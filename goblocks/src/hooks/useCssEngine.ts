/**
 * useCssEngine — React hook for CSS generation in the block editor.
 *
 * Runs the CSS pipeline whenever `attributes.styles` changes, then:
 *  1. Stores the result in `attributes.generatedCss` via setAttributes.
 *  2. Injects a `<style>` tag into the editor document so the preview updates.
 *
 * Debounced at 100 ms to prevent thrash during slider drag.
 *
 * The injected <style> tag uses `data-gb-id` as a key so it is replaced,
 * not appended, on each update. It is removed on unmount.
 *
 * WordPress 6.3+ renders the block canvas inside an iframe. This hook
 * detects the correct document by searching for the block element's
 * ownerDocument, so styles always land in the right <head>.
 */

import { useEffect, useRef, useCallback } from '@wordpress/element';
import type { BlockStyles } from '../types/styles';
import { buildBlockCss } from '../utils/css/CssEngine';

// ── Types ─────────────────────────────────────────────────────────────────

interface UseCssEngineOptions {
	/** Block name without namespace, e.g. 'box'. */
	blockSlug: string;

	/** The block's `uniqueId` attribute. */
	uniqueId: string;

	/** The block's `styles` attribute object. */
	styles: BlockStyles;

	/**
	 * The block's existing generatedCss attribute.
	 * When provided and the CSS engine would generate nothing (empty styles),
	 * this value is injected into the editor DOM on first mount so patterns
	 * with hardcoded generatedCss show correctly in the editor.
	 */
	generatedCss?: string;

	/**
	 * The block's setAttributes function.
	 * Called with `{ generatedCss }` on each CSS change.
	 */
	setAttributes: ( attrs: { generatedCss: string } ) => void;

	/** Debounce delay in ms. Default: 100. */
	debounce?: number;

	/**
	 * Override the CSS selector used for the generated rules.
	 * Pass a compound selector like '.gb-heading.gb-heading-{uniqueId}'
	 * to raise specificity above conflicting tag+class rules in blocks.css.
	 */
	selectorOverride?: string | undefined;
}

// ── Document targeting (handles WP iframed editor) ────────────────────────

/**
 * Find the document that contains the block element.
 *
 * In WordPress 6.3+ the editor canvas runs inside an iframe. React may run
 * inside that iframe (its own JS context), in which case `document` is already
 * the correct document. If React runs in the parent window (portal pattern),
 * block elements live in the iframe and we search for them there.
 *
 * Returns null when the element cannot yet be found (timing race on first
 * mount) — callers should fall back to `document` in that case.
 * @param blockSlug
 * @param uniqueId
 */
function findBlockOwnerDoc(
	blockSlug: string,
	uniqueId: string
): Document | null {
	const selector = `.gb-${ blockSlug }-${ uniqueId }`;

	// Check current document first (covers: non-iframed editor, AND the
	// case where React itself runs inside the WP canvas iframe).
	const el = document.querySelector( selector );
	if ( el ) {
		return el.ownerDocument as Document;
	}

	// React is in the parent window — search iframe documents.
	// Try the known WP canvas iframe selectors first (fastest path).
	const WP_CANVAS = [
		'iframe[name="editor-canvas"]',
		'iframe.block-editor-iframe__iframe',
		'iframe[title="Editor canvas"]',
	];
	for ( const sel of WP_CANVAS ) {
		const frame = document.querySelector< HTMLIFrameElement >( sel );
		if ( ! frame ) {
			continue;
		}
		try {
			const contentDoc = frame.contentDocument;
			if ( ! contentDoc ) {
				continue;
			}
			if ( contentDoc.querySelector( selector ) ) {
				return contentDoc;
			}
			// Frame found but element not yet mounted — return the frame doc
			// so the style lands in the right head even before the element exists.
			if ( contentDoc.body ) {
				return contentDoc;
			}
		} catch {
			// Cross-origin — skip.
		}
	}

	// Fallback: search every accessible iframe.
	const frames = document.querySelectorAll< HTMLIFrameElement >( 'iframe' );
	for ( const frame of Array.from( frames ) ) {
		try {
			const contentDoc = frame.contentDocument;
			if ( ! contentDoc ) {
				continue;
			}
			if ( contentDoc.querySelector( selector ) ) {
				return contentDoc;
			}
		} catch {
			// Cross-origin — skip.
		}
	}

	return null;
}

// ── StyleTag manager ──────────────────────────────────────────────────────

