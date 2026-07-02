import { useState, useEffect, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { TextControl, Spinner, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, copySmall, check } from '@wordpress/icons';

interface PatternItem {
	slug: string;
	title: string;
	description: string;
	categories: string[];
	keywords: string[];
	viewport_width: number;
	inserter: boolean;
	content: string;
	rendered: string;
}

// ── Iframe preview helpers ────────────────────────────────────────────────────

function buildPreviewDoc( rendered: string, viewportWidth: number ): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${ viewportWidth },initial-scale=1">
<style>
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;
  font-size:16px;line-height:1.6;color:#0f172a;background:#fff;
}
h1,h2,h3,h4,h5,h6{font-weight:700;line-height:1.2;margin:0 0 .5em;color:#0f172a}
h1{font-size:2.5rem}h2{font-size:2rem}h3{font-size:1.25rem}h4{font-size:1.1rem}
p{margin:0}
a{color:#6366f1;text-decoration:none}
img{max-width:100%;height:auto;display:block}
figure{margin:0}
/* GoBlocks block base — reset margins/padding so generatedCss controls everything */
.gb-group,.gb-column,.gb-heading,.gb-text,.gb-button{margin:0;padding:0;}
/* Column default — flex grow so columns share space equally */
.gb-column{flex:1;min-width:0;}
/* Button inner span */
.gb-button{display:inline-flex;align-items:center;cursor:pointer;}
.gb-button__text{display:block;}
</style>
</head>
<body>${ rendered || '<p style="color:#94a3b8;text-align:center;padding:40px 0;font-size:14px">No preview available</p>' }</body>
</html>`;
}

// ── Pattern Card ──────────────────────────────────────────────────────────────

interface PatternCardProps {
	pattern: PatternItem;
	copied: boolean;
	onCopy: () => void;
}

function PatternCard( { pattern, copied, onCopy }: PatternCardProps ) {
	const previewDoc = buildPreviewDoc( pattern.rendered, pattern.viewport_width || 1280 );

	return (
		<div className="gb-patterns__item">
			{ /* Live iframe preview */ }
			<div className="gb-patterns__preview" aria-hidden="true">
				<iframe
					className="gb-patterns__preview-frame"
					srcDoc={ previewDoc }
					title={ pattern.title }
					sandbox="allow-same-origin"
					tabIndex={ -1 }
				/>
				<div className="gb-patterns__preview-overlay" />
			</div>

			{ /* Card metadata */ }
			<div className="gb-patterns__meta">
				<div className="gb-patterns__meta-top">
					<strong className="gb-patterns__title">{ pattern.title }</strong>

					{ pattern.description && (
						<p className="gb-patterns__description">
							{ pattern.description }
						</p>
					) }
				</div>

				<div className="gb-patterns__footer">
					<div className="gb-patterns__categories">
						{ pattern.categories.map( ( cat ) => (
							<span key={ cat } className="gb-patterns__tag">
								{ cat }
							</span>
						) ) }
					</div>

					<Button
						variant={ copied ? 'primary' : 'secondary' }
						size="small"
						onClick={ onCopy }
						className="gb-patterns__copy-btn"
					>
						<Icon
							icon={ copied ? check : copySmall }
							size={ 14 }
						/>
						{ copied
							? __( 'Copied!', 'goblocks' )
							: __( 'Copy', 'goblocks' ) }
					</Button>
				</div>
			</div>
		</div>
	);
}

// ── Main App ──────────────────────────────────────────────────────────────────

export function PatternsApp(): JSX.Element {
	const [ patterns, setPatterns ] = useState< PatternItem[] >( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( '' );
	const [ search, setSearch ] = useState( '' );
	const [ copied, setCopied ] = useState( '' );

	useEffect( () => {
		apiFetch< PatternItem[] >( { path: '/goblocks/v1/patterns' } )
			.then( ( data ) => {
				setPatterns( data );
				setLoading( false );
			} )
			.catch( () => {
				setError(
					__(
						'Failed to load patterns. Please refresh and try again.',
						'goblocks'
					)
				);
				setLoading( false );
			} );
	}, [] );

	const filtered = search.trim()
		? patterns.filter( ( p ) => {
				const q = search.toLowerCase();
				return (
					p.title.toLowerCase().includes( q ) ||
					p.description.toLowerCase().includes( q ) ||
					p.keywords.some( ( k ) => k.toLowerCase().includes( q ) )
				);
		  } )
		: patterns;

	const handleCopy = useCallback(
		( pattern: PatternItem ): void => {
			navigator.clipboard.writeText( pattern.content ).then( () => {
				setCopied( pattern.slug );
				setTimeout( () => setCopied( '' ), 2000 );
			} );
		},
		[]
	);

	return (
		<div className="gb-patterns wrap">
			{ /* ── Page header ── */ }
			<div className="gb-patterns__header">
				<div className="gb-patterns__header-top">
					<div>
						<h1 className="gb-patterns__heading">
							{ __( 'Pattern Library', 'goblocks' ) }
						</h1>
						<p className="gb-patterns__subheading">
							{ __(
								'Ready-made block layouts. Insert from the editor or copy the markup.',
								'goblocks'
							) }
						</p>
					</div>

					<div className="gb-patterns__search">
						<TextControl
							placeholder={ __( 'Search patterns…', 'goblocks' ) }
							value={ search }
							onChange={ setSearch }
							// @ts-ignore
							__nextHasNoMarginBottom
						/>
					</div>
				</div>

				<div className="gb-patterns__stats">
					{ ! loading && ! error && (
						<span className="gb-patterns__count">
							{ filtered.length }{ ' ' }
							{ filtered.length === 1
								? __( 'pattern', 'goblocks' )
								: __( 'patterns', 'goblocks' ) }
						</span>
					) }
				</div>
			</div>

			{ /* ── Loading state ── */ }
			{ loading && (
				<div className="gb-patterns__loading">
					<Spinner />
					<span>{ __( 'Loading patterns…', 'goblocks' ) }</span>
				</div>
			) }

			{ /* ── Error state ── */ }
			{ error && (
				<div className="gb-patterns__error notice notice-error">
					<p>{ error }</p>
				</div>
			) }

			{ /* ── Pattern grid ── */ }
			{ ! loading && ! error && filtered.length > 0 && (
				<div className="gb-patterns__grid">
					{ filtered.map( ( pattern ) => (
						<PatternCard
							key={ pattern.slug }
							pattern={ pattern }
							copied={ copied === pattern.slug }
							onCopy={ () => handleCopy( pattern ) }
						/>
					) ) }
				</div>
			) }

			{ /* ── Empty state ── */ }
			{ ! loading && ! error && filtered.length === 0 && (
				<div className="gb-patterns__empty">
					<p>
						{ search
							? __( 'No patterns match your search.', 'goblocks' )
							: __( 'No patterns registered yet.', 'goblocks' ) }
					</p>
				</div>
			) }
		</div>
	);
}
