<?php
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.NamingConventions.PrefixAllGlobals
if ( ! defined( 'ABSPATH' ) ) {
	exit; // phpcs:ignore WordPress.Security.NonceVerification -- CLI-only script.
}
/**
 * Distributes aggregated pattern CSS from the one root block into each child
 * block's own `generatedCss` attribute.
 *
 * Run: php bin/fix-pattern-css.php
 */

$patterns_dir = __DIR__ . '/../patterns';

/**
 * Parse minified CSS into an array of rule strings.
 * Handles: base rules, pseudo rules, @media wrapper rules.
 * Returns array of [ 'selectors' => [...], 'rule' => string, 'media' => string|null ]
 */
function goblocks_parse_css_rules( string $css ): array {
	$rules = [];
	$pos   = 0;
	$len   = strlen( $css );

	while ( $pos < $len ) {
		// Skip whitespace.
		while ( $pos < $len && ctype_space( $css[ $pos ] ) ) {
			$pos++;
		}
		if ( $pos >= $len ) {
			break;
		}

		if ( substr( $css, $pos, 6 ) === '@media' ) {
			// Consume the @media condition up to the first '{'.
			$cond_end = strpos( $css, '{', $pos );
			$media    = substr( $css, $pos, $cond_end - $pos );
			$pos      = $cond_end + 1; // skip '{'

			// Collect inner rules until matching '}'.
			$depth = 1;
			while ( $pos < $len && $depth > 0 ) {
				// Find next rule inside @media.
				$inner_start = $pos;
				while ( $pos < $len && $css[ $pos ] !== '{' && $css[ $pos ] !== '}' ) {
					$pos++;
				}
				if ( $pos >= $len ) {
					break;
				}
				if ( $css[ $pos ] === '}' ) {
					$pos++;
					break; // End of @media block.
				}
				// We have '{', so the inner rule starts at $inner_start.
				$selector_str = trim( substr( $css, $inner_start, $pos - $inner_start ) );
				$pos++;           // skip '{'

				// Read until matching '}'.
				$rule_end = strpos( $css, '}', $pos );
				$rule_body = substr( $css, $pos, $rule_end - $pos );
				$pos       = $rule_end + 1;

				$full_rule   = $selector_str . '{' . $rule_body . '}';
				$media_rule  = $media . '{' . $full_rule . '}';
				$selectors   = array_map( 'trim', explode( ',', $selector_str ) );

				$rules[] = [
					'selectors' => $selectors,
					'rule'      => $full_rule,
					'media'     => $media,
					'full'      => $media_rule,
				];
			}
		} else {
			// Regular rule: read selector up to '{'.
			$rule_start    = $pos;
			$selector_end  = strpos( $css, '{', $pos );
			if ( $selector_end === false ) {
				break;
			}
			$selector_str = trim( substr( $css, $pos, $selector_end - $pos ) );
			$pos          = $selector_end + 1;

			$rule_end  = strpos( $css, '}', $pos );
			if ( $rule_end === false ) {
				break;
			}
			$rule_body = substr( $css, $pos, $rule_end - $pos );
			$pos       = $rule_end + 1;

			$full_rule = $selector_str . '{' . $rule_body . '}';
			$selectors = array_map( 'trim', explode( ',', $selector_str ) );

			$rules[] = [
				'selectors' => $selectors,
				'rule'      => $full_rule,
				'media'     => null,
				'full'      => $full_rule,
			];
		}
	}

	return $rules;
}

/**
 * Given a CSS selector like ".gb-box-p1hero::before" or ".gb-box-p1hero .gb-inner",
 * extract the uniqueId (last segment of the first .gb-*-{id} class).
 */
function goblocks_extract_unique_id( string $selector ): ?string {
	if ( preg_match( '/^\.gb-[a-z-]+-([a-z0-9]+)(?:[:\s{,]|$)/', $selector, $m ) ) {
		return $m[1];
	}
	return null;
}

/**
 * Process one pattern file: find aggregated CSS, split per-block, rewrite file.
 */
