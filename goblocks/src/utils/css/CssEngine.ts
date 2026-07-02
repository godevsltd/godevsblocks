/**
 * CssEngine — Orchestrator (Pipeline Stage 7)
 *
 * Public API for CSS generation. Block edit.tsx and useCssEngine hook
 * call only this module — they never import individual pipeline stages.
 *
 * Pipeline:
 *   BlockStyles
 *     → StyleNormalizer   (clean + validate)
 *     → RuleBuilder       (declarations by breakpoint + pseudo)
 *     → PseudoBuilder     (pseudo-state CssRules)
 *     → MediaQueryWrapper (breakpoint CssRules with @media)
 *     → CssSerializer     (CssRule[] → string)
 *     → Minifier          (string → minified string)
 *     → stored in attributes.generatedCss
 *
 * Selector convention (from CSS-ENGINE.md):
 *   .gb-{block-slug}-{uniqueId}
 *
 * @example
 *   const css = CssEngine.build(attributes.styles, 'box', attributes.uniqueId);
 *   setAttributes({ generatedCss: css });
 */

import type { BlockStyles, BreakpointConfig } from '../../types/styles';
import type { CssRule } from './buildCss';
import { buildRuleSet } from './RuleBuilder';
import { buildPseudoRules } from './PseudoBuilder';
import { buildMediaRules } from './MediaQueryWrapper';
import { serializeCss } from './CssSerializer';
import { minify } from './Minifier';

// ── Types ─────────────────────────────────────────────────────────────────

export interface CssEngineOptions {
	/**
	 * Breakpoint config for @media query pixel values.
	 * Defaults to the plugin runtime config (window.goblocksEditor.breakpoints).
	 */
	breakpoints?: BreakpointConfig;

	/**
	 * If true, returns pretty-printed CSS (useful in development / tests).
	 * Default: false (minified).
	 */
	pretty?: boolean;

	/**
	 * Override the generated selector entirely.
	 * Use to bump specificity, e.g. '.gb-heading.gb-heading-{uniqueId}'.
	 * When omitted, makeSelector(blockSlug, uniqueId) is used.
	 */
	selectorOverride?: string | undefined;
}

// ── Selector factory ──────────────────────────────────────────────────────

/**
 * Build the unique block selector from block slug and uniqueId.
 *
 * @param blockSlug
 * @param uniqueId
 * @example  makeSelector('box', 'a1b2c3') → '.gb-box-a1b2c3'
 */
export function makeSelector( blockSlug: string, uniqueId: string ): string {
	return `.gb-${ blockSlug }-${ uniqueId }`;
}

// ── Runtime breakpoint config ─────────────────────────────────────────────

function getRuntimeBreakpoints(): BreakpointConfig | undefined {
	return window.goblocksEditor?.breakpoints as BreakpointConfig | undefined;
}

// ── Engine ────────────────────────────────────────────────────────────────

/**
 * Generate the complete CSS string for a block instance.
 *
 * @param styles    The block's `attributes.styles` object.
 * @param blockSlug Block name without namespace, e.g. 'box', 'text'.
 * @param uniqueId  The block's unique ID attribute, e.g. 'a1b2c3'.
 * @param options   Optional engine configuration.
 *
 * @return           Minified CSS string (empty string if styles produce no rules).
 */
export function buildBlockCss(
	styles: BlockStyles,
	blockSlug: string,
	uniqueId: string,
	options: CssEngineOptions = {}
): string {
	if ( ! uniqueId ) {
		return '';
	}

	const selector = ( options.selectorOverride || '' ) || makeSelector( blockSlug, uniqueId );
	const breakpoints = options.breakpoints ?? getRuntimeBreakpoints();

	// Stage 2: Build rule buckets.
	const ruleSet = buildRuleSet( styles );

	// Collect all CssRule objects.
	const rules: CssRule[] = [];

	// Base rule (no media query, no pseudo).
	if ( ruleSet.base.length > 0 ) {
		rules.push( { selector, declarations: ruleSet.base } );
	}

	// Stage 3: Pseudo-state rules.
	const pseudoRules = buildPseudoRules( selector, ruleSet );
	rules.push( ...pseudoRules );

	// Stage 4: Media query rules.
	const mediaRules = buildMediaRules( selector, ruleSet, breakpoints );
	rules.push( ...mediaRules );

	if ( 0 === rules.length ) {
		return '';
	}

	// Stage 5: Serialize.
	const raw = serializeCss( rules );

	// Stage 6: Minify (skip in pretty mode).
	return options.pretty ? raw : minify( raw );
}

// ── Namespace export (used as CssEngine.build() in docs + comments) ───────

export const CssEngine = {
	build: buildBlockCss,
	makeSelector,
} as const;
