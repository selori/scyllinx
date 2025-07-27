import type { QueryGrammar } from "../drivers/grammars/QueryGrammar";
import type { DatabaseDriver } from "../drivers/DatabaseDriver";
import type { WhereClause } from "@/types";
import type { Model } from "@/model/Model";
type Operator = "=" | "!=" | "<" | "<=" | ">" | ">=" | "in";
/**
 * QueryBuilder class for building and executing database queries.
 * Provides a fluent interface for constructing SQL/CQL queries with support for:
 * - Basic CRUD operations (SELECT, INSERT, UPDATE, DELETE)
 * - Complex WHERE clauses and joins
 * - ScyllaDB-specific features (ALLOW FILTERING, TTL, lightweight transactions)
 * - Eager loading of relationships
 * - Query optimization and debugging
 *
 * @template TModel - The model type this query builder operates on
 * @template TAttrs - The attributes/columns available for this model
 *
 * @example
 *
 * // Basic usage
 * const users = await new QueryBuilder('users')
 *   .where('active', true)
 *   .orderBy('created_at', 'desc')
 *   .limit(10)
 *   .get();
 *
 * // With model binding
 * const query = User.query()
 *   .where('email', 'john@example.com')
 *   .with('posts', 'comments');
 *
 * // ScyllaDB specific
 * const result = await new QueryBuilder('analytics')
 *   .where('user_id', userId)
 *   .allowFiltering()
 *   .get();
 * ```
 */
