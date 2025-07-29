---
title: ModelObserver
---

# ModelObserver








## ObserverRegistry







## ModelObserver


The &#x60;ModelObserver&#x60; class allows you to listen to lifecycle events
of a model (e.g., created, updated, deleted).

To observe a model, create a class extending &#x60;ModelObserver&#x60; and
implement the lifecycle hooks you want to listen to.

Each method receives the affected model instance as an argument,
and can be either synchronous or asynchronous.





## ObserverRegistry


Singleton class that manages the registration and notification of model observers.

The &#x60;ObserverRegistry&#x60; holds a map of model names to their observers.
It allows observers to be registered and dispatches lifecycle events to them.





## creating


Called before a model is created.





## created


Called after a model has been created.





## updating


Called before a model is updated.





## updated


Called after a model has been updated.





## saving


Called before a model is saved (either create or update).





## saved


Called after a model has been saved (either create or update).





## deleting


Called before a model is deleted.





## deleted


Called after a model has been deleted.





## restoring


Called before a soft-deleted model is restored.





## restored


Called after a soft-deleted model has been restored.





## register


Registers an observer for a specific model.


### Parameters

| Name | Description |
|------|-------------|
| `modelName` | The name of the model (e.g., &#x60;&#x27;User&#x27;&#x60;) |
| `observer` | An instance of a class extending &#x60;ModelObserver&#x60; |

### Example

```typescript
ObserverRegistry.getInstance().register('Post', new PostObserver())
```




## notify


Notifies all registered observers of a given model event.

This method is internally called by the ORM during model lifecycle changes.


### Parameters

| Name | Description |
|------|-------------|
| `event` | The model event object, containing the model and event type |





## getInstance


Returns the singleton instance of the &#x60;ObserverRegistry&#x60;.





