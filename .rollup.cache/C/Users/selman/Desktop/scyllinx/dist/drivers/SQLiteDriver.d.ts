import { DatabaseDriver } from "./DatabaseDriver";
import type { QueryGrammar } from "./grammars/QueryGrammar";
import { ConnectionConfig, PreparedStatement, QueryResult } from "@/types";
/**
 * SQLite driver implementation using better-sqlite3.
 */
export declare class SQLiteDriver extends DatabaseDriver {
    private sqliteModule;
    private db;
    private grammar;
    private transactionLevel;
    /**
     * Creates a new PostgreSQLDriver instance.
     *
     * @param config - Database configuration object
     */
    constructor(config: ConnectionConfig);
    /**
     * Connect to a SQLite database using the given configuration.
     *
     * @returns Promise that resolves when connection is established
     * @throws {Error} When connection fails
     *
     * @example
     * await driver.connect();
     * console.log('Connected to SQLite');
     * ```
     */
    connect(): Promise<void>;
    /**
     * Disconnects from the SQLite database.
     */
    disconnect(): Promise<void>;
    /**
     * Execute a raw SQL query with optional bindings and options.
     *
     * @param sql - The raw SQL string to execute.
     * @param bindings - The parameter bindings for the SQL query.
     * @returns The result of the executed query.
     */
    query(sql: string, bindings?: any[]): Promise<QueryResult>;
    /**
     * Prepares a SQL statement and returns a PreparedStatement wrapper.
     *
     * @param sql - The SQL statement to prepare.
     * @returns A prepared statement interface for reuse.
     */
    prepare(sql: string): Promise<PreparedStatement>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    /**
     * Get the last inserted row ID.
     *
     * @returns The ID of the last inserted row.
     */
    getLastInsertId(): Promise<string | number>;
    /**
     * Escape an identifier (e.g. table or column name) for SQLite.
     *
     * @param value - The identifier to escape.
     * @returns The escaped identifier.
     * @example
     * ```ts
     * driver.escape("users") // => "`users`"
     * ```
     */
    escape(value: any): string;
    /**
     * Returns the SQLite grammar instance.
     */
    getGrammar(): QueryGrammar;
    /**
     * Checks whether a given feature is supported by the SQLite driver.
     *
     * @param feature - The name of the feature to check.
     * @returns Whether the feature is supported.
     */
    supportsFeature(feature: string): boolean;
}
//# sourceMappingURL=SQLiteDriver.d.ts.map