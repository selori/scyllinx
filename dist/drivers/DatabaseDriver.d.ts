import type { ConnectionConfig, PreparedStatement, QueryResult } from "@/types/index";
import type { QueryGrammar } from "./grammars/QueryGrammar";
/**
 * Abstract base class for database drivers.
 * Defines the interface that all database drivers must implement.
 * Provides common functionality and enforces consistent behavior across different database systems.
 *
 * @abstract
 *
 * @example
 *
 * class MyCustomDriver extends DatabaseDriver {
 *   async connect(): Promise<void> {
 *     // Implementation specific to your database
 *   }
 *
 *   async query(sql: string, bindings?: any[]): Promise<QueryResult> {
 *     // Execute query and return results
 *   }
 *
 *   // ... implement other abstract methods
 * }
 *
 */
export declare abstract class DatabaseDriver {
    /** Database configuration */
    protected config: ConnectionConfig;
    /** Active database connection instance */
    protected connection: any;
    /** Transaction state flag */
    protected inTransaction: boolean;
    /**
     * Creates a new DatabaseDriver instance.
     *
     * @param config - Database configuration object
     */
    constructor(config: ConnectionConfig);
    /**
     * Establishes connection to the database.
     * Must be implemented by concrete driver classes.
     *
     * @abstract
     * @returns Promise that resolves when connection is established
     * @throws {Error} When connection fails
     */
    abstract connect(): Promise<void>;
    /**
     * Closes the database connection.
     * Must be implemented by concrete driver classes.
     *
     * @abstract
     * @returns Promise that resolves when connection is closed
     */
    abstract disconnect(): Promise<void>;
    /**
     * Executes a query against the database.
     * Must be implemented by concrete driver classes.
     *
     * @abstract
     * @param sql - The SQL query to execute
     * @param bindings - Optional parameter bindings for the query
     * @returns Promise resolving to query results
     * @throws {Error} When query execution fails
     */
    abstract query(sql: string, bindings?: any[]): Promise<QueryResult>;
    /**
     * Prepares a SQL statement for repeated execution.
     * Must be implemented by concrete driver classes.
     *
     * @abstract
     * @param sql - The SQL statement to prepare
     * @returns Promise resolving to prepared statement
     * @throws {Error} When statement preparation fails
     */
    abstract prepare(sql: string): Promise<PreparedStatement>;
    /**
     * Begins a database transaction.
     * Must be implemented by concrete driver classes.
     *
     * @abstract
     * @returns Promise that resolves when transaction begins
     * @throws {Error} When transaction cannot be started
     */
    abstract beginTransaction(): Promise<void>;
    /**
     * Commits the current transaction.
     * Must be implemented by concrete driver classes.
     *
     * @abstract
     * @returns Promise that resolves when transaction is committed
     * @throws {Error} When commit fails
     */
    abstract commit(): Promise<void>;
    /**
     * Rolls back the current transaction.
     * Must be implemented by concrete driver classes.
     *
     * @abstract
     * @returns Promise that resolves when transaction is rolled back
     * @throws {Error} When rollback fails
     */
    abstract rollback(): Promise<void>;
    /**
     * Gets the ID of the last inserted record.
     * Must be implemented by concrete driver classes.
     *
     * @abstract
     * @returns Promise resolving to the last insert ID
     * @throws {Error} When ID cannot be retrieved
     */
    abstract getLastInsertId(): Promise<string | number>;
    /**
     * Escapes a value for safe inclusion in SQL queries.
     * Must be implemented by concrete driver classes.
     *
     * @abstract
     * @param value - The value to escape
     * @returns Escaped string representation of the value
     */
    abstract escape(value: any): string;
    /**
     * Gets the query grammar instance for this driver.
     * Must be implemented by concrete driver classes.
     *
     * @abstract
     * @returns The QueryGrammar instance
     */
    abstract getGrammar(): QueryGrammar;
    /**
     * Checks if the driver supports a specific feature.
     * Must be implemented by concrete driver classes.
     *
     * @abstract
     * @param feature - The feature name to check
     * @returns True if feature is supported, false otherwise
     */
    abstract supportsFeature(feature: string): boolean;
    /**
     * Checks if the driver is currently connected to the database.
     *
     * @returns True if connected, false otherwise
     *
     * @example
     *
     * if (driver.isConnected()) {
     *   console.log('Driver is connected');
     * }
     *
     */
    isConnected(): boolean;
    /**
     * Checks if the driver is currently in a transaction.
     *
     * @returns True if in transaction, false otherwise
     *
     * @example
     *
     * if (driver.isInTransaction()) {
     *   console.log('Currently in transaction');
     * }
     *
     */
    isInTransaction(): boolean;
}
//# sourceMappingURL=DatabaseDriver.d.ts.map