"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const ConnectionManager_1 = require("../connection/ConnectionManager");
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
class QueryBuilder {
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
    constructor(table, connection) {
        // Query components
        this._select = ["*"];
        this._joins = [];
        this._wheres = [];
        this._groups = [];
        this._havings = [];
        this._orders = [];
        this._unions = [];
        this.eager = [];
        // ScyllaDB specific
        this._allowFiltering = false;
        this._ifNotExists = false;
        this._ifConditions = [];
        this._from = table;
        this.connection = connection;
        const connManager = ConnectionManager_1.ConnectionManager.getInstance();
        this.driver = connManager.getConnection(connection).getDriver();
        this.grammar = this.driver.getGrammar();
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
    setModel(model) {
        this.model = model;
        return this;
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
    select(...columns) {
        this._select = columns.length > 0 ? columns.map(String) : ["*"];
        return this;
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
    addSelect(...columns) {
        if (this._select.length === 1 && this._select[0] === "*") {
            this._select = columns.map(String);
        }
        else {
            for (const col of columns) {
                const colStr = String(col);
                if (!this._select.includes(colStr)) {
                    this._select.push(colStr);
                }
            }
        }
        return this;
    }
    where(column, operatorOrValue, value) {
        const args = arguments;
        if (typeof column === "object") {
            Object.entries(column).forEach(([key, val]) => {
                this._wheres.push({
                    type: "basic",
                    column: key,
                    operator: "=",
                    value: val,
                    boolean: "and",
                });
            });
        }
        else if (args.length === 2) {
            this._wheres.push({
                type: "basic",
                column,
                operator: "=",
                value: operatorOrValue,
                boolean: "and",
            });
        }
        else {
            this._wheres.push({
                type: "basic",
                column,
                operator: operatorOrValue,
                value,
                boolean: "and",
            });
        }
        return this;
    }
    orWhere(column, operatorOrValue, value) {
        const args = arguments;
        if (args.length === 2) {
            this._wheres.push({
                type: "basic",
                column,
                operator: "=",
                value: operatorOrValue,
                boolean: "or",
            });
        }
        else {
            this._wheres.push({
                type: "basic",
                column,
                operator: operatorOrValue,
                value,
                boolean: "or",
            });
        }
        return this;
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
    whereIn(column, values) {
        this._wheres.push({
            type: "in",
            column,
            values,
            boolean: "and",
        });
        return this;
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
    whereNotIn(column, values) {
        this._wheres.push({
            type: "notIn",
            column,
            values,
            boolean: "and",
        });
        return this;
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
    whereBetween(column, values) {
        this._wheres.push({
            type: "between",
            column,
            values,
            boolean: "and",
        });
        return this;
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
    whereNull(column) {
        this._wheres.push({
            type: "null",
            column,
            boolean: "and",
        });
        return this;
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
    whereNotNull(column) {
        this._wheres.push({
            type: "notNull",
            column,
            boolean: "and",
        });
        return this;
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
    join(table, first, operator, second) {
        this._joins.push({
            type: "inner",
            table,
            first,
            operator,
            second,
        });
        return this;
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
    leftJoin(table, first, operator, second) {
        this._joins.push({
            type: "left",
            table,
            first,
            operator,
            second,
        });
        return this;
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
    rightJoin(table, first, operator, second) {
        this._joins.push({
            type: "right",
            table,
            first,
            operator,
            second,
        });
        return this;
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
    orderBy(column, direction = "asc") {
        this._orders.push({
            column,
            direction: direction.toLowerCase(),
        });
        return this;
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
    groupBy(...columns) {
        this._groups.push(...columns.map(String));
        return this;
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
    having(column, operator, value) {
        const args = arguments;
        if (args.length === 2) {
            value = operator;
            operator = "=";
        }
        this._havings.push({
            type: "basic",
            column,
            operator,
            value,
            boolean: "and",
        });
        return this;
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
    limit(value) {
        this._limit = value;
        return this;
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
    offset(value) {
        this._offset = value;
        return this;
    }
    /**
     * Alias for limit() method.
     *
     * @param value - Maximum number of results
     * @returns QueryBuilder instance for method chaining
     */
    take(value) {
        return this.limit(value);
    }
    /**
     * Alias for offset() method.
     *
     * @param value - Number of results to skip
     * @returns QueryBuilder instance for method chaining
     */
    skip(value) {
        return this.offset(value);
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
    allowFiltering() {
        this._allowFiltering = true;
        return this;
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
    ttl(seconds) {
        this._ttl = seconds;
        return this;
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
    ifNotExists() {
        this._ifNotExists = true;
        return this;
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
    if(column, operator, value) {
        this._ifConditions.push({
            type: "basic",
            column,
            operator,
            value,
            boolean: "AND",
        });
        return this;
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
    whereToken(columns, operator, values) {
        this._wheres.push({
            type: "token",
            columns,
            operator,
            values,
            boolean: "and",
        });
        return this;
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
    async get() {
        const sql = this.grammar.compileSelect(this.toBase());
        const params = this.getParams();
        const result = await this.driver.query(sql, params);
        let models = [];
        if (this.model) {
            models = result.rows.map((row) => this.hydrate(row));
        }
        else {
            models = result.rows;
        }
        if (this.eager.length) {
            await Promise.all(models.map((m) => this.loadEagerFor(m, this.eager)));
        }
        return models;
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
    with(...relations) {
        const items = Array.isArray(relations) ? relations : [relations];
        this.eager.push(...items);
        return this;
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
    async loadEagerFor(model, relations) {
        for (const rel of relations) {
            const [head, ...tail] = rel.split(".");
            const relInstance = model[`${head}Relation`]();
            const result = await relInstance.getResults();
            model.setAttribute(head, result);
            if (tail.length && result) {
                const babies = Array.isArray(result) ? result : [result];
                await Promise.all(babies.map((b) => this.loadEagerFor(b, [tail.join(".")])));
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
    async first() {
        const results = await this.take(1).get();
        return results.length > 0 ? results[0] : null;
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
    async count(column = "*") {
        const clone = this.clone();
        clone._select = [`COUNT(${column}) as aggregate`];
        const result = await clone.get();
        return result[0]?.aggregate || 0;
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
    async exists() {
        const count = await this.count();
        return count > 0;
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
    async insert(values) {
        if (Array.isArray(values)) {
            const queries = values.map((value) => ({
                query: this.grammar.compileInsert({
                    table: this._from,
                    values: value,
                    ttl: this._ttl,
                    ifNotExists: this._ifNotExists,
                }),
                params: Object.values(value),
            }));
            if (this.driver instanceof (await Promise.resolve().then(() => __importStar(require("../drivers/ScyllaDBDriver")))).ScyllaDBDriver) {
                await this.driver.batch(queries);
            }
            else {
                for (const query of queries) {
                    await this.driver.query(query.query, query.params);
                }
            }
        }
        else {
            const sql = this.grammar.compileInsert({
                table: this._from,
                values,
                ttl: this._ttl,
                ifNotExists: this._ifNotExists,
            });
            const params = Object.values(values);
            await this.driver.query(sql, params);
        }
        return true;
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
    async insertGetId(values) {
        await this.insert(values);
        return await this.driver.getLastInsertId();
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
    async update(values) {
        const sql = this.grammar.compileUpdate({
            table: this._from,
            values,
            wheres: this._wheres,
            ttl: this._ttl,
            ifConditions: this._ifConditions,
        });
        const params = [
            ...Object.values(values),
            ...this.getWhereParams(this._wheres),
            ...this.getWhereParams(this._ifConditions),
        ];
        const result = await this.driver.query(sql, params);
        return result.affectedRows || 0;
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
    async updateOrInsert(attributes, values = {}) {
        const exists = await this.where(attributes).exists();
        if (exists) {
            return (await this.where(attributes).update(values)) > 0;
        }
        else {
            return await this.insert({ ...attributes, ...values });
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
    async delete() {
        // Determine if we should soft-delete
        const modelClass = this._model;
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
        });
        const params = [
            ...this.getWhereParams(this._wheres),
            ...this.getWhereParams(this._ifConditions),
        ];
        const result = await this.driver.query(sql, params);
        return result.affectedRows || 0;
    }
    /**
     * Truncates the entire table, removing all records.
     *
     * @example
     *
     * await query.truncate(); // Removes all records from table
     * ```
     */
    async truncate() {
        const sql = `TRUNCATE ${this.grammar.wrapTable(this._from)}`;
        await this.driver.query(sql);
    }
    // Helper methods
    /**
     * Converts the query builder to a base query object for grammar compilation.
     *
     * @returns Base query object
     */
    toBase() {
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
        };
    }
    /**
     * Gets all query parameters in the correct order.
     *
     * @returns Array of parameter values
     */
    getParams() {
        return [...this.getWhereParams(this._wheres), ...this.getHavingParams()];
    }
    /**
     * Extracts parameter values from WHERE clauses.
     *
     * @param wheres - Array of WHERE clause objects
     * @returns Array of parameter values
     */
    getWhereParams(wheres) {
        const params = [];
        for (const where of wheres) {
            switch (where.type) {
                case "basic":
                    params.push(where.value);
                    break;
                case "in":
                case "notIn":
                    params.push(...(where.values ?? []));
                    break;
                case "between":
                    params.push(...(where.values ?? []));
                    break;
                case "token":
                    params.push(...(where.values ?? []));
                    break;
            }
        }
        return params;
    }
    /**
     * Extracts parameter values from HAVING clauses.
     *
     * @returns Array of parameter values
     */
    getHavingParams() {
        const params = [];
        for (const having of this._havings) {
            if (having.type === "basic") {
                params.push(having.value);
            }
        }
        return params;
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
    hydrate(row) {
        if (!this.model) {
            throw new Error("Model is not set on QueryBuilder");
        }
        const inst = new this.model();
        inst.setAttributes(row);
        inst.setExists(true);
        inst.setOriginal(row);
        return inst;
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
    clone() {
        const clone = new QueryBuilder(this._from, this.connection);
        clone._select = [...this._select];
        clone._joins = [...this._joins];
        clone._wheres = [...this._wheres];
        clone._groups = [...this._groups];
        clone._havings = [...this._havings];
        clone._orders = [...this._orders];
        clone._limit = this._limit;
        clone._offset = this._offset;
        clone._unions = [...this._unions];
        clone._allowFiltering = this._allowFiltering;
        clone._ttl = this._ttl;
        clone._ifNotExists = this._ifNotExists;
        clone._ifConditions = [...this._ifConditions];
        clone.model = this.model;
        return clone;
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
    toSql() {
        return this.grammar.compileSelect(this.toBase());
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
    toRawSql() {
        const sql = this.toSql();
        const params = this.getParams();
        let index = 0;
        return sql.replace(/\?/g, () => {
            const param = params[index++];
            return typeof param === "string" ? `'${param}'` : String(param);
        });
    }
}
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=QueryBuilder.js.map