export declare class QueryBuilder<TModel extends Model<any>, TAttrs> {
    [x: string]: any;
    protected driver: DatabaseDriver;
    protected grammar: QueryGrammar;
    protected _select: string[];
    protected _from: string;
    protected _values: Record<string, any>;
    protected _joins: any[];
    protected _wheres: any[];
    protected _groups: string[];
    protected _havings: any[];
    protected _orders: any[];
    protected _limit?: number;
    protected _offset?: number;
    protected _unions: any[];
    protected eager: string[];
    protected _allowFiltering: boolean;
    protected _ttl?: number;
    protected _ifNotExists: boolean;
    protected _ifConditions: any[];
    protected model?: new () => TModel;
    protected connection?: string;
    /**
     * Creates a new QueryBuilder instance. haha
     *
     * @param table - The table name to query
     * @param connection - Optional connection name to use
     *
     * @example
     *
     * const qb = new QueryBuilder('users');
     * const qbWithConn = new QueryBuilder('users', 'analytics');
     * ```
     */
    constructor(table: string, connection?: string);
    /**
     * Sets the model class for this query builder.
     * Enables model hydration and relationship loading.
     *
     * @param model - Model constructor function
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * const query = new QueryBuilder('users').setModel(User);
     * const users = await query.get(); // Returns User instances
     * ```
     */
    setModel<M extends TModel>(model: new () => M): QueryBuilder<M, TAttrs>;
    /**
     * Specifies the columns to select in the query.
     * Replaces any previously selected columns.
     *
     * @param columns - Column names to select
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * // Select specific columns
     * query.select('id', 'name', 'email');
     *
     * // Select all columns (default)
     * query.select();
     * ```
     */
    select<K extends keyof TAttrs>(...columns: K[]): this;
    /**
     * Adds additional columns to the existing SELECT clause.
     *
     * @param columns - Additional column names to select
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.select('id', 'name')
     *      .addSelect('email', 'created_at');
     * ```
     */
    addSelect<K extends keyof TAttrs>(...columns: string[]): this;
    /**
     * Adds a WHERE clause to the query.
     * Supports multiple overloads for different use cases.
     *
     * @param column - Column name or conditions object
     * @param operatorOrValue - Operator or value (when using 2-param form)
     * @param value - Value to compare against
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * // Basic equality
     * query.where('status', 'active');
     *
     * // With operator
     * query.where('age', '>', 18);
     *
     * // Multiple conditions
     * query.where({
     *   status: 'active',
     *   verified: true
     * });
     * ```
     */
    where<K extends keyof TAttrs>(column: K, operator: Operator, value: TAttrs[K]): this;
    where<K extends keyof TAttrs>(column: K, value: TAttrs[K]): this;
    where<K extends keyof TAttrs>(conditions: Record<string, any>): this;
    /**
     * Adds an OR WHERE clause to the query.
     *
     * @param column - Column name to filter on
     * @param operatorOrValue - Operator or value (when using 2-param form)
     * @param value - Value to compare against
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.where('status', 'active')
     *      .orWhere('priority', 'high');
     * ```
     */
    orWhere<K extends keyof TAttrs>(column: K, operator: Operator, value: TAttrs[K]): this;
    orWhere<K extends keyof TAttrs>(column: K, value: TAttrs[K]): this;
    /**
     * Adds a WHERE IN clause to filter by multiple values.
     *
     * @param column - Column name to filter on
     * @param values - Array of values to match against
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereIn('status', ['active', 'pending', 'verified']);
     * query.whereIn('id', [1, 2, 3, 4, 5]);
     * ```
     */
    whereIn<K extends keyof TAttrs>(column: K | string, values: TAttrs[K][]): this;
    /**
     * Adds a WHERE NOT IN clause to exclude multiple values.
     *
     * @param column - Column name to filter on
     * @param values - Array of values to exclude
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereNotIn('status', ['deleted', 'banned']);
     * ```
     */
    whereNotIn<K extends keyof TAttrs>(column: K, values: TAttrs[K][]): this;
    /**
     * Adds a WHERE BETWEEN clause for range filtering.
     *
     * @param column - Column name to filter on
     * @param values - Tuple of [min, max] values
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereBetween('age', [18, 65]);
     * query.whereBetween('created_at', [startDate, endDate]);
     * ```
     */
    whereBetween<K extends keyof TAttrs>(column: K, values: [any, any]): this;
    /**
     * Adds a WHERE NULL clause to filter for null values.
     *
     * @param column - Column name to check for null
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereNull('deleted_at');
     * ```
     */
    whereNull<K extends keyof TAttrs>(column: K): this;
    /**
     * Adds a WHERE NOT NULL clause to filter for non-null values.
     *
     * @param column - Column name to check for non-null
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereNotNull('email_verified_at');
     * ```
     */
    whereNotNull<K extends keyof TAttrs>(column: K): this;
    /**
     * Adds an INNER JOIN clause to the query.
     *
     * @param table - Table to join with
     * @param first - First column in the join condition
     * @param operator - Comparison operator
     * @param second - Second column in the join condition
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.join('profiles', 'users.id', '=', 'profiles.user_id');
     * ```
     */
    join(table: string, first: string, operator: Operator, second: string): this;
    /**
     * Adds a LEFT JOIN clause to the query.
     *
     * @param table - Table to join with
     * @param first - First column in the join condition
     * @param operator - Comparison operator
     * @param second - Second column in the join condition
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.leftJoin('profiles', 'users.id', '=', 'profiles.user_id');
     * ```
     */
    leftJoin(table: string, first: string, operator: Operator, second: string): this;
    /**
     * Adds a RIGHT JOIN clause to the query.
     *
     * @param table - Table to join with
     * @param first - First column in the join condition
     * @param operator - Comparison operator
     * @param second - Second column in the join condition
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.rightJoin('profiles', 'users.id', '=', 'profiles.user_id');
     * ```
     */
    rightJoin(table: string, first: string, operator: Operator, second: string): this;
    /**
     * Adds an ORDER BY clause to sort results.
     *
     * @param column - Column name to sort by
     * @param direction - Sort direction ('asc' or 'desc')
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.orderBy('created_at', 'desc');
     * query.orderBy('name'); // defaults to 'asc'
     * ```
     */
    orderBy<K extends keyof TAttrs>(column: K, direction?: "asc" | "desc"): this;
    /**
     * Adds a GROUP BY clause for result grouping.
     *
     * @param columns - Column names to group by
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.groupBy('department', 'status');
     * ```
     */
    groupBy<K extends keyof TAttrs>(...columns: K[]): this;
    /**
     * Adds a HAVING clause for filtering grouped results.
     *
     * @param column - Column name to filter on
     * @param operator - Comparison operator (optional, defaults to '=')
     * @param value - Value to compare against
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.groupBy('department')
     *      .having('count(*)', '>', 5);
     * ```
     */
    having<K extends keyof TAttrs>(column: K, operator?: Operator, value?: any): this;
    /**
     * Sets the maximum number of results to return.
     *
     * @param value - Maximum number of results
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.limit(10); // Get only 10 results
     * ```
     */
    limit(value: number): this;
    /**
     * Sets the number of results to skip.
     *
     * @param value - Number of results to skip
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.offset(20); // Skip first 20 results
     * ```
     */
    offset(value: number): this;
    /**
     * Alias for limit() method.
     *
     * @param value - Maximum number of results
     * @returns QueryBuilder instance for method chaining
     */
    take(value: number): this;
    /**
     * Alias for offset() method.
     *
     * @param value - Number of results to skip
     * @returns QueryBuilder instance for method chaining
     */
    skip(value: number): this;
    /**
     * Adds ALLOW FILTERING to the query (ScyllaDB specific).
     * Use sparingly as it can impact performance significantly.
     *
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.where('non_indexed_column', 'value')
     *      .allowFiltering(); // Required for non-indexed columns
     * ```
     */
    allowFiltering(): this;
    /**
     * Sets TTL (Time To Live) for INSERT/UPDATE operations (ScyllaDB specific).
     *
     * @param seconds - TTL in seconds
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.ttl(3600).insert(data); // Data expires in 1 hour
     * ```
     */
    ttl(seconds: number): this;
    /**
     * Adds IF NOT EXISTS condition for lightweight transactions (ScyllaDB specific).
     *
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.ifNotExists().insert(data); // Only insert if doesn't exist
     * ```
     */
    ifNotExists(): this;
    /**
     * Adds IF condition for lightweight transactions (ScyllaDB specific).
     *
     * @param column - Column name to check
     * @param operator - Comparison operator
     * @param value - Value to compare against
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.if('version', '=', 1).update(data); // Only update if version is 1
     * ```
     */
    if<K extends keyof TAttrs>(column: K, operator: Operator, value: TAttrs[K]): this;
    /**
     * Adds TOKEN-based WHERE clause for ScyllaDB partition key filtering.
     *
     * @param columns - Partition key columns
     * @param operator - Comparison operator
     * @param values - Values to compare against
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereToken(['user_id'], '>', [1000]);
     * ```
     */
    whereToken<K extends keyof TAttrs>(columns: K[], operator: Operator, values: TAttrs[K][]): this;
    /**
     * Executes the query and returns all matching results.
     * If a model is bound, returns hydrated model instances.
     *
     * @returns Promise resolving to array of results
     *
     * @example
     *
     * const users = await User.query()
     *   .where('active', true)
     *   .get();
     * ```
     */
    get(): Promise<TModel[]>;
    /**
     * Specifies relationships to eager load with the query results.
     * Supports dot notation for nested relationships.
     *
     * @param relations - Relationship names to load
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * const users = await User.query()
     *   .with('posts', 'profile')
     *   .get();
     *
     * // Nested relationships
     * const users = await User.query()
     *   .with('posts.comments', 'posts.tags')
     *   .get();
     * ```
     */
    with(...relations: string[]): this;
    /**
     * Loads eager relationships for a single model instance.
     * Supports nested relationship loading with dot notation.
     *
     * @param model - Model instance to load relationships for
     * @param relations - Array of relationship names to load
     *
     * @example
     *
     * await query.loadEagerFor(user, ['posts', 'profile']);
     * await query.loadEagerFor(user, ['posts.comments']);
     * ```
     */
    loadEagerFor(model: TModel, relations: string[]): Promise<void>;
    /**
     * Executes the query and returns the first matching result.
     *
     * @returns Promise resolving to first result or null if none found
     *
     * @example
     *
     * const user = await User.query()
     *   .where('email', 'john@example.com')
     *   .first();
     * ```
     */
    first(): Promise<TModel | null>;
    /**
     * Gets the count of records matching the query.
     *
     * @param column - Column to count (defaults to '*')
     * @returns Promise resolving to count number
     *
     * @example
     *
     * const userCount = await User.query()
     *   .where('active', true)
     *   .count();
     *
     * const emailCount = await User.query()
     *   .count('email');
     * ```
     */
    count(column?: string): Promise<number>;
    /**
     * Checks if any records exist matching the query.
     *
     * @returns Promise resolving to boolean
     *
     * @example
     *
     * const hasActiveUsers = await User.query()
     *   .where('active', true)
     *   .exists();
     * ```
     */
    exists(): Promise<boolean>;
    /**
     * Inserts new record(s) into the database.
     * Supports both single record and batch insert operations.
     *
     * @param values - Record data or array of records to insert
     * @returns Promise resolving to boolean indicating success
     *
     * @example
     *
     * // Single insert
     * await query.insert({
     *   name: 'John Doe',
     *   email: 'john@example.com'
     * });
     *
     * // Batch insert
     * await query.insert([
     *   { name: 'John', email: 'john@example.com' },
     *   { name: 'Jane', email: 'jane@example.com' }
     * ]);
     * ```
     */
    insert(values: Record<string, any> | Record<string, any>[]): Promise<boolean>;
    /**
     * Inserts a new record and returns the generated ID.
     *
     * @param values - Record data to insert
     * @returns Promise resolving to the generated ID
     *
     * @example
     *
     * const userId = await query.insertGetId({
     *   name: 'John Doe',
     *   email: 'john@example.com'
     * });
     * ```
     */
    insertGetId(values: Record<string, any>): Promise<string | number>;
    /**
     * Updates records matching the current query conditions.
     *
     * @param values - Data to update
     * @returns Promise resolving to number of affected rows
     *
     * @example
     *
     * const updated = await User.query()
     *   .where('active', false)
     *   .update({ status: 'inactive' });
     * ```
     */
    update(values: Record<string, any>): Promise<number>;
    /**
     * Updates an existing record or inserts a new one if it doesn't exist.
     *
     * @param attributes - Attributes to search by
     * @param values - Values to update or insert
     * @returns Promise resolving to boolean indicating success
     *
     * @example
     *
     * await query.updateOrInsert(
     *   { email: 'john@example.com' },
     *   { name: 'John Doe', active: true }
     * );
     * ```
     */
    updateOrInsert(attributes: Record<string, any>, values?: Record<string, any>): Promise<boolean>;
    /**
     * Deletes records matching the current query conditions.
     *
     * If the model uses soft deletes (`static softDeletes = true`), this method
     * will perform an UPDATE setting the `deleted_at` timestamp instead of a hard delete.
     *
     * @returns {Promise<number>}
     *   The number of rows affected (hard-deleted or soft-deleted).
     *
     * @example
     * // Hard delete:
     * const removed = await User.query()
     *   .where('active', false)
     *   .delete();
     *
     * @example
     * // Soft delete (if User.softDeletes = true):
     * const trashed = await User.query()
     *   .where('role', 'guest')
     *   .delete();
     */
    delete(): Promise<number>;
    /**
     * Truncates the entire table, removing all records.
     *
     * @example
     *
     * await query.truncate(); // Removes all records from table
     * ```
     */
    truncate(): Promise<void>;
    /**
     * Converts the query builder to a base query object for grammar compilation.
     *
     * @returns Base query object
     */
    protected toBase(): any;
    /**
     * Gets all query parameters in the correct order.
     *
     * @returns Array of parameter values
     */
    protected getParams(): any[];
    /**
     * Extracts parameter values from WHERE clauses.
     *
     * @param wheres - Array of WHERE clause objects
     * @returns Array of parameter values
     */
    protected getWhereParams(wheres: WhereClause[]): any[];
    /**
     * Extracts parameter values from HAVING clauses.
     *
     * @returns Array of parameter values
     */
    protected getHavingParams(): any[];
    /**
     * Creates a model instance from a database row.
     * Sets up the model with attributes, existence state, and original values.
     *
     * @param row - Raw database row data
     * @returns Hydrated model instance
     *
     * @throws {Error} When no model is bound to the query builder
     */
    protected hydrate(row: Record<string, any>): TModel;
    /**
     * Creates a deep copy of the query builder.
     * Useful for creating variations of a query without affecting the original.
     *
     * @returns New QueryBuilder instance with copied state
     *
     * @example
     *
     * const baseQuery = User.query().where('active', true);
     * const adminQuery = baseQuery.clone().where('role', 'admin');
     * const userQuery = baseQuery.clone().where('role', 'user');
     * ```
     */
    clone(): QueryBuilder<TModel, TAttrs>;
    /**
     * Converts the query to its SQL/CQL string representation.
     * Useful for debugging and logging.
     *
     * @returns SQL/CQL query string
     *
     * @example
     *
     * const sql = User.query()
     *   .where('active', true)
     *   .toSql();
     * console.log(sql); // SELECT * FROM users WHERE active = ?
     * ```
     */
    toSql(): string;
    /**
     * Converts the query to SQL/CQL with parameter values interpolated.
     * Useful for debugging (do not use for actual query execution).
     *
     * @returns SQL/CQL query string with values
     *
     * @example
     *
     * const sql = User.query()
     *   .where('active', true)
     *   .toRawSql();
     * console.log(sql); // SELECT * FROM users WHERE active = true
     * ```
     */
    toRawSql(): string;
}
export {};
//# sourceMappingURL=QueryBuilder.d.ts.map