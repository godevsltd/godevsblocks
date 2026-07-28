/**
 * GoBlocks Settings Page Entry Point
 *
 * Loaded on the GoBlocks settings admin page (Settings → GoBlocks).
 * Mounts the React settings UI which manages:
 *  - Breakpoint configuration
 *  - Global color palette
 *  - Global typography presets
 *  - Container width
 *  - CSS print method
 *  - Dark mode toggle
 *  - Google Fonts toggle
 *
 * Built to: build/settings.js + build/settings.asset.php
 */

// Global type augmentation.
import './types/block';

// Settings page React SPA.
import './settings/index';
