import { DatabaseDriver } from "./DatabaseDriver";
import { MySQLGrammar } from "./grammars/MySQLGrammar";
import type { ConnectionConfig, QueryResult, PreparedStatement } from "@/types/index";
/**
 * MySQL/MariaDB database driver implementation using `mysql2`.
 * Provides connection pooling, query execution, prepared statements, and grammar support.
 *
 * @extends DatabaseDriver
 *
 * @example
 *
 * const config = {
 *   driver: 'mysql',
 *   host: 'localhost',
 *   port: 3306,
 *   database: 'myapp',
 *   username: 'root',
 *   password: 'secret'
 * };
 *
 * const driver = new MySQLDriver(config);
 * await driver.connect();
 * const result = await driver.query('SELECT * FROM users');
 */
export declare class MySQLDriver extends DatabaseDriver {
    /** MySQL connection instance */
    protected mysqlConnection: any | null;
    private mysqlModule;
    /** SQL grammar instance */
    private grammar;
    /**
     * Creates a new MySQLDriver instance.
     *
     * @param config - Database configuration object
     */
    constructor(config: ConnectionConfig);
    /**
     * Establishes a connection to the MySQL server.
     *
     * @returns Promise that resolves when connection is established
     * @throws {Error} When connection fails
     */
    connect(): Promise<void>;
    /**
     * Closes the database connection.
     *
     * @returns Promise that resolves when connection is closed
     */
    disconnect(): Promise<void>;
    /**
     * Executes a raw SQL query with optional parameter bindings.
     *
     * @param sql - The SQL query to execute
     * @param bindings - Optional parameter bindings
     * @returns Promise resolving to query results
     * @throws {Error} When query execution fails
     *
     * @example
     * const result = await driver.query('SELECT * FROM users WHERE active = ?', [1]);
     */
    query(sql: string, bindings?: any[]): Promise<QueryResult>;
    /**
     * Prepares a SQL statement for repeated execution.
     *
     * @param sql - The SQL statement to prepare
     * @returns Promise resolving to a prepared statement
     * @throws {Error} When statement preparation fails
     *
     * @example
     * const prepared = await driver.prepare('INSERT INTO logs (id, message) VALUES (?, ?)');
     * await prepared.execute(['1', 'Hello']);
     */
    prepare(sql: string): Promise<PreparedStatement>;
    /**
     * Begins a transaction on the current connection.
     *
     * @returns Promise that resolves when transaction begins
     */
    beginTransaction(): Promise<void>;
    /**
     * Commits the current transaction.
     *
     * @returns Promise that resolves when transaction is committed
     */
    commit(): Promise<void>;
    /**
     * Rolls back the current transaction.
     *
     * @returns Promise that resolves when transaction is rolled back
     */
    rollback(): Promise<void>;
    /**
     * Gets the ID of the last inserted record.
     *
     * @returns Promise resolving to the last insert ID
     *
     * @example
     * const id = await driver.getLastInsertId();
     */
    getLastInsertId(): Promise<string | number>;
    /**
     * Escapes a value for safe inclusion in SQL queries.
     *
     * @param value - The value to escape
     * @returns Escaped string
     *
     * @example
     * const escaped = driver.escape("O'Reilly");
     * // "'O\\'Reilly'"
     */
    escape(value: any): string;
    /**
     * Gets the SQL grammar instance for this driver.
     *
     * @returns The MySQLGrammar instance
     */
    getGrammar(): MySQLGrammar;
    /**
     * Checks if the driver supports a specific feature.
     *
     * @param feature - The feature name
     * @returns True if supported, false otherwise
     *
     * @example
     * if (driver.supportsFeature('transactions')) {
     *   console.log('Supports transactions');
     * }
     */
    supportsFeature(feature: string): boolean;
}
//# sourceMappingURL=MySQLDriver.d.ts.map