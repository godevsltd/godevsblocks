/**
 * Tabs block — Edit component.
 *
 * Renders a tab bar drawn from child goblocks/tab-panel blocks + all panels
 * stacked (always visible in the editor for easy access). Clicking a tab
 * button selects the corresponding inner block. The view script handles
 * frontend tab switching.
 */

import { useEffect } from '@wordpress/element';
import {
	useBlockProps,
	InnerBlocks,
	BlockControls,
} from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

import { useCssEngine } from '../../hooks/useCssEngine';
import { clsx } from '../../utils/classNames';
import { TabsInspector } from './components/Inspector';
import type { TabsBlockAttributes } from './components/Inspector';

// ── Unique ID ─────────────────────────────────────────────────────────────────

function makeUniqueId( clientId: string ): string {
	return clientId.replace( /-/g, '' ).slice( 0, 8 );
}

// ── Default template ──────────────────────────────────────────────────────────

const DEFAULT_TEMPLATE: [ string, Record< string, unknown > ][] = [
	[ 'goblocks/tab-panel', { label: 'Tab 1' } ],
	[ 'goblocks/tab-panel', { label: 'Tab 2' } ],
];

// ── Edit component ────────────────────────────────────────────────────────────

export function Edit( {
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps< TabsBlockAttributes > ) {
	const { uniqueId, styles, orientation = 'horizontal', tabStyle = 'pill', tabsFullWidth = false, generatedCss } = attributes;

	// Assign uniqueId once on first insertion.
	useEffect( () => {
		if ( ! uniqueId ) {
			setAttributes( { uniqueId: makeUniqueId( clientId ) } );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// CSS generation.
	useCssEngine( {
		blockSlug: 'tabs',
		uniqueId,
		styles,
		generatedCss,
		setAttributes: ( patch ) =>
			setAttributes( patch as Partial< TabsBlockAttributes > ),
	} );

	// Read child tab-panel blocks to build the tab bar.
	const { childBlocks, insertBlock, selectBlock } = useSelect(
		( select ) => ( {
			childBlocks: ( select( 'core/block-editor' ) as any )
				.getBlockOrder( clientId )
				.map( ( id: string ) => ( {
					id,
					attrs:
						(
							select( 'core/block-editor' ) as any
						 ).getBlockAttributes( id ) ?? {},
				} ) ),
			insertBlock: undefined,
			selectBlock: undefined,
		} ),
		[ clientId ]
	);
	const { insertBlock: doInsert, selectBlock: doSelect } = useDispatch(
		'core/block-editor'
	) as any;

	const wrapperClass = clsx(
		'gb-tabs',
		uniqueId && `gb-tabs-${ uniqueId }`,
		`gb-tabs--${ orientation }`,
		`gb-tabs--style-${ tabStyle }`,
		tabsFullWidth && 'gb-tabs--full-width'
	);

	const blockProps = useBlockProps( { className: wrapperClass } );

	return (
		<>
			{ /* Inspector */ }
			<TabsInspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			{ /* Toolbar: add tab */ }
			<BlockControls group="block">
				<ToolbarGroup>
					<ToolbarButton
						icon={ plus }
						label={ __( 'Add Tab', 'goblocks' ) }
						onClick={ () => {
							const n = childBlocks.length + 1;
							const block = createBlock( 'goblocks/tab-panel', {
								label: `Tab ${ n }`,
							} );
							doInsert( block, childBlocks.length, clientId );
						} }
					/>
				</ToolbarGroup>
			</BlockControls>

			{ /* Block */ }
			<div { ...blockProps }>
				{ /* Tab bar — derived from child blocks' labels */ }
				<div
					className="gb-tabs__tablist"
					role="tablist"
					aria-orientation={ orientation }
				>
					{ childBlocks.map(
						(
							child: {
								id: string;
								attrs: Record< string, unknown >;
							},
							idx: number
						) => (
							<button
								key={ child.id }
								type="button"
								role="tab"
								className={ clsx(
									'gb-tabs__button',
									idx === 0 && 'is-active'
								) }
								onClick={ () => doSelect( child.id ) }
								aria-selected={ idx === 0 }
								tabIndex={ idx === 0 ? 0 : -1 }
							>
								{ ( child.attrs.label as string ) ||
									__( 'Tab', 'goblocks' ) }
							</button>
						)
					) }
				</div>

				{ /* Panels (all stacked / visible in editor) */ }
				<div className="gb-tabs__panels">
					<InnerBlocks
						allowedBlocks={ [ 'goblocks/tab-panel' ] }
						template={ DEFAULT_TEMPLATE }
						renderAppender={ false }
					/>
				</div>
			</div>
		</>
	);
}
