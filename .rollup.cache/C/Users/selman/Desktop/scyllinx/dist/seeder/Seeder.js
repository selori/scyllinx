import { ConnectionManager } from "@/connection/ConnectionManager";
/**
 * Base class for database seeders.
 * Extend this class and implement the `run()` method to insert or manipulate data.
 *
 * @example
 * // Example seeder:
 * import { Seeder } from "@/seeders/Seeder"
 * import { User } from "@/models/User"
 *
 * export class UserSeeder extends Seeder {
 *   async run() {
 *     // Clear existing records
 *     await this.truncate("users")
 *
 *     // Insert new records via factory
 *     const users = this.factory(() => User.factory()).makeMany(10)
 *     for (const user of users) {
 *       await user.save()
 *     }
 *   }
 * }
 *
 * // Register and run:
 * SeederRunner.register(UserSeeder)
 * await SeederRunner.run()
 */
export class Seeder {
    /** Underlying database connection */
    connection = ConnectionManager.getInstance().getConnection();
    /**
     * Invoke another seeder from within this seeder.
     *
     * @param SeederClass - The seeder class to call.
     * @example
     * // Within a seeder:
     * await this.call(OtherSeeder)
     */
    async call(SeederClass) {
        const instance = new SeederClass();
        await instance.run();
    }
    /**
     * Access a model factory for generating test data.
     *
     * @template TFactory - A subclass of ModelFactory
     * @param factory - A function returning the factory instance
     * @returns The factory instance
     * @example
     * // Get the Post factory:
     * const postFactory = this.factory(() => Post.factory())
     * const posts = postFactory.makeMany(5)
     */
    factory(factory) {
        return factory();
    }
    /**
     * Truncate (empty) the given table.
     *
     * @param tableName - Name of the table to truncate.
     * @returns Promise that resolves when truncation is complete.
     * @example
     * // Clear the comments table:
     * await this.truncate("comments")
     */
    async truncate(tableName) {
        await this.connection.query(`TRUNCATE ${tableName}`);
    }
}
/**
 * Manages and runs registered seeders.
 *
 * @example
 * import { SeederRunner } from "@/seeders/Seeder"
 * import { UserSeeder } from "@/seeders/UserSeeder"
 *
 * // Register multiple:
 * SeederRunner.register(UserSeeder)
 *
 * // Run all:
 * await SeederRunner.run()
 *
 * // Or run a single:
 * await SeederRunner.runOne(UserSeeder)
 */
export class SeederRunner {
    /** Internal list of registered seeder classes */
    static seeders = [];
    /**
     * Register a seeder class to be run later.
     *
     * @param seederClass - Seeder class constructor.
     */
    static register(seederClass) {
        this.seeders.push(seederClass);
    }
    /**
     * Run all registered seeders, or a provided list.
     *
     * @param seeders - Optional array of seeder classes to run instead of all registered.
     * @returns Promise that resolves when all runs complete.
     */
    static async run(seeders) {
        const toRun = seeders ?? this.seeders;
        for (const SeederClass of toRun) {
            console.log(`Seeding: ${SeederClass.name}`);
            const seeder = new SeederClass();
            await seeder.run();
            console.log(`Seeded: ${SeederClass.name}`);
        }
    }
    /**
     * Run a single seeder class.
     *
     * @param seederClass - The seeder class to execute.
     * @returns Promise that resolves when the run completes.
     */
    static async runOne(seederClass) {
        console.log(`Seeding: ${seederClass.name}`);
        const seeder = new seederClass();
        await seeder.run();
        console.log(`Seeded: ${seederClass.name}`);
    }
}
//# sourceMappingURL=Seeder.js.map