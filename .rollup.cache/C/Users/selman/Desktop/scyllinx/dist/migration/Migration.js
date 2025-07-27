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
export class Migration {
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
    getName() {
        return this.constructor.name;
    }
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
    getTimestamp() {
        const match = this.constructor.name.match(/^(\d{4}_\d{2}_\d{2}_\d{6})/);
        return match
            ? match[1]
            : new Date()
                .toISOString()
                .replace(/[-:T.]/g, "")
                .slice(0, 15);
    }
}
//# sourceMappingURL=Migration.js.map