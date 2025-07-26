import type { ModelFactory } from "./ModelFactory";
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
export declare abstract class Seeder {
    /** Underlying database connection */
    protected connection: import("..").Connection;
    /**
     * Perform the seeding operations.
     * Must be implemented by subclasses.
     *
     * @returns Promise that resolves when seeding is complete.
     */
    abstract run(): Promise<void>;
    /**
     * Invoke another seeder from within this seeder.
     *
     * @param SeederClass - The seeder class to call.
     * @example
     * // Within a seeder:
     * await this.call(OtherSeeder)
     */
    protected call(SeederClass: new () => Seeder): Promise<void>;
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
    protected factory<TFactory extends ModelFactory<any, any>>(factory: () => TFactory): TFactory;
    /**
     * Truncate (empty) the given table.
     *
     * @param tableName - Name of the table to truncate.
     * @returns Promise that resolves when truncation is complete.
     * @example
     * // Clear the comments table:
     * await this.truncate("comments")
     */
    protected truncate(tableName: string): Promise<void>;
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
export declare class SeederRunner {
    /** Internal list of registered seeder classes */
    private static seeders;
    /**
     * Register a seeder class to be run later.
     *
     * @param seederClass - Seeder class constructor.
     */
    static register(seederClass: new () => Seeder): void;
    /**
     * Run all registered seeders, or a provided list.
     *
     * @param seeders - Optional array of seeder classes to run instead of all registered.
     * @returns Promise that resolves when all runs complete.
     */
    static run(seeders?: (new () => Seeder)[]): Promise<void>;
    /**
     * Run a single seeder class.
     *
     * @param seederClass - The seeder class to execute.
     * @returns Promise that resolves when the run completes.
     */
    static runOne(seederClass: new () => Seeder): Promise<void>;
}
//# sourceMappingURL=Seeder.d.ts.map