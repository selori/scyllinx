import type { Faker } from "@faker-js/faker"
import { faker } from "@faker-js/faker"
import { Model } from "@/model/Model"
import { ModelRegistry } from "@/model/ModelRegistry"

/**
 * Shape of the default attribute definition for a factory.
 * Each key maps to a static value or a function using Faker.
 *
 * @template T - Model attribute type
 */
export type FactoryDefinition<T> = {
  [K in keyof T]?: T[K] | ((faker: Faker) => T[K])
}

/**
 * Shape of named state overrides for a factory.
 *
 * @template T - Model attribute type
 */
export type FactoryState<T> = {
  [state: string]: Partial<FactoryDefinition<T>> | ((faker: Faker) => Partial<FactoryDefinition<T>>)
}

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
export class ModelFactory<TModel extends Model<TAttrs>, TAttrs extends Record<string, any>> {
  private static factories = new Map<string, ModelFactory<any, any>>()

  private definition: FactoryDefinition<TAttrs> = {}
  private states = new Map<string, FactoryState<TAttrs>[string]>()
  private count = 1
  private currentStates: string[] = []

  constructor(
    private modelName: string,
    definition: FactoryDefinition<TAttrs>,
  ) {
    this.definition = definition
  }

  /**
   * Register a factory definition under a model name.
   *
   * @param modelName - Unique key matching ModelRegistry.
   * @param definition - Default attribute definitions.
   * @returns The defined factory instance.
   */
  static define<TModel extends Model<TAttrs>, TAttrs extends Record<string, any>>(
    modelName: string,
    definition: FactoryDefinition<TAttrs>
  ): ModelFactory<TModel, TAttrs> {
    const factory = new ModelFactory<TModel, TAttrs>(modelName, definition)
    this.factories.set(modelName, factory)
    return factory
  }

  /**
   * Retrieve a cloned factory for a model.
   *
   * @param modelName - Key of the registered factory.
   * @returns A fresh factory instance.
   * @throws If factory not found.
   */
  static for<TModel extends Model<TAttrs>, TAttrs extends Record<string, any>>(
    modelName: string
  ): ModelFactory<TModel, TAttrs> {
    const factory = this.factories.get(modelName)
    if (!factory) throw new Error(`Factory for model '${modelName}' not found`)
    return factory.clone()
  }

  /**
   * Define a named state with specific overrides.
   * @param name - State identifier
   * @param definition - Partial overrides or function to generate them
   */
  state(name: string, definition: FactoryState<TAttrs>[string]): this {
    this.states.set(name, definition)
    return this
  }

  /**
   * Apply a named state to the factory.
   */
  as(stateName: string): this {
    this.currentStates.push(stateName)
    return this
  }

  /**
   * Specify how many instances to create or make.
   */
  times(count: number): this {
    this.count = count
    return this
  }

  /**
   * Persist multiple model instances.
   *
   * @param overrides - Attribute overrides for generation.
   * @returns Array of persisted model instances.
   */
  async create(overrides: Partial<TAttrs> = {}): Promise<TModel[]> {
    const models: TModel[] = []
    for (let i = 0; i < this.count; i++) {
      const attrs = this.generateAttributes(overrides)
      const ModelClass = ModelRegistry.getInstance().get<TAttrs>(this.modelName)
      const model = await (ModelClass as any).create(attrs) as TModel
      models.push(model)
    }
    return models
  }

  /**
   * Persist and return a single model instance.
   */
  async createOne(overrides: Partial<TAttrs> = {}): Promise<TModel> {
    const [first] = await this.times(1).create(overrides)
    return first
  }

  /**
   * Build model instances without saving.
   */
  make(overrides: Partial<TAttrs> = {}): TModel | TModel[] {
    const arr: TModel[] = []
    for (let i = 0; i < this.count; i++) {
      const attrs = this.generateAttributes(overrides)
      const ModelClass = ModelRegistry.getInstance().get<TAttrs>(this.modelName)
      arr.push(new ModelClass(attrs) as TModel)
    }
    return this.count === 1 ? arr[0] : arr
  }

  /**
   * Generate raw attribute data without Model wrapping.
   */
  raw(overrides: Partial<TAttrs> = {}): TAttrs | TAttrs[] {
    const data: TAttrs[] = []
    for (let i = 0; i < this.count; i++) data.push(this.generateAttributes(overrides))
    return this.count === 1 ? data[0] : data
  }

  /**
   * Internal: combine definition, states, and overrides, resolving functions.
   */
  private generateAttributes(overrides: Partial<TAttrs>): TAttrs {
    let attrs: FactoryDefinition<TAttrs> = { ...this.definition }
    for (const state of this.currentStates) {
      const def = this.states.get(state)
      const stateAttrs = typeof def === 'function' ? def(faker) : def
      attrs = { ...attrs, ...stateAttrs }
    }
    attrs = { ...attrs, ...overrides }
    const result: Partial<TAttrs> = {}
    for (const [k, v] of Object.entries(attrs)) {
      result[k as keyof TAttrs] = typeof v === 'function' ? (v as any)(faker) : v
    }
    return result as TAttrs
  }

  /** Clone this factory with existing states. */
  private clone(): ModelFactory<TModel, TAttrs> {
    const c = new ModelFactory<TModel, TAttrs>(this.modelName, this.definition)
    c.states = new Map(this.states)
    return c
  }
}

/**
 * Shortcut to retrieve a defined factory for a model.
 * @example
 * const users = await factory("User").times(3).create()
 */
export function factory<TModel extends Model<TAttrs>, TAttrs extends Record<string, any>>(
  modelName: string
): ModelFactory<TModel, TAttrs> {
  return ModelFactory.for<TModel, TAttrs>(modelName)
}

/**
 * Shortcut to define a new factory.
 */
export function defineFactory<TModel extends Model<TAttrs>, TAttrs extends Record<string, any>>(
  modelName: string,
  definition: FactoryDefinition<TAttrs>
): ModelFactory<TModel, TAttrs> {
  return ModelFactory.define<TModel, TAttrs>(modelName, definition)
}
