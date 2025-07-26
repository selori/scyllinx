"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HasMany = void 0;
const Relationship_1 = require("./Relationship");
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
class HasMany extends Relationship_1.Relationship {
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
    addConstraints(query) {
        const parentKey = this.getParentKey();
        if (parentKey !== null && parentKey !== undefined) {
            query.where(this.foreignKey, parentKey);
        }
        return query;
    }
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
    async getResults() {
        return await this.get();
    }
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
    async create(attributes) {
        const instance = new this.relatedCtor();
        instance.setAttribute(this.foreignKey, this.getParentKey());
        instance.fill(attributes);
        await instance.save();
        return instance;
    }
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
    async createMany(records) {
        const instances = [];
        for (const attributes of records) {
            const instance = await this.create(attributes);
            instances.push(instance);
        }
        return instances;
    }
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
    async save(model) {
        ;
        model.setAttribute(this.foreignKey, this.getParentKey());
        await model.save();
        return model;
    }
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
    async saveMany(models) {
        for (const model of models) {
            await this.save(model);
        }
        return models;
    }
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
    async find(id) {
        const query = this.getQuery();
        this.addConstraints(query);
        return await query.find(id);
    }
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
    async update(attributes) {
        const query = this.getQuery();
        this.addConstraints(query);
        return await query.update(attributes);
    }
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
    async delete() {
        const query = this.getQuery();
        this.addConstraints(query);
        return await query.delete();
    }
}
exports.HasMany = HasMany;
//# sourceMappingURL=HasMany.js.map