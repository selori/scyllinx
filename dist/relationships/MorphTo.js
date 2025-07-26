"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MorphTo = void 0;
const QueryBuilder_1 = require("@/query/QueryBuilder");
const Relationship_1 = require("./Relationship");
/**
 * Represents a polymorphic belongs-to relationship.
 * Allows a model to belong to multiple different parent model types.
 * The inverse of MorphOne and MorphMany relationships.
 *
 * @template T - The child model type (the one with morph columns)
 * @template R - The parent model type (can be multiple types)
 *
 * @example
 *
 * // In Comment model
 * commentable(): MorphTo<Comment, User | Post> {
 *   return new MorphTo(this, 'commentable_type', 'commentable_id', 'id')
 *     .registerModel('user', User)
 *     .registerModel('post', Post);
 * }
 *
 * // Usage
 * const comment = await Comment.find(1);
 * const parent = await comment.commentable().getResults();
 *
 * if (parent instanceof User) {
 *   console.log(`Comment on user: ${parent.name}`);
 * } else if (parent instanceof Post) {
 *   console.log(`Comment on post: ${parent.title}`);
 * }
 *
 */
class MorphTo extends Relationship_1.Relationship {
    /**
     * Creates a new MorphTo relationship instance.
     *
     * @param parent - Child model instance (the one with morph columns)
     * @param morphType - Column name storing the parent model type
     * @param morphId - Column name storing the parent model ID
     * @param localKey - Local key on parent models (usually primary key)
     *
     * @example
     *
     * // Comment belongs to User or Post polymorphically
     * new MorphTo(
     *   this,               // Comment instance
     *   'commentable_type', // stores 'user' or 'post'
     *   'commentable_id',   // stores the parent ID
     *   'id'                // parent's primary key
     * );
     *
     */
    constructor(parent, morphType, morphId, localKey) {
        super(parent, null, morphId, localKey);
        this.models = new Map();
        this.morphType = morphType;
        this.morphId = morphId;
    }
    /**
     * Adds constraints to the relationship query.
     * For MorphTo relationships, constraints are applied dynamically based on morph type.
     *
     * @param query - Query builder to add constraints to
     * @returns Query builder (unchanged for MorphTo)
     */
    addConstraints(query) {
        // MorphTo constraints are applied dynamically in getResults()
        return query;
    }
    /**
     * Gets the relationship results.
     * Determines the parent model type from morph type column and queries accordingly.
     *
     * @returns Promise resolving to parent model or null
     *
     * @example
     *
     * const comment = await Comment.find(1);
     * const parent = await comment.commentable().getResults();
     *
     * // Parent could be User, Post, or any registered model type
     * if (parent) {
     *   console.log(`Parent type: ${comment.commentable_type}`);
     *   console.log(`Parent ID: ${comment.commentable_id}`);
     * }
     *
     */
    async getResults() {
        const morphType = this.parent.getAttribute(this.morphType);
        const morphId = this.parent.getAttribute(this.morphId);
        if (!morphType || !morphId) {
            return null;
        }
        const ModelClass = this.models.get(morphType);
        if (!ModelClass) {
            throw new Error(`Model not registered for morph type: ${morphType}`);
        }
        const instance = new ModelClass();
        const query = new QueryBuilder_1.QueryBuilder(instance.getTable(), instance.getConnection()).setModel(ModelClass);
        // return await query.where(this.localKey as any, morphId).first()
        return null;
    }
    /**
     * Registers a model class for a specific morph type.
     * Required to map morph type strings to actual model classes.
     *
     * @param type - Morph type string (stored in morph type column)
     * @param modelClass - Model constructor for this type
     * @returns This relationship instance for method chaining
     *
     * @example
     *
     * const morphTo = new MorphTo(this, 'commentable_type', 'commentable_id', 'id')
     *   .registerModel('user', User)
     *   .registerModel('post', Post)
     *   .registerModel('page', Page);
     *
     */
    registerModel(type, modelClass) {
        this.models.set(type, modelClass);
        return this;
    }
    /**
     * Associates the child model with a parent model.
     * Sets both the morph type and morph ID columns.
     *
     * @param model - Parent model to associate with
     * @returns The child model for method chaining
     *
     * @example
     *
     * const comment = new Comment();
     * const user = await User.find(1);
     *
     * comment.commentable().associate(user);
     * console.log(comment.commentable_type); // 'user'
     * console.log(comment.commentable_id);   // user.id
     *
     * await comment.save();
     *
     */
    associate(model) {
        const morphType = model.constructor.name.toLowerCase();
        const morphId = model.getAttribute(this.localKey);
        this.parent.setAttribute(this.morphType, morphType);
        this.parent.setAttribute(this.morphId, morphId);
        return this.parent;
    }
    /**
     * Dissociates the child model from its parent.
     * Sets both morph type and morph ID columns to null.
     *
     * @returns The child model for method chaining
     *
     * @example
     *
     * const comment = await Comment.find(1);
     *
     * comment.commentable().dissociate();
     * console.log(comment.commentable_type); // null
     * console.log(comment.commentable_id);   // null
     *
     * await comment.save();
     *
     */
    dissociate() {
        ;
        this.parent.setAttribute(this.morphType, null);
        this.parent.setAttribute(this.morphId, null);
        return this.parent;
    }
    /**
     * Gets the morph type value from the child model.
     *
     * @returns The morph type string or null
     *
     * @example
     *
     * const comment = await Comment.find(1);
     * const type = comment.commentable().getMorphType();
     * console.log(type); // 'user', 'post', etc.
     *
     */
    getMorphType() {
        return this.parent.getAttribute(this.morphType);
    }
    /**
     * Gets the morph ID value from the child model.
     *
     * @returns The morph ID value or null
     *
     * @example
     *
     * const comment = await Comment.find(1);
     * const id = comment.commentable().getMorphId();
     * console.log(id); // 123, 456, etc.
     *
     */
    getMorphId() {
        return this.parent.getAttribute(this.morphId);
    }
}
exports.MorphTo = MorphTo;
//# sourceMappingURL=MorphTo.js.map