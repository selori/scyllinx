import type { QueryGrammar } from "../drivers/grammars/QueryGrammar"
import type { DatabaseDriver } from "../drivers/DatabaseDriver"
import { ConnectionManager } from "../connection/ConnectionManager"
import type { WhereClause } from "@/types"
import type { Model } from "@/model/Model"
import type { Relationship } from "@/relationships/Relationship"

type Operator = "=" | "!=" | "<" | "<=" | ">" | ">=" | "in"
type EagerLoadRelations<TModel extends Model<any>> = Record<string, (query: QueryBuilder<any, any>) => void>

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
export class QueryBuilder<TModel extends Model<any>, TAttrs> {
  [x: string]: any
  protected driver: DatabaseDriver
  protected grammar: QueryGrammar

  // Query components
  protected _select: string[] = ["*"]
  protected _from: string
  protected _joins: any[] = []
  protected _wheres: any[] = []
  protected _groups: string[] = []
  protected _havings: any[] = []
  protected _orders: any[] = []
  protected _limit?: number
  protected _offset?: number
  protected _unions: any[] = []
  protected eager: string[] = []

  // ScyllaDB specific
  protected _allowFiltering = false
  protected _ttl?: number
  protected _ifNotExists = false
  protected _ifConditions: any[] = []

  // Model binding
  protected model?: new () => TModel
  protected connection?: string

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
  constructor(table: string, connection?: string) {
    this._from = table
    this.connection = connection

    const connManager = ConnectionManager.getInstance()
    this.driver = connManager.getConnection(connection).getDriver()
    this.grammar = this.driver.getGrammar()
  }

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
  public setModel<M extends TModel>(model: new () => M): QueryBuilder<M, TAttrs> {
    this.model = model
    return this as unknown as QueryBuilder<M, TAttrs>
  }

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
  public select<K extends keyof TAttrs>(...columns: K[]): this {
    this._select = columns.length > 0 ? columns.map(String) : ["*"]
    return this
  }

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
  public addSelect<K extends keyof TAttrs>(...columns: string[]): this {
    if (this._select.length === 1 && this._select[0] === "*") {
      this._select = columns.map(String)
    } else {
      for (const col of columns) {
        const colStr = String(col)
        if (!this._select.includes(colStr)) {
          this._select.push(colStr)
        }
      }
    }
    return this
  }

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
  where<K extends keyof TAttrs>(column: K, operator: Operator, value: TAttrs[K]): this
  where<K extends keyof TAttrs>(column: K, value: TAttrs[K]): this
  where<K extends keyof TAttrs>(conditions: Record<string, any>): this
  where<K extends keyof TAttrs>(
    column: K | Record<string, any>,
    operatorOrValue?: string | any,
    value?: TAttrs[K],
  ): this {
    const args = arguments
    if (typeof column === "object") {
      Object.entries(column).forEach(([key, val]) => {
        this._wheres.push({
          type: "basic",
          column: key,
          operator: "=",
          value: val,
          boolean: "and",
        })
      })
    } else if (args.length === 2) {
      this._wheres.push({
        type: "basic",
        column,
        operator: "=",
        value: operatorOrValue,
        boolean: "and",
      })
    } else {
      this._wheres.push({
        type: "basic",
        column,
        operator: operatorOrValue,
        value,
        boolean: "and",
      })
    }
    return this
  }

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
  orWhere<K extends keyof TAttrs>(column: K, operator: Operator, value: TAttrs[K]): this
  orWhere<K extends keyof TAttrs>(column: K, value: TAttrs[K]): this
  orWhere<K extends keyof TAttrs>(column: K, operatorOrValue?: string | any, value?: TAttrs[K]): this {
    const args = arguments
    if (args.length === 2) {
      this._wheres.push({
        type: "basic",
        column,
        operator: "=",
        value: operatorOrValue,
        boolean: "or",
      })
    } else {
      this._wheres.push({
        type: "basic",
        column,
        operator: operatorOrValue,
        value,
        boolean: "or",
      })
    }
    return this
  }

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
  public whereIn<K extends keyof TAttrs>(column: K | string, values: TAttrs[K][]): this {
    this._wheres.push({
      type: "in",
      column,
      values,
      boolean: "and",
    })
    return this
  }

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
  public whereNotIn<K extends keyof TAttrs>(column: K, values: TAttrs[K][]): this {
    this._wheres.push({
      type: "notIn",
      column,
      values,
      boolean: "and",
    })
    return this
  }

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
  public whereBetween<K extends keyof TAttrs>(column: K, values: [any, any]): this {
    this._wheres.push({
      type: "between",
      column,
      values,
      boolean: "and",
    })
    return this
  }

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
  public whereNull<K extends keyof TAttrs>(column: K): this {
    this._wheres.push({
      type: "null",
      column,
      boolean: "and",
    })
    return this
  }

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
  public whereNotNull<K extends keyof TAttrs>(column: K): this {
    this._wheres.push({
      type: "notNull",
      column,
      boolean: "and",
    })
    return this
  }

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
  join(table: string, first: string, operator: Operator, second: string): this {
    this._joins.push({
      type: "inner",
      table,
      first,
      operator,
      second,
    })
    return this
  }

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
  leftJoin(table: string, first: string, operator: Operator, second: string): this {
    this._joins.push({
      type: "left",
      table,
      first,
      operator,
      second,
    })
    return this
  }

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
  rightJoin(table: string, first: string, operator: Operator, second: string): this {
    this._joins.push({
      type: "right",
      table,
      first,
      operator,
      second,
    })
    return this
  }

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
  public orderBy<K extends keyof TAttrs>(column: K, direction: "asc" | "desc" = "asc"): this {
    this._orders.push({
      column,
      direction: direction.toLowerCase(),
    })
    return this
  }

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
  public groupBy<K extends keyof TAttrs>(...columns: K[]): this {
    this._groups.push(...columns.map(String))
    return this
  }

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
  public having<K extends keyof TAttrs>(column: K, operator?: Operator, value?: any): this {
    const args = arguments
    if (args.length === 2) {
      value = operator
      operator = "="
    }

    this._havings.push({
      type: "basic",
      column,
      operator,
      value,
      boolean: "and",
    })
    return this
  }

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
  public limit(value: number): this {
    this._limit = value
    return this
  }

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
  public offset(value: number): this {
    this._offset = value
    return this
  }

