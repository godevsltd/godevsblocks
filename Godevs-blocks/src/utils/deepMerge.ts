/**
 * Deep merge utility for GoBlocks nested style objects.
 *
 * Used by `setAttributes` to update a single ResponsiveValue key (e.g. `md`)
 * without clobbering sibling breakpoints or adjacent style categories.
 *
 * Rules:
 * - Plain objects are merged recursively.
 * - Arrays are replaced (not concatenated) — no block attribute uses array merge.
 * - Primitives from `source` always override `target`.
 * - `undefined` values in `source` are skipped (use null to explicitly clear).
 * - Returns a new object; originals are not mutated.
 */

type PlainObject = Record< string, unknown >;

function isPlainObject( value: unknown ): value is PlainObject {
	return (
		null !== value &&
		'object' === typeof value &&
		! Array.isArray( value ) &&
		Object.getPrototypeOf( value ) === Object.prototype
	);
}

/**
 * Recursively merge `source` into `target`.
 * Returns a new plain object — inputs are never mutated.
 * @param target
 * @param source
 */
export function deepMerge< T extends object >(
	target: T,
	source: Partial< T >
): T {
	const output: PlainObject = { ...( target as PlainObject ) };

	for ( const key of Object.keys( source ) as Array< keyof typeof source > ) {
		const sourceVal = source[ key ];
		const targetVal = output[ key as string ];

		if ( undefined === sourceVal ) {
			// Skip explicit undefined — lets callers omit keys they don't want to touch.
			continue;
		}

		if ( isPlainObject( sourceVal ) && isPlainObject( targetVal ) ) {
			output[ key as string ] = deepMerge( targetVal, sourceVal );
		} else {
			output[ key as string ] = sourceVal;
		}
	}

	return output as T;
}

/**
 * Set a deeply nested value by dot-path string.
 *
 * @param obj
 * @param path
 * @param value
 * @example
 * setNestedValue({}, 'spacing.paddingTop.md', '20px')
 * → { spacing: { paddingTop: { md: '20px' } } }
 */
export function setNestedValue< T extends PlainObject >(
	obj: T,
	path: string,
	value: unknown
): T {
	const keys = path.split( '.' );
	const patch = buildNestedPatch( keys, value );
	return deepMerge( obj, patch as Partial< T > );
}

function buildNestedPatch( keys: string[], value: unknown ): PlainObject {
	if ( 0 === keys.length ) {
		return {};
	}

	const [ head, ...rest ] = keys;
	if ( ! head ) {
		return {};
	}

	return {
		[ head ]: 0 === rest.length ? value : buildNestedPatch( rest, value ),
	};
}

/**
 * Get a deeply nested value by dot-path string.
 * Returns `undefined` if any key along the path is missing.
 *
 * @param obj
 * @param path
 * @example
 * getNestedValue({ spacing: { paddingTop: { md: '20px' } } }, 'spacing.paddingTop.md')
 * → '20px'
 */
export function getNestedValue( obj: PlainObject, path: string ): unknown {
	const keys = path.split( '.' );
	let current: unknown = obj;

	for ( const key of keys ) {
		if ( ! isPlainObject( current ) ) {
			return undefined;
		}
		current = current[ key ];
	}

	return current;
}

/**
 * Omit keys at the top level of an object.
 * Returns a new object without mutating the input.
 * @param obj
 * @param keys
 */
export function omitKeys< T extends PlainObject >(
	obj: T,
	keys: Array< keyof T >
): Partial< T > {
	const out: Partial< T > = { ...obj };
	for ( const key of keys ) {
		delete out[ key ];
	}
	return out;
}

/**
 * Pick specific keys from an object.
 * Returns a new object containing only the requested keys.
 * @param obj
 * @param keys
 */
export function pickKeys< T extends PlainObject >(
	obj: T,
	keys: Array< keyof T >
): Partial< T > {
	const out: Partial< T > = {};
	for ( const key of keys ) {
		if ( key in obj ) {
			out[ key ] = obj[ key ];
		}
	}
	return out;
}
