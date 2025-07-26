import type { InferAttributes, Model } from "@/model/Model"
import type { QueryBuilder } from "@/query/QueryBuilder"
import { Relationship } from "./Relationship"

/**
 * Represents a one-to-one relationship where the parent model has one related model.
 * The foreign key is stored on the related model's table.
 *
 * @template T - The parent model type
 * @template R - The related model type
 *
 * @example
 * 
 * // In User model
 * profileRelation(): HasOne<User, Profile> {
 *   return new HasOne(this, Profile, 'user_id', 'id');
 * }
 *
 * // Usage
 * const user = await User.find(1);
 * const profile = await user.profileRelation().getResults();
 *
 * // Create new related model
 * const newProfile = await user.profileRelation().create({
 *   bio: 'Software developer',
 *   avatar: 'avatar.jpg'
 * });
 * 
 */
export class HasOne<T extends Model<any>, R extends Model<any>> extends Relationship<T, R> {
  /**
   * Adds constraints to the relationship query.
   * Filters the related model by the foreign key matching the parent's local key.
   *
   * @param query - Query builder to add constraints to
   * @returns Modified query builder with relationship constraints
   *
   * @example
   * 
   * // For User hasOne Profile relationship
   * // Adds: WHERE profiles.user_id = ?
   * 
   */
  public addConstraints(query: QueryBuilder<R, InferAttributes<R>>): QueryBuilder<R, InferAttributes<R>> {
    const parentKey = this.getParentKey()
    if (parentKey !== null && parentKey !== undefined) {
      query.where(this.foreignKey, parentKey)
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
   * const user = await User.find(1);
   * const profile = await user.profileRelation().getResults();
   *
   * if (profile) {
   *   console.log(profile.bio);
   * }
   * 
   */
  public async getResults(): Promise<R | null> {
    return await this.first()
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
   * const profile = await user.profileRelation().create({
   *   bio: 'Full-stack developer',
   *   website: 'https://example.com',
   *   location: 'San Francisco'
   * });
   *
   * console.log(profile.user_id); // Will be set to user.id
   * 
   */
  public async create(attributes: Record<string, any>): Promise<R> {
    const instance = new this.relatedCtor()
    ;(instance as any).setAttribute(this.foreignKey, this.getParentKey())
    ;(instance as any).fill(attributes)
    await (instance as any).save()
    return instance
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
   * const profile = new Profile();
   * profile.bio = 'New bio';
   *
   * await user.profileRelation().save(profile);
   * console.log(profile.user_id); // Will be set to user.id
   * 
   */
  public async save(model: R): Promise<R> {
    ;(model as any).setAttribute(this.foreignKey, this.getParentKey())
    await (model as any).save()
    return model
  }

  /**
   * Associates an existing model with the parent without saving.
   * Sets the foreign key on the model but doesn't persist the change.
   *
   * @param model - Related model instance to associate
   * @returns The associated model
   *
   * @example
   * 
   * const user = await User.find(1);
   * const profile = await Profile.find(5);
   *
   * user.profileRelation().associate(profile);
   * console.log(profile.user_id); // Will be set to user.id
   *
   * // Remember to save the profile to persist the association
   * await profile.save();
   * 
   */
  public associate(model: R): R {
    ;(model as any).setAttribute(this.foreignKey, this.getParentKey())
    return model
  }

  /**
   * Dissociates the related model from the parent.
   * Sets the foreign key to null and saves the change.
   *
   * @returns Promise that resolves when dissociation is complete
   *
   * @example
   * 
   * const user = await User.find(1);
   * await user.profileRelation().dissociate();
   *
   * // The profile's user_id will be set to null
   * const profile = await user.profileRelation().getResults();
   * console.log(profile); // null
   * 
   */
  public async dissociate(): Promise<void> {
    const related = await this.getResults()
    if (related) {
      ;(related as any).setAttribute(this.foreignKey, null)
      await (related as any).save()
    }
  }
}