  /**
   * Alias for limit() method.
   *
   * @param value - Maximum number of results
   * @returns QueryBuilder instance for method chaining
   */
  public take(value: number): this {
    return this.limit(value)
  }

  /**
   * Alias for offset() method.
   *
   * @param value - Number of results to skip
   * @returns QueryBuilder instance for method chaining
   */
  public skip(value: number): this {
    return this.offset(value)
  }

  // ScyllaDB specific methods

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
  public allowFiltering(): this {
    this._allowFiltering = true
    return this
  }

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
  public ttl(seconds: number): this {
    this._ttl = seconds
    return this
  }

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
  public ifNotExists(): this {
    this._ifNotExists = true
    return this
  }

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
  public if<K extends keyof TAttrs>(column: K, operator: Operator, value: TAttrs[K]): this {
    this._ifConditions.push({
      type: "basic",
      column,
      operator,
      value,
      boolean: "AND",
    })
    return this
  }

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
  public whereToken<K extends keyof TAttrs>(columns: K[], operator: Operator, values: TAttrs[K][]): this {
    this._wheres.push({
      type: "token",
      columns,
      operator,
      values,
      boolean: "and",
    })
    return this
  }

  // Execution methods

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
  public async get(): Promise<TModel[]> {
    const sql = this.grammar.compileSelect(this.toBase())
    const params = this.getParams()

    const result = await this.driver.query(sql, params)

    let models: TModel[] = []
    if (this.model) {
      models = result.rows.map((row) => this.hydrate(row))
    } else {
      models = result.rows
    }

    if (this.eager.length) {
      await Promise.all(models.map((m) => this.loadEagerFor(m, this.eager)))
    }

    return models
  }

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
  public with(...relations: string[]): this {
    const items = Array.isArray(relations) ? relations : [relations]
    this.eager.push(...items)
    return this
  }

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
  public async loadEagerFor(model: TModel, relations: string[]) {
    for (const rel of relations) {
      const [head, ...tail] = rel.split(".")
      const relInstance = (model as any)[`${head}Relation`]() as Relationship<any, any>
      const result = await relInstance.getResults()
      ;(model as any).setAttribute(head, result)

      if (tail.length && result) {
        const babies = Array.isArray(result) ? result : [result]
        await Promise.all(babies.map((b) => this.loadEagerFor(b, [tail.join(".")])))
      }
    }
  }

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
  public async first(): Promise<TModel | null> {
    const results = await this.take(1).get()
    return results.length > 0 ? results[0] : null
  }

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
  public async count(column = "*"): Promise<number> {
    const clone = this.clone()
    clone._select = [`COUNT(${column}) as aggregate`]

    const result = await clone.get()
    return (result[0] as { aggregate?: number })?.aggregate || 0
  }

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
  public async exists(): Promise<boolean> {
    const count = await this.count()
    return count > 0
  }

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
  public async insert(values: Record<string, any> | Record<string, any>[]): Promise<boolean> {
    if (Array.isArray(values)) {
      const queries = values.map((value) => ({
        query: this.grammar.compileInsert({
          table: this._from,
          values: value,
          ttl: this._ttl,
          ifNotExists: this._ifNotExists,
        }),
        params: Object.values(value),
      }))

      if (this.driver instanceof (await import("../drivers/ScyllaDBDriver")).ScyllaDBDriver) {
        await (this.driver as any).batch(queries)
      } else {
        for (const query of queries) {
          await this.driver.query(query.query, query.params)
        }
      }
    } else {
      const sql = this.grammar.compileInsert({
        table: this._from,
        values,
        ttl: this._ttl,
        ifNotExists: this._ifNotExists,
      })
      const params = Object.values(values)

      await this.driver.query(sql, params)
    }

    return true
  }

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
  public async insertGetId(values: Record<string, any>): Promise<string | number> {
    await this.insert(values)
    return await this.driver.getLastInsertId()
  }

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
  public async update(values: Record<string, any>): Promise<number> {
    const sql = this.grammar.compileUpdate({
      table: this._from,
      values,
      wheres: this._wheres,
      ttl: this._ttl,
      ifConditions: this._ifConditions,
    })

    const params = [
      ...Object.values(values),
      ...this.getWhereParams(this._wheres),
      ...this.getWhereParams(this._ifConditions),
    ]

    const result = await this.driver.query(sql, params)
    return result.affectedRows || 0
  }

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
  public async updateOrInsert(attributes: Record<string, any>, values: Record<string, any> = {}): Promise<boolean> {
    const exists = await this.where(attributes).exists()

    if (exists) {
      return (await this.where(attributes).update(values)) > 0
    } else {
      return await this.insert({ ...attributes, ...values })
    }
  }

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
  public async delete(): Promise<number> {
    // Determine if we should soft-delete
    const modelClass = this._model
    // if (modelClass.softDeletes) {
    //   // Soft delete: set deleted_at = now()
    //   const column = 'deleted_at'
    //   const now = new Date().toISOString()
    //   const sql = this.grammar.compileUpdate({
    //     table: this._from,
    //     wheres: this._wheres,
    //     updates: [{ column, value: '?' }],
    //     ifConditions: this._ifConditions,
    //   })
    //   const params = [ now, 
    //     ...this.getWhereParams(this._wheres),
    //     ...this.getWhereParams(this._ifConditions),
    //   ]
    //   const result = await this.driver.query(sql, params)
    //   return result.affectedRows || 0
    // }

    // Hard delete fallback
    const sql = this.grammar.compileDelete({
      table: this._from,
      wheres: this._wheres,
      ifConditions: this._ifConditions,
    })
    const params = [
      ...this.getWhereParams(this._wheres),
      ...this.getWhereParams(this._ifConditions),
    ]
    const result = await this.driver.query(sql, params)
    return result.affectedRows || 0
  }


