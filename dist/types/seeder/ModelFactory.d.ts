import type { Faker } from "@faker-js/faker";
import { Model } from "@/model/Model";
/**
 * Shape of the default attribute definition for a factory.
 * Each key maps to a static value or a function using Faker.
 *
 * @template T - Model attribute type
 */
export type FactoryDefinition<T> = {
    [K in keyof T]?: T[K] | ((faker: Faker) => T[K]);
};
/**
 * Shape of named state overrides for a factory.
 *
 * @template T - Model attribute type
 */
export type FactoryState<T> = {
    [state: string]: Partial<FactoryDefinition<T>> | ((faker: Faker) => Partial<FactoryDefinition<T>>);
};
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
export declare class ModelFactory<TModel extends Model<TAttrs>, TAttrs extends Record<string, any>> {
    private modelName;
    private static factories;
    private definition;
    private states;
    private count;
    private currentStates;
    constructor(modelName: string, definition: FactoryDefinition<TAttrs>);
    /**
     * Register a factory definition under a model name.
     *
     * @param modelName - Unique key matching ModelRegistry.
     * @param definition - Default attribute definitions.
     * @returns The defined factory instance.
     */
    static define<TModel extends Model<TAttrs>, TAttrs extends Record<string, any>>(modelName: string, definition: FactoryDefinition<TAttrs>): ModelFactory<TModel, TAttrs>;
    /**
     * Retrieve a cloned factory for a model.
     *
     * @param modelName - Key of the registered factory.
     * @returns A fresh factory instance.
     * @throws If factory not found.
     */
    static for<TModel extends Model<TAttrs>, TAttrs extends Record<string, any>>(modelName: string): ModelFactory<TModel, TAttrs>;
    /**
     * Define a named state with specific overrides.
     * @param name - State identifier
     * @param definition - Partial overrides or function to generate them
     */
    state(name: string, definition: FactoryState<TAttrs>[string]): this;
    /**
     * Apply a named state to the factory.
     */
    as(stateName: string): this;
    /**
     * Specify how many instances to create or make.
     */
    times(count: number): this;
    /**
     * Persist multiple model instances.
     *
     * @param overrides - Attribute overrides for generation.
     * @returns Array of persisted model instances.
     */
    create(overrides?: Partial<TAttrs>): Promise<TModel[]>;
    /**
     * Persist and return a single model instance.
     */
    createOne(overrides?: Partial<TAttrs>): Promise<TModel>;
    /**
     * Build model instances without saving.
     */
    make(overrides?: Partial<TAttrs>): TModel | TModel[];
    /**
     * Generate raw attribute data without Model wrapping.
     */
    raw(overrides?: Partial<TAttrs>): TAttrs | TAttrs[];
    /**
     * Internal: combine definition, states, and overrides, resolving functions.
     */
    private generateAttributes;
    /** Clone this factory with existing states. */
    private clone;
}
/**
 * Shortcut to retrieve a defined factory for a model.
 * @example
 * const users = await factory("User").times(3).create()
 */
export declare function factory<TModel extends Model<TAttrs>, TAttrs extends Record<string, any>>(modelName: string): ModelFactory<TModel, TAttrs>;
/**
 * Shortcut to define a new factory.
 */
export declare function defineFactory<TModel extends Model<TAttrs>, TAttrs extends Record<string, any>>(modelName: string, definition: FactoryDefinition<TAttrs>): ModelFactory<TModel, TAttrs>;
//# sourceMappingURL=ModelFactory.d.ts.map