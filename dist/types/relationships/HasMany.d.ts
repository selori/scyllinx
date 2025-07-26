import type { InferAttributes, Model } from "@/model/Model";
import type { QueryBuilder } from "@/query/QueryBuilder";
import { Relationship } from "./Relationship";
/**
 * Represents a one-to-many relationship where the parent model has multiple related models.
 * The foreign key is stored on the related model's table.
 *
 * @template T - The parent model type
 * @template R - The related model type
 *
 * @example
 *
 * // In User model
 * postsRelation(): HasMany<User, Post> {
 *   return new HasMany(this, Post, 'user_id', 'id');
 * }
 *
 * // Usage
 * const user = await User.find(1);
 * const posts = await user.postsRelation().getResults();
 *
 * // Create multiple related models
 * const newPosts = await user.postsRelation().createMany([
 *   { title: 'First Post', content: '...' },
 *   { title: 'Second Post', content: '...' }
 * ]);
 *
 */
export declare class HasMany<T extends Model<any>, R extends Model<any>> extends Relationship<T, R> {
    /**
     * Adds constraints to the relationship query.
     * Filters the related models by the foreign key matching the parent's local key.
     *
     * @param query - Query builder to add constraints to
     * @returns Modified query builder with relationship constraints
     *
     * @example
     *
     * // For User hasMany Posts relationship
     * // Adds: WHERE posts.user_id = ?
     *
     */
    addConstraints(query: QueryBuilder<R, InferAttributes<R>>): QueryBuilder<R, InferAttributes<R>>;
    /**
     * Gets the relationship results.
     * Returns an array of all related model instances.
     *
     * @returns Promise resolving to array of related models
     *
     * @example
     *
     * const user = await User.find(1);
     * const posts = await user.postsRelation().getResults();
     *
     * posts.forEach(post => {
     *   console.log(post.title);
     * });
     *
     */
    getResults(): Promise<R[]>;
    /**
     * Creates a new related model and associates it with the parent.
     * Sets the foreign key on the new model to link it to the parent.
     *
     * @param attributes - Attributes for the new related model
     * @returns Promise resolving to the created model
     *
     * @example
     *
     * const user = await User.find(1);
     * const post = await user.postsRelation().create({
     *   title: 'My New Post',
     *   content: 'This is the content of my post...',
     *   status: 'published'
     * });
     *
     * console.log(post.user_id); // Will be set to user.id
     *
     */
    create(attributes: Record<string, any>): Promise<R>;
    /**
     * Creates multiple related models in a batch operation.
     * Each model will be associated with the parent via the foreign key.
     *
     * @param records - Array of attribute objects for the new models
     * @returns Promise resolving to array of created models
     *
     * @example
     *
     * const user = await User.find(1);
     * const posts = await user.postsRelation().createMany([
     *   { title: 'Post 1', content: 'Content 1' },
     *   { title: 'Post 2', content: 'Content 2' },
     *   { title: 'Post 3', content: 'Content 3' }
     * ]);
     *
     * console.log(`Created ${posts.length} posts`);
     *
     */
    createMany(records: Record<string, any>[]): Promise<R[]>;
    /**
     * Saves an existing related model and associates it with the parent.
     * Updates the foreign key on the model to link it to the parent.
     *
     * @param model - Related model instance to save
     * @returns Promise resolving to the saved model
     *
     * @example
     *
     * const user = await User.find(1);
     * const post = new Post();
     * post.title = 'New Post';
     * post.content = 'Post content';
     *
     * await user.postsRelation().save(post);
     * console.log(post.user_id); // Will be set to user.id
     *
     */
    save(model: R): Promise<R>;
    /**
     * Saves multiple existing models and associates them with the parent.
     *
     * @param models - Array of related model instances to save
     * @returns Promise resolving to array of saved models
     *
     * @example
     *
     * const user = await User.find(1);
     * const posts = [post1, post2, post3];
     *
     * await user.postsRelation().saveMany(posts);
     * // All posts will have their user_id set to user.id
     *
     */
    saveMany(models: R[]): Promise<R[]>;
    /**
     * Finds a related model by its ID.
     * Applies relationship constraints to ensure the model belongs to the parent.
     *
     * @param id - ID of the related model to find
     * @returns Promise resolving to the found model or null
     *
     * @example
     *
     * const user = await User.find(1);
     * const post = await user.postsRelation().find(123);
     *
     * if (post) {
     *   console.log(`Found post: ${post.title}`);
     * }
     *
     */
    find(id: any): Promise<R | null>;
    /**
     * Updates all related models matching the relationship constraints.
     *
     * @param attributes - Attributes to update
     * @returns Promise resolving to number of updated records
     *
     * @example
     *
     * const user = await User.find(1);
     * const updated = await user.postsRelation().update({
     *   status: 'archived'
     * });
     *
     * console.log(`Updated ${updated} posts`);
     *
     */
    update(attributes: Record<string, any>): Promise<number>;
    /**
     * Deletes all related models matching the relationship constraints.
     *
     * @returns Promise resolving to number of deleted records
     *
     * @example
     *
     * const user = await User.find(1);
     * const deleted = await user.postsRelation().delete();
     *
     * console.log(`Deleted ${deleted} posts`);
     *
     */
    delete(): Promise<number>;
}
//# sourceMappingURL=HasMany.d.ts.map