function goblocks_process_pattern( string $path ): void {
	$content = file_get_contents( $path );
	if ( $content === false ) {
		echo "  ERROR: cannot read $path\n";
		return;
	}

	// Find all generatedCss values and their positions in the content.
	// Pattern: "generatedCss":"VALUE"
	// We look for the one non-empty value.
	$pattern    = '/"generatedCss":"((?:[^"\\\\]|\\\\.)*)"/';
	preg_match_all( $pattern, $content, $matches, PREG_OFFSET_CAPTURE );

	$agg_css       = null;
	$agg_match_pos = null;

	foreach ( $matches[1] as $i => $m ) {
		$val = json_decode( '"' . $m[0] . '"' );  // Unescape JSON string.
		if ( $val === null ) {
			$val = $m[0]; // fallback: use raw.
		}
		if ( $val !== '' ) {
			$agg_css       = $val;
			$agg_match_pos = $i;
		}
	}

	if ( $agg_css === null ) {
		echo "  SKIP: no aggregated CSS found in " . basename( $path ) . "\n";
		return;
	}

	// Extract all uniqueIds present in the pattern.
	preg_match_all( '/"uniqueId":"([^"]+)"/', $content, $uid_matches );
	$all_uids = array_unique( $uid_matches[1] );

	// Parse CSS into rules.
	$rules = goblocks_parse_css_rules( $agg_css );

	// Map uniqueId → CSS string.
	$uid_css = [];
	foreach ( $all_uids as $uid ) {
		$uid_css[ $uid ] = '';
	}

	// Accumulate per-block CSS. A rule belongs to a block if ANY selector in the
	// rule starts with .gb-{anything}-{uid}.
	foreach ( $rules as $rule ) {
		$assigned = [];

		foreach ( $rule['selectors'] as $selector ) {
			$uid = goblocks_extract_unique_id( $selector );
			if ( $uid && isset( $uid_css[ $uid ] ) && ! in_array( $uid, $assigned, true ) ) {
				$assigned[] = $uid;
			}
		}

		if ( empty( $assigned ) ) {
			// Couldn't assign — put in the first block as a fallback.
			if ( ! empty( $all_uids ) ) {
				$uid_css[ $all_uids[0] ] .= $rule['full'];
			}
			continue;
		}

		if ( count( $assigned ) === 1 ) {
			// Single-block rule.
			$uid_css[ $assigned[0] ] .= $rule['full'];
		} else {
			// Multi-block rule (e.g. ".gb-button-p1b1,.gb-button-p1b2{...}").
			// Split the @media (if any) into per-block rules.
			if ( $rule['media'] !== null ) {
				foreach ( $assigned as $uid ) {
					// Only include selectors relevant to this uid.
					$relevant_sels = array_filter( $rule['selectors'], function( $sel ) use ( $uid ) {
						return goblocks_extract_unique_id( $sel ) === $uid;
					});
					if ( $relevant_sels ) {
						$new_sel  = implode( ',', $relevant_sels );
						$body     = substr( $rule['rule'], strpos( $rule['rule'], '{' ) + 1, -1 );
						$new_rule = $rule['media'] . '{' . $new_sel . '{' . $body . '}}';
						$uid_css[ $uid ] .= $new_rule;
					}
				}
			} else {
				foreach ( $assigned as $uid ) {
					$relevant_sels = array_filter( $rule['selectors'], function( $sel ) use ( $uid ) {
						return goblocks_extract_unique_id( $sel ) === $uid;
					});
					if ( $relevant_sels ) {
						$new_sel  = implode( ',', $relevant_sels );
						$body     = substr( $rule['rule'], strpos( $rule['rule'], '{' ) + 1, -1 );
						$new_rule = $new_sel . '{' . $body . '}';
						$uid_css[ $uid ] .= $new_rule;
					}
				}
			}
		}
	}

	// Rewrite pattern file: replace each "generatedCss":"VALUE" with per-block CSS.
	$new_content = preg_replace_callback(
		'/"generatedCss":"((?:[^"\\\\]|\\\\.)*)"/',
		function( $m ) use ( &$uid_css, $content ) {
			// We need to know which block this occurrence belongs to.
			// Use a static counter approach — we'll handle this differently.
			return $m[0]; // placeholder; real replacement below.
		},
		$content
	);

	// Better approach: replace occurrences sequentially, matching each one to its
	// preceding uniqueId in the same block comment.
	// Walk the content and replace each "generatedCss":"..." based on nearby uniqueId.
	$new_content = $content;
	$offset      = 0;

	while ( true ) {
		// Find next generatedCss occurrence.
		$gen_pos = strpos( $new_content, '"generatedCss":"', $offset );
		if ( $gen_pos === false ) {
			break;
		}

		// Find the closing quote of the value.
		$val_start = $gen_pos + strlen( '"generatedCss":"' );
		$val_end   = $val_start;
		while ( $val_end < strlen( $new_content ) ) {
			if ( $new_content[ $val_end ] === '"' && $new_content[ $val_end - 1 ] !== '\\' ) {
				break;
			}
			$val_end++;
		}

		// Look backwards from $gen_pos for the nearest "uniqueId":"..." in this block comment.
		// Block comments span from <!-- to -->. Find the start of this comment.
		$comment_start = strrpos( substr( $new_content, 0, $gen_pos ), '<!-- wp:' );

		$uid = null;
		if ( $comment_start !== false ) {
			$comment_chunk = substr( $new_content, $comment_start, $gen_pos - $comment_start );
			if ( preg_match( '/"uniqueId":"([^"]+)"/', $comment_chunk, $uid_m ) ) {
				$uid = $uid_m[1];
			}
		}

		if ( $uid && isset( $uid_css[ $uid ] ) ) {
			$new_val          = $uid_css[ $uid ];
			$new_val_json     = addcslashes( $new_val, '"\\' );
			$replacement      = '"generatedCss":"' . $new_val_json . '"';
			$old_len          = $val_end + 1 - $gen_pos;
			$new_content      = substr( $new_content, 0, $gen_pos )
				. $replacement
				. substr( $new_content, $val_end + 1 );
			$offset = $gen_pos + strlen( $replacement );
		} else {
			$offset = $val_end + 1;
		}
	}

	file_put_contents( $path, $new_content );
	$count = count( array_filter( $uid_css, fn( $v ) => $v !== '' ) );
	echo "  OK: " . basename( $path ) . " — CSS distributed to $count/" . count( $uid_css ) . " blocks\n";
}

// ── Main ─────────────────────────────────────────────────────────────────────

$files = glob( $patterns_dir . '/**/*.php' );
echo "Processing " . count( $files ) . " pattern files...\n";

foreach ( $files as $file ) {
	echo basename( dirname( $file ) ) . '/' . basename( $file ) . ":\n";
	goblocks_process_pattern( $file );
}

echo "\nDone.\n";
