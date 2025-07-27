import { faker } from "@faker-js/faker";
import { ModelRegistry } from "@/model/ModelRegistry";
/**
 * Factory class to generate model instances, raw data, or persist records.
 *
 * @template TModel - Model class extending Model<TAttrs>
 * @template TAttrs - Attribute shape for the model
 *
 * @example
 * // Define a factory for User model:
 * import { defineFactory } from "@/factories/ModelFactory"
 * import { User } from "@/models/User"
 *
 * defineFactory<User, UserAttributes>("User", {
 *   id: () => faker.string.uuid(),
 *   first_name: () => faker.person.firstName(),
 *   last_name: () => faker.person.lastName(),
 *   email: () => faker.internet.email(),
 *   created_at: () => new Date(),
 *   updated_at: () => new Date(),
 * })
 */
export class ModelFactory {
    modelName;
    static factories = new Map();
    definition = {};
    states = new Map();
    count = 1;
    currentStates = [];
    constructor(modelName, definition) {
        this.modelName = modelName;
        this.definition = definition;
    }
    /**
     * Register a factory definition under a model name.
     *
     * @param modelName - Unique key matching ModelRegistry.
     * @param definition - Default attribute definitions.
     * @returns The defined factory instance.
     */
    static define(modelName, definition) {
        const factory = new ModelFactory(modelName, definition);
        this.factories.set(modelName, factory);
        return factory;
    }
    /**
     * Retrieve a cloned factory for a model.
     *
     * @param modelName - Key of the registered factory.
     * @returns A fresh factory instance.
     * @throws If factory not found.
     */
    static for(modelName) {
        const factory = this.factories.get(modelName);
        if (!factory)
            throw new Error(`Factory for model '${modelName}' not found`);
        return factory.clone();
    }
    /**
     * Define a named state with specific overrides.
     * @param name - State identifier
     * @param definition - Partial overrides or function to generate them
     */
    state(name, definition) {
        this.states.set(name, definition);
        return this;
    }
    /**
     * Apply a named state to the factory.
     */
    as(stateName) {
        this.currentStates.push(stateName);
        return this;
    }
    /**
     * Specify how many instances to create or make.
     */
    times(count) {
        this.count = count;
        return this;
    }
    /**
     * Persist multiple model instances.
     *
     * @param overrides - Attribute overrides for generation.
     * @returns Array of persisted model instances.
     */
    async create(overrides = {}) {
        const models = [];
        for (let i = 0; i < this.count; i++) {
            const attrs = this.generateAttributes(overrides);
            const ModelClass = ModelRegistry.getInstance().get(this.modelName);
            const model = await ModelClass.create(attrs);
            models.push(model);
        }
        return models;
    }
    /**
     * Persist and return a single model instance.
     */
    async createOne(overrides = {}) {
        const [first] = await this.times(1).create(overrides);
        return first;
    }
    /**
     * Build model instances without saving.
     */
    make(overrides = {}) {
        const arr = [];
        for (let i = 0; i < this.count; i++) {
            const attrs = this.generateAttributes(overrides);
            const ModelClass = ModelRegistry.getInstance().get(this.modelName);
            arr.push(new ModelClass(attrs));
        }
        return this.count === 1 ? arr[0] : arr;
    }
    /**
     * Generate raw attribute data without Model wrapping.
     */
    raw(overrides = {}) {
        const data = [];
        for (let i = 0; i < this.count; i++)
            data.push(this.generateAttributes(overrides));
        return this.count === 1 ? data[0] : data;
    }
    /**
     * Internal: combine definition, states, and overrides, resolving functions.
     */
    generateAttributes(overrides) {
        let attrs = { ...this.definition };
        for (const state of this.currentStates) {
            const def = this.states.get(state);
            const stateAttrs = typeof def === 'function' ? def(faker) : def;
            attrs = { ...attrs, ...stateAttrs };
        }
        attrs = { ...attrs, ...overrides };
        const result = {};
        for (const [k, v] of Object.entries(attrs)) {
            result[k] = typeof v === 'function' ? v(faker) : v;
        }
        return result;
    }
    /** Clone this factory with existing states. */
    clone() {
        const c = new ModelFactory(this.modelName, this.definition);
        c.states = new Map(this.states);
        return c;
    }
}
/**
 * Shortcut to retrieve a defined factory for a model.
 * @example
 * const users = await factory("User").times(3).create()
 */
export function factory(modelName) {
    return ModelFactory.for(modelName);
}
/**
 * Shortcut to define a new factory.
 */
export function defineFactory(modelName, definition) {
    return ModelFactory.define(modelName, definition);
}
//# sourceMappingURL=ModelFactory.js.map