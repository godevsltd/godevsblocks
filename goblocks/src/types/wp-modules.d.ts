/**
 * Ambient declarations for WordPress packages externalized by @wordpress/scripts.
 * These modules exist at runtime as window.wp.* globals; TypeScript only needs
 * the shape — the real bundle never imports them.
 */

// ── @wordpress/element (thin wrapper around React) ─────────────────────────

declare module '@wordpress/element' {
	export type {
		ReactNode,
		ReactElement,
		FC,
		ComponentType,
		ComponentProps,
		PropsWithChildren,
		MutableRefObject,
		RefObject,
		RefCallback,
		CSSProperties,
		MouseEventHandler,
		ChangeEventHandler,
		KeyboardEventHandler,
		FormEventHandler,
		Dispatch,
		SetStateAction,
	} from 'react';
	export {
		createElement,
		Fragment,
		render,
		createContext,
		forwardRef,
		memo,
		createRef,
		useState,
		useEffect,
		useLayoutEffect,
		useRef,
		useCallback,
		useMemo,
		useReducer,
		useContext,
		useId,
	} from 'react';
}

// ── @wordpress/blocks ──────────────────────────────────────────────────────

declare module '@wordpress/blocks' {
	import type { ComponentType } from 'react';

	export interface BlockEditProps<A extends object = Record<string, unknown>> {
		attributes:    A;
		setAttributes: ( attrs: Partial<A> ) => void;
		isSelected:    boolean;
		clientId:      string;
		context:       Record<string, unknown>;
		className:     string;
	}

	export interface BlockSaveProps<A extends object = Record<string, unknown>> {
		attributes: A;
	}

	export interface BlockInstance {
		clientId:    string;
		name:        string;
		attributes:  Record<string, unknown>;
		innerBlocks: BlockInstance[];
	}

	export interface BlockTransformItem {
		type:        'block' | 'enter' | 'files' | 'prefix' | 'raw' | 'shortcode';
		blocks?:     string[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		transform:   ( attributes: Record<string, unknown>, ...rest: any[] ) => BlockInstance | BlockInstance[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		isMatch?:    ( ...args: any[] ) => boolean;
		isMultiBlock?: boolean;
		priority?:   number;
	}

	export interface BlockTransform {
		from?: BlockTransformItem[];
		to?:   BlockTransformItem[];
	}

	export interface BlockSettings<A extends object = Record<string, unknown>> {
		title:       string;
		description?: string;
		category?:   string;
		icon?:       unknown;
		keywords?:   string[];
		attributes?: Record<keyof A, { type: string; default?: unknown; [k: string]: unknown }>;
		supports?:   Record<string, unknown>;
		transforms?: BlockTransform;
		edit:        ComponentType<BlockEditProps<A>>;
		save:        ComponentType<BlockSaveProps<A>>;
		parent?:     string[];
		ancestor?:   string[];
		usesContext?: string[];
		providesContext?: Record<string, string>;
	}

	export function registerBlockType<A extends object>(
		name:     string,
		settings: BlockSettings<A>,
	): void;

	export function unregisterBlockType( name: string ): void;

	export function createBlock(
		name:        string,
		attributes?: Record<string, unknown>,
		innerBlocks?: unknown[],
	): BlockInstance;

	export function cloneBlock(
		block:      BlockInstance,
		attributes?: Record<string, unknown>,
		innerBlocks?: BlockInstance[],
	): BlockInstance;

	export function getBlockType( name: string ): BlockSettings | undefined;

	export function getBlockTypes(): BlockSettings[];

	export function hasBlockSupport(
		nameOrSettings: string | BlockSettings,
		feature:        string,
		defaultSupport?: boolean,
	): boolean;
}

// ── @wordpress/block-editor ────────────────────────────────────────────────

declare module '@wordpress/block-editor' {
	import type { ComponentType, ReactNode, HTMLAttributes } from 'react';
	import type { BlockInstance }                            from '@wordpress/blocks';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type AnyProps = Record<string, any>;

	export interface UseBlockPropsOptions {
		className?: string;
		style?:     import('react').CSSProperties;
		ref?:       unknown;
		[key: string]: unknown;
	}

	export function useBlockProps( options?: UseBlockPropsOptions ): AnyProps;

