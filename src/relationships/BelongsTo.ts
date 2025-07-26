import type { InferAttributes, Model } from "@/model/Model"
import type { QueryBuilder } from "@/query/QueryBuilder"
import { Relationship } from "./Relationship"

/**
 * Represents an inverse one-to-one or one-to-many relationship.
 * The foreign key is stored on the parent model's table, pointing to the related model.
 * This is the "inverse" side of HasOne and HasMany relationships.
 *
 * @template T - The parent model type (the one with the foreign key)
 * @template R - The related model type (the one being referenced)
 *
 * @example
 * 
 * // In Post model
 * userRelation(): BelongsTo<Post, User> {
 *   return new BelongsTo(this, User, 'user_id', 'id');
 * }
 *
 * // Usage
 * const post = await Post.find(1);
 * const user = await post.userRelation().getResults();
 *
 * // Associate with different user
 * const newUser = await User.find(2);
 * post.userRelation().associate(newUser);
 * await post.save();
 * 
 */
export class BelongsTo<T extends Model<any>, R extends Model<any>> extends Relationship<T, R> {
  /**
   * Adds constraints to the relationship query.
   * Filters the related model by its local key matching the parent's foreign key value.
   *
   * @param query - Query builder to add constraints to
   * @returns Modified query builder with relationship constraints
   *
   * @example
   * 
   * // For Post belongsTo User relationship
   * // Adds: WHERE users.id = ? (where ? is post.user_id)
   * 
   */
  public addConstraints(query: QueryBuilder<R, InferAttributes<R>>): QueryBuilder<R, InferAttributes<R>> {
    const foreignKey = this.getParentKey()
    if (foreignKey !== null && foreignKey !== undefined) {
      query.where(this.localKey, foreignKey)
    }
    return query
  }

  /**
   * Gets the relationship results.
   * Returns a single related model instance or null if none exists.
   *
   * @returns Promise resolving to related model or null
   *
   * @example
   * 
   * const post = await Post.find(1);
   * const user = await post.userRelation().getResults();
   *
   * if (user) {
   *   console.log(`Post author: ${user.name}`);
   * }
   * 
   */
  public async getResults(): Promise<R | null> {
    return await this.first()
  }

  /**
   * Associates the parent model with a related model.
   * Sets the foreign key on the parent to point to the related model.
   * Does not save the parent model - you must call save() separately.
   *
   * @param model - Related model to associate with
   * @returns The parent model for method chaining
   *
   * @example
   * 
   * const post = await Post.find(1);
   * const user = await User.find(2);
   *
   * post.userRelation().associate(user);
   * await post.save(); // Don't forget to save!
   *
   * console.log(post.user_id); // Will be set to user.id
   * 
   */
  public associate(model: R): T {
    const parentKey = (model as any).getAttribute(this.localKey)
    ;(this.parent as any).setAttribute(this.foreignKey, parentKey)
    return this.parent
  }

  /**
   * Dissociates the parent model from its related model.
   * Sets the foreign key on the parent to null.
   * Does not save the parent model - you must call save() separately.
   *
   * @returns The parent model for method chaining
   *
   * @example
   * 
   * const post = await Post.find(1);
   *
   * post.userRelation().dissociate();
   * await post.save(); // Don't forget to save!
   *
   * console.log(post.user_id); // Will be null
   *
   * // Verify dissociation
   * const user = await post.userRelation().getResults();
   * console.log(user); // null
   * 
   */
  public dissociate(): T {
    ;(this.parent as any).setAttribute(this.foreignKey, null)
    return this.parent
  }

  /**
   * Gets the foreign key value from the parent model.
   * Overridden for BelongsTo since the foreign key is on the parent.
   *
   * @protected
   * @returns The foreign key value from the parent model
   */
  protected getParentKey(): any {
    return (this.parent as any).getAttribute(this.foreignKey)
  }
}