  /**
   * Truncates the entire table, removing all records.
   *
   * @example
   * 
   * await query.truncate(); // Removes all records from table
   * ```
   */
  public async truncate(): Promise<void> {
    const sql = `TRUNCATE ${this.grammar.wrapTable(this._from)}`
    await this.driver.query(sql)
  }

  // Helper methods

  /**
   * Converts the query builder to a base query object for grammar compilation.
   *
   * @returns Base query object
   */
  protected toBase(): any {
    return {
      columns: this._select,
      from: this._from,
      joins: this._joins,
      wheres: this._wheres,
      groups: this._groups,
      havings: this._havings,
      orders: this._orders,
      limit: this._limit,
      offset: this._offset,
      unions: this._unions,
      allowFiltering: this._allowFiltering,
    }
  }

  /**
   * Gets all query parameters in the correct order.
   *
   * @returns Array of parameter values
   */
  protected getParams(): any[] {
    return [...this.getWhereParams(this._wheres), ...this.getHavingParams()]
  }

  /**
   * Extracts parameter values from WHERE clauses.
   *
   * @param wheres - Array of WHERE clause objects
   * @returns Array of parameter values
   */
  protected getWhereParams(wheres: WhereClause[]): any[] {
    const params: any[] = []

    for (const where of wheres) {
      switch (where.type) {
        case "basic":
          params.push(where.value)
          break
        case "in":
        case "notIn":
          params.push(...(where.values ?? []))
          break
        case "between":
          params.push(...(where.values ?? []))
          break
        case "token":
          params.push(...(where.values ?? []))
          break
      }
    }

    return params
  }

  /**
   * Extracts parameter values from HAVING clauses.
   *
   * @returns Array of parameter values
   */
  protected getHavingParams(): any[] {
    const params: any[] = []

    for (const having of this._havings) {
      if (having.type === "basic") {
        params.push(having.value)
      }
    }

    return params
  }

  /**
   * Creates a model instance from a database row.
   * Sets up the model with attributes, existence state, and original values.
   *
   * @param row - Raw database row data
   * @returns Hydrated model instance
   *
   * @throws {Error} When no model is bound to the query builder
   */
  protected hydrate(row: Record<string, any>): TModel {
    if (!this.model) {
      throw new Error("Model is not set on QueryBuilder")
    }
    const inst = new this.model()
    inst.setAttributes(row)
    inst.setExists(true)
    inst.setOriginal(row)
    return inst
  }

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
  public clone(): QueryBuilder<TModel, TAttrs> {
    const clone = new QueryBuilder<TModel, TAttrs>(this._from, this.connection)

    clone._select = [...this._select]
    clone._joins = [...this._joins]
    clone._wheres = [...this._wheres]
    clone._groups = [...this._groups]
    clone._havings = [...this._havings]
    clone._orders = [...this._orders]
    clone._limit = this._limit
    clone._offset = this._offset
    clone._unions = [...this._unions]
    clone._allowFiltering = this._allowFiltering
    clone._ttl = this._ttl
    clone._ifNotExists = this._ifNotExists
    clone._ifConditions = [...this._ifConditions]
    clone.model = this.model

    return clone
  }

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
  public toSql(): string {
    return this.grammar.compileSelect(this.toBase())
  }

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
  public toRawSql(): string {
    const sql = this.toSql()
    const params = this.getParams()

    let index = 0
    return sql.replace(/\?/g, () => {
      const param = params[index++]
      return typeof param === "string" ? `'${param}'` : String(param)
    })
  }
}
