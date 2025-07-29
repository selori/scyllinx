import type { ModelEvent, EventListener } from "../types"

/**
 * A singleton event dispatcher for managing custom and model-specific event listeners.
 *
 * Allows you to register, dispatch, and remove event listeners for global or model-specific events.
 *
 * - Global events: `created`, `updated`, `deleted`, etc.
 * - Model-specific events: `User.created`, `Post.deleted`, etc.
 *
 * @example
 * const dispatcher = EventDispatcher.getInstance()
 *
 * dispatcher.listen('User.created', async (event) => {
 *   console.log(`User created: ${event.model}`)
 * })
 *
 * dispatcher.dispatch({
 *   type: 'created',
 *   model: new User({ name: 'Alice' }),
 * })
 */
export class EventDispatcher {
  private static instance: EventDispatcher
  private listeners: Map<string, EventListener[]> = new Map()

  /**
   * Get the singleton instance of the event dispatcher.
   *
   * @returns The singleton `EventDispatcher` instance.
   */
  static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher()
    }
    return EventDispatcher.instance
  }

  /**
   * Register a listener for a given event type.
   *
   * @param event - The name of the event (e.g., `created`, `User.updated`)
   * @param listener - The listener function to call when the event is dispatched.
   *
   * @example
   * dispatcher.listen('Post.deleted', (event) => { ... })
   */
  listen(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  /**
   * Dispatch an event to all registered listeners.
   *
   * Listeners are executed in the order they were registered. Both global and model-specific listeners will be triggered.
   *
   * @param event - The model event to dispatch.
   *
   * @example
   * dispatcher.dispatch({
   *   type: 'deleted',
   *   model: postInstance
   * })
   */
  async dispatch(event: ModelEvent): Promise<void> {
    const eventListeners = this.listeners.get(event.type) || []
    const modelListeners = this.listeners.get(`${event.model.constructor.name}.${event.type}`) || []

    const allListeners = [...eventListeners, ...modelListeners]

    for (const listener of allListeners) {
      await listener(event)
    }
  }

  /**
   * Remove a specific listener for a given event.
   *
   * @param event - The name of the event.
   * @param listener - The listener function to remove.
   *
   * @example
   * dispatcher.removeListener('User.created', myListener)
   */
  removeListener(event: string, listener: EventListener): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * Remove all listeners for a specific event or all events entirely.
   *
   * @param event - (Optional) The name of the event. If omitted, all listeners for all events will be removed.
   *
   * @example
   * dispatcher.removeAllListeners('User.deleted')
   * dispatcher.removeAllListeners() // clears everything
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}
