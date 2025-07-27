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
export class DatabaseDriver {
    /** Database configuration */
    config;
    /** Active database connection instance */
    connection;
    /** Transaction state flag */
    inTransaction = false;
    /**
     * Creates a new DatabaseDriver instance.
     *
     * @param config - Database configuration object
     */
    constructor(config) {
        this.config = config;
    }
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
    isConnected() {
        return !!this.connection;
    }
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
    isInTransaction() {
        return this.inTransaction;
    }
}
//# sourceMappingURL=DatabaseDriver.js.map