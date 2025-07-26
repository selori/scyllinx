"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseDriver = void 0;
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
class DatabaseDriver {
    /**
     * Creates a new DatabaseDriver instance.
     *
     * @param config - Database configuration object
     */
    constructor(config) {
        /** Transaction state flag */
        this.inTransaction = false;
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
exports.DatabaseDriver = DatabaseDriver;
//# sourceMappingURL=DatabaseDriver.js.map