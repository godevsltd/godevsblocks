WP.org Plugin Icon Requirements
================================

Required files for wordpress.org/plugins/goblocks/assets/:
  icon-128x128.png  — 128x128px (submitted to WP.org via SVN, not the plugin zip)
  icon-256x256.png  — 256x256px (retina)

Source SVG: assets/icon.svg

To generate the PNGs from the SVG:
  Using Inkscape CLI:  inkscape --export-filename=icon-128x128.png --export-width=128 --export-height=128 assets/icon.svg
  Using ImageMagick:   convert -background none assets/icon.svg -resize 128x128 assets/images/icon-128x128.png

WP.org Plugin Banner Requirements
===================================
Required files for wordpress.org/plugins/goblocks/assets/:
  banner-772x250.jpg  — standard banner
  banner-1544x500.jpg — retina banner

Note: Icons and banners go in the SVN /assets/ folder, NOT inside the plugin zip.
They are separate from the plugin files on WP.org.
