---
title: Seeder
---

# Seeder








## SeederRunner







## Seeder


Base class for database seeders.
Extend this class and implement the &#x60;run()&#x60; method to insert or manipulate data.





## SeederRunner


Manages and runs registered seeders.





## connection


Underlying database connection





## call


Invoke another seeder from within this seeder.


### Parameters

| Name | Description |
|------|-------------|
| `SeederClass` | The seeder class to call. |

### Example

```typescript
// Within a seeder:
await this.call(OtherSeeder)
```




## factory


Access a model factory for generating test data.


### Parameters

| Name | Description |
|------|-------------|
| `factory` | A function returning the factory instance |

### Example

```typescript
// Get the Post factory:
const postFactory = this.factory(() => Post.factory())
const posts = postFactory.makeMany(5)
```



  `returns` — The factory instance



## truncate


Truncate (empty) the given table.


### Parameters

| Name | Description |
|------|-------------|
| `tableName` | Name of the table to truncate. |

### Example

```typescript
// Clear the comments table:
await this.truncate("comments")
```



  `returns` — Promise that resolves when truncation is complete.



## seeders


Internal list of registered seeder classes





## register


Register a seeder class to be run later.


### Parameters

| Name | Description |
|------|-------------|
| `seederClass` | Seeder class constructor. |





## run


Run all registered seeders, or a provided list.


### Parameters

| Name | Description |
|------|-------------|
| `seeders` | Optional array of seeder classes to run instead of all registered. |




  `returns` — Promise that resolves when all runs complete.



## runOne


Run a single seeder class.


### Parameters

| Name | Description |
|------|-------------|
| `seederClass` | The seeder class to execute. |




  `returns` — Promise that resolves when the run completes.



