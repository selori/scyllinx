---
title: ModelFactory
---

# ModelFactory








## ModelFactory


Factory class to generate model instances, raw data, or persist records.





## factory


Shortcut to retrieve a defined factory for a model.





## defineFactory


Shortcut to define a new factory.





## state


Define a named state with specific overrides.


### Parameters

| Name | Description |
|------|-------------|
| `name` | State identifier |
| `definition` | Partial overrides or function to generate them |





## as


Apply a named state to the factory.





## times


Specify how many instances to create or make.





## create


Persist multiple model instances.


### Parameters

| Name | Description |
|------|-------------|
| `overrides` | Attribute overrides for generation. |




  `returns` — Array of persisted model instances.



## createOne


Persist and return a single model instance.





## make


Build model instances without saving.





## raw


Generate raw attribute data without Model wrapping.





## generateAttributes


Internal: combine definition, states, and overrides, resolving functions.





## clone


Clone this factory with existing states.





## define


Register a factory definition under a model name.


### Parameters

| Name | Description |
|------|-------------|
| `modelName` | Unique key matching ModelRegistry. |
| `definition` | Default attribute definitions. |




  `returns` — The defined factory instance.



## for


Retrieve a cloned factory for a model.


### Parameters

| Name | Description |
|------|-------------|
| `modelName` | Key of the registered factory. |




  `returns` — A fresh factory instance.



