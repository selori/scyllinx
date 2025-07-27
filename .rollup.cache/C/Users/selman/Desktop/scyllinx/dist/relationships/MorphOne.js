import { Relationship } from "./Relationship";
/**
 * Represents a polymorphic one-to-one relationship.
 * Allows a model to belong to multiple other model types through a single association.
 * Uses morph type and morph ID columns to identify the parent model type and ID.
 *
 * @template T - The parent model type
 * @template R - The related model type
 *
 * @example
 *
 * // In User model
 * imageRelation(): MorphOne<User, Image> {
 *   return new MorphOne(this, Image, 'imageable_type', 'imageable_id', 'id');
 * }
 *
 * // In Post model
 * imageRelation(): MorphOne<Post, Image> {
 *   return new MorphOne(this, Image, 'imageable_type', 'imageable_id', 'id');
 * }
 *
 * // Usage
 * const user = await User.find(1);
 * const image = await user.imageRelation().getResults();
 *
 * // Create polymorphic relationship
 * const newImage = await user.imageRelation().create({
 *   url: 'avatar.jpg',
 *   alt_text: 'User avatar'
 * });
 *
 */
export class MorphOne extends Relationship {
    morphType;
    morphId;
    /**
     * Creates a new MorphOne relationship instance.
     *
     * @param parent - Parent model instance
     * @param related - Related model constructor
     * @param morphType - Column name storing the parent model type
     * @param morphId - Column name storing the parent model ID
     * @param localKey - Local key on parent model (usually primary key)
     *
     * @example
     *
     * // Image belongs to User or Post polymorphically
     * new MorphOne(
     *   this,              // User instance
     *   Image,             // Image constructor
     *   'imageable_type',  // stores 'user' or 'post'
     *   'imageable_id',    // stores the ID
     *   'id'               // parent's primary key
     * );
     *
     */
    constructor(parent, related, morphType, morphId, localKey) {
        super(parent, related, morphId, localKey);
        this.morphType = morphType;
        this.morphId = morphId;
    }
    /**
     * Adds constraints to the relationship query.
     * Filters by both the morph type (parent model class name) and morph ID.
     *
     * @param query - Query builder to add constraints to
     * @returns Modified query builder with polymorphic constraints
     *
     * @example
     *
     * // For User morphOne Image relationship
     * // Adds: WHERE imageable_type = 'user' AND imageable_id = ?
     *
     */
    addConstraints(query) {
        const parentKey = this.getParentKey();
        const morphType = this.parent.constructor.name.toLowerCase();
        if (parentKey !== null && parentKey !== undefined) {
            query.where(this.morphId, parentKey).where(this.morphType, morphType);
        }
        return query;
    }
    /**
     * Gets the relationship results.
     * Returns a single related model instance or null if none exists.
     *
     * @returns Promise resolving to related model or null
     *
     * @example
     *
     * const user = await User.find(1);
     * const image = await user.imageRelation().getResults();
     *
     * if (image) {
     *   console.log(`User avatar: ${image.url}`);
     * }
     *
     */
    async getResults() {
        return await this.first();
    }
    /**
     * Creates a new related model with polymorphic association.
     * Sets both the morph type and morph ID to link to the parent.
     *
     * @param attributes - Attributes for the new related model
     * @returns Promise resolving to the created model
     *
     * @example
     *
     * const user = await User.find(1);
     * const image = await user.imageRelation().create({
     *   url: 'profile-pic.jpg',
     *   alt_text: 'User profile picture',
     *   size: 'large'
     * });
     *
     * console.log(image.imageable_type); // 'user'
     * console.log(image.imageable_id);   // user.id
     *
     */
    async create(attributes) {
        const instance = new this.relatedCtor();
        const morphType = this.parent.constructor.name.toLowerCase();
        instance.setAttribute(this.morphType, morphType);
        instance.setAttribute(this.morphId, this.getParentKey());
        instance.fill(attributes);
        await instance.save();
        return instance;
    }
    /**
     * Saves an existing related model with polymorphic association.
     * Updates the morph type and morph ID to link to the parent.
     *
     * @param model - Related model instance to save
     * @returns Promise resolving to the saved model
     *
     * @example
     *
     * const user = await User.find(1);
     * const image = new Image();
     * image.url = 'new-avatar.jpg';
     *
     * await user.imageRelation().save(image);
     * console.log(image.imageable_type); // 'user'
     * console.log(image.imageable_id);   // user.id
     *
     */
    async save(model) {
        const morphType = this.parent.constructor.name.toLowerCase();
        model.setAttribute(this.morphType, morphType);
        model.setAttribute(this.morphId, this.getParentKey());
        await model.save();
        return model;
    }
}
//# sourceMappingURL=MorphOne.js.map