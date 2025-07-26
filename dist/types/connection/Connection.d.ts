import type { DatabaseDriver } from "@/drivers/DatabaseDriver";
import type { ConnectionConfig } from "@/types/index";
/**
 * Represents a database connection with its associated driver and configuration.
 * Manages the lifecycle and operations of a single database connection.
 *
 * @example
 *
 * const connection = new Connection('scylladb', driver, {
 *   hosts: ['127.0.0.1'],
 *   keyspace: 'my_app'
 * });
 *
 * await connection.connect();
 * const result = await connection.query('SELECT * FROM users');
 * await connection.disconnect();
 *
 */
export declare class Connection {
    private name;
    private driver;
    private config;
    private connected;
    /**
     * Creates a new database connection instance.
     *
     * @param name - Unique identifier for this connection
     * @param driver - Database driver instance to handle queries
     * @param config - Connection configuration options
     *
     * @example
     *
     * const connection = new Connection('default', new ScyllaDBDriver(), {
     *   hosts: ['localhost:9042'],
     *   keyspace: 'test_db',
     *   username: 'cassandra',
     *   password: 'cassandra'
     * });
     *
     */
    constructor(name: string, driver: DatabaseDriver, config: ConnectionConfig);
    /**
     * Gets the connection name/identifier.
     *
     * @returns The unique name of this connection
     */
    getName(): string;
    /**
     * Gets the database driver instance.
     *
     * @returns The driver associated with this connection
     */
    getDriver(): DatabaseDriver;
    /**
     * Gets the connection configuration.
     *
     * @returns Configuration object used for this connection
     */
    getConfig(): ConnectionConfig;
    /**
     * Establishes the database connection.
     * Initializes the driver and creates the actual database connection.
     *
     * @throws {Error} When connection fails or driver initialization fails
     *
     * @example
     *
     * try {
     *   await connection.connect();
     *   console.log('Connected successfully');
     * } catch (error) {
     *   console.error('Connection failed:', error);
     * }
     *
     */
    connect(): Promise<void>;
    /**
     * Closes the database connection.
     * Properly shuts down the driver and releases resources.
     *
     * @example
     *
     * await connection.disconnect();
     * console.log('Connection closed');
     *
     */
    disconnect(): Promise<void>;
    /**
     * Checks if the connection is currently active.
     *
     * @returns True if connected, false otherwise
     */
    isConnected(): boolean;
    /**
     * Executes a raw query against the database.
     *
     * @param query - SQL/CQL query string to execute
     * @param params - Optional parameters for the query
     * @returns Promise resolving to query results
     *
     * @throws {Error} When query execution fails or connection is not established
     *
     * @example
     *
     * // Simple query
     * const users = await connection.query('SELECT * FROM users');
     *
     * // Parameterized query
     * const user = await connection.query(
     *   'SELECT * FROM users WHERE id = ?',
     *   [userId]
     * );
     *
     */
    query(query: string, params?: any[]): Promise<any>;
    /**
     * Begins a database transaction.
     * Note: ScyllaDB has limited transaction support compared to traditional RDBMS.
     *
     * @throws {Error} When transaction cannot be started
     *
     * @example
     *
     * await connection.beginTransaction();
     * try {
     *   await connection.query('INSERT INTO users ...');
     *   await connection.query('UPDATE profiles ...');
     *   await connection.commit();
     * } catch (error) {
     *   await connection.rollback();
     *   throw error;
     * }
     *
     */
    beginTransaction(): Promise<void>;
    /**
     * Commits the current transaction.
     *
     * @throws {Error} When commit fails or no active transaction
     */
    commit(): Promise<void>;
    /**
     * Rolls back the current transaction.
     *
     * @throws {Error} When rollback fails or no active transaction
     */
    rollback(): Promise<void>;
}
//# sourceMappingURL=Connection.d.ts.map