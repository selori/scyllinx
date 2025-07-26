import { BelongsTo } from "@/relationships/BelongsTo";
import { BelongsToMany } from "@/relationships/BelongsToMany";
import { HasMany } from "@/relationships/HasMany";
import { HasOne } from "@/relationships/HasOne";
import { MorphMany } from "@/relationships/MorphMany";
import { MorphOne } from "@/relationships/MorphOne";
import { MorphTo } from "@/relationships/MorphTo";
import { QueryBuilder } from "../query/QueryBuilder";
import util from "util";
/**
 * Type helper to infer model attributes from Model class.
 *
 * @template T - The Model class type
 */
export type InferAttributes<T> = T extends Model<infer A> ? A : never;
/**
 * Base Model class implementing Active Record pattern for ScyllinX ORM.
 * Provides CRUD operations, relationships, attribute management, and ScyllaDB-specific features.
 *
 * @template TAttrs - Type definition for model attributes
 *
 * @example
 *
 * interface UserAttributes {
 *   id: string;
 *   name: string;
 *   email: string;
 *   created_at?: Date;
 *   updated_at?: Date;
 * }
 *
 * class User extends Model<UserAttributes> {
 *   protected static table = 'users';
 *   protected static primaryKey = 'id';
 *   protected static fillable = ['name', 'email'];
 *
 *   // Define relationships
 *   posts() {
 *     return this.hasMany(Post);
 *   }
 *
 *   profile() {
 *     return this.hasOne(Profile);
 *   }
 * }
 *
 * // Usage
 * const user = await User.create({ name: 'John', email: 'john@example.com' });
 * const posts = await user.posts().get();
 *
 */
export declare class Model<TAttrs extends Record<string, any>> {
    /** The database table name for this model */
    protected static table: string;
    /** The primary key column name */
    protected static primaryKey: string;
    /** ScyllaDB keyspace name (optional) */
    protected static keyspace?: string;
    /** ScyllaDB partition key columns */
    protected static partitionKeys: string[];
    /** ScyllaDB clustering key columns */
    protected static clusteringKeys: string[];
    /** Database connection name to use */
    protected static connection?: string;
    /** Attributes that are mass assignable */
    protected static fillable: string[];
    /** Attributes that are not mass assignable */
    protected static guarded: string[];
    /** Attributes that should be hidden from serialization */
    protected static hidden: string[];
    /** Attributes that should be visible in serialization */
    protected static visible: string[];
    /** Attribute casting definitions */
    protected static casts: Record<string, string>;
    /** Date attribute names */
    protected static dates: string[];
    /** Whether to automatically manage timestamps */
    protected static timestamps: boolean;
    /** Whether to use soft deletes */
    static softDeletes: boolean;
    /** Query scopes defined on this model */
    protected static scopes: Record<string, Function>;
    /** Current attribute values */
    protected attributes: Partial<TAttrs>;
    /** Original attribute values from database */
    protected original: Partial<TAttrs>;
    /** Changed attributes since last sync */
    protected changes: Partial<TAttrs>;
    /** Whether this model exists in the database */
    protected exists: boolean;
    /** Whether this model was recently created */
    protected wasRecentlyCreated: boolean;
    /**
     * Creates a new Model instance.
     *
     * @param attributes - Initial attributes for the model
     * @param forceFill - Whether to bypass fillable restrictions
     *
     * @example
     *
     * const user = new User({ name: 'John', email: 'john@example.com' });
     * const userWithGuarded = new User({ id: '123', name: 'John' }, true);
     *
     */
    constructor(attributes?: Partial<TAttrs>, forceFill?: boolean);
    /**
     * Custom inspect method for better debugging output.
     *
     * @returns Object representation for debugging
     *
     * @example
     *
     * const user = new User({ name: 'John' });
     * console.log(user); // Shows model state, attributes, changes, etc.
     *
     */
    [util.inspect.custom](): object;
    /**
     * Defines a property accessor for an attribute.
     * Allows direct property access to model attributes.
     *
     * @protected
     * @template K - The attribute key type
     * @param key - The attribute key to define accessor for
     *
     * @example
     *
     * // Internal usage - creates property accessors
     * user.name = 'John'; // Calls setAttribute internally
     * console.log(user.name); // Calls getAttribute internally
     *
     */
    protected defineAccessor<K extends keyof TAttrs>(key: K): void;
    /**
     * Creates a new query builder for the model.
     * Entry point for all database queries on this model.
     *
     * @template TModel - The model class type
     * @param this - The model class (static context)
     * @returns QueryBuilder instance configured for this model
     *
     * @example
     *
     * const activeUsers = await User.query().where('status', 'active').get();
     * const user = await User.query().where('id', '123').first();
     * const count = await User.query().count();
     *
     */
    static query<TModel extends typeof Model<any>>(this: TModel): QueryBuilder<InstanceType<TModel>, InferAttributes<InstanceType<TModel>>>;
    /**
     * Finds a model by its primary key.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @param id - The primary key value to search for
     * @returns Promise resolving to model instance or null if not found
     *
     * @example
     *
     * const user = await User.find('123');
     * if (user) {
     *   console.log(user.name);
     * }
     *
     * const nonExistent = await User.find('999'); // Returns null
     *
     */
    static find<TAttrs extends Record<string, any>, TModel extends typeof Model<TAttrs>>(this: TModel, id: any): Promise<InstanceType<TModel> | null>;
    /**
     * Finds a model by its primary key or throws an exception.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @param id - The primary key value to search for
     * @returns Promise resolving to model instance
     * @throws {Error} When model is not found
     *
     * @example
     *
     * try {
     *   const user = await User.findOrFail('123');
     *   console.log(user.name);
     * } catch (error) {
     *   console.log('User not found');
     * }
     *
     */
    static findOrFail<TAttrs extends Record<string, any>, TModel extends typeof Model<TAttrs>>(this: TModel, id: any): Promise<InstanceType<TModel>>;
    /**
     * Creates a new model instance and saves it to the database.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @param attrs - Attributes for the new model
     * @returns Promise resolving to the created model instance
     *
     * @example
     *
     * const user = await User.create({
     *   name: 'John Doe',
     *   email: 'john@example.com'
     * });
     * console.log(user.id); // Auto-generated ID
     *
     */
    static create<TAttrs extends Record<string, any>, TModel extends typeof Model<TAttrs>>(this: TModel, attrs: Partial<TAttrs>): Promise<InstanceType<TModel> & TAttrs>;
    /**
     * Creates multiple records in bulk.
     *
     * For each attribute set in `items`, a new model instance is created (bypassing fillable),
     * saved to the database, and collected into an array.
     *
     * @template TModel
     * @param - Array of attribute objects to insert.
     * @returns - Resolves with an array of newly created model instances.
     *
     * @example
     * // Create multiple users at once
     * const users = await User.createMany([
     *   { name: 'Alice', email: 'alice@example.com' },
     *   { name: 'Bob', email: 'bob@example.com' },
     *   { name: 'Charlie', email: 'charlie@example.com' }
     * ]);
     *
     * console.log(`Created ${users.length} users`);
     */
    static createMany<TAttrs extends Record<string, any>, TModel extends typeof Model<TAttrs>>(this: TModel, items: Partial<TAttrs>[]): Promise<InstanceType<TModel>[]>;
    /**
     * Retrieves all models from the database.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @returns Promise resolving to array of model instances
     *
     * @example
     *
     * const allUsers = await User.all();
     * console.log(`Found ${allUsers.length} users`);
     *
     */
    static all<TAttrs extends Record<string, any>, TModel extends typeof Model<TAttrs>>(this: TModel): Promise<InstanceType<TModel>[]>;
    /**
     * Gets the first model matching the query.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @returns Promise resolving to first model instance or null
     *
     * @example
     *
     * const firstUser = await User.first();
     * if (firstUser) {
     *   console.log('First user:', firstUser.name);
     * }
     *
     */
    static first<TAttrs extends Record<string, any>, TModel extends typeof Model<TAttrs>>(this: TModel): Promise<InstanceType<TModel> | null>;
    /**
     * Updates an existing model or creates a new one.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @param attributes - Attributes to search by
     * @param values - Values to update or create with
     * @returns Promise resolving to the model instance
     *
     * @example
     *
     * const user = await User.updateOrCreate(
     *   { email: 'john@example.com' },
     *   { name: 'John Doe', status: 'active' }
     * );
     *
     */
    static updateOrCreate<TAttrs extends Record<string, any>, TModel extends typeof Model<TAttrs>>(this: TModel, attributes: Partial<TAttrs>, values?: Partial<TAttrs>): Promise<InstanceType<TModel>>;
    /**
     * Saves the model to the database.
     * Handles both creating new records and updating existing ones.
     *
     * @returns Promise resolving to true if save was successful
     *
     * @example
     *
     * const user = new User({ name: 'John' });
     * await user.save(); // Creates new record
     *
     * user.name = 'Jane';
     * await user.save(); // Updates existing record
     *
     */
    save(): Promise<boolean>;
    /**
     * Updates the model with new attributes and saves to database.
     *
     * @param attributes - Attributes to update
     * @returns Promise resolving to true if update was successful
     *
     * @example
     *
     * const user = await User.find('123');
     * await user.update({ name: 'Jane Doe', email: 'jane@example.com' });
     *
     */
    update(attributes: Partial<TAttrs>): Promise<boolean>;
    /**
     * Deletes the model from the database.
     *
     * @returns Promise resolving to true if deletion was successful
     *
     * @example
     *
     * const user = await User.find('123');
     * if (user) {
     *   await user.delete();
     *   console.log('User deleted');
     * }
     *
     */
    delete(): Promise<boolean>;
    /**
     * Refreshes the model from the database.
     * Reloads all attributes from the database, discarding any unsaved changes.
     *
     * @returns Promise resolving to the refreshed model instance
     *
     * @example
     *
     * const user = await User.find('123');
     * user.name = 'Changed Name'; // Not saved
     * await user.refresh(); // Discards changes and reloads from DB
     *
     */
    refresh(): Promise<this>;
    /**
   * Create an in-memory copy of this model, excluding its primary key,
   * and apply any attribute overrides. Does NOT persist to the database
   * until you call `save()` on the returned instance.
   *
   * @param {Partial<TAttrs>} [overrides={}] — Attributes to override on the replica.
   * @returns {this} A new model instance with copied attributes (primary key removed) and overrides applied.
   *
   * @example
   * ```ts
   * const user = await User.find('user-id-123');
   * // Clone with a new email
   * const newUser = user.replicate({
   *   email: 'new-email@example.com'
   * });
   * await newUser.save(); // Inserts as a new record
   * ```
   */
    replicate(overrides?: Partial<TAttrs>): this;
    /**
     * Fills the model with attributes, respecting fillable/guarded rules.
     *
     * @param attributes - Attributes to fill
     * @returns The model instance with filled attributes
     *
     * @example
     *
     * const user = new User();
     * user.fill({ name: 'John', email: 'john@example.com' });
     * // Only fillable attributes are set
     *
     */
    fill(attributes: Partial<TAttrs>): this & TAttrs;
    /**
     * Fills the model with attributes, bypassing fillable/guarded rules.
     *
     * @param attributes - Attributes to fill
     * @returns The model instance with filled attributes
     *
     * @example
     *
     * const user = new User();
     * user.forceFill({ id: '123', name: 'John', admin: true });
     * // All attributes are set, including guarded ones
     *
     */
    forceFill(attributes: Partial<TAttrs>): this & TAttrs;
    /**
   * Update this model's `updated_at` timestamp (and optionally touch related models).
   *
   * @param {string[]} [relations] - Names of relations to touch after updating this model.
   * @returns {Promise<this>} Resolves to this model instance.
   *
   * @example
   * ```ts
   * const user = await User.find('abc');
   * await user.touch();
   *
   * // Also update timestamps on all related posts and comments
   * await user.touch(['posts', 'comments']);
   * ```
   */
    touch(relations?: string[]): Promise<this>;
    /**
     * Gets an attribute value from the model.
     * Applies mutators and casts if defined.
     *
     * @template K - The attribute key type
     * @param key - The attribute key to get
     * @returns The attribute value
     *
     * @example
     *
     * const user = new User({ name: 'John' });
     * const name = user.getAttribute('name'); // 'John'
     *
     */
    getAttribute<K extends keyof TAttrs>(key: K): TAttrs[K] | undefined;
    /**
     * Sets an attribute value on the model.
     * Applies mutators and tracks changes.
     *
     * @template K - The attribute key type
     * @param key - The attribute key to set
     * @param value - The value to set
     * @returns The model instance
     *
     * @example
     *
     * const user = new User();
     * user.setAttribute('name', 'John');
     * user.setAttribute('email', 'john@example.com');
     *
     */
    setAttribute<K extends keyof TAttrs>(key: K, value: TAttrs[K]): this & TAttrs;
    /**
     * Gets the model's primary key value.
     *
     * @returns The primary key value
     *
     * @example
     *
     * const user = await User.find('123');
     * console.log(user.getKey()); // '123'
     *
     */
    getKey(): any;
    /**
     * Gets the primary key column name.
     *
     * @returns The primary key column name
     *
     * @example
     *
     * const user = new User();
     * console.log(user.getKeyName()); // 'id'
     *
     */
    getKeyName(): string;
    /**
     * Gets the table name for this model.
     *
     * @returns The table name
     *
     * @example
     *
     * const user = new User();
     * console.log(user.getTable()); // 'users'
     *
     */
    getTable(): string;
    /**
     * Gets the database connection name for this model.
     *
     * @returns The connection name or undefined for default
     *
     * @example
     *
     * const user = new User();
     * console.log(user.getConnection()); // undefined or 'analytics'
     *
     */
    getConnection(): string | undefined;
    /**
     * Checks if the model has unsaved changes.
     *
     * @param attributes - Optional specific attributes to check
     * @returns True if model has unsaved changes
     *
     * @example
     *
     * const user = await User.find('123');
     * user.name = 'New Name';
     * console.log(user.isDirty()); // true
     * console.log(user.isDirty(['email'])); // false
     *
     */
    isDirty(attributes?: string[]): boolean;
    /**
     * Gets the dirty (changed) attributes.
     *
     * @returns Object containing changed attributes
     *
     * @example
     *
     * const user = await User.find('123');
     * user.name = 'New Name';
     * user.email = 'new@example.com';
     * console.log(user.getDirty()); // { name: 'New Name', email: 'new@example.com' }
     *
     */
    getDirty(): Partial<TAttrs>;
    /**
     * Sets the model's attributes directly (internal use).
     *
     * @param attrs - Attributes to set
     *
     * @example
     *
     * // Internal usage in hydration
     * model.setAttributes({ id: '123', name: 'John' });
     *
     */
    setAttributes(attrs: Partial<TAttrs>): void;
    /**
     * Sets the model's existence state (internal use).
     *
     * @param exists - Whether the model exists in database
     *
     * @example
     *
     * // Internal usage in hydration
     * model.setExists(true);
     *
     */
    setExists(exists: boolean): void;
    /**
     * Sets the model's original attributes (internal use).
     *
     * @param attrs - Original attributes to set
     *
     * @example
     *
     * // Internal usage in hydration
     * model.setOriginal({ id: '123', name: 'John' });
     *
     */
    setOriginal(attrs: Partial<TAttrs>): void;
    /**
     * Converts the model to a plain object.
     * Applies visibility rules (hidden/visible attributes).
     *
     * @returns Plain object representation of the model
     *
     * @example
     *
     * const user = new User({ name: 'John', password: 'secret' });
     * const obj = user.toObject(); // { name: 'John' } (password hidden)
     *
     */
    toObject(): Partial<TAttrs>;
    /**
     * Converts the model to JSON string.
     *
     * @returns JSON string representation of the model
     *
     * @example
     *
     * const user = new User({ name: 'John' });
     * const json = user.toJSON(); // '{"name":"John"}'
     *
     */
    toJSON(): string;
    /**
     * Creates a new query builder for this model instance.
     *
     * @protected
     * @returns QueryBuilder instance
     */
    protected newQuery(): QueryBuilder<this, TAttrs>;
    /**
     * Performs database insert operation.
     *
     * @protected
     * @param query - QueryBuilder instance
     * @returns Promise that resolves when insert is complete
     */
    protected performInsert(query: QueryBuilder<this, TAttrs>): Promise<void>;
    /**
     * Performs database update operation.
     *
     * @protected
     * @param query - QueryBuilder instance
     * @returns Promise that resolves when update is complete
     */
    protected performUpdate(query: QueryBuilder<this, TAttrs>): Promise<void>;
    /**
     * Performs database delete operation.
     *
     * @protected
     * @returns Promise that resolves when delete is complete
     */
    protected performDeleteOnModel(): Promise<void>;
    /**
     * Gets attributes prepared for database insertion.
     *
     * @protected
     * @returns Attributes object for insertion
     */
    protected getAttributesForInsert(): Record<string, any>;
    /**
     * Updates timestamp attributes.
     *
     * @protected
     */
    protected updateTimestamps(): void;
    /**
     * Checks if timestamps are enabled for this model.
     *
     * @protected
     * @returns True if timestamps are enabled
     */
    protected getTimestamps(): boolean;
    /**
     * Gets the fillable attributes list.
     *
     * @protected
     * @returns Array of fillable attribute names
     */
    protected getFillable(): string[];
    /**
     * Gets the guarded attributes list.
     *
     * @protected
     * @returns Array of guarded attribute names
     */
    protected getGuarded(): string[];
    /**
     * Gets the hidden attributes list.
     *
     * @protected
     * @returns Array of hidden attribute names
     */
    protected getHidden(): string[];
    /**
     * Gets the visible attributes list.
     *
     * @protected
     * @returns Array of visible attribute names
     */
    protected getVisible(): string[];
    /**
     * Gets the attribute casting definitions.
     *
     * @protected
     * @returns Object mapping attribute names to cast types
     */
    protected getCasts(): Record<string, string>;
    /**
     * Gets the query scopes defined on this model.
     *
     * @protected
     * @returns Object mapping scope names to functions
     */
    protected getScopes(): Record<string, Function>;
    /**
     * Checks if an attribute is fillable.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if attribute is fillable
     */
    protected isFillable(key: string): boolean;
    /**
     * Checks if an attribute has a cast defined.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if attribute has a cast
     */
    protected hasCast(key: keyof TAttrs): boolean;
    /**
     * Casts an attribute value to the specified type.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to cast
     * @returns Casted value
     */
    protected castAttribute(key: keyof TAttrs, value: any): any;
    /**
     * Casts an attribute value for JSON storage.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to cast
     * @returns Casted value for storage
     */
    protected castAttributeAsJson(key: keyof TAttrs, value: any): any;
    /**
     * Checks if an attribute has a getter mutator.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if getter mutator exists
     */
    protected hasGetMutator(key: keyof TAttrs): boolean;
    /**
     * Checks if an attribute has a setter mutator.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if setter mutator exists
     */
    protected hasSetMutator(key: keyof TAttrs): boolean;
    /**
     * Applies a getter mutator to an attribute value.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to mutate
     * @returns Mutated value
     */
    protected mutateAttribute(key: keyof TAttrs, value: any): any;
    /**
     * Applies a setter mutator to an attribute value.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to mutate
     * @returns Mutated value
     */
    protected mutateAttributeForArray(key: keyof TAttrs, value: any): any;
    /**
     * Converts a string to StudlyCase.
     *
     * @protected
     * @param str - String to convert
     * @returns StudlyCase string
     */
    protected studly(str: string): string;
    /**
     * Fires a model event.
     *
     * @protected
     * @param event - Event name to fire
     * @param halt - Whether to halt on false return
     * @returns Promise resolving to event result
     */
    protected fireModelEvent(event: string, halt?: boolean): Promise<boolean | void>;
    /**
     * Finalizes the save operation by syncing state.
     *
     * @protected
     */
    protected finishSave(): void;
    /**
     * Gets partition keys for ScyllaDB.
     *
     * @returns Array of partition key column names
     *
     * @example
     *
     * const user = new User();
     * console.log(user.getPartitionKeys()); // ['user_id']
     *
     */
    getPartitionKeys(): string[];
    /**
     * Gets clustering keys for ScyllaDB.
     *
     * @returns Array of clustering key column names
     *
     * @example
     *
     * const event = new UserEvent();
     * console.log(event.getClusteringKeys()); // ['created_at']
     *
     */
    getClusteringKeys(): string[];
    /**
     * Gets keyspace for ScyllaDB.
     *
     * @returns Keyspace name or undefined
     *
     * @example
     *
     * const user = new User();
     * console.log(user.getKeyspace()); // 'myapp'
     *
     */
    getKeyspace(): string | undefined;
    /**
     * Sets TTL for ScyllaDB operations.
     *
     * @param seconds - TTL in seconds
     * @returns QueryBuilder with TTL set
     *
     * @example
     *
     * const user = new User();
     * await user.withTTL(3600).save(); // Expires in 1 hour
     *
     */
    withTTL(seconds: number): QueryBuilder<this, TAttrs>;
    /**
     * Uses IF NOT EXISTS for ScyllaDB operations.
     *
     * @returns QueryBuilder with IF NOT EXISTS set
     *
     * @example
     *
     * const user = new User();
     * await user.ifNotExists().save(); // Only insert if doesn't exist
     *
     */
    ifNotExists(): QueryBuilder<this, TAttrs>;
    /**
     * Lazy loads relationships on this model instance.
     *
     * @param relations - Relationship names to load
     * @returns Promise resolving to this model with loaded relationships
     *
     * @example
     *
     * const user = await User.find('123');
     * await user.load('posts', 'profile');
     * console.log(user.posts); // Now loaded
     *
     */
    load(...relations: string[]): Promise<this>;
    /**
     * Defines a one-to-one relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param foreignKey - Foreign key column name
     * @param localKey - Local key column name
     * @returns HasOne relationship instance
     *
     * @example
     *
     * class User extends Model {
     *   profile() {
     *     return this.hasOne(Profile, 'user_id', 'id');
     *   }
     * }
     *
     */
    protected hasOne<Related extends Model<any>>(related: new () => Related, foreignKey?: string, localKey?: string): HasOne<this, Related>;
    /**
     * Defines a one-to-many relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param foreignKey - Foreign key column name
     * @param localKey - Local key column name
     * @returns HasMany relationship instance
     *
     * @example
     *
     * class User extends Model {
     *   posts() {
     *     return this.hasMany(Post, 'user_id', 'id');
     *   }
     * }
     *
     */
    protected hasMany<Related extends Model<any>>(related: new () => Related, foreignKey?: string, localKey?: string): HasMany<this, Related>;
    /**
     * Defines an inverse one-to-one or one-to-many relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param foreignKey - Foreign key column name
     * @param ownerKey - Owner key column name
     * @returns BelongsTo relationship instance
     *
     * @example
     *
     * class Post extends Model {
     *   user() {
     *     return this.belongsTo(User, 'user_id', 'id');
     *   }
     * }
     *
     */
    protected belongsTo<Related extends Model<any>>(related: new () => Related, foreignKey?: string, ownerKey?: string): BelongsTo<this, Related>;
    /**
     * Defines a many-to-many relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param pivotTable - Pivot table name
     * @param foreignPivotKey - Foreign pivot key column name
     * @param relatedPivotKey - Related pivot key column name
     * @param parentKey - Parent key column name
     * @param relatedKey - Related key column name
     * @returns BelongsToMany relationship instance
     *
     * @example
     *
     * class User extends Model {
     *   roles() {
     *     return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
     *   }
     * }
     *
     */
    protected belongsToMany<Related extends Model<any>>(related: new () => Related, pivotTable?: string, foreignPivotKey?: string, relatedPivotKey?: string, parentKey?: string, relatedKey?: string): BelongsToMany<this, Related>;
    /**
     * Defines a polymorphic one-to-one relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param name - Morph name
     * @param type - Morph type column name
     * @param id - Morph ID column name
     * @param localKey - Local key column name
     * @returns MorphOne relationship instance
     *
     * @example
     *
     * class User extends Model {
     *   avatar() {
     *     return this.morphOne(Image, 'imageable');
     *   }
     * }
     *
     */
    protected morphOne<Related extends Model<any>>(related: new () => Related, name: string, type?: string, id?: string, localKey?: string): MorphOne<this, Related>;
    /**
     * Defines a polymorphic one-to-many relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param name - Morph name
     * @param type - Morph type column name
     * @param id - Morph ID column name
     * @param localKey - Local key column name
     * @returns MorphMany relationship instance
     *
     * @example
     *
     * class Post extends Model {
     *   comments() {
     *     return this.morphMany(Comment, 'commentable');
     *   }
     * }
     *
     */
    protected morphMany<Related extends Model<any>>(related: new () => Related, name: string, type?: string, id?: string, localKey?: string): MorphMany<this, Related>;
    /**
     * Defines a polymorphic belongs-to relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param name - Morph name
     * @param type - Morph type column name
     * @param id - Morph ID column name
     * @param ownerKey - Owner key column name
     * @returns MorphTo relationship instance
     *
     * @example
     *
     * class Comment extends Model {
     *   commentable() {
     *     return this.morphTo('commentable');
     *   }
     * }
     *
     */
    protected morphTo<Related extends Model<any>>(name?: string, type?: string, id?: string, ownerKey?: string): MorphTo<this, Related>;
}
//# sourceMappingURL=Model.d.ts.map