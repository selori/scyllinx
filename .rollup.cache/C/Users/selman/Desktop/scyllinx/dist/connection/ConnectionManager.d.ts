import { ConnectionConfig, DatabaseConfig } from "@/types/index";
import { Connection } from "./Connection";
/**
 * Manages multiple database connections in a centralized manner.
 * Implements singleton pattern to ensure consistent connection management across the application.
 * Supports multiple named connections with different configurations and drivers.
 *
 * @example
 *
 * const manager = ConnectionManager.getInstance();
 *
 * // Add connections
 * manager.addConnection('default', driver1, config1);
 * manager.addConnection('analytics', driver2, config2);
 *
 * // Use connections
 * const defaultConn = manager.getConnection();
 * const analyticsConn = manager.getConnection('analytics');
 *
 */
export declare class ConnectionManager {
    private static instance;
    private connections;
    private defaultConnection;
    /**
     * Private constructor to enforce singleton pattern.
     * Use getInstance() to get the ConnectionManager instance.
     */
    private constructor();
    /**
     * Gets the singleton instance of ConnectionManager.
     * Creates a new instance if one doesn't exist.
     *
     * @returns The singleton ConnectionManager instance
     *
     * @example
     *
     * const manager = ConnectionManager.getInstance();
     *
     */
    static getInstance(): ConnectionManager;
    /**
     * Initializes the ConnectionManager with the given configuration object.
     *
     * @param {DatabaseConfig} config - An object containing global database settings
     *
     * @example
     * import { databaseConfig } from "@/database/config";
     *
     * // Load all configured connections at once
     * const manager = ConnectionManager.getInstance();
     * manager.initialize(databaseConfig);
     *
     * // Connect to every database in parallel
     * await manager.connectAll();
     *
     * // Now you can retrieve named connections or use the default:
     * const defaultConn = manager.getConnection();          // uses config.default
     * const analyticsConn = manager.getConnection("report"); // uses named key
     */
    initialize(config: DatabaseConfig): Promise<void>;
    /**
     * Adds a new database connection to the manager.
     *
     * @param name - Unique identifier for the connection
     * @param driver - Database driver instance
     * @param config - Connection configuration options
     *
     * @throws {Error} When a connection with the same name already exists
     *
     * @example
     *
     * manager.addConnection('primary', {
     *   driver: 'scyyladb',
     *   hosts: ['127.0.0.1:9042'],
     *   keyspace: 'main_db'
     * });
     *
     * manager.addConnection('cache', {
     *   driver: 'scyyladb',
     *   hosts: ['cache-cluster:9042'],
     *   keyspace: 'cache_db'
     * });
     *
     */
    addConnection(name: string, config: ConnectionConfig): Promise<void>;
    /**
     * Retrieves a connection by name.
     * If no name is provided, returns the default connection.
     *
     * @param name - Optional connection name. Uses default if not provided
     * @returns The requested connection instance
     *
     * @throws {Error} When the requested connection doesn't exist
     *
     * @example
     *
     * // Get default connection
     * const conn = manager.getConnection();
     *
     * // Get named connection
     * const cacheConn = manager.getConnection('cache');
     *
     */
    getConnection(name?: string): Connection;
    /**
     * Sets the default connection name.
     * This connection will be used when no specific connection is requested.
     *
     * @param name - Name of the connection to set as default
     *
     * @throws {Error} When the specified connection doesn't exist
     *
     * @example
     *
     * manager.setDefaultConnection('primary');
     *
     * // Now this will use 'primary' connection
     * const conn = manager.getConnection();
     *
     */
    setDefaultConnection(name: string): void;
    /**
     * Gets the name of the current default connection.
     *
     * @returns The name of the default connection
     */
    getDefaultConnectionName(): string;
    /**
     * Checks if a connection with the given name exists.
     *
     * @param name - Connection name to check
     * @returns True if connection exists, false otherwise
     *
     * @example
     *
     * if (manager.hasConnection('analytics')) {
     *   const conn = manager.getConnection('analytics');
     *   // Use analytics connection
     * }
     *
     */
    hasConnection(name: string): boolean;
    /**
     * Removes a connection from the manager.
     * Automatically disconnects the connection before removal.
     *
     * @param name - Name of the connection to remove
     *
     * @throws {Error} When trying to remove a non-existent connection
     *
     * @example
     *
     * await manager.removeConnection('old_connection');
     *
     */
    removeConnection(name: string): Promise<void>;
    /**
   * Returns all managed Connection instances.
   *
   * @returns {Connection[]} Array of Connection objects.
   */
    getConnections(): Connection[];
    /**
     * Returns all managed connection names.
     *
     * @returns {string[]} Array of connection name strings.
     * @example
     *
     * const names = manager.getConnectionNames();
     * console.log('Available connections:', names);
     */
    getConnectionNames(): string[];
    /**
     * Tests the specified connection by connecting and disconnecting.
     *
     * @param {string} name - Connection name to test.
     * @returns {Promise<boolean>} True if connect/disconnect succeeds, false otherwise.
     * @throws {Error} If the connection name is not found.
     * @example
     *
     * const isScyllaHealthy = await connectionManager.testConnection('scylladb')
     * console.log(isScyllaHealthy ? 'OK' : 'Failed');
     */
    testConnection(name: string): Promise<boolean>;
    /**
     * Connects all managed connections.
     * Useful for application startup to establish all database connections.
     *
     * @throws {Error} When any connection fails to connect
     *
     * @example
     *
     * try {
     *   await manager.connectAll();
     *   console.log('All connections established');
     * } catch (error) {
     *   console.error('Failed to connect:', error);
     * }
     *
     */
    connectAll(): Promise<void>;
    /**
     * Disconnects all managed connections.
     * Useful for graceful application shutdown.
     *
     * @example
     *
     * // During app shutdown
     * await manager.disconnectAll();
     * console.log('All connections closed');
     *
     */
    disconnectAll(): Promise<void>;
    /**
     * Gets the total number of managed connections.
     *
     * @returns Number of connections
     */
    getConnectionCount(): number;
    /**
     * Clears all connections from the manager.
     * Disconnects all connections before clearing.
     *
     * @example
     *
     * await manager.clear();
     * console.log('All connections removed');
     *
     */
    clear(): Promise<void>;
}
//# sourceMappingURL=ConnectionManager.d.ts.map