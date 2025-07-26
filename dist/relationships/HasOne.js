"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HasOne = void 0;
const Relationship_1 = require("./Relationship");
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
class HasOne extends Relationship_1.Relationship {
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
    addConstraints(query) {
        const parentKey = this.getParentKey();
        if (parentKey !== null && parentKey !== undefined) {
            query.where(this.foreignKey, parentKey);
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
     * const profile = await user.profileRelation().getResults();
     *
     * if (profile) {
     *   console.log(profile.bio);
     * }
     *
     */
    async getResults() {
        return await this.first();
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
    async create(attributes) {
        const instance = new this.relatedCtor();
        instance.setAttribute(this.foreignKey, this.getParentKey());
        instance.fill(attributes);
        await instance.save();
        return instance;
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
    async save(model) {
        ;
        model.setAttribute(this.foreignKey, this.getParentKey());
        await model.save();
        return model;
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
    associate(model) {
        ;
        model.setAttribute(this.foreignKey, this.getParentKey());
        return model;
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
    async dissociate() {
        const related = await this.getResults();
        if (related) {
            ;
            related.setAttribute(this.foreignKey, null);
            await related.save();
        }
    }
}
exports.HasOne = HasOne;
//# sourceMappingURL=HasOne.js.map