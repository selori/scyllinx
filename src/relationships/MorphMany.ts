import type { InferAttributes, Model } from "@/model/Model"
import type { QueryBuilder } from "@/query/QueryBuilder"
import { Relationship } from "./Relationship"

/**
 * Represents a polymorphic one-to-many relationship.
 * Allows a model to have multiple related models that can belong to different parent types.
 * Uses morph type and morph ID columns to identify the parent model type and ID.
 *
 * @template T - The parent model type
 * @template R - The related model type
 *
 * @example
 * 
 * // In User model
 * commentsRelation(): MorphMany<User, Comment> {
 *   return new MorphMany(this, Comment, 'commentable_type', 'commentable_id', 'id');
 * }
 *
 * // In Post model
 * commentsRelation(): MorphMany<Post, Comment> {
 *   return new MorphMany(this, Comment, 'commentable_type', 'commentable_id', 'id');
 * }
 *
 * // Usage
 * const post = await Post.find(1);
 * const comments = await post.commentsRelation().getResults();
 *
 * // Create multiple comments
 * const newComments = await post.commentsRelation().createMany([
 *   { content: 'Great post!' },
 *   { content: 'Thanks for sharing!' }
 * ]);
 * 
 */
export class MorphMany<T extends Model<any>, R extends Model<any>> extends Relationship<T, R> {
  protected morphType: string
  protected morphId: string

  /**
   * Creates a new MorphMany relationship instance.
   *
   * @param parent - Parent model instance
   * @param related - Related model constructor
   * @param morphType - Column name storing the parent model type
   * @param morphId - Column name storing the parent model ID
   * @param localKey - Local key on parent model (usually primary key)
   *
   * @example
   * 
   * // Comments belong to User or Post polymorphically
   * new MorphMany(
   *   this,               // Post instance
   *   Comment,            // Comment constructor
   *   'commentable_type', // stores 'user' or 'post'
   *   'commentable_id',   // stores the ID
   *   'id'                // parent's primary key
   * );
   * 
   */
  constructor(parent: T, related: new () => R, morphType: string, morphId: string, localKey: string) {
    super(parent, related, morphId, localKey)
    this.morphType = morphType
    this.morphId = morphId
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
   * // For Post morphMany Comments relationship
   * // Adds: WHERE commentable_type = 'post' AND commentable_id = ?
   * 
   */
  public addConstraints(query: QueryBuilder<R, InferAttributes<R>>): QueryBuilder<R, InferAttributes<R>> {
    const parentKey = this.getParentKey()
    const morphType = this.parent.constructor.name.toLowerCase()

    if (parentKey !== null && parentKey !== undefined) {
      query.where(this.morphId, parentKey).where(this.morphType, morphType)
    }

    return query
  }

  /**
   * Gets the relationship results.
   * Returns an array of all related model instances.
   *
   * @returns Promise resolving to array of related models
   *
   * @example
   * 
   * const post = await Post.find(1);
   * const comments = await post.commentsRelation().getResults();
   *
   * comments.forEach(comment => {
   *   console.log(`Comment: ${comment.content}`);
   * });
   * 
   */
  public async getResults(): Promise<R[]> {
    return await this.get()
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
   * const post = await Post.find(1);
   * const comment = await post.commentsRelation().create({
   *   content: 'This is a great post!',
   *   author_name: 'John Doe',
   *   author_email: 'john@example.com'
   * });
   *
   * console.log(comment.commentable_type); // 'post'
   * console.log(comment.commentable_id);   // post.id
   * 
   */
  public async create(attributes: Record<string, any>): Promise<R> {
    const instance = new this.relatedCtor()
    const morphType = this.parent.constructor.name.toLowerCase()
    ;(instance as any).setAttribute(this.morphType, morphType)
    ;(instance as any).setAttribute(this.morphId, this.getParentKey())
    ;(instance as any).fill(attributes)

    await (instance as any).save()
    return instance
  }

  /**
   * Creates multiple related models in a batch operation.
   * Each model will be associated with the parent via polymorphic keys.
   *
   * @param records - Array of attribute objects for the new models
   * @returns Promise resolving to array of created models
   *
   * @example
   * 
   * const post = await Post.find(1);
   * const comments = await post.commentsRelation().createMany([
   *   { content: 'First comment', author_name: 'Alice' },
   *   { content: 'Second comment', author_name: 'Bob' },
   *   { content: 'Third comment', author_name: 'Charlie' }
   * ]);
   *
   * console.log(`Created ${comments.length} comments`);
   * 
   */
  public async createMany(records: Record<string, any>[]): Promise<R[]> {
    const instances: R[] = []

    for (const attributes of records) {
      const instance = await this.create(attributes)
      instances.push(instance)
    }

    return instances
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
   * const post = await Post.find(1);
   * const comment = new Comment();
   * comment.content = 'New comment content';
   *
   * await post.commentsRelation().save(comment);
   * console.log(comment.commentable_type); // 'post'
   * console.log(comment.commentable_id);   // post.id
   * 
   */
  public async save(model: R): Promise<R> {
    const morphType = this.parent.constructor.name.toLowerCase()
    ;(model as any).setAttribute(this.morphType, morphType)
    ;(model as any).setAttribute(this.morphId, this.getParentKey())

    await (model as any).save()
    return model
  }

  /**
   * Saves multiple existing models with polymorphic association.
   *
   * @param models - Array of related model instances to save
   * @returns Promise resolving to array of saved models
   *
   * @example
   * 
   * const post = await Post.find(1);
   * const comments = [comment1, comment2, comment3];
   *
   * await post.commentsRelation().saveMany(comments);
   * // All comments will have their polymorphic keys set to post
   * 
   */
  public async saveMany(models: R[]): Promise<R[]> {
    for (const model of models) {
      await this.save(model)
    }
    return models
  }
}
