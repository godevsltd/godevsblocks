/**
 * GoBlocks — Query System Type Definitions
 *
 * Mirrors the PHP QueryAttributes schema defined in .claude/QUERY-BUILDER.md.
 */

export interface TaxFilter {
	taxonomy: string;
	field: 'slug' | 'id' | 'name';
	terms: string[];
	operator: 'IN' | 'NOT IN' | 'AND';
	includeChildren: boolean;
}

export interface MetaClause {
	key: string;
	value: string | string[];
	compare:
		| '='
		| '!='
		| '>'
		| '>='
		| '<'
		| '<='
		| 'LIKE'
		| 'NOT LIKE'
		| 'IN'
		| 'NOT IN'
		| 'BETWEEN'
		| 'NOT BETWEEN'
		| 'EXISTS'
		| 'NOT EXISTS';
	type:
		| 'CHAR'
		| 'NUMERIC'
		| 'BINARY'
		| 'DATE'
		| 'DATETIME'
		| 'DECIMAL'
		| 'SIGNED'
		| 'TIME'
		| 'UNSIGNED';
}

export interface MetaQuery {
	relation: 'AND' | 'OR';
	clauses: MetaClause[];
}

export interface DateQuery {
	after?: string;
	before?: string;
	inclusive: boolean;
	column: 'post_date' | 'post_modified' | 'post_date_gmt';
}

export interface QueryAttributes {
	postType: string[];
	postStatus: string[];
	includeIds: number[];
	excludeIds: number[];
	excludeCurrent: boolean;
	taxQuery: TaxFilter[];
	author: number[];
	metaQuery: MetaQuery | null;
	dateQuery: DateQuery | null;
	orderBy:
		| 'date'
		| 'title'
		| 'menu_order'
		| 'rand'
		| 'comment_count'
		| 'meta_value'
		| 'meta_value_num';
	metaKey: string;
	order: 'ASC' | 'DESC';
	perPage: number;
	offset: number;
	noPaging: boolean;
	search: string;
	sticky: 'include' | 'exclude' | 'only';
	inherit: boolean;
	cacheResults: boolean;
}

export const QUERY_DEFAULTS: QueryAttributes = {
	postType: [ 'post' ],
	postStatus: [ 'publish' ],
	includeIds: [],
	excludeIds: [],
	excludeCurrent: false,
	taxQuery: [],
	author: [],
	metaQuery: null,
	dateQuery: null,
	orderBy: 'date',
	metaKey: '',
	order: 'DESC',
	perPage: 10,
	offset: 0,
	noPaging: false,
	search: '',
	sticky: 'include',
	inherit: false,
	cacheResults: true,
};

export interface QueryLayout {
	type: 'list' | 'grid';
	columns: 1 | 2 | 3 | 4;
}

export const LAYOUT_DEFAULTS: QueryLayout = {
	type: 'grid',
	columns: 3,
};

export interface PostSummary {
	id: number;
	title: string;
	permalink: string;
	thumbnail: string | null;
	excerpt: string;
	date: string;
	author: string;
}
