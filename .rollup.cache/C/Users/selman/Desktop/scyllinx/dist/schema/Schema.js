import { TableBuilder } from "./TableBuilder";
import { MaterializedViewBuilder } from "./MaterializedViewBuilder";
import { UserDefinedTypeBuilder } from "./UserDefinedTypeBuilder";
import { UserDefinedFunctionBuilder } from "./UserDefinedFunctionBuilder";
import { UserDefinedAggregateBuilder } from "./UserDefinedAggregateBuilder";
/**
 * Schema builder for creating and managing database schema objects.
 * Provides a fluent interface for creating tables, materialized views, user-defined types,
 * functions, and aggregates. Supports both SQL and ScyllaDB/Cassandra-specific features.
 *
 * @example
 *
 * const schema = new Schema(driver);
 *
 * // Create a table
 * await schema.createTable('users', (table) => {
 *   table.id();
 *   table.string('name');
 *   table.string('email').unique();
 *   table.timestamps();
 * });
 *
 * // Create a materialized view
 * await schema.createMaterializedView('users_by_email', 'users', (view) => {
 *   view.select('*');
 *   view.primaryKey('email', 'id');
 * });
 *
 */
export class Schema {
    driver;
    /**
     * Creates a new Schema instance.
     *
     * @param driver - Database driver for executing schema operations
     *
     * @example
     *
     * const connection = connectionManager.getConnection();
     * const schema = new Schema(connection.getDriver());
     *
     */
    constructor(driver) {
        this.driver = driver;
    }
    /**
     * Creates a new table with the specified structure.
     *
     * @param tableName - Name of the table to create
     * @param callback - Function to define table structure
     * @returns Promise that resolves when table is created
     *
     * @example
     *
     * await schema.createTable('posts', (table) => {
     *   table.id();
     *   table.string('title');
     *   table.text('content');
     *   table.integer('user_id');
     *   table.foreign('user_id').references('id').on('users');
     *   table.timestamps();
     * });
     *
     */
    async createTable(table, callback) {
        const builder = new TableBuilder(table);
        callback(builder);
        const definition = builder.build();
        const grammar = this.driver.getGrammar();
        const sql = grammar.compileCreateTable(definition);
        await this.driver.query(sql);
    }
    /**
     * Creates a new table only if it doesn't already exist.
     *
     * @param tableName - Name of the table to create
     * @param callback - Function to define table structure
     * @returns Promise that resolves when table is created or already exists
     *
     * @example
     *
     * await schema.createTableIfNotExists('cache', (table) => {
     *   table.string('key').primary();
     *   table.text('value');
     *   table.integer('ttl');
     * });
     *
     */
    // public async createTableIfNotExists(tableName: string, callback: (table: TableBuilder) => void): Promise<void> {
    //   const builder = new TableBuilder(tableName, this.driver)
    //   callback(builder)
    //   await builder.createIfNotExists()
    // }
    /**
     * Modifies an existing table structure.
     *
     * @param tableName - Name of the table to modify
     * @param callback - Function to define table modifications
     * @returns Promise that resolves when table is modified
     *
     * @example
     *
     * await schema.alterTable('users', (table) => {
     *   table.addColumn('phone', 'text');
     *   table.dropColumn('old_field');
     *   table.addIndex('email');
     * });
     *
     */
    async alterTable(table, callback) {
        const builder = new TableBuilder(table);
        builder.setTableExists(true);
        callback(builder);
        const definition = builder.build();
        const grammar = this.driver.getGrammar();
        const sql = grammar.compileAlterTable(definition);
        await this.driver.query(sql);
    }
    /**
     * Drops a table from the database.
     *
     * @param tableName - Name of the table to drop
     * @returns Promise that resolves when table is dropped
     *
     * @example
     *
     * await schema.dropTable('old_table');
     *
     */
    async dropTable(table) {
        const grammar = this.driver.getGrammar();
        const sql = `DROP TABLE ${grammar.wrapTable(table)}`;
        await this.driver.query(sql);
    }
    /**
     * Drops a table only if it exists.
     *
     * @param tableName - Name of the table to drop
     * @returns Promise that resolves when table is dropped or doesn't exist
     *
     * @example
     *
     * await schema.dropTableIfExists('temporary_table');
     *
     */
    async dropTableIfExists(table) {
        const grammar = this.driver.getGrammar();
        if (this.driver.constructor.name === "ScyllaDBDriver") {
            const sql = `DROP TABLE IF EXISTS ${grammar.wrapTable(table)}`;
            await this.driver.query(sql);
        }
        else {
            const exists = await this.hasTable(table);
            if (exists) {
                await this.dropTable(table);
            }
        }
    }
    /**
     * Truncates a table, removing all data but keeping the structure.
     *
     * @param tableName - Name of the table to truncate
     * @returns Promise that resolves when table is truncated
     *
     * @example
     *
     * await schema.truncateTable('logs');
     *
     */
    async truncateTable(tableName) {
        const grammar = this.driver.getGrammar();
        const sql = `TRUNCATE ${grammar.wrapTable(tableName)}`;
        await this.driver.query(sql);
    }
    /**
     * Creates a materialized view (ScyllaDB/Cassandra specific).
     *
     * @param viewName - Name of the materialized view
     * @param baseTable - Base table for the view
     * @param callback - Function to define view structure
     * @returns Promise that resolves when view is created
     *
     * @example
     *
     * await schema.createMaterializedView('users_by_email', 'users', (view) => {
     *   view.select('id', 'name', 'email', 'created_at');
     *   view.where('email', 'IS NOT NULL');
     *   view.primaryKey('email', 'id');
     * });
     *
     */
    async createMaterializedView(viewName, baseTable, callback) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("Materialized views are only supported in ScyllaDB");
        }
        const builder = new MaterializedViewBuilder(viewName, baseTable);
        callback(builder);
        const sql = builder.toSQL();
        await this.driver.query(sql);
    }
    /**
     * Drops a materialized view.
     *
     * @param viewName - Name of the materialized view to drop
     * @returns Promise that resolves when view is dropped
     *
     * @example
     *
     * await schema.dropMaterializedView('users_by_email');
     *
     */
    async dropMaterializedView(viewName) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("Materialized views are only supported in ScyllaDB");
        }
        // const builder = new MaterializedViewBuilder(viewName, "")
        // await builder.drop()
        const cql = `DROP MATERIALIZED VIEW IF EXISTS ${viewName}`;
        await this.driver.query(cql);
    }
    /**
     * Creates a user-defined type (ScyllaDB/Cassandra specific).
     *
     * @param typeName - Name of the user-defined type
     * @param callback - Function to define type structure
     * @returns Promise that resolves when type is created
     *
     * @example
     *
     * await schema.createType('address', (type) => {
     *   type.field('street', 'text');
     *   type.field('city', 'text');
     *   type.field('zip_code', 'text');
     *   type.field('country', 'text');
     * });
     *
     */
    async createType(typeName, callback) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined types are only supported in ScyllaDB");
        }
        const builder = new UserDefinedTypeBuilder(typeName);
        callback(builder);
        const sql = builder.toSQL();
        await this.driver.query(sql);
    }
    /**
     * Drops a user-defined type.
     *
     * @param typeName - Name of the type to drop
     * @returns Promise that resolves when type is dropped
     *
     * @example
     *
     * await schema.dropType('address');
     *
     */
    async dropType(typeName) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined types are only supported in ScyllaDB");
        }
        // const builder = new UserDefinedTypeBuilder(typeName)
        // await builder.drop()
        const cql = `DROP TYPE IF EXISTS ${typeName}`;
        await this.driver.query(cql);
    }
    /**
     * Creates a user-defined function (ScyllaDB/Cassandra specific).
     *
     * @param functionName - Name of the function
     * @param callback - Function to define function structure
     * @returns Promise that resolves when function is created
     *
     * @example
     *
     * await schema.createFunction('calculate_age', (func) => {
     *   func.parameter('birth_date', 'timestamp');
     *   func.returns('int');
     *   func.language('java');
     *   func.body(`
     *     return (int) ((System.currentTimeMillis() - birth_date.getTime())
     *       / (1000L * 60 * 60 * 24 * 365));
     *   `);
     * });
     *
     */
    async createFunction(functionName, callback) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined functions are only supported in ScyllaDB");
        }
        const builder = new UserDefinedFunctionBuilder(functionName);
        callback(builder);
        const sql = builder.toSQL();
        await this.driver.query(sql);
    }
    /**
     * Drops a user-defined function.
     *
     * @param functionName - Name of the function to drop
     * @returns Promise that resolves when function is dropped
     *
     * @example
     *
     * await schema.dropFunction('calculate_age');
     *
     */
    async dropFunction(functionName, parameterTypes) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined functions are only supported in ScyllaDB");
        }
        // const builder = new UserDefinedFunctionBuilder(functionName)
        // await builder.drop()
        if (parameterTypes.length === 0) {
            throw new Error("Parameter types are required to drop a UDF in ScyllaDB");
        }
        const paramStr = parameterTypes.join(", ");
        const sql = `DROP FUNCTION IF EXISTS ${functionName}(${paramStr})`;
        await this.driver.query(sql);
    }
    /**
     * Creates a user-defined aggregate (ScyllaDB/Cassandra specific).
     *
     * @param aggregateName - Name of the aggregate
     * @param callback - Function to define aggregate structure
     * @returns Promise that resolves when aggregate is created
     *
     * @example
     *
     * await schema.createAggregate('average', (agg) => {
     *   agg.parameter('val', 'int');
     *   agg.stateFunction('avg_state');
     *   agg.stateType('tuple<int, bigint>');
     *   agg.finalFunction('avg_final');
     *   agg.initialCondition('(0, 0)');
     * });
     *
     */
    async createAggregate(aggregateName, callback) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined aggregates are only supported in ScyllaDB");
        }
        const builder = new UserDefinedAggregateBuilder(aggregateName);
        callback(builder);
        const sql = builder.toSQL();
        await this.driver.query(sql);
    }
    /**
     * Drops a user-defined aggregate.
     *
     * @param aggregateName - Name of the aggregate to drop
     * @returns Promise that resolves when aggregate is dropped
     *
     * @example
     *
     * await schema.dropAggregate('average');
     *
     */
    async dropAggregate(aggregateName, parameterTypes) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined aggregates are only supported in ScyllaDB");
        }
        if (parameterTypes.length === 0) {
            throw new Error("Parameter types are required to drop a UDA in ScyllaDB");
        }
        const builder = new UserDefinedAggregateBuilder(aggregateName).withParameters(parameterTypes);
        const sql = builder.dropSQL();
        await this.driver.query(sql);
    }
    /**
     * Checks if a table exists in the database.
     *
     * @param tableName - Name of the table to check
     * @returns Promise resolving to boolean indicating existence
     *
     * @example
     *
     * if (await schema.hasTable('users')) {
     *   console.log('Users table exists');
     * }
     *
     */
    async hasTable(tableName) {
        const grammar = this.driver.getGrammar();
        const sql = grammar.compileTableExists(tableName);
        const result = await this.driver.query(sql);
        return result.rows.length > 0;
    }
    /**
     * Checks if a column exists in a table.
     *
     * @param tableName - Name of the table
     * @param columnName - Name of the column to check
     * @returns Promise resolving to boolean indicating existence
     *
     * @example
     *
     * if (await schema.hasColumn('users', 'email')) {
     *   console.log('Email column exists in users table');
     * }
     *
     */
    async hasColumn(tableName, columnName) {
        const grammar = this.driver.getGrammar();
        const sql = grammar.compileColumnExists(tableName, columnName);
        const result = await this.driver.query(sql);
        return result.rows.length > 0;
    }
    /**
     * Gets information about table columns.
     *
     * @param tableName - Name of the table
     * @returns Promise resolving to array of column information
     *
     * @example
     *
     * const columns = await schema.getColumnListing('users');
     * columns.forEach(column => {
     *   console.log(`Column: ${column.name}, Type: ${column.type}`);
     * });
     *
     */
    // public async getColumnListing(tableName: string): Promise<Array<{ name: string; type: string; nullable: boolean }>> {
    //   const grammar = this.driver.getGrammar()
    //   const sql = grammar.compileColumnListing(tableName)
    //   const result = await this.driver.query(sql)
    //   return result.rows
    // }
    /**
     * Executes a raw schema query.
     * Use with caution - bypasses query builder safety features.
     *
     * @param sql - Raw SQL/CQL query to execute
     * @param params - Optional query parameters
     * @returns Promise resolving to query result
     *
     * @example
     *
     * await schema.raw('CREATE KEYSPACE IF NOT EXISTS test_ks WITH replication = ?', [
     *   { 'class': 'SimpleStrategy', 'replication_factor': 1 }
     * ]);
     *
     */
    async raw(sql, params) {
        return await this.driver.query(sql, params);
    }
}
//# sourceMappingURL=Schema.js.map