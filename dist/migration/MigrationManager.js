"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationManager = void 0;
const Schema_1 = require("@/schema/Schema");
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
class MigrationManager {
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
    constructor(connManager) {
        this.migrationsTable = "migrations";
        this.connManager = connManager;
        this.connection = this.connManager.getConnection();
    }
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
    async migrate(migrations) {
        await this.ensureMigrationsTable();
        const executed = await this.getExecutedMigrations();
        const pending = migrations.filter((migration) => !executed.includes(migration.getName()));
        for (const migration of pending) {
            console.log(`Running migration: ${migration.getName()}`);
            try {
                const schema = new Schema_1.Schema(this.connection.getDriver());
                await migration.up(schema);
                await this.recordMigration(migration);
                console.log(`Migrated: ${migration.getName()}`);
            }
            catch (error) {
                console.error(`Migration failed: ${migration.getName()}`, error);
                throw error;
            }
        }
    }
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
    async rollback(migrations, steps = 1) {
        const executed = await this.getExecutedMigrations();
        const toRollback = executed.slice(-steps).reverse();
        for (const migrationName of toRollback) {
            const migration = migrations.find((m) => m.getName() === migrationName);
            if (!migration) {
                console.warn(`Migration not found: ${migrationName}`);
                continue;
            }
            console.log(`Rolling back: ${migrationName}`);
            try {
                const schema = new Schema_1.Schema(this.connection.getDriver());
                await migration.down(schema);
                await this.removeMigrationRecord(migration);
                console.log(`Rolled back: ${migrationName}`);
            }
            catch (error) {
                console.error(`Rollback failed: ${migrationName}`, error);
                throw error;
            }
        }
    }
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
    async status(migrations) {
        await this.ensureMigrationsTable();
        const executed = await this.getExecutedMigrationsWithBatch();
        return migrations.map((migration) => {
            const executedMigration = executed.find((e) => e.migration === migration.getName());
            return {
                name: migration.getName(),
                executed: !!executedMigration,
                batch: executedMigration?.batch,
            };
        });
    }
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
    async reset(migrations) {
        const executed = await this.getExecutedMigrations();
        const toRollback = executed.reverse();
        for (const migrationName of toRollback) {
            const migration = migrations.find((m) => m.getName() === migrationName);
            if (!migration) {
                continue;
            }
            try {
                const schema = new Schema_1.Schema(this.connection.getDriver());
                await migration.down(schema);
                await this.removeMigrationRecord(migration);
            }
            catch (error) {
                console.error(`Reset failed: ${migrationName}`, error);
            }
        }
    }
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
    async refresh(migrations) {
        await this.reset(migrations);
        await this.migrate(migrations);
    }
    /**
     * Ensures the migrations tracking table exists.
     * Creates the table with appropriate schema for tracking migration execution.
     * Uses composite primary key for ScyllaDB compatibility.
     *
     * @private
     * @returns Promise that resolves when table is ensured to exist
     */
    async ensureMigrationsTable() {
        const driver = this.connection.getDriver();
        const grammar = driver.getGrammar();
        await driver.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        batch_number int,
        migration text,
        executed_at timestamp,
        PRIMARY KEY (batch_number, migration)
      )
    `);
    }
    /**
     * Retrieves list of executed migration names.
     *
     * @private
     * @returns Promise resolving to array of migration names
     */
    async getExecutedMigrations() {
        const driver = this.connection.getDriver();
        const grammar = driver.getGrammar();
        const result = await driver.query(`SELECT migration FROM ${grammar.wrapTable(this.migrationsTable)}`);
        return result.rows.map((row) => row.migration);
    }
    /**
     * Retrieves executed migrations with their batch information.
     *
     * @private
     * @returns Promise resolving to array of migration objects with batch info
     */
    async getExecutedMigrationsWithBatch() {
        const driver = this.connection.getDriver();
        const grammar = driver.getGrammar();
        const result = await driver.query(`SELECT migration, batch_number FROM ${grammar.wrapTable(this.migrationsTable)}`);
        return result.rows.map((row) => ({
            migration: row.migration,
            batch: row.batch_number,
        }));
    }
    /**
     * Records a migration as executed in the migrations table.
     * Assigns the migration to the next available batch number.
     *
     * @private
     * @param migration - Migration instance to record
     * @returns Promise that resolves when migration is recorded
     */
    async recordMigration(migration) {
        const driver = this.connection.getDriver();
        const grammar = driver.getGrammar();
        const batchResult = await driver.query(`SELECT MAX(batch_number) as max_batch FROM ${grammar.wrapTable(this.migrationsTable)}`);
        const nextBatch = (batchResult.rows[0]?.max_batch || 0) + 1;
        const insertSql = grammar.compileInsert({
            table: this.migrationsTable,
            values: {
                batch_number: nextBatch,
                migration: migration.getName(),
                executed_at: new Date(),
            },
        });
        await driver.query(insertSql, [nextBatch, migration.getName(), new Date()]);
    }
    /**
     * Removes a migration record from the migrations table.
     * Used during rollback operations.
     *
     * @private
     * @param migration - Migration instance to remove
     * @returns Promise that resolves when record is removed
     */
    async removeMigrationRecord(migration) {
        const driver = this.connection.getDriver();
        const grammar = driver.getGrammar();
        const deleteSql = grammar.compileDelete({
            table: this.migrationsTable,
            wheres: [
                {
                    type: "basic",
                    column: "migration",
                    operator: "=",
                    value: migration.getName(),
                },
            ],
        });
        await driver.query(deleteSql, [migration.getName()]);
    }
}
exports.MigrationManager = MigrationManager;
//# sourceMappingURL=MigrationManager.js.map