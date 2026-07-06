<?php
/**
 * Query Sanitizer.
 *
 * @package GoBlocks\Query
 */

namespace GoBlocks\Query;

defined( 'ABSPATH' ) || exit;

/**
 * Sanitizes raw query block attributes before they are fed to QueryBuilder.
 *
 * All methods return safe values ready for use in WP_Query args.
 * No value from the editor or REST body reaches WP_Query without going through here.
 */
final class QuerySanitizer {

	/**
	 * Allowed orderby values — WP_Query supports more, but we expose only these.
	 *
	 * @var string[]
	 */
	private const ALLOWED_ORDER_BY = array(
		'date',
		'modified',
		'title',
		'menu_order',
		'rand',
		'comment_count',
		'meta_value',
		'meta_value_num',
		'ID',
	);

	/**
	 * Sanitize an array of post type slugs, keeping only registered ones.
	 *
	 * @param  mixed $types Raw post_type value.
	 * @return string[] Sanitized post type slugs (never empty — falls back to 'post').
	 */
	public static function sanitize_post_types( $types ): array {
		$types = is_array( $types ) ? $types : ( '' !== (string) $types ? array( (string) $types ) : array() );

		$clean = array();
		foreach ( $types as $type ) {
			$slug = sanitize_key( (string) $type );
			if ( $slug && post_type_exists( $slug ) ) {
				$clean[] = $slug;
			}
		}

		return $clean ? array_values( array_unique( $clean ) ) : array( 'post' );
	}

	/**
	 * Sanitize an array of post status slugs.
	 *
	 * Non-admins are limited to 'publish'. Editors with read_private_posts may
	 * also request 'private'. 'draft' and 'pending' are stripped for everyone
	 * except users with edit_others_posts.
	 *
	 * @param  mixed $statuses Raw status value(s).
	 * @return string[] Sanitized status slugs.
	 */
	public static function sanitize_status( $statuses ): array {
		$statuses = is_array( $statuses ) ? $statuses : array( (string) $statuses );

		$privileged_statuses = array( 'draft', 'pending', 'future', 'private' );
		$clean               = array();

		foreach ( $statuses as $status ) {
			$status = sanitize_key( (string) $status );
			if ( '' === $status ) {
				continue;
			}
			if ( in_array( $status, $privileged_statuses, true ) ) {
				if ( ! current_user_can( 'edit_others_posts' ) ) {
					continue;
				}
			}
			$clean[] = $status;
		}

		if ( empty( $clean ) || ! current_user_can( 'edit_posts' ) ) {
			return array( 'publish' );
		}

		return array_values( array_unique( $clean ) );
	}

	/**
	 * Sanitize a tax_query array.
	 *
	 * Each clause must have a registered taxonomy and a valid field type.
	 *
	 * @param  mixed $tax_query Raw tax_query from block attributes.
	 * @return array<int, array<string, mixed>> Sanitized tax_query clauses.
	 */
	public static function sanitize_tax_query( $tax_query ): array {
		if ( ! is_array( $tax_query ) ) {
			return array();
		}

		$clean = array();

		foreach ( $tax_query as $clause ) {
			if ( ! is_array( $clause ) ) {
				continue;
			}

			$taxonomy = sanitize_key( (string) ( $clause['taxonomy'] ?? '' ) );
			if ( '' === $taxonomy || ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}

			$field    = in_array( $clause['field'] ?? 'term_id', array( 'term_id', 'slug', 'name' ), true )
				? (string) $clause['field']
				: 'term_id';
			$operator = in_array( $clause['operator'] ?? 'IN', array( 'IN', 'NOT IN', 'AND' ), true )
				? (string) $clause['operator']
				: 'IN';

			$terms = array();
			foreach ( (array) ( $clause['terms'] ?? array() ) as $term ) {
				$terms[] = 'term_id' === $field ? absint( $term ) : sanitize_text_field( (string) $term );
			}

			$clean[] = array(
				'taxonomy'         => $taxonomy,
				'field'            => $field,
				'terms'            => $terms,
				'operator'         => $operator,
				'include_children' => ! empty( $clause['includeChildren'] ),
			);
		}

		return $clean;
	}

	/**
	 * Sanitize a meta_query array.
	 *
	 * Only a known-safe subset of comparison operators and types are allowed.
	 *
	 * @param  mixed $meta_query Raw meta_query from block attributes.
	 * @return array<string, mixed> Sanitized meta_query.
	 */
	public static function sanitize_meta_query( $meta_query ): array {
		if ( ! is_array( $meta_query ) ) {
			return array();
		}

		$allowed_compare = array(
			'=',
			'!=',
			'>',
			'>=',
			'<',
			'<=',
			'LIKE',
			'NOT LIKE',
			'IN',
			'NOT IN',
			'BETWEEN',
			'NOT BETWEEN',
			'EXISTS',
			'NOT EXISTS',
		);
		$allowed_types   = array(
			'CHAR',
			'NUMERIC',
			'BINARY',
			'DATE',
			'DATETIME',
			'DECIMAL',
			'SIGNED',
			'TIME',
			'UNSIGNED',
		);

		$relation = in_array( strtoupper( (string) ( $meta_query['relation'] ?? 'AND' ) ), array( 'AND', 'OR' ), true )
			? strtoupper( (string) $meta_query['relation'] )
			: 'AND';

		$clauses = array();
		foreach ( (array) ( $meta_query['clauses'] ?? array() ) as $clause ) {
			if ( ! is_array( $clause ) || empty( $clause['key'] ) ) {
				continue;
			}

			$compare = strtoupper( (string) ( $clause['compare'] ?? '=' ) );
			$compare = in_array( $compare, $allowed_compare, true ) ? $compare : '=';

			$type = strtoupper( (string) ( $clause['type'] ?? 'CHAR' ) );
			$type = in_array( $type, $allowed_types, true ) ? $type : 'CHAR';

			$value = $clause['value'] ?? '';
			if ( is_array( $value ) ) {
				$value = array_map( 'sanitize_text_field', array_map( 'strval', $value ) );
			} else {
				$value = sanitize_text_field( (string) $value );
			}

			$clauses[] = array(
				'key'     => sanitize_text_field( (string) $clause['key'] ),
				'value'   => $value,
				'compare' => $compare,
				'type'    => $type,
			);
		}

		if ( empty( $clauses ) ) {
			return array();
		}

		return array(
			'relation' => $relation,
			...$clauses,
		);
	}

	/**
	 * Sanitize a date_query configuration.
	 *
	 * @param  mixed $date_query Raw date_query from block attributes.
	 * @return array<int, array<string, mixed>> Sanitized date_query clauses, or empty array if invalid.
	 */
	public static function sanitize_date_query( $date_query ): array {
		if ( ! is_array( $date_query ) || empty( $date_query ) ) {
			return array();
		}

		$allowed_columns = array( 'post_date', 'post_modified', 'post_date_gmt' );
		$column          = in_array( $date_query['column'] ?? 'post_date', $allowed_columns, true )
			? (string) $date_query['column']
			: 'post_date';

		$clause = array( 'column' => $column );

		if ( ! empty( $date_query['after'] ) && preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $date_query['after'] ) ) {
			$clause['after'] = (string) $date_query['after'];
		}

		if ( ! empty( $date_query['before'] ) && preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $date_query['before'] ) ) {
			$clause['before'] = (string) $date_query['before'];
		}

		if ( isset( $date_query['inclusive'] ) ) {
			$clause['inclusive'] = (bool) $date_query['inclusive'];
		}

		return empty( $clause['after'] ) && empty( $clause['before'] ) ? array() : array( $clause );
	}

	/**
	 * Sanitize the orderby parameter.
	 *
	 * @param  mixed $orderby Raw orderby value.
	 * @return string Sanitized orderby, defaulting to 'date'.
	 */
	public static function sanitize_order_by( $orderby ): string {
		$value = (string) $orderby;
		return in_array( $value, self::ALLOWED_ORDER_BY, true ) ? $value : 'date';
	}

	/**
	 * Clamp posts_per_page to the server-side maximum of 100.
	 *
	 * @param  mixed $n Raw per_page value.
	 * @return int Sanitized value in the range 1–100.
	 */
	public static function sanitize_per_page( $n ): int {
		$int = absint( $n );
		return max( 1, min( 100, $int ? $int : 10 ) );
	}
}
