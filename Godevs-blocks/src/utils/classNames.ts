/**
 * BEM + conditional class name builder.
 *
 * Wraps `clsx` with GoBlocks-specific BEM helpers so blocks produce
 * consistent, predictable class strings.
 *
 * BEM convention: .gb-{block}__element--modifier
 */

import clsx, { type ClassValue } from 'clsx';

// ── Re-export clsx for general use ────────────────────────────────────────

export { clsx };
export type { ClassValue };

// ── BEM helpers ───────────────────────────────────────────────────────────

/**
 * Return a BEM block class: .gb-{block}
 * @param block
 */
export function gbBlock( block: string ): string {
	return `gb-${ block }`;
}

/**
 * Return a BEM element class: .gb-{block}__element
 *
 * @param block
 * @param element
 * @example  gbElement('box', 'inner') → 'gb-box__inner'
 */
export function gbElement( block: string, element: string ): string {
	return `gb-${ block }__${ element }`;
}

/**
 * Return a BEM modifier class: .gb-{block}--modifier
 *
 * @param block
 * @param modifier
 * @example  gbModifier('box', 'full-width') → 'gb-box--full-width'
 */
export function gbModifier( block: string, modifier: string ): string {
	return `gb-${ block }--${ modifier }`;
}

/**
 * Build a full block class string combining base, modifiers, global classes,
 * and any extra class values (via clsx).
 *
 * @param          block
 * @param          modifiers
 * @param {...any} extra
 * @example
 * blockClasses('box', { 'full-width': true, 'has-background': false }, 'my-class')
 * → 'gb-box gb-box--full-width my-class'
 */
export function blockClasses(
	block: string,
	modifiers?: Record< string, boolean | undefined | null >,
	...extra: ClassValue[]
): string {
	const base = gbBlock( block );
	const modList = modifiers
		? Object.entries( modifiers )
				.filter( ( [ , active ] ) => Boolean( active ) )
				.map( ( [ mod ] ) => gbModifier( block, mod ) )
		: [];

	return clsx( base, ...modList, ...extra );
}

// ── Unique ID class helper ─────────────────────────────────────────────────

/**
 * Return the selector-ready unique class for a block instance.
 * GoBlocks uses this as the primary scoping selector for generated CSS.
 *
 * @param uniqueId
 * @example  uniqueClass('abc123') → 'gb-block-abc123'
 */
export function uniqueClass( uniqueId: string ): string {
	return `gb-block-${ uniqueId }`;
}

/**
 * Return the CSS selector string (prefixed with .) for use in style generation.
 *
 * @param uniqueId
 * @example  uniqueSelector('abc123') → '.gb-block-abc123'
 */
export function uniqueSelector( uniqueId: string ): string {
	return `.${ uniqueClass( uniqueId ) }`;
}

// ── Responsive class helpers ──────────────────────────────────────────────

/**
 * Return a breakpoint-scoped modifier class.
 *
 * @param block
 * @param modifier
 * @param breakpoint
 * @example  responsiveClass('box', 'align-center', 'md') → 'gb-box--md-align-center'
 */
export function responsiveClass(
	block: string,
	modifier: string,
	breakpoint: string
): string {
	return `gb-${ block }--${ breakpoint }-${ modifier }`;
}

// ── Alignment helpers ─────────────────────────────────────────────────────

/** Map align attribute values to wp-block alignment classes. */
const ALIGN_CLASS: Record< string, string > = {
	wide: 'alignwide',
	full: 'alignfull',
	left: 'alignleft',
	right: 'alignright',
	center: 'aligncenter',
};

/**
 * Return the WP alignment class for an align attribute value, or '' if none.
 * @param align
 */
export function alignClass( align: string | undefined ): string {
	return align ? ALIGN_CLASS[ align ] ?? '' : '';
}
