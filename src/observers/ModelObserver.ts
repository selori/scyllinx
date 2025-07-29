import type { Model } from "../model/Model"
import type { ModelEvent } from "../types"

/**
 * The `ModelObserver` class allows you to listen to lifecycle events
 * of a model (e.g., created, updated, deleted).
 * 
 * To observe a model, create a class extending `ModelObserver` and
 * implement the lifecycle hooks you want to listen to.
 *
 * Each method receives the affected model instance as an argument,
 * and can be either synchronous or asynchronous.
 *
 * @example
 * class UserObserver extends ModelObserver {
 *   created(user: Model) {
 *     console.log(`User created: ${user.getAttribute('email')}`)
 *   }
 * }
 */
export abstract class ModelObserver {
  /**
   * Called before a model is created.
   */
  creating?(model: Model<any>): Promise<void> | void {}

  /**
   * Called after a model has been created.
   */
  created?(model: Model<any>): Promise<void> | void {}

  /**
   * Called before a model is updated.
   */
  updating?(model: Model<any>): Promise<void> | void {}

  /**
   * Called after a model has been updated.
   */
  updated?(model: Model<any>): Promise<void> | void {}

  /**
   * Called before a model is saved (either create or update).
   */
  saving?(model: Model<any>): Promise<void> | void {}

  /**
   * Called after a model has been saved (either create or update).
   */
  saved?(model: Model<any>): Promise<void> | void {}

  /**
   * Called before a model is deleted.
   */
  deleting?(model: Model<any>): Promise<void> | void {}

  /**
   * Called after a model has been deleted.
   */
  deleted?(model: Model<any>): Promise<void> | void {}

  /**
   * Called before a soft-deleted model is restored.
   */
  restoring?(model: Model<any>): Promise<void> | void {}

  /**
   * Called after a soft-deleted model has been restored.
   */
  restored?(model: Model<any>): Promise<void> | void {}
}

/**
 * Singleton class that manages the registration and notification of model observers.
 *
 * The `ObserverRegistry` holds a map of model names to their observers.
 * It allows observers to be registered and dispatches lifecycle events to them.
 *
 * @example
 * ObserverRegistry.getInstance().register('User', new UserObserver())
 */
export class ObserverRegistry {
  private static instance: ObserverRegistry
  private observers: Map<string, ModelObserver[]> = new Map()

  /**
   * Returns the singleton instance of the `ObserverRegistry`.
   */
  static getInstance(): ObserverRegistry {
    if (!ObserverRegistry.instance) {
      ObserverRegistry.instance = new ObserverRegistry()
    }
    return ObserverRegistry.instance
  }

  /**
   * Registers an observer for a specific model.
   *
   * @param modelName - The name of the model (e.g., `'User'`)
   * @param observer - An instance of a class extending `ModelObserver`
   *
   * @example
   * ObserverRegistry.getInstance().register('Post', new PostObserver())
   */
  register(modelName: string, observer: ModelObserver): void {
    if (!this.observers.has(modelName)) {
      this.observers.set(modelName, [])
    }
    this.observers.get(modelName)!.push(observer)
  }

  /**
   * Notifies all registered observers of a given model event.
   *
   * This method is internally called by the ORM during model lifecycle changes.
   *
   * @param event - The model event object, containing the model and event type
   */
  async notify(event: ModelEvent): Promise<void> {
    const modelName = event.model.constructor.name
    const observers = this.observers.get(modelName) || []

    for (const observer of observers) {
      const method = observer[event.type as keyof ModelObserver]
      if (method && typeof method === "function") {
        await method.call(observer, event.model)
      }
    }
  }
}
