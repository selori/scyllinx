import type { DatabaseDriver } from "@/drivers/DatabaseDriver";
import { TableBuilder } from "./TableBuilder";
import { MaterializedViewBuilder } from "./MaterializedViewBuilder";
import { PrimitiveScyllaType, UserDefinedTypeBuilder } from "./UserDefinedTypeBuilder";
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
export declare class Schema {
    private driver;
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
    constructor(driver: DatabaseDriver);
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
    createTable(table: string, callback: (table: TableBuilder) => void): Promise<void>;
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
    alterTable(table: string, callback: (table: TableBuilder) => void): Promise<void>;
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
    dropTable(table: string): Promise<void>;
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
    dropTableIfExists(table: string): Promise<void>;
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
    truncateTable(tableName: string): Promise<void>;
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
    createMaterializedView(viewName: string, baseTable: string, callback: (view: MaterializedViewBuilder) => void): Promise<void>;
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
    dropMaterializedView(viewName: string): Promise<void>;
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
    createType(typeName: string, callback: (type: UserDefinedTypeBuilder) => void): Promise<void>;
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
    dropType(typeName: string): Promise<void>;
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
    createFunction(functionName: string, callback: (func: UserDefinedFunctionBuilder) => void): Promise<void>;
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
    dropFunction(functionName: string, parameterTypes: PrimitiveScyllaType[]): Promise<void>;
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
    createAggregate(aggregateName: string, callback: (agg: UserDefinedAggregateBuilder) => void): Promise<void>;
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
    dropAggregate(aggregateName: string, parameterTypes: PrimitiveScyllaType[]): Promise<void>;
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
    hasTable(tableName: string): Promise<boolean>;
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
    hasColumn(tableName: string, columnName: string): Promise<boolean>;
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
    raw(sql: string, params?: any[]): Promise<any>;
}
//# sourceMappingURL=Schema.d.ts.map