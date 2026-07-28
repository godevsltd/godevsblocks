<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals
if ( ! defined( 'ABSPATH' ) ) {
	exit; // phpcs:ignore -- CLI-only script; run via wp eval-file.
}
$src   = "/var/www/html/wp-content/plugins/goblocks";
$dest  = "/tmp/goblocks.zip";
$exDir = ["node_modules",".git","bin",".claude","tests"];
$exFil = ["verify3.mjs","verify-admin.mjs","verify2.mjs","ISSUES.md"];
if (file_exists($dest)) unlink($dest); // phpcs:ignore WordPress.WP.AlternativeFunctions.unlink_unlink -- No WP context; pure PHP CLI script.
$zip = new ZipArchive;
$zip->open($dest, ZipArchive::CREATE | ZipArchive::OVERWRITE);
$iter = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($src, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);
$n = 0;
foreach ($iter as $file) {
    $fp  = $file->getRealPath();
    $rel = ltrim(str_replace($src, "", $fp), "/");
    $pts = explode("/", $rel);
    $skip = false;
    foreach ($pts as $pt) {
        if (in_array($pt, $exDir, true) || in_array($pt, $exFil, true)) {
            $skip = true; break;
        }
    }
    if ($skip) continue;
    $zp = "goblocks/" . $rel;
    if ($file->isDir()) { $zip->addEmptyDir($zp); }
    else { $zip->addFile($fp, $zp); $n++; }
}
$zip->close();
echo "Files: $n\n";
echo "Size: " . round(filesize($dest)/1048576, 2) . " MB\n";
