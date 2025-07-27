import type { ConnectionManager } from "@/connection/ConnectionManager";
import type { Migration } from "./Migration";
/**
 * Manages database migrations including execution, rollback, and status tracking.
 * Provides comprehensive migration management with batch tracking and error handling.
 * Automatically creates and manages a migrations table to track executed migrations.
 *
 * @example
 *
 * const connManager = ConnectionManager.getInstance();
 * const migrationManager = new MigrationManager(connManager);
 *
 * const migrations = [
 *   new CreateUsersTable(),
 *   new CreatePostsTable(),
 *   new AddIndexesToUsers()
 * ];
 *
 * // Run all pending migrations
 * await migrationManager.migrate(migrations);
 *
 * // Rollback last migration
 * await migrationManager.rollback(migrations, 1);
 *
 * // Check migration status
 * const status = await migrationManager.status(migrations);
 *
 */
export declare class MigrationManager {
    private connManager;
    private connection;
    private migrationsTable;
    /**
     * Creates a new MigrationManager instance.
     *
     * @param connManager - ConnectionManager instance for database access
     *
     * @example
     *
     * const connManager = ConnectionManager.getInstance();
     * const migrationManager = new MigrationManager(connManager);
     *
     */
    constructor(connManager: ConnectionManager);
    /**
     * Executes all pending migrations in order.
     * Creates the migrations tracking table if it doesn't exist.
     * Skips migrations that have already been executed.
     *
     * @param migrations - Array of migration instances to execute
     * @returns Promise that resolves when all migrations are complete
     *
     * @throws {Error} When any migration fails to execute
     *
     * @example
     *
     * const migrations = [
     *   new CreateUsersTable(),
     *   new CreatePostsTable()
     * ];
     *
     * try {
     *   await migrationManager.migrate(migrations);
     *   console.log('All migrations completed successfully');
     * } catch (error) {
     *   console.error('Migration failed:', error);
     * }
     *
     */
    migrate(migrations: Migration[]): Promise<void>;
    /**
     * Rolls back the specified number of migrations.
     * Executes the `down()` method of migrations in reverse order.
     *
     * @param migrations - Array of all available migrations
     * @param steps - Number of migrations to rollback (default: 1)
     * @returns Promise that resolves when rollback is complete
     *
     * @throws {Error} When any rollback operation fails
     *
     * @example
     *
     * // Rollback last migration
     * await migrationManager.rollback(migrations);
     *
     * // Rollback last 3 migrations
     * await migrationManager.rollback(migrations, 3);
     *
     */
    rollback(migrations: Migration[], steps?: number): Promise<void>;
    /**
     * Gets the execution status of all migrations.
     * Shows which migrations have been executed and their batch numbers.
     *
     * @param migrations - Array of migration instances to check
     * @returns Promise resolving to array of migration status objects
     *
     * @example
     *
     * const status = await migrationManager.status(migrations);
     * status.forEach(({ name, executed, batch }) => {
     *   console.log(`${name}: ${executed ? `Executed (batch ${batch})` : 'Pending'}`);
     * });
     *
     */
    status(migrations: Migration[]): Promise<{
        name: string;
        executed: boolean;
        batch?: number;
    }[]>;
    /**
     * Rolls back all executed migrations.
     * Executes all migrations' `down()` methods in reverse order.
     *
     * @param migrations - Array of all available migrations
     * @returns Promise that resolves when all migrations are rolled back
     *
     * @example
     *
     * await migrationManager.reset(migrations);
     * console.log('All migrations have been rolled back');
     *
     */
    reset(migrations: Migration[]): Promise<void>;
    /**
     * Resets all migrations and then re-runs them.
     * Equivalent to calling `reset()` followed by `migrate()`.
     *
     * @param migrations - Array of migration instances
     * @returns Promise that resolves when refresh is complete
     *
     * @example
     *
     * await migrationManager.refresh(migrations);
     * console.log('Database refreshed with latest migrations');
     *
     */
    refresh(migrations: Migration[]): Promise<void>;
    /**
     * Ensures the migrations tracking table exists.
     * Creates the table with appropriate schema for tracking migration execution.
     * Uses composite primary key for ScyllaDB compatibility.
     *
     * @private
     * @returns Promise that resolves when table is ensured to exist
     */
    private ensureMigrationsTable;
    /**
     * Retrieves list of executed migration names.
     *
     * @private
     * @returns Promise resolving to array of migration names
     */
    private getExecutedMigrations;
    /**
     * Retrieves executed migrations with their batch information.
     *
     * @private
     * @returns Promise resolving to array of migration objects with batch info
     */
    private getExecutedMigrationsWithBatch;
    /**
     * Records a migration as executed in the migrations table.
     * Assigns the migration to the next available batch number.
     *
     * @private
     * @param migration - Migration instance to record
     * @returns Promise that resolves when migration is recorded
     */
    private recordMigration;
    /**
     * Removes a migration record from the migrations table.
     * Used during rollback operations.
     *
     * @private
     * @param migration - Migration instance to remove
     * @returns Promise that resolves when record is removed
     */
    private removeMigrationRecord;
}
//# sourceMappingURL=MigrationManager.d.ts.map