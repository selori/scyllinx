import type { InferAttributes, Model } from "../model/Model"
import { QueryBuilder } from "../query/QueryBuilder"

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
export abstract class Relationship<T extends Model<any> = Model<any>, R extends Model<any> = Model<any>> {
  protected parent: T
  protected relatedCtor: new () => R
  protected foreignKey: string
  protected localKey: string

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
  constructor(parent: T, relatedCtor: new () => R, foreignKey: string, localKey: string) {
    this.parent = parent
    this.relatedCtor = relatedCtor
    this.foreignKey = foreignKey
    this.localKey = localKey
  }

  /**
   * Creates a new instance of the related model.
   *
   * @protected
   * @returns New instance of the related model
   */
  protected related(): R {
    return new this.relatedCtor()
  }

  /**
   * Creates a new query builder for the related model.
   * Sets up the query with the correct table and model binding.
   *
   * @protected
   * @returns QueryBuilder instance for the related model
   */
  protected getQuery(): QueryBuilder<R, InferAttributes<R>> {
    const instance = this.related()
    return new QueryBuilder(instance.getTable(), instance.getConnection()).setModel(this.relatedCtor)
  }

  /**
   * Adds relationship-specific constraints to the query.
   * Must be implemented by each relationship type to define how models are related.
   *
   * @abstract
   * @param query - Query builder to add constraints to
   * @returns Modified query builder with relationship constraints
   *
   * @example
   * 
   * // In HasMany relationship
   * addConstraints(query: QueryBuilder<R, InferAttributes<R>>) {
   *   return query.where(this.foreignKey, this.getParentKey());
   * }
   * 
   */
  public abstract addConstraints(query: QueryBuilder<R, InferAttributes<R>>): QueryBuilder<R, InferAttributes<R>>

  /**
   * Gets the results of the relationship query.
   * Must be implemented by each relationship type to return appropriate result format.
   *
   * @abstract
   * @returns Promise resolving to relationship results (single model, array, or null)
   *
   * @example
   * 
   * // In HasOne relationship
   * async getResults(): Promise<R | null> {
   *   return await this.first();
   * }
   *
   * // In HasMany relationship
   * async getResults(): Promise<R[]> {
   *   return await this.get();
   * }
   * 
   */
  public abstract getResults(): Promise<R | R[] | null>

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
  public async get(): Promise<R[]> {
    const query = this.getQuery()
    this.addConstraints(query).allowFiltering()
    return await query.get()
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
  public async first(): Promise<R | null> {
    const query = this.getQuery()
    this.addConstraints(query)
    return await query.first()
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
  public where(column: string, operator?: any, value?: any): QueryBuilder<R, InferAttributes<R>> {
    const query = this.getQuery()
    this.addConstraints(query)
    return query.where(column, operator, value)
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
  public with(...relations: string[]): QueryBuilder<R, InferAttributes<R>> {
    const query = this.getQuery()
    this.addConstraints(query).allowFiltering()
    return query.with(...relations)
  }

  /**
   * Gets the parent model's key value for the relationship.
   * Used to build relationship constraints.
   *
   * @protected
   * @returns The parent model's local key value
   */
  protected getParentKey(): any {
    return (this.parent as any).getAttribute(this.localKey)
  }

  /**
   * Gets the foreign key column name.
   *
   * @returns Foreign key column name
   */
  public getForeignKeyName(): string {
    return this.foreignKey
  }

  /**
   * Gets the local key column name.
   *
   * @returns Local key column name
   */
  public getLocalKeyName(): string {
    return this.localKey
  }
}
