"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relationship = void 0;
const QueryBuilder_1 = require("../query/QueryBuilder");
/**
 * Abstract base class for all relationship types in the ORM.
 * Provides common functionality for defining and querying relationships between models.
 * All specific relationship types (HasOne, HasMany, BelongsTo, etc.) extend this class.
 *
 * @template T - The parent model type
 * @template R - The related model type
 *
 * @abstract
 *
 * @example
 *
 * // This is typically used internally by specific relationship classes
 * class CustomRelationship extends Relationship<User, Post> {
 *   addConstraints(query: QueryBuilder<Post, any>) {
 *     return query.where('user_id', this.getParentKey());
 *   }
 *
 *   async getResults() {
 *     return await this.get();
 *   }
 * }
 *
 */
class Relationship {
    /**
     * Creates a new relationship instance.
     *
     * @param parent - The parent model instance
     * @param relatedCtor - Constructor function for the related model
     * @param foreignKey - Foreign key column name
     * @param localKey - Local key column name (usually primary key)
     *
     * @example
     *
     * // Typically called by specific relationship constructors
     * super(user, Post, 'user_id', 'id');
     *
     */
    constructor(parent, relatedCtor, foreignKey, localKey) {
        this.parent = parent;
        this.relatedCtor = relatedCtor;
        this.foreignKey = foreignKey;
        this.localKey = localKey;
    }
    /**
     * Creates a new instance of the related model.
     *
     * @protected
     * @returns New instance of the related model
     */
    related() {
        return new this.relatedCtor();
    }
    /**
     * Creates a new query builder for the related model.
     * Sets up the query with the correct table and model binding.
     *
     * @protected
     * @returns QueryBuilder instance for the related model
     */
    getQuery() {
        const instance = this.related();
        return new QueryBuilder_1.QueryBuilder(instance.getTable(), instance.getConnection()).setModel(this.relatedCtor);
    }
    /**
     * Executes the relationship query and returns all matching records.
     * Applies relationship constraints and enables filtering for ScyllaDB compatibility.
     *
     * @returns Promise resolving to array of related models
     *
     * @example
     *
     * const posts = await user.postsRelation().get();
     *
     */
    async get() {
        const query = this.getQuery();
        this.addConstraints(query).allowFiltering();
        return await query.get();
    }
    /**
     * Executes the relationship query and returns the first matching record.
     *
     * @returns Promise resolving to first related model or null
     *
     * @example
     *
     * const profile = await user.profileRelation().first();
     *
     */
    async first() {
        const query = this.getQuery();
        this.addConstraints(query);
        return await query.first();
    }
    /**
     * Adds a WHERE clause to the relationship query.
     * Allows for additional filtering beyond the basic relationship constraints.
     *
     * @param column - Column name to filter on
     * @param operator - Comparison operator (optional)
     * @param value - Value to compare against
     * @returns QueryBuilder instance with added constraints
     *
     * @example
     *
     * const activePosts = await user.postsRelation()
     *   .where('status', 'published')
     *   .get();
     *
     */
    where(column, operator, value) {
        const query = this.getQuery();
        this.addConstraints(query);
        return query.where(column, operator, value);
    }
    /**
     * Specifies relationships to eager load with the query results.
     * Enables loading nested relationships through the relationship chain.
     *
     * @param relations - Relationship names to eager load
     * @returns QueryBuilder instance with eager loading configured
     *
     * @example
     *
     * const postsWithComments = await user.postsRelation()
     *   .with('comments', 'tags')
     *   .get();
     *
     */
    with(...relations) {
        const query = this.getQuery();
        this.addConstraints(query).allowFiltering();
        return query.with(...relations);
    }
    /**
     * Gets the parent model's key value for the relationship.
     * Used to build relationship constraints.
     *
     * @protected
     * @returns The parent model's local key value
     */
    getParentKey() {
        return this.parent.getAttribute(this.localKey);
    }
    /**
     * Gets the foreign key column name.
     *
     * @returns Foreign key column name
     */
    getForeignKeyName() {
        return this.foreignKey;
    }
    /**
     * Gets the local key column name.
     *
     * @returns Local key column name
     */
    getLocalKeyName() {
        return this.localKey;
    }
}
exports.Relationship = Relationship;
//# sourceMappingURL=Relationship.js.map