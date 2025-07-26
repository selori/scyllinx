---
title: ModelRegistry
---

# ModelRegistry








## ModelRegistry


Registry for managing model classes and their aliases.
Provides centralized model registration and retrieval with support for aliases and auto-discovery.





## models


Map of model names to model classes





## aliases


Map of aliases to model names





## register


Registers a model class with optional aliases.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Primary name for the model |
| `modelClass` | Model class constructor |
| `aliases` | Optional array of alias names |

### Example

```typescript
registry.register('User', User, ['user', 'users'])
  .register('Post', Post, ['post', 'posts'])
  .register('Comment', Comment);
```



  `returns` — This registry instance for chaining



## get


Retrieves a model class by name or alias.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Model name or alias |

### Example

```typescript
const User = registry.get<UserAttributes, User>('User');
const user = new User({ name: 'John' });

// Using alias
const SameUser = registry.get('users');
```



  `returns` — Model class constructor



## has


Checks if a model is registered.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Model name or alias to check |

### Example

```typescript
if (registry.has('User')) {
  console.log('User model is registered');
}

if (registry.has('users')) {
  console.log('User model found by alias');
}
```



  `returns` — True if model exists in registry



## all


Gets all registered models.




  `returns` — Map of model names to model classes



## getModelNames


Gets all registered model names.




  `returns` — Array of model names



## autoDiscover


Auto-discovers models in a directory.
Note: This is a placeholder implementation for future enhancement.


### Parameters

| Name | Description |
|------|-------------|
| `directory` | Directory path to scan for models |

### Example

```typescript
registry.autoDiscover('./app/Models');
```




## pluralize


Converts a singular word to plural form.
Simple pluralization rules for English words.


### Parameters

| Name | Description |
|------|-------------|
| `word` | Word to pluralize |

### Example

```typescript
pluralize('user') // 'users'
pluralize('category') // 'categories'
pluralize('box') // 'boxes'
```



  `returns` — Pluralized word



## getInstance


Gets the singleton instance of ModelRegistry.




  `returns` — The ModelRegistry instance



