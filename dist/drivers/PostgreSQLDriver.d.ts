import { DatabaseDriver } from "./DatabaseDriver";
import { PostgreSQLGrammar } from "./grammars/PostgreSQLGrammar";
import { ConnectionConfig, PreparedStatement, QueryResult } from "@/types/index";
/**
 * PostgreSQL database driver implementation using `pg`.
 * Provides PostgreSQL-specific functionality including connection pooling,
 * query execution, prepared statements via named queries, and SQL grammar support.
 *
 * @extends DatabaseDriver
 *
 * @example
 *
 * const config = {
 *   driver: 'pgsql',
 *   host: 'localhost',
 *   port: 5432,
 *   database: 'mydb',
 *   username: 'user',
 *   password: 'secret'
 * };
 *
 * const driver = new PostgreSQLDriver(config);
 * await driver.connect();
 * const result = await driver.query('SELECT * FROM users');
 * console.log(result.rows);
 */
export declare class PostgreSQLDriver extends DatabaseDriver {
    /** PostgreSQL connection pool instance */
    private pool;
    /** Query grammar for SQL compilation */
    private grammar;
    /**
     * Creates a new PostgreSQLDriver instance.
     *
     * @param config - Database configuration object
     */
    constructor(config: ConnectionConfig);
    /**
     * Establishes connection to PostgreSQL using a connection pool.
     *
     * @returns Promise that resolves when connection is established
     * @throws {Error} When connection fails
     *
     * @example
     * await driver.connect();
     * console.log('Connected to PostgreSQL');
     */
    connect(): Promise<void>;
    /**
     * Closes the PostgreSQL connection pool.
     *
     * @returns Promise that resolves when connection is closed
     *
     * @example
     * await driver.disconnect();
     * console.log('Disconnected from PostgreSQL');
     */
    disconnect(): Promise<void>;
    /**
     * Executes a SQL query against PostgreSQL.
     *
     * @param sql - The SQL query to execute
     * @param bindings - Optional parameter bindings for the query
     * @returns Promise resolving to query results
     * @throws {Error} When query execution fails
     *
     * @example
     * const result = await driver.query(
     *   'SELECT * FROM users WHERE status = $1',
     *   ['active']
     * );
     * console.log(`Found ${result.rowCount} users`);
     */
    query(sql: string, bindings?: any[]): Promise<QueryResult>;
    /**
     * Prepares a SQL statement for repeated execution.
     * Uses named prepared statements under the hood.
     *
     * @param sql - The SQL statement to prepare
     * @returns Promise resolving to prepared statement
     * @throws {Error} When statement preparation fails
     *
     * @example
     * const prepared = await driver.prepare('INSERT INTO users (id, name) VALUES ($1, $2)');
     * await prepared.execute(['123', 'John']);
     */
    prepare(sql: string): Promise<PreparedStatement>;
    /**
     * Begins a database transaction.
     *
     * @returns Promise that resolves when transaction begins
     *
     * @example
     * await driver.beginTransaction();
     */
    beginTransaction(): Promise<void>;
    /**
     * Commits the current transaction.
     *
     * @returns Promise that resolves when transaction is committed
     *
     * @example
     * await driver.commit();
     */
    commit(): Promise<void>;
    /**
     * Rolls back the current transaction.
     *
     * @returns Promise that resolves when transaction is rolled back
     *
     * @example
     * await driver.rollback();
     */
    rollback(): Promise<void>;
    /**
     * Gets the ID of the last inserted record.
     * Relies on PostgreSQL's `LASTVAL()` function.
     *
     * @returns Promise resolving to the last insert ID
     * @throws {Error} When ID cannot be retrieved
     *
     * @example
     * const id = await driver.getLastInsertId();
     */
    getLastInsertId(): Promise<string | number>;
    /**
     * Escapes a value for safe inclusion in SQL queries.
     *
     * @param value - The value to escape
     * @returns Escaped string representation of the value
     *
     * @example
     * const escaped = driver.escape("O'Reilly");
     * // Returns: "'O''Reilly'"
     */
    escape(value: any): string;
    /**
     * Gets the query grammar instance for this driver.
     *
     * @returns The PostgreSQLGrammar instance
     */
    getGrammar(): PostgreSQLGrammar;
    /**
     * Checks if the driver supports a specific feature.
     *
     * @param feature - The feature name to check
     * @returns True if feature is supported, false otherwise
     *
     * @example
     * if (driver.supportsFeature('returning')) {
     *   console.log('RETURNING is supported');
     * }
     */
    supportsFeature(feature: string): boolean;
}
//# sourceMappingURL=PostgreSQLDriver.d.ts.map