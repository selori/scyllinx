"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
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
class Connection {
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
    constructor(name, driver, config) {
        this.connected = false;
        this.name = name;
        this.driver = driver;
        this.config = config;
    }
    /**
     * Gets the connection name/identifier.
     *
     * @returns The unique name of this connection
     */
    getName() {
        return this.name;
    }
    /**
     * Gets the database driver instance.
     *
     * @returns The driver associated with this connection
     */
    getDriver() {
        return this.driver;
    }
    /**
     * Gets the connection configuration.
     *
     * @returns Configuration object used for this connection
     */
    getConfig() {
        return this.config;
    }
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
    async connect() {
        if (this.connected) {
            return;
        }
        await this.driver.connect();
        this.connected = true;
    }
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
    async disconnect() {
        if (!this.connected) {
            return;
        }
        await this.driver.disconnect();
        this.connected = false;
    }
    /**
     * Checks if the connection is currently active.
     *
     * @returns True if connected, false otherwise
     */
    isConnected() {
        return this.connected;
    }
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
    async query(query, params) {
        if (!this.connected) {
            throw new Error(`Connection '${this.name}' is not connected`);
        }
        return await this.driver.query(query, params);
    }
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
    async beginTransaction() {
        await this.driver.beginTransaction();
    }
    /**
     * Commits the current transaction.
     *
     * @throws {Error} When commit fails or no active transaction
     */
    async commit() {
        await this.driver.commit();
    }
    /**
     * Rolls back the current transaction.
     *
     * @throws {Error} When rollback fails or no active transaction
     */
    async rollback() {
        await this.driver.rollback();
    }
}
exports.Connection = Connection;
//# sourceMappingURL=Connection.js.map