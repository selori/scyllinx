import { DatabaseDriver } from "./DatabaseDriver";
import { ScyllaDBGrammar } from "./grammars/ScyllaDBGrammar";
import type { ConnectionConfig, PreparedStatement, QueryResult } from "@/types/index";
/**
 * ScyllaDB database driver implementation.
 * Provides ScyllaDB-specific functionality including connection management,
 * query execution, batch operations, and data type mapping.
 *
 * @extends DatabaseDriver
 *
 * @example
 *
 * const config = {
 *   driver: 'scylladb',
 *   host: 'localhost',
 *   keyspace: 'myapp',
 *   localDataCenter: 'datacenter1',
 *   username: 'cassandra',
 *   password: 'cassandra'
 * };
 *
 * const driver = new ScyllaDBDriver(config);
 * await driver.connect();
 * const result = await driver.query('SELECT * FROM users');
 *
 */
export declare class ScyllaDBDriver extends DatabaseDriver {
    private cassandraModule;
    /** ScyllaDB client instance */
    private client;
    /** Query grammar for CQL compilation */
    private grammar;
    /** Cache for prepared statements */
    private preparedStatements;
    /**
     * Creates a new ScyllaDBDriver instance.
     *
     * @param config - Database configuration object
     */
    constructor(config: ConnectionConfig);
    /**
     * Establishes connection to ScyllaDB cluster.
     * Configures client options including contact points, data center, keyspace, and credentials.
     *
     * @returns Promise that resolves when connection is established
     * @throws {Error} When connection fails
     *
     * @example
     *
     * await driver.connect();
     * console.log('Connected to ScyllaDB');
     *
     */
    connect(): Promise<void>;
    /**
     * Closes connection to ScyllaDB cluster.
     *
     * @returns Promise that resolves when connection is closed
     *
     * @example
     *
     * await driver.disconnect();
     * console.log('Disconnected from ScyllaDB');
     *
     */
    disconnect(): Promise<void>;
    /**
     * Executes a CQL query against ScyllaDB.
     * Automatically prepares statements for better performance and maps result rows.
     *
     * @param cql - The CQL query to execute
     * @param params - Optional parameters for the query
     * @returns Promise resolving to query results with mapped rows
     * @throws {Error} When query execution fails
     *
     * @example
     *
     * const result = await driver.query(
     *   'SELECT * FROM users WHERE status = ?',
     *   ['active']
     * );
     * console.log(`Found ${result.rowCount} users`);
     * result.rows.forEach(user => console.log(user.name));
     *
     */
    query(cql: string, params?: any[]): Promise<QueryResult>;
    /**
     * Prepares a CQL statement for repeated execution.
     * Caches prepared statements to avoid re-preparation overhead.
     *
     * @param cql - The CQL statement to prepare
     * @returns Promise resolving to prepared statement wrapper
     * @throws {Error} When statement preparation fails
     *
     * @example
     *
     * const prepared = await driver.prepare('INSERT INTO users (id, name) VALUES (?, ?)');
     * await prepared.execute(['123', 'John']);
     * await prepared.execute(['456', 'Jane']);
     *
     */
    prepare(cql: string): Promise<PreparedStatement>;
    /**
     * Executes multiple queries as a batch operation.
     * Provides atomicity for related operations and better performance for bulk operations.
     *
     * @param queries - Array of query objects with CQL and parameters
     * @returns Promise resolving to batch execution result
     * @throws {Error} When batch execution fails
     *
     * @example
     *
     * await driver.batch([
     *   { query: 'INSERT INTO users (id, name) VALUES (?, ?)', params: ['1', 'John'] },
     *   { query: 'INSERT INTO profiles (user_id, bio) VALUES (?, ?)', params: ['1', 'Developer'] }
     * ]);
     *
     */
    batch(queries: Array<{
        query: string;
        params?: any[];
    }>): Promise<QueryResult>;
    /**
     * Begins a database transaction.
     * Note: ScyllaDB uses lightweight transactions (LWT) instead of traditional ACID transactions.
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
     * Note: ScyllaDB doesn't have auto-increment, so this typically returns empty.
     *
     * @returns Promise resolving to empty string (ScyllaDB doesn't support auto-increment)
     */
    getLastInsertId(): Promise<string | number>;
    /**
     * Escapes a value for safe inclusion in CQL queries.
     * Handles null values, strings, booleans, and other data types.
     *
     * @param value - The value to escape
     * @returns Escaped string representation of the value
     *
     * @example
     *
     * const escaped = driver.escape("O'Reilly");
     * // Returns: "'O''Reilly'"
     *
     * const escapedBool = driver.escape(true);
     * // Returns: "true"
     *
     */
    escape(value: any): string;
    /**
     * Gets the query grammar instance for this driver.
     *
     * @returns The ScyllaDBGrammar instance
     */
    getGrammar(): ScyllaDBGrammar;
    /**
     * Checks if the driver supports a specific feature.
     *
     * @param feature - The feature name to check
     * @returns True if feature is supported, false otherwise
     *
     * @example
     *
     * if (driver.supportsFeature('batch_operations')) {
     *   console.log('Batch operations are supported');
     * }
     *
     * if (driver.supportsFeature('ttl')) {
     *   console.log('TTL is supported');
     * }
     *
     */
    supportsFeature(feature: string): boolean;
    /**
     * Maps a ScyllaDB row to a plain JavaScript object.
     * Handles ScyllaDB-specific data types and converts them to JavaScript equivalents.
     *
     * @private
     * @param row - The raw row from ScyllaDB
     * @returns Mapped plain object
     */
    private mapRow;
    /**
     * Maps ScyllaDB values to JavaScript types.
     * Handles UUID, TimeUUID, BigDecimal, Long, Date, and other ScyllaDB-specific types.
     *
     * @private
     * @param value - The value to map
     * @returns Mapped JavaScript value
     *
     * @example
     *
     * // Internal usage - converts ScyllaDB types to JS types
     * const uuid = mapValue(scyllaUuid); // Returns string
     * const timestamp = mapValue(scyllaTimestamp); // Returns ISO string
     * const decimal = mapValue(scyllaBigDecimal); // Returns number
     *
     */
    private mapValue;
}
//# sourceMappingURL=ScyllaDBDriver.d.ts.map