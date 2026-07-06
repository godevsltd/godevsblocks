/**
 * Bundled Tabler icon library.
 *
 * Each value is the inner SVG content (paths/shapes, no outer <svg> wrapper).
 * The outer wrapper is added by the Icon block with correct size/color attributes.
 *
 * Based on Tabler Icons (MIT License) — https://tabler.io/icons
 * viewBox: 0 0 24 24, stroke="currentColor", stroke-width="2",
 * stroke-linecap="round", stroke-linejoin="round", fill="none"
 */

export interface IconDefinition {
	slug: string;
	label: string;
	category: string;
	inner: string;
}

const ICONS: IconDefinition[] = [
	// ── UI / Actions ──────────────────────────────────────────────────────────
	{
		slug: 'home',
		label: 'Home',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />',
	},
	{
		slug: 'search',
		label: 'Search',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" />',
	},
	{
		slug: 'settings',
		label: 'Settings',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />',
	},
	{
		slug: 'x',
		label: 'Close',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" />',
	},
	{
		slug: 'check',
		label: 'Check',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" />',
	},
	{
		slug: 'plus',
		label: 'Plus',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" />',
	},
	{
		slug: 'minus',
		label: 'Minus',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" />',
	},
	{
		slug: 'menu',
		label: 'Menu',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" />',
	},
	{
		slug: 'filter',
		label: 'Filter',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z" />',
	},
	{
		slug: 'sort',
		label: 'Sort',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 9l4 -4l4 4m-4 -4v14" /><path d="M21 15l-4 4l-4 -4m4 4v-14" />',
	},
	{
		slug: 'grid',
		label: 'Grid',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2v-2z" /><path d="M3 13a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2v-2z" /><path d="M13 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2v-2z" /><path d="M13 13a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2v-2z" />',
	},
	{
		slug: 'list',
		label: 'List',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l11 0" /><path d="M9 12l11 0" /><path d="M9 18l11 0" /><path d="M5 6l0 .01" /><path d="M5 12l0 .01" /><path d="M5 18l0 .01" />',
	},
	{
		slug: 'sliders',
		label: 'Sliders',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4l0 6" /><path d="M19 4l0 4" /><path d="M5 20l0 -6" /><path d="M19 14l0 6" /><path d="M3 10l4 0l0 4l-4 0z" /><path d="M17 8l4 0l0 4l-4 0z" />',
	},
	{
		slug: 'toggle-right',
		label: 'Toggle',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M2 9a3 3 0 0 0 0 6h18a3 3 0 0 0 0 -6h-18z" /><path d="M17 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />',
	},
	{
		slug: 'refresh',
		label: 'Refresh',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />',
	},
	{
		slug: 'zoom-in',
		label: 'Zoom In',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M7 10l6 0" /><path d="M10 7l0 6" /><path d="M21 21l-6 -6" />',
	},
	{
		slug: 'maximize',
		label: 'Maximize',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" />',
	},
	{
		slug: 'copy',
		label: 'Copy',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />',
	},
	{
		slug: 'edit',
		label: 'Edit',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" /><path d="M16 5l3 3" />',
	},
	{
		slug: 'trash',
		label: 'Trash',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />',
	},
	{
		slug: 'lock',
		label: 'Lock',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" /><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /><path d="M8 11v-4a4 4 0 1 1 8 0v4" />',
	},
	{
		slug: 'eye',
		label: 'Eye',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />',
	},
	{
		slug: 'eye-off',
		label: 'Eye Off',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" />',
	},
	{
		slug: 'bookmark',
		label: 'Bookmark',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z" />',
	},
	{
		slug: 'flag',
		label: 'Flag',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 5a5 5 0 0 1 7 0a5 5 0 0 0 7 0v9a5 5 0 0 1 -7 0a5 5 0 0 0 -7 0v-9z" /><path d="M5 21v-7" />',
	},
	{
		slug: 'info',
		label: 'Info',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" />',
	},
	{
		slug: 'alert-triangle',
		label: 'Warning',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4" /><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.871l-8.106 -13.534a1.914 1.914 0 0 0 -3.274 0z" /><path d="M12 16h.01" />',
	},
	{
		slug: 'circle-check',
		label: 'Circle Check',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l2 2l4 -4" />',
	},
	{
		slug: 'circle-x',
		label: 'Circle X',
		category: 'ui',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M10 10l4 4m0 -4l-4 4" />',
	},
	// ── Arrows / Navigation ───────────────────────────────────────────────────
	{
		slug: 'arrow-right',
		label: 'Arrow Right',
		category: 'arrows',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" /><path d="M13 18l6 -6" /><path d="M13 6l6 6" />',
	},
	{
		slug: 'arrow-left',
		label: 'Arrow Left',
		category: 'arrows',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" /><path d="M5 12l6 6" /><path d="M5 12l6 -6" />',
	},
	{
		slug: 'arrow-up',
		label: 'Arrow Up',
		category: 'arrows',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M18 11l-6 -6" /><path d="M6 11l6 -6" />',
	},
	{
		slug: 'arrow-down',
		label: 'Arrow Down',
		category: 'arrows',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M18 13l-6 6" /><path d="M6 13l6 6" />',
	},
	{
		slug: 'chevron-right',
		label: 'Chevron Right',
		category: 'arrows',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" />',
	},
	{
		slug: 'chevron-left',
		label: 'Chevron Left',
		category: 'arrows',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" />',
	},
	{
		slug: 'chevron-up',
		label: 'Chevron Up',
		category: 'arrows',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 15l6 -6l6 6" />',
	},
	{
		slug: 'chevron-down',
		label: 'Chevron Down',
		category: 'arrows',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 9l6 6l6 -6" />',
	},
	{
		slug: 'chevrons-right',
		label: 'Chevrons Right',
		category: 'arrows',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7l5 5l-5 5" /><path d="M13 7l5 5l-5 5" />',
	},
	{
		slug: 'corner-down-right',
		label: 'Corner Down Right',
		category: 'arrows',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 6v6a3 3 0 0 0 3 3h10" /><path d="M13 12l6 3l-6 3" />',
	},
	{
		slug: 'rotate-clockwise',
		label: 'Rotate CW',
		category: 'arrows',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />',
	},
	// ── Communication ─────────────────────────────────────────────────────────
	{
		slug: 'mail',
		label: 'Mail',
		category: 'communication',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" /><path d="M3 7l9 6l9 -6" />',
	},
	{
		slug: 'phone',
		label: 'Phone',
		category: 'communication',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />',
	},
	{
		slug: 'message-circle',
		label: 'Message',
		category: 'communication',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1" />',
	},
	{
		slug: 'message-square',
		label: 'Chat',
		category: 'communication',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8l-6 4v-4h-2a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2z" />',
	},
	{
		slug: 'bell',
		label: 'Bell',
		category: 'communication',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" />',
	},
	{
		slug: 'send',
		label: 'Send',
		category: 'communication',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 14l11 -11" /><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />',
	},
	{
		slug: 'at',
		label: 'At / Mention',
		category: 'communication',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0v-1.5a9 9 0 1 0 -5.5 8.28" />',
	},
	{
		slug: 'inbox',
		label: 'Inbox',
		category: 'communication',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" /><path d="M4 13h3l3 3h4l3 -3h3" />',
	},
	// ── People ────────────────────────────────────────────────────────────────
	{
		slug: 'user',
		label: 'User',
		category: 'people',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />',
	},
	{
		slug: 'users',
		label: 'Users',
		category: 'people',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />',
	},
	{
		slug: 'user-plus',
		label: 'Add User',
		category: 'people',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M16 19h6" /><path d="M19 16v6" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4" />',
	},
	{
		slug: 'user-check',
		label: 'User Check',
		category: 'people',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4" /><path d="M15 19l2 2l4 -4" />',
	},
	{
		slug: 'id-badge',
		label: 'ID Badge',
		category: 'people',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 12h.01" /><path d="M13 12h2" /><path d="M9 16h.01" /><path d="M13 16h2" />',
	},
	// ── Files / Data ──────────────────────────────────────────────────────────
	{
		slug: 'file',
		label: 'File',
		category: 'files',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />',
	},
	{
		slug: 'folder',
		label: 'Folder',
		category: 'files',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />',
	},
	{
		slug: 'database',
		label: 'Database',
		category: 'files',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0" /><path d="M4 6v6a8 3 0 0 0 16 0v-6" /><path d="M4 12v6a8 3 0 0 0 16 0v-6" />',
	},
	{
		slug: 'cloud',
		label: 'Cloud',
		category: 'files',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878" />',
	},
	{
		slug: 'cloud-upload',
		label: 'Cloud Upload',
		category: 'files',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" /><path d="M9 15l3 -3l3 3" /><path d="M12 12l0 9" />',
	},
	{
		slug: 'server',
		label: 'Server',
		category: 'files',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" /><path d="M3 12m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" /><path d="M7 8l0 .01" /><path d="M7 16l0 .01" />',
	},
	{
		slug: 'code',
		label: 'Code',
		category: 'files',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 8l-4 4l4 4" /><path d="M17 8l4 4l-4 4" /><path d="M14 4l-4 16" />',
	},
	{
		slug: 'terminal',
		label: 'Terminal',
		category: 'files',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 7l5 5l-5 5" /><path d="M12 19l7 0" />',
	},
	// ── Media ─────────────────────────────────────────────────────────────────
	{
		slug: 'play',
		label: 'Play',
		category: 'media',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" />',
	},
	{
		slug: 'pause',
		label: 'Pause',
		category: 'media',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" />',
	},
	{
		slug: 'volume-2',
		label: 'Volume',
		category: 'media',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8a5 5 0 0 1 0 8" /><path d="M17.7 5a9 9 0 0 1 0 14" /><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v13a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />',
	},
	{
		slug: 'camera',
		label: 'Camera',
		category: 'media',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" /><path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />',
	},
	{
		slug: 'photo',
		label: 'Photo',
		category: 'media',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8h.01" /><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" /><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" /><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />',
	},
	{
		slug: 'video',
		label: 'Video',
		category: 'media',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 10l4.553 -2.277a1 1 0 0 1 1.447 .894v6.766a1 1 0 0 1 -1.447 .894l-4.553 -2.277v-4z" /><path d="M3 8a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-8z" />',
	},
	{
		slug: 'microphone',
		label: 'Microphone',
		category: 'media',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 2m0 3a3 3 0 0 1 6 0v5a3 3 0 0 1 -6 0z" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M8 21l8 0" /><path d="M12 17l0 4" />',
	},
	{
		slug: 'music',
		label: 'Music',
		category: 'media',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M9 17v-13l10 -2v13" />',
	},
	// ── Commerce ──────────────────────────────────────────────────────────────
	{
		slug: 'shopping-cart',
		label: 'Shopping Cart',
		category: 'commerce',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 17h-11v-14h-2" /><path d="M6 5l14 1l-1 7h-13" />',
	},
	{
		slug: 'shopping-bag',
		label: 'Shopping Bag',
		category: 'commerce',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 2l3 6" /><path d="M18 2l-3 6" /><path d="M3 8h18l-1.5 9a2 2 0 0 1 -2 1.5h-11a2 2 0 0 1 -2 -1.5z" /><path d="M9 11l0 3" /><path d="M15 11l0 3" />',
	},
	{
		slug: 'credit-card',
		label: 'Credit Card',
		category: 'commerce',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" /><path d="M3 10l18 0" /><path d="M7 15l.01 0" /><path d="M11 15l2 0" />',
	},
	{
		slug: 'wallet',
		label: 'Wallet',
		category: 'commerce',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" /><path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" />',
	},
	{
		slug: 'package',
		label: 'Package',
		category: 'commerce',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" /><path d="M12 12l8 -4.5" /><path d="M12 12l0 9" /><path d="M12 12l-8 -4.5" /><path d="M16 5.25l-8 4.5" />',
	},
	{
		slug: 'gift',
		label: 'Gift',
		category: 'commerce',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z" /><path d="M12 8l0 13" /><path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5" />',
	},
	{
		slug: 'tag',
		label: 'Tag',
		category: 'commerce',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />',
	},
	{
		slug: 'receipt',
		label: 'Receipt',
		category: 'commerce',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2" /><path d="M14 8h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5m2 0v1.5m0 -9v1.5" />',
	},
	// ── Locations / Travel ────────────────────────────────────────────────────
	{
		slug: 'map-pin',
		label: 'Map Pin',
		category: 'location',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />',
	},
	{
		slug: 'map',
		label: 'Map',
		category: 'location',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13" /><path d="M9 4v13" /><path d="M15 7v13" />',
	},
	{
		slug: 'globe',
		label: 'Globe',
		category: 'location',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M3.6 9h16.8" /><path d="M3.6 15h16.8" /><path d="M11.5 3a17 17 0 0 0 0 18" /><path d="M12.5 3a17 17 0 0 1 0 18" />',
	},
	{
		slug: 'plane',
		label: 'Plane',
		category: 'location',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3z" />',
	},
	// ── Health / Misc ─────────────────────────────────────────────────────────
	{
		slug: 'heart',
		label: 'Heart',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.566" />',
	},
	{
		slug: 'star',
		label: 'Star',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />',
	},
	{
		slug: 'sparkles',
		label: 'Sparkles',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 18a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2a2 2 0 0 1 2 2" /><path d="M12 8a6 6 0 0 1 6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 -6 -6a6 6 0 0 1 6 6" /><path d="M3 12a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2a2 2 0 0 1 2 2" />',
	},
	{
		slug: 'shield',
		label: 'Shield',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />',
	},
	{
		slug: 'shield-check',
		label: 'Shield Check',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" /><path d="M9 12l2 2l4 -4" />',
	},
	{
		slug: 'zap',
		label: 'Lightning',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2l-5 10h5l-1 10l8 -12h-5l3 -8z" />',
	},
	{
		slug: 'sun',
		label: 'Sun',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />',
	},
	{
		slug: 'moon',
		label: 'Moon',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />',
	},
	{
		slug: 'award',
		label: 'Award',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0" /><path d="M12 15l3.4 5.89l1.598 -3.233l3.598 .232l-3.4 -5.889" /><path d="M6.802 12l-3.4 5.89l3.598 -.233l1.598 3.232l3.4 -5.889" />',
	},
	{
		slug: 'trending-up',
		label: 'Trending Up',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 17l4 -4l4 4l4 -4l6 6" /><path d="M14 9l2 -2l2 2" /><path d="M21 3l-6 6" />',
	},
	{
		slug: 'thumbs-up',
		label: 'Thumbs Up',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" />',
	},
	{
		slug: 'rocket',
		label: 'Rocket',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" /><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" /><path d="M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />',
	},
	{
		slug: 'target',
		label: 'Target',
		category: 'misc',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />',
	},
	// ── Sharing / Links ───────────────────────────────────────────────────────
	{
		slug: 'share',
		label: 'Share',
		category: 'sharing',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M8.7 10.7l6.6 -3.4" /><path d="M8.7 13.3l6.6 3.4" />',
	},
	{
		slug: 'link',
		label: 'Link',
		category: 'sharing',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 15l6 -6" /><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" /><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />',
	},
	{
		slug: 'external-link',
		label: 'External Link',
		category: 'sharing',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" />',
	},
	{
		slug: 'download',
		label: 'Download',
		category: 'sharing',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" />',
	},
	{
		slug: 'upload',
		label: 'Upload',
		category: 'sharing',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 9l5 -5l5 5" /><path d="M12 4l0 12" />',
	},
	// ── Social ────────────────────────────────────────────────────────────────
	{
		slug: 'brand-twitter',
		label: 'Twitter / X',
		category: 'social',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />',
	},
	{
		slug: 'brand-facebook',
		label: 'Facebook',
		category: 'social',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />',
	},
	{
		slug: 'brand-instagram',
		label: 'Instagram',
		category: 'social',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" /><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M16.5 7.5l0 .01" />',
	},
	{
		slug: 'brand-linkedin',
		label: 'LinkedIn',
		category: 'social',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" /><path d="M8 11l0 5" /><path d="M8 8l0 .01" /><path d="M12 16l0 -5" /><path d="M16 16v-3a2 2 0 0 0 -4 0" />',
	},
	{
		slug: 'brand-youtube',
		label: 'YouTube',
		category: 'social',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" /><path d="M10 9l5 3l-5 3z" />',
	},
	{
		slug: 'brand-github',
		label: 'GitHub',
		category: 'social',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />',
	},
	{
		slug: 'brand-tiktok',
		label: 'TikTok',
		category: 'social',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />',
	},
	{
		slug: 'brand-pinterest',
		label: 'Pinterest',
		category: 'social',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 20l4 -9" /><path d="M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75 -1.929 3.75 -4.3a4.25 4.25 0 0 0 -4.25 -4.2a4.5 4.5 0 0 0 -4.5 4.5c0 1.215 .381 2.35 1 3" /><path d="M12.004 3c-4.97 .001 -9.004 4.036 -9.004 9.004c0 4.972 4.033 9.004 9.004 9.004c4.97 0 9.004 -4.034 9.004 -9.004c0 -4.97 -4.033 -9.003 -9.004 -9.004z" />',
	},
	// ── Calendar / Time ───────────────────────────────────────────────────────
	{
		slug: 'calendar',
		label: 'Calendar',
		category: 'time',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" /><path d="M11 15h1" /><path d="M12 15v3" />',
	},
	{
		slug: 'clock',
		label: 'Clock',
		category: 'time',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 7v5l3 3" />',
	},
	{
		slug: 'hourglass',
		label: 'Hourglass',
		category: 'time',
		inner: '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6.5 7h11" /><path d="M6.5 17h11" /><path d="M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1z" /><path d="M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1z" />',
	},
];

export default ICONS;

export const ICON_CATEGORIES: Record< string, string > = {
	all: 'All',
	ui: 'UI',
	arrows: 'Arrows',
	communication: 'Communication',
	people: 'People',
	files: 'Files',
	media: 'Media',
	commerce: 'Commerce',
	location: 'Location',
	sharing: 'Sharing',
	social: 'Social',
	time: 'Time',
	misc: 'Misc',
};

/** Map for O(1) slug lookup. */
export const ICON_MAP: Record< string, IconDefinition > = Object.fromEntries(
	ICONS.map( ( icon ) => [ icon.slug, icon ] )
);

/**
 * Build a full SVG string from an icon slug.
 * Returns an empty string if the slug is not found.
 * @param slug
 * @param size
 * @param color
 */
export function iconToSvg(
	slug: string,
	size = 24,
	color = 'currentColor'
): string {
	const icon = ICON_MAP[ slug ];
	if ( ! icon ) {
		return '';
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${ size }" height="${ size }" viewBox="0 0 24 24" fill="none" stroke="${ color }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ icon.inner }</svg>`;
}
