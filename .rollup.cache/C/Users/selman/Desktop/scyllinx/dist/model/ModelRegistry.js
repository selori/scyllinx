/**
 * Registry for managing model classes and their aliases.
 * Provides centralized model registration and retrieval with support for aliases and auto-discovery.
 *
 * @example
 *
 * const registry = ModelRegistry.getInstance();
 *
 * // Register models
 * registry.register('User', User, ['user', 'users']);
 * registry.register('Post', Post);
 *
 * // Retrieve models
 * const UserModel = registry.get('User');
 * const user = new UserModel({ name: 'John' });
 *
 * // Use aliases
 * const SameUserModel = registry.get('users');
 *
 */
export class ModelRegistry {
    /** Singleton instance */
    static instance;
    /** Map of model names to model classes */
    models = new Map();
    /** Map of aliases to model names */
    aliases = new Map();
    /**
     * Gets the singleton instance of ModelRegistry.
     *
     * @returns The ModelRegistry instance
     *
     * @example
     *
     * const registry = ModelRegistry.getInstance();
     *
     */
    static getInstance() {
        if (!ModelRegistry.instance) {
            ModelRegistry.instance = new ModelRegistry();
        }
        return ModelRegistry.instance;
    }
    /**
     * Registers a model class with optional aliases.
     *
     * @template TAttrs - Model attributes type
     * @param name - Primary name for the model
     * @param modelClass - Model class constructor
     * @param aliases - Optional array of alias names
     * @returns This registry instance for chaining
     *
     * @example
     *
     * registry.register('User', User, ['user', 'users'])
     *   .register('Post', Post, ['post', 'posts'])
     *   .register('Comment', Comment);
     *
     */
    register(name, modelClass, aliases = []) {
        this.models.set(name, modelClass);
        aliases.forEach((alias) => {
            this.aliases.set(alias, name);
        });
        this.aliases.set(name.toLowerCase(), name);
        this.aliases.set(this.pluralize(name.toLowerCase()), name);
        return this;
    }
    /**
     * Retrieves a model class by name or alias.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param name - Model name or alias
     * @returns Model class constructor
     * @throws {Error} When model is not found
     *
     * @example
     *
     * const User = registry.get<UserAttributes, User>('User');
     * const user = new User({ name: 'John' });
     *
     * // Using alias
     * const SameUser = registry.get('users');
     *
     */
    get(name) {
        const ModelClass = this.models.get(name) || this.models.get(this.aliases.get(name));
        if (!ModelClass) {
            throw new Error(`Model '${name}' not found`);
        }
        return ModelClass;
    }
    /**
     * Checks if a model is registered.
     *
     * @param name - Model name or alias to check
     * @returns True if model exists in registry
     *
     * @example
     *
     * if (registry.has('User')) {
     *   console.log('User model is registered');
     * }
     *
     * if (registry.has('users')) {
     *   console.log('User model found by alias');
     * }
     *
     */
    has(name) {
        return this.models.has(name) || this.aliases.has(name);
    }
    /**
     * Gets all registered models.
     *
     * @returns Map of model names to model classes
     *
     * @example
     *
     * const allModels = registry.all();
     * for (const [name, ModelClass] of allModels) {
     *   console.log(`Registered model: ${name}`);
     * }
     *
     */
    all() {
        return new Map(this.models);
    }
    /**
     * Gets all registered model names.
     *
     * @returns Array of model names
     *
     * @example
     *
     * const modelNames = registry.getModelNames();
     * console.log('Registered models:', modelNames); // ['User', 'Post', 'Comment']
     *
     */
    getModelNames() {
        return Array.from(this.models.keys());
    }
    /**
     * Auto-discovers models in a directory.
     * Note: This is a placeholder implementation for future enhancement.
     *
     * @param directory - Directory path to scan for models
     *
     * @example
     *
     * registry.autoDiscover('./app/Models');
     *
     */
    autoDiscover(directory = "./app/Models") {
        console.log(`Auto-discovering models in ${directory}...`);
        // TODO: Implement directory scanning and model registration
    }
    /**
     * Converts a singular word to plural form.
     * Simple pluralization rules for English words.
     *
     * @private
     * @param word - Word to pluralize
     * @returns Pluralized word
     *
     * @example
     *
     * pluralize('user') // 'users'
     * pluralize('category') // 'categories'
     * pluralize('box') // 'boxes'
     *
     */
    pluralize(word) {
        if (word.endsWith("y"))
            return word.slice(0, -1) + "ies";
        if (word.match(/(s|sh|ch|x|z)$/))
            return word + "es";
        return word + "s";
    }
}
//# sourceMappingURL=ModelRegistry.js.map