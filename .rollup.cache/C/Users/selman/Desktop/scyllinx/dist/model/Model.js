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
export class Model {
    // Static properties for model configuration
    /** The database table name for this model */
    static table;
    /** The primary key column name */
    static primaryKey = "id";
    /** ScyllaDB keyspace name (optional) */
    static keyspace;
    /** ScyllaDB partition key columns */
    static partitionKeys = [];
    /** ScyllaDB clustering key columns */
    static clusteringKeys = [];
    /** Database connection name to use */
    static connection;
    /** Attributes that are mass assignable */
    static fillable = [];
    /** Attributes that are not mass assignable */
    static guarded = ["*"];
    /** Attributes that should be hidden from serialization */
    static hidden = [];
    /** Attributes that should be visible in serialization */
    static visible = [];
    /** Attribute casting definitions */
    static casts = {};
    /** Date attribute names */
    static dates = ["created_at", "updated_at"];
    /** Whether to automatically manage timestamps */
    static timestamps = true;
    /** Whether to use soft deletes */
    static softDeletes = false;
    /** Query scopes defined on this model */
    static scopes = {};
    // Instance properties for model state
    /** Current attribute values */
    attributes = {};
    /** Original attribute values from database */
    original = {};
    /** Changed attributes since last sync */
    changes = {};
    /** Whether this model exists in the database */
    exists = false;
    /** Whether this model was recently created */
    wasRecentlyCreated = false;
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
    constructor(attributes = {}, forceFill = false) {
        forceFill === true ? this.forceFill(attributes) : this.fill(attributes);
    }
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
    [util.inspect.custom]() {
        return {
            __model__: this.constructor.name,
            attributes: this.attributes,
            original: this.original,
            changes: this.getDirty(),
            dirty: this.isDirty(),
            exists: this.exists,
            wasRecentlyCreated: this.wasRecentlyCreated,
        };
    }
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
    defineAccessor(key) {
        if (!Object.prototype.hasOwnProperty.call(this, key)) {
            Object.defineProperty(this, key, {
                get: () => this.getAttribute(key),
                set: (val) => this.setAttribute(key, val),
                enumerable: true,
                configurable: true,
            });
        }
    }
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
    static query() {
        const instance = new this();
        const builder = new QueryBuilder(instance.getTable(), instance.getConnection()).setModel(this);
        // const scopes = instance.getScopes?.() ?? {};
        // for (const [name, fn] of Object.entries(scopes)) {
        //   (builder as any)[name] = (...args: any[]) => fn.call(this, builder, ...args);
        // }
        return builder;
    }
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
    static async find(id) {
        const inst = new this({});
        return await this.query()
            .where(inst.getKeyName(), id)
            .first();
    }
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
    static async findOrFail(id) {
        const model = await this.find(id);
        if (!model) {
            throw new Error(`Model not found with id: ${id}`);
        }
        return model;
    }
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
    static async create(attrs) {
        const inst = new this(attrs, true);
        await inst.save();
        return inst;
    }
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
    static async createMany(items) {
        const created = [];
        for (const attrs of items) {
            const inst = new this(attrs, true);
            await inst.save();
            created.push(inst);
        }
        return created;
    }
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
    static async all() {
        return await this.query().get();
    }
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
    static async first() {
        return await this.query().first();
    }
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
    static async updateOrCreate(attributes, values = {}) {
        const instance = await this.query().where(attributes).first();
        if (instance) {
            instance.fill(values);
            await instance.save();
            return instance;
        }
        return await this.create({ ...attributes, ...values });
    }
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
    async save() {
        const query = this.newQuery();
        // Fire saving event
        if ((await this.fireModelEvent("saving")) === false) {
            return false;
        }
        if (this.exists) {
            // Update existing model
            if ((await this.fireModelEvent("updating")) === false) {
                return false;
            }
            if (this.isDirty()) {
                await this.performUpdate(query);
                this.fireModelEvent("updated", false);
            }
        }
        else {
            // Create new model
            if ((await this.fireModelEvent("creating")) === false) {
                return false;
            }
            await this.performInsert(query);
            this.exists = true;
            this.wasRecentlyCreated = true;
            this.fireModelEvent("created", false);
        }
        this.finishSave();
        this.fireModelEvent("saved", false);
        return true;
    }
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
    async update(attributes) {
        if (!this.exists) {
            return false;
        }
        this.fill(attributes);
        return await this.save();
    }
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
    async delete() {
        if (!this.exists) {
            return false;
        }
        if ((await this.fireModelEvent("deleting")) === false) {
            return false;
        }
        await this.performDeleteOnModel();
        this.exists = false;
        this.fireModelEvent("deleted", false);
        return true;
    }
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
    async refresh() {
        if (!this.exists) {
            return this;
        }
        const fresh = await this.newQuery().where(this.getKeyName(), this.getKey()).first();
        if (fresh) {
            this.attributes = fresh.attributes;
            this.original = { ...this.attributes };
            this.changes = {};
        }
        return this;
    }
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
    replicate(overrides = {}) {
        // Determine primary key field
        const pk = this.getKeyName();
        // Clone attributes and remove primary key
        const attrs = { ...this.attributes };
        delete attrs[pk];
        // Instantiate a fresh model, bypassing fillable/guarded
        const ModelClass = this.constructor;
        const replica = new ModelClass(attrs, true);
        // Reset internal state so it will be treated as new
        replica.setExists(false);
        replica.setOriginal({});
        replica.changes = {};
        // Apply any overrides (using fill to respect fillable)
        replica.fill(overrides);
        return replica;
    }
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
    fill(attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            if (this.isFillable(key)) {
                this.setAttribute(key, value);
            }
        }
        return this;
    }
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
    forceFill(attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            this.setAttribute(key, value);
        });
        return this;
    }
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
    async touch(relations) {
        // Update this.updated_at
        const now = new Date();
        this.setAttribute('updated_at', now);
        // Save only the timestamp change
        await this.save();
        // If relations requested, touch each related model instance
        if (relations && relations.length) {
            for (const rel of relations) {
                const loader = this[rel + "Relation"];
                if (typeof loader === 'function') {
                    const related = await loader.call(this).get();
                    for (const inst of related) {
                        if (typeof inst.touch === 'function') {
                            await inst.touch();
                        }
                    }
                }
            }
        }
        return this;
    }
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
    getAttribute(key) {
        if (this.hasGetMutator(key)) {
            return this.mutateAttribute(key, this.attributes[key]);
        }
        if (this.hasCast(key)) {
            return this.castAttribute(key, this.attributes[key]);
        }
        return this.attributes[key];
    }
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
    setAttribute(key, value) {
        if (this.hasSetMutator(key)) {
            value = this.mutateAttributeForArray(key, value);
        }
        if (this.hasCast(key)) {
            value = this.castAttributeAsJson(key, value);
        }
        const current = this.attributes[key];
        const original = this.original[key];
        // If original not set (e.g., first time filling), set it
        if (!this.original.hasOwnProperty(key)) {
            this.original[key] = current;
        }
        // If there's a change, write to changes, otherwise clean it
        if (value !== this.original[key]) {
            this.changes[key] = value;
        }
        else {
            delete this.changes[key];
        }
        this.attributes[key] = value;
        this.defineAccessor(key);
        return this;
    }
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
    getKey() {
        return this.getAttribute(this.getKeyName());
    }
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
    getKeyName() {
        return this.constructor.primaryKey;
    }
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
    getTable() {
        const table = this.constructor.table;
        if (!table) {
            // Convert class name to snake_case table name
            const className = this.constructor.name;
            return (className
                .replace(/([A-Z])/g, "_$1")
                .toLowerCase()
                .slice(1) + "s");
        }
        return table;
    }
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
    getConnection() {
        return this.constructor.connection;
    }
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
    isDirty(attributes) {
        if (attributes) {
            return attributes.some((attr) => this.changes.hasOwnProperty(attr));
        }
        return Object.keys(this.changes).length > 0;
    }
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
    getDirty() {
        return { ...this.changes };
    }
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
    setAttributes(attrs) {
        this.attributes = { ...attrs };
        Object.keys(this.attributes).forEach((key) => {
            this.defineAccessor(key);
        });
        this.changes = {}; // Reset changes
    }
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
    setExists(exists) {
        this.exists = exists;
    }
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
    setOriginal(attrs) {
        this.original = { ...attrs };
        this.changes = {}; // Reset changes
    }
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
    toObject() {
        const attributes = { ...this.attributes };
        const hidden = this.getHidden();
        const visible = this.getVisible();
        // Apply visibility rules
        if (visible.length > 0) {
            for (const key of Object.keys(attributes)) {
                if (!visible.includes(key)) {
                    delete attributes[key];
                }
            }
        }
        for (const key of hidden) {
            delete attributes[key];
        }
        return attributes;
    }
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
    toJSON() {
        return JSON.stringify(this.toObject());
    }
    // Protected methods for internal operations
    /**
     * Creates a new query builder for this model instance.
     *
     * @protected
     * @returns QueryBuilder instance
     */
    newQuery() {
        return new QueryBuilder(this.getTable(), this.getConnection()).setModel(this.constructor);
    }
    /**
     * Performs database insert operation.
     *
     * @protected
     * @param query - QueryBuilder instance
     * @returns Promise that resolves when insert is complete
     */
    async performInsert(query) {
        if (this.getTimestamps()) {
            this.updateTimestamps();
        }
        const attributes = this.getAttributesForInsert();
        await query.insert(attributes);
    }
    /**
     * Performs database update operation.
     *
     * @protected
     * @param query - QueryBuilder instance
     * @returns Promise that resolves when update is complete
     */
    async performUpdate(query) {
        if (this.getTimestamps()) {
            this.updateTimestamps();
        }
        const dirty = this.getDirty();
        if (Object.keys(dirty).length === 0) {
            return;
        }
        await query.where(this.getKeyName(), this.getKey()).update(dirty);
    }
    /**
     * Performs database delete operation.
     *
     * @protected
     * @returns Promise that resolves when delete is complete
     */
    async performDeleteOnModel() {
        await this.newQuery().where(this.getKeyName(), this.getKey()).delete();
    }
    /**
     * Gets attributes prepared for database insertion.
     *
     * @protected
     * @returns Attributes object for insertion
     */
    getAttributesForInsert() {
        return { ...this.attributes };
    }
    /**
     * Updates timestamp attributes.
     *
     * @protected
     */
    updateTimestamps() {
        const time = new Date();
        if (!this.exists && !this.attributes.created_at) {
            this.setAttribute("created_at", time);
        }
        this.setAttribute("updated_at", time);
    }
    /**
     * Checks if timestamps are enabled for this model.
     *
     * @protected
     * @returns True if timestamps are enabled
     */
    getTimestamps() {
        return this.constructor.timestamps;
    }
    /**
     * Gets the fillable attributes list.
     *
     * @protected
     * @returns Array of fillable attribute names
     */
    getFillable() {
        return this.constructor.fillable;
    }
    /**
     * Gets the guarded attributes list.
     *
     * @protected
     * @returns Array of guarded attribute names
     */
    getGuarded() {
        return this.constructor.guarded;
    }
    /**
     * Gets the hidden attributes list.
     *
     * @protected
     * @returns Array of hidden attribute names
     */
    getHidden() {
        return this.constructor.hidden;
    }
    /**
     * Gets the visible attributes list.
     *
     * @protected
     * @returns Array of visible attribute names
     */
    getVisible() {
        return this.constructor.visible;
    }
    /**
     * Gets the attribute casting definitions.
     *
     * @protected
     * @returns Object mapping attribute names to cast types
     */
    getCasts() {
        return this.constructor.casts;
    }
    /**
     * Gets the query scopes defined on this model.
     *
     * @protected
     * @returns Object mapping scope names to functions
     */
    getScopes() {
        return this.constructor.scopes;
    }
    /**
     * Checks if an attribute is fillable.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if attribute is fillable
     */
    isFillable(key) {
        const fillable = this.getFillable();
        const guarded = this.getGuarded();
        if (fillable.length > 0 && !fillable.includes(key)) {
            return false;
        }
        if (guarded.includes("*")) {
            return fillable.includes(key);
        }
        return !guarded.includes(key);
    }
    /**
     * Checks if an attribute has a cast defined.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if attribute has a cast
     */
    hasCast(key) {
        return this.getCasts().hasOwnProperty(String(key));
    }
    /**
     * Casts an attribute value to the specified type.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to cast
     * @returns Casted value
     */
    castAttribute(key, value) {
        const castType = this.getCasts()[String(key)];
        if (value === null) {
            return null;
        }
        switch (castType) {
            case "int":
            case "integer":
                return Number.parseInt(value, 10);
            case "real":
            case "float":
            case "double":
                return Number.parseFloat(value);
            case "string":
                return String(value);
            case "bool":
            case "boolean":
                return Boolean(value);
            case "object":
            case "array":
            case "json":
                return typeof value === "string" ? JSON.parse(value) : value;
            case "date":
            case "datetime":
                return new Date(value);
            default:
                return value;
        }
    }
    /**
     * Casts an attribute value for JSON storage.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to cast
     * @returns Casted value for storage
     */
    castAttributeAsJson(key, value) {
        const castType = this.getCasts()[String(key)];
        if (["object", "array", "json"].includes(castType)) {
            return typeof value === "object" ? JSON.stringify(value) : value;
        }
        return value;
    }
    /**
     * Checks if an attribute has a getter mutator.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if getter mutator exists
     */
    hasGetMutator(key) {
        return typeof this[`get${this.studly(String(key))}Attribute`] === "function";
    }
    /**
     * Checks if an attribute has a setter mutator.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if setter mutator exists
     */
    hasSetMutator(key) {
        return typeof this[`set${this.studly(String(key))}Attribute`] === "function";
    }
    /**
     * Applies a getter mutator to an attribute value.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to mutate
     * @returns Mutated value
     */
    mutateAttribute(key, value) {
        return this[`get${this.studly(String(key))}Attribute`](value);
    }
    /**
     * Applies a setter mutator to an attribute value.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to mutate
     * @returns Mutated value
     */
    mutateAttributeForArray(key, value) {
        return this[`set${this.studly(String(key))}Attribute`](value);
    }
    /**
     * Converts a string to StudlyCase.
     *
     * @protected
     * @param str - String to convert
     * @returns StudlyCase string
     */
    studly(str) {
        return str.replace(/_(.)/g, (_, char) => char.toUpperCase()).replace(/^(.)/, (char) => char.toUpperCase());
    }
    /**
     * Fires a model event.
     *
     * @protected
     * @param event - Event name to fire
     * @param halt - Whether to halt on false return
     * @returns Promise resolving to event result
     */
    async fireModelEvent(event, halt = true) {
        const eventName = `scyllinx.${event}: ${this.constructor.name}`;
        console.log("Method not implemented", "for debug", eventName);
        return true;
    }
    /**
     * Finalizes the save operation by syncing state.
     *
     * @protected
     */
    finishSave() {
        this.original = { ...this.attributes };
        this.changes = {};
    }
    // ScyllaDB specific methods
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
    getPartitionKeys() {
        return this.constructor.partitionKeys;
    }
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
    getClusteringKeys() {
        return this.constructor.clusteringKeys;
    }
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
    getKeyspace() {
        return this.constructor.keyspace;
    }
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
    withTTL(seconds) {
        return this.newQuery().ttl(seconds);
    }
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
    ifNotExists() {
        return this.newQuery().ifNotExists();
    }
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
    async load(...relations) {
        const list = Array.isArray(relations) ? relations : [relations];
        // Use QueryBuilder.loadEagerFor
        await new QueryBuilder(this.getTable(), this.getConnection())
            .setModel(this.constructor)
            .loadEagerFor(this, list);
        return this;
    }
    // Relationship methods
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
    hasOne(related, foreignKey, localKey) {
        const fk = foreignKey || `${this.getTable()}_id`;
        const lk = localKey || this.getKeyName();
        return new HasOne(this, related, fk, lk);
    }
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
    hasMany(related, foreignKey, localKey) {
        const fk = foreignKey || `${this.getTable()}_id`;
        const lk = localKey || this.getKeyName();
        return new HasMany(this, related, fk, lk);
    }
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
    belongsTo(related, foreignKey, ownerKey) {
        const instance = new related();
        const fk = foreignKey || `${instance.getTable()}_id`;
        const ok = ownerKey || instance.getKeyName();
        return new BelongsTo(this, related, fk, ok);
    }
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
    belongsToMany(related, pivotTable, foreignPivotKey, relatedPivotKey, parentKey, relatedKey) {
        const relatedInstance = new related();
        const pivot = pivotTable || [this.getTable(), relatedInstance.getTable()].sort().join("_");
        const fpk = foreignPivotKey || `${this.getTable()}_id`;
        const rpk = relatedPivotKey || `${relatedInstance.getTable()}_id`;
        const pk = parentKey || this.getKeyName();
        const rk = relatedKey || relatedInstance.getKeyName();
        return new BelongsToMany(this, related, pivot, fpk, rk, pk, rpk);
    }
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
    morphOne(related, name, type, id, localKey) {
        const morphType = type || `${name}_type`;
        const morphId = id || `${name}_id`;
        const lk = localKey || this.getKeyName();
        return new MorphOne(this, related, morphType, morphId, lk);
    }
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
    morphMany(related, name, type, id, localKey) {
        const morphType = type || `${name}_type`;
        const morphId = id || `${name}_id`;
        const lk = localKey || this.getKeyName();
        return new MorphMany(this, related, morphType, morphId, lk);
    }
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
    morphTo(name, type, id, ownerKey) {
        const morphName = name || "morphable";
        const morphType = type || `${morphName}_type`;
        const morphId = id || `${morphName}_id`;
        const ok = ownerKey || "id";
        return new MorphTo(this, morphType, morphId, ok);
    }
}
//# sourceMappingURL=Model.js.map