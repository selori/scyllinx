import type { Schema } from "@/schema/Schema";
/**
 * Abstract base class for database migrations.
 * Provides structure for creating reversible database schema changes.
 * Each migration should implement both `up()` and `down()` methods to support
 * forward and backward migration operations.
 *
 * @abstract
 *
 * @example
 *
 * export class CreateUsersTable extends Migration {
 *   async up(schema: Schema): Promise<void> {
 *     await schema.createTable('users', (table) => {
 *       table.id();
 *       table.string('name');
 *       table.string('email').unique();
 *       table.timestamps();
 *     });
 *   }
 *
 *   async down(schema: Schema): Promise<void> {
 *     await schema.dropTable('users');
 *   }
 * }
 *
 */
export declare abstract class Migration {
    /**
     * Executes the migration to apply schema changes.
     * This method should contain all the forward migration logic,
     * such as creating tables, adding columns, or creating indexes.
     *
     * @param schema - Schema builder instance for database operations
     * @returns Promise that resolves when migration is complete
     *
     * @example
     *
     * async up(schema: Schema): Promise<void> {
     *   await schema.createTable('posts', (table) => {
     *     table.id();
     *     table.string('title');
     *     table.text('content');
     *     table.integer('user_id');
     *     table.foreign('user_id').references('id').on('users');
     *     table.timestamps();
     *   });
     * }
     *
     */
    abstract up(schema: Schema): Promise<void>;
    /**
     * Reverses the migration to undo schema changes.
     * This method should contain all the rollback logic to undo
     * the changes made in the `up()` method.
     *
     * @param schema - Schema builder instance for database operations
     * @returns Promise that resolves when rollback is complete
     *
     * @example
     *
     * async down(schema: Schema): Promise<void> {
     *   await schema.dropTable('posts');
     * }
     *
     */
    abstract down(schema: Schema): Promise<void>;
    /**
     * Gets the migration class name.
     * Used for tracking which migrations have been executed.
     *
     * @returns The class name of the migration
     *
     * @example
     *
     * const migration = new CreateUsersTable();
     * console.log(migration.getName()); // "CreateUsersTable"
     *
     */
    getName(): string;
    /**
     * Extracts timestamp from migration class name or generates current timestamp.
     * Migration class names should follow the format: YYYY_MM_DD_HHMMSS_MigrationName
     * If no timestamp is found in the class name, returns current timestamp.
     *
     * @returns Timestamp string in format YYYYMMDDHHMMSS
     *
     * @example
     *
     * // For class name "2024_01_15_143022_CreateUsersTable"
     * const migration = new CreateUsersTable();
     * console.log(migration.getTimestamp()); // "2024_01_15_143022"
     *
     * // For class name without timestamp
     * console.log(migration.getTimestamp()); // Current timestamp
     *
     */
    getTimestamp(): string;
}
//# sourceMappingURL=Migration.d.ts.map