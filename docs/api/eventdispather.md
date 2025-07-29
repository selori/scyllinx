---
title: EventDispatcher
---

# EventDispatcher








## EventDispatcher


A singleton event dispatcher for managing custom and model-specific event listeners.

Allows you to register, dispatch, and remove event listeners for global or model-specific events.

- Global events: &#x60;created&#x60;, &#x60;updated&#x60;, &#x60;deleted&#x60;, etc.
- Model-specific events: &#x60;User.created&#x60;, &#x60;Post.deleted&#x60;, etc.





## listen


Register a listener for a given event type.


### Parameters

| Name | Description |
|------|-------------|
| `event` | The name of the event (e.g., &#x60;created&#x60;, &#x60;User.updated&#x60;) |
| `listener` | The listener function to call when the event is dispatched. |

### Example

```typescript
dispatcher.listen('Post.deleted', (event) => { ... })
```




## dispatch


Dispatch an event to all registered listeners.

Listeners are executed in the order they were registered. Both global and model-specific listeners will be triggered.


### Parameters

| Name | Description |
|------|-------------|
| `event` | The model event to dispatch. |

### Example

```typescript
dispatcher.dispatch({
  type: 'deleted',
  model: postInstance
})
```




## removeListener


Remove a specific listener for a given event.


### Parameters

| Name | Description |
|------|-------------|
| `event` | The name of the event. |
| `listener` | The listener function to remove. |

### Example

```typescript
dispatcher.removeListener('User.created', myListener)
```




## removeAllListeners


Remove all listeners for a specific event or all events entirely.


### Parameters

| Name | Description |
|------|-------------|
| `event` | (Optional) The name of the event. If omitted, all listeners for all events will be removed. |

### Example

```typescript
dispatcher.removeAllListeners('User.deleted')
dispatcher.removeAllListeners() // clears everything
```




## getInstance


Get the singleton instance of the event dispatcher.




  `returns` — The singleton &#x60;EventDispatcher&#x60; instance.