	export function useInnerBlocksProps(
		blockProps?: AnyProps,
		options?:    AnyProps,
	): AnyProps;

	export const InspectorControls:  ComponentType<{ group?: string; children?: ReactNode }>;
	export const BlockControls:       ComponentType<{ group?: string; children?: ReactNode }>;
	export const BlockIcon:           ComponentType<AnyProps>;

	export const InnerBlocks: ComponentType<{
		allowedBlocks?:      string[];
		template?:           unknown[][];
		templateLock?:       false | 'all' | 'insert' | 'contentOnly';
		renderAppender?:     ComponentType | false | null;
		orientation?:        'horizontal' | 'vertical';
		[key: string]:       unknown;
	}> & {
		ButtonBlockAppender: ComponentType;
		DefaultBlockAppender: ComponentType;
	};

	export const RichText: ComponentType<{
		tagName?:        string;
		value?:          string;
		onChange?:       ( value: string ) => void;
		placeholder?:    string;
		allowedFormats?: string[];
		multiline?:      boolean | string;
		onSplit?:        ( value: string ) => BlockInstance;
		onMerge?:        ( forward: boolean ) => void;
		onRemove?:       ( forward: boolean ) => void;
		identifier?:     string;
		[key: string]:   unknown;
	}> & {
		Content: ComponentType<{ value?: string; tagName?: string; [k: string]: unknown }>;
		isEmpty: ( value: string ) => boolean;
	};

	export const MediaUpload: ComponentType<{
		onSelect:           ( media: { id: number; url: string; alt: string; [k: string]: unknown } ) => void;
		allowedTypes?:      string[];
		value?:             number;
		render:             ( args: { open: () => void } ) => ReactNode;
		[key: string]:      unknown;
	}>;

	export const MediaPlaceholder: ComponentType<{
		onSelect:           ( media: { id: number; url: string; alt: string; [k: string]: unknown } ) => void;
		allowedTypes?:      string[];
		value?:             number;
		labels?:            { title?: string; instructions?: string };
		icon?:              ReactNode;
		[key: string]:      unknown;
	}>;

	export const ColorPalette:    ComponentType<AnyProps>;
	export const PanelColorSettings: ComponentType<AnyProps>;
	export const ContrastChecker: ComponentType<AnyProps>;

	export function useSelect<T>( selector: ( select: ( storeId: string ) => AnyProps ) => T ): T;

	export function useSetting( path: string ): unknown;
}

// ── @wordpress/components ──────────────────────────────────────────────────

declare module '@wordpress/components' {
	import type { ComponentType, ReactNode, HTMLAttributes, InputHTMLAttributes } from 'react';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type AnyProps = Record<string, any>;

	// ── Structural
	export const PanelBody:   ComponentType<{ title?: string; initialOpen?: boolean; className?: string; children?: ReactNode; [k: string]: unknown }>;
	export const PanelRow:    ComponentType<{ className?: string; children?: ReactNode }>;
	export const PanelHeader: ComponentType<{ label?: ReactNode; children?: ReactNode }>;

	// ── Form controls
	export const TextControl: ComponentType<{
		label?:         string;
		value?:         string;
		onChange?:      ( value: string ) => void;
		placeholder?:   string;
		type?:          string;
		help?:          ReactNode;
		className?:     string;
		readOnly?:      boolean;
		disabled?:      boolean;
		hideLabelFromVision?: boolean;
		[k: string]:    unknown;
	}>;

	export const TextareaControl: ComponentType<{
		label?:         string;
		value?:         string;
		onChange?:      ( value: string ) => void;
		placeholder?:   string;
		rows?:          number;
		help?:          ReactNode;
		className?:     string;
		[k: string]:    unknown;
	}>;

	export const SelectControl: ComponentType<{
		label?:         string;
		value?:         string;
		options?:       { label: string; value: string; disabled?: boolean }[];
		onChange?:      ( value: string ) => void;
		help?:          ReactNode;
		className?:     string;
		multiple?:      boolean;
		[k: string]:    unknown;
	}>;

	export const ToggleControl: ComponentType<{
		label?:         string;
		help?:          ReactNode;
		checked?:       boolean;
		onChange?:      ( value: boolean ) => void;
		className?:     string;
		[k: string]:    unknown;
	}>;

	export const RadioControl: ComponentType<{
		label?:         string;
		help?:          ReactNode;
		selected?:      string;
		options?:       { label: string; value: string }[];
		onChange?:      ( value: string ) => void;
		className?:     string;
		[k: string]:    unknown;
	}>;

	export const CheckboxControl: ComponentType<{
		label?:         string;
		help?:          ReactNode;
		checked?:       boolean;
		onChange?:      ( value: boolean ) => void;
		indeterminate?: boolean;
		[k: string]:    unknown;
	}>;

	export const RangeControl: ComponentType<{
		label?:         string;
		value?:         number | undefined;
		onChange?:      ( value: number | undefined ) => void;
		min?:           number;
		max?:           number;
		step?:          number;
		help?:          ReactNode | undefined;
		className?:     string;
		[k: string]:    unknown;
	}>;

	export const __experimentalNumberControl: ComponentType<{
		label?:         string;
		value?:         number | string;
		onChange?:      ( value: string | undefined ) => void;
		min?:           number;
		max?:           number;
		step?:          number;
		isDragEnabled?: boolean;
		[k: string]:    unknown;
	}>;

	// ── Buttons
	export const Button: ComponentType<{
		variant?:       'primary' | 'secondary' | 'tertiary' | 'link';
		size?:          'small' | 'compact' | 'default' | 'large';
		icon?:          ReactNode | ComponentType<AnyProps>;
		label?:         string;
		iconSize?:      number;
		iconPosition?:  'left' | 'right';
		isPressed?:     boolean;
		isDestructive?: boolean;
		isBusy?:        boolean;
		disabled?:      boolean;
		href?:          string;
		target?:        string;
		onClick?:       ( event: MouseEvent ) => void;
		className?:     string;
		children?:      ReactNode;
		type?:          'button' | 'submit' | 'reset';
		[k: string]:    unknown;
	}>;

	export const ToolbarButton: ComponentType<{
		title?:         string;
		label?:         string;
		icon?:          ReactNode | ComponentType<AnyProps>;
		onClick?:       () => void;
		isActive?:      boolean;
		isDisabled?:    boolean;
		children?:      ReactNode;
		[k: string]:    unknown;
	}>;

	export const ToolbarGroup:       ComponentType<{ children?: ReactNode; className?: string; [k: string]: unknown }>;
	export const ToolbarDropdownMenu: ComponentType<{ label: string; icon?: ReactNode; controls?: AnyProps[]; toggleProps?: AnyProps; children?: ReactNode; [k: string]: unknown }>;
	export const Toolbar:            ComponentType<{ label?: string; children?: ReactNode; [k: string]: unknown }>;

	// ── Overlay / feedback
	export const Spinner:    ComponentType<{ className?: string }>;
	export const Notice:     ComponentType<{ status?: 'success' | 'info' | 'warning' | 'error'; isDismissible?: boolean; onDismiss?: () => void; children?: ReactNode; [k: string]: unknown }>;
	export const Popover:    ComponentType<{ position?: string; onClose?: () => void; noArrow?: boolean; children?: ReactNode; [k: string]: unknown }>;
	export const Modal:      ComponentType<{ title?: string; onRequestClose?: () => void; isFullScreen?: boolean; children?: ReactNode; [k: string]: unknown }>;
	export const Tooltip:    ComponentType<{ text?: string; delay?: number; children?: ReactNode }>;

	// ── Colour
	export const ColorPicker: ComponentType<{
		color?:         string | undefined;
		onChange?:      ( color: string ) => void;
		enableAlpha?:   boolean;
		copyFormat?:    string;
		[k: string]:    unknown;
	}>;

	export const ColorIndicator:    ComponentType<{ colorValue?: string; [k: string]: unknown }>;
	export const ColorPalette:      ComponentType<AnyProps>;

	// ── Navigation
	export const TabPanel: ComponentType<{
		tabs:           { name: string; title: string; className?: string; content?: ReactNode }[];
		onSelect?:      ( tabName: string ) => void;
		initialTabName?: string;
		className?:     string;
		children:       ( tab: { name: string; title: string } ) => ReactNode;
		[k: string]:    unknown;
	}>;