function getOrCreateStyleTag(
	id: string,
	targetDoc: Document
): HTMLStyleElement {
	const existing = targetDoc.querySelector< HTMLStyleElement >(
		`[data-gb-id="${ id }"]`
	);
	if ( existing ) {
		return existing;
	}

	const el = targetDoc.createElement( 'style' );
	el.setAttribute( 'data-gb-id', id );
	targetDoc.head.appendChild( el );
	return el;
}

function removeStyleTag( id: string, targetDoc: Document ): void {
	const el = targetDoc.querySelector( `[data-gb-id="${ id }"]` );
	el?.parentNode?.removeChild( el );
}

// ── Hook ──────────────────────────────────────────────────────────────────

/**
 * @param root0
 * @param root0.blockSlug
 * @param root0.uniqueId
 * @param root0.styles
 * @param root0.setAttributes
 * @param root0.debounce
 * @param root0.generatedCss
 * @param root0.selectorOverride
 * @example
 * // In edit.tsx:
 * useCssEngine({ blockSlug: 'box', uniqueId, styles: attributes.styles, setAttributes });
 */
export function useCssEngine( {
	blockSlug,
	uniqueId,
	styles,
	generatedCss,
	setAttributes,
	debounce: debounceMs = 100,
	selectorOverride,
}: UseCssEngineOptions ): void {
	const timerRef = useRef< ReturnType< typeof setTimeout > | null >( null );
	const prevCssRef = useRef< string >( '' );
	// Cache the resolved document once found so it stays consistent across
	// re-renders. Starts null; set on first successful findBlockOwnerDoc call.
	const targetDocRef = useRef< Document | null >( null );
	const styleTagId = `gb-style-${ uniqueId }`;

	// On first mount: if the CSS engine would produce nothing (empty styles) but
	// there is already a stored generatedCss (e.g. pattern blocks with hardcoded
	// CSS), inject that CSS into the editor DOM for a correct visual preview.
	// We do NOT call setAttributes here — the stored CSS is preserved as-is.
	useEffect( () => {
		if ( ! uniqueId || ! generatedCss ) {
			return;
		}
		const css = buildBlockCss(
			styles,
			blockSlug,
			uniqueId,
			selectorOverride ? { selectorOverride } : {}
		);
		if ( css !== '' ) {
			return; // CSS engine will inject via the main effect below.
		}
		if ( ! targetDocRef.current ) {
			targetDocRef.current =
				findBlockOwnerDoc( blockSlug, uniqueId ) ?? document;
		}
		getOrCreateStyleTag( styleTagId, targetDocRef.current ).textContent =
			generatedCss;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] ); // Intentionally run once on mount only.

	// Stable CSS builder — doesn't cause re-renders.
	const buildAndApply = useCallback( () => {
		if ( ! uniqueId ) {
			return;
		}

		const css = buildBlockCss(
			styles,
			blockSlug,
			uniqueId,
			selectorOverride ? { selectorOverride } : {}
		);

		// Skip DOM + setAttributes update if CSS hasn't changed.
		if ( css === prevCssRef.current ) {
			return;
		}
		prevCssRef.current = css;

		// Resolve the document that contains this block (handles WP iframe canvas).
		// Cache it after first successful lookup so injection is always consistent.
		if ( ! targetDocRef.current ) {
			targetDocRef.current =
				findBlockOwnerDoc( blockSlug, uniqueId ) ?? document;
		}
		const targetDoc = targetDocRef.current;

		// Inject/replace <style> in the correct editor document.
		const styleEl = getOrCreateStyleTag( styleTagId, targetDoc );
		styleEl.textContent = css;

		// Persist to block attributes.
		setAttributes( { generatedCss: css } );
	}, [
		styles,
		blockSlug,
		uniqueId,
		setAttributes,
		styleTagId,
		selectorOverride,
	] );

	// Debounced effect: re-run whenever styles change.
	// On the very first call (uniqueId already set) run immediately so
	// generatedCss is populated before any autosave fires.
	const isFirstRunRef = useRef< boolean >( true );
	useEffect( () => {
		if ( timerRef.current ) {
			clearTimeout( timerRef.current );
		}

		if ( isFirstRunRef.current && uniqueId ) {
			isFirstRunRef.current = false;
			buildAndApply();
			return;
		}
		isFirstRunRef.current = false;

		timerRef.current = setTimeout( buildAndApply, debounceMs );

		return () => {
			if ( timerRef.current ) {
				clearTimeout( timerRef.current );
			}
		};
	}, [ buildAndApply, debounceMs ] );

	// Cleanup <style> tag on unmount — uses last known target document.
	useEffect( () => {
		return () => {
			if ( timerRef.current ) {
				clearTimeout( timerRef.current );
			}
			removeStyleTag( styleTagId, targetDocRef.current ?? document );
		};
		// Run only on mount/unmount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
}
