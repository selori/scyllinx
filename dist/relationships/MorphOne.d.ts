import type { InferAttributes, Model } from "@/model/Model";
import type { QueryBuilder } from "@/query/QueryBuilder";
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
export declare class MorphOne<T extends Model<any>, R extends Model<any>> extends Relationship<T, R> {
    protected morphType: string;
    protected morphId: string;
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
    constructor(parent: T, related: new () => R, morphType: string, morphId: string, localKey: string);
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
    addConstraints(query: QueryBuilder<R, InferAttributes<R>>): QueryBuilder<R, InferAttributes<R>>;
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
    getResults(): Promise<R | null>;
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
    create(attributes: Record<string, any>): Promise<R>;
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
    save(model: R): Promise<R>;
}
//# sourceMappingURL=MorphOne.d.ts.map