	export const ButtonGroup: ComponentType<{ children?: ReactNode; className?: string; [k: string]: unknown }>;

	export const UnitControl: ComponentType<{
		label?:         string;
		value?:         string | number;
		onChange?:      ( value: string | undefined ) => void;
		units?:         { value: string; label: string; default?: number }[];
		min?:           number;
		max?:           number;
		isPressEnterToChange?: boolean;
		[k: string]:    unknown;
	}>;

	// ── Misc
	export const ExternalLink: ComponentType<{ href?: string; children?: ReactNode; [k: string]: unknown }>;
	export const Placeholder:  ComponentType<{ icon?: ReactNode; label?: string; instructions?: string; children?: ReactNode; [k: string]: unknown }>;
	export const Disabled:     ComponentType<{ isDisabled?: boolean; children?: ReactNode }>;
	export const Flex:         ComponentType<{ direction?: string; gap?: number; align?: string; justify?: string; children?: ReactNode; [k: string]: unknown }>;
	export const FlexItem:     ComponentType<{ isBlock?: boolean; children?: ReactNode; [k: string]: unknown }>;

	// ── Focal Point Picker
	export const FocalPointPicker: ComponentType<{
		label?:    string;
		url?:      string;
		value?:    { x: number; y: number };
		onChange?: ( value: { x: number; y: number } ) => void;
		[k: string]: unknown;
	}>;
}

// ── @wordpress/data ────────────────────────────────────────────────────────

declare module '@wordpress/data' {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type AnyProps = Record<string, any>;

	export function useSelect<T>( selector: ( select: ( storeId: string ) => AnyProps ) => T, deps?: unknown[] ): T;

	export function useDispatch( storeId: string ): AnyProps;

	export function select( storeId: string ): AnyProps;

	export function dispatch( storeId: string ): AnyProps;

	export function subscribe( listener: () => void ): () => void;

	export function registerStore( storeId: string, options: AnyProps ): AnyProps;

	export function createReduxStore( storeId: string, config: AnyProps ): AnyProps;

	export function register( store: AnyProps ): AnyProps;

	export function withSelect( mapSelectToProps: AnyProps ): ( component: AnyProps ) => AnyProps;

	export function withDispatch( mapDispatchToProps: AnyProps ): ( component: AnyProps ) => AnyProps;
}

// ── @wordpress/icons ──────────────────────────────────────────────────────

declare module '@wordpress/icons' {
	import type { ComponentType, SVGProps } from 'react';

	export type WPIcon = ComponentType<SVGProps<SVGSVGElement>>;

	// Specific icons used in this project
	export const copySmall:     WPIcon;
	export const plus:          WPIcon;
	export const close:         WPIcon;
	export const check:         WPIcon;
	export const trash:         WPIcon;
	export const edit:          WPIcon;
	export const seen:          WPIcon;
	export const unseen:        WPIcon;
	export const arrowLeft:     WPIcon;
	export const arrowRight:    WPIcon;
	export const arrowUp:       WPIcon;
	export const arrowDown:     WPIcon;
	export const chevronLeft:   WPIcon;
	export const chevronRight:  WPIcon;
	export const chevronUp:     WPIcon;
	export const chevronDown:   WPIcon;
	export const grid:          WPIcon;
	export const list:          WPIcon;
	export const image:         WPIcon;
	export const paragraph:     WPIcon;
	export const heading:       WPIcon;
	export const button:        WPIcon;
	export const table:         WPIcon;
	export const search:        WPIcon;
	export const upload:        WPIcon;
	export const alignLeft:     WPIcon;
	export const alignCenter:   WPIcon;
	export const alignRight:    WPIcon;
	export const alignJustify:  WPIcon;
	export const arrowLeft:     WPIcon;
	export const arrowRight:    WPIcon;
	export const arrowUp:       WPIcon;
	export const arrowDown:     WPIcon;
	export const link:          WPIcon;
	export const linkOff:       WPIcon;
	export const settings:      WPIcon;
	export const more:          WPIcon;
	export const reset:         WPIcon;
	export const Icon:          ComponentType<{ icon: WPIcon | string; size?: number; className?: string }>;

	// Catch-all for any other icon accessed by name
	const _default: Record<string, WPIcon>;
	export default _default;
}
