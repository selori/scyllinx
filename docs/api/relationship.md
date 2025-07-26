---
title: Relationship
---

# Relationship



Creates a new relationship instance.


### Parameters

| Name | Description |
|------|-------------|
| `parent` | The parent model instance |
| `relatedCtor` | Constructor function for the related model |
| `foreignKey` | Foreign key column name |
| `localKey` | Local key column name (usually primary key) |

### Example

```typescript
// This is typically used internally by specific relationship classes
class CustomRelationship extends Relationship<User, Post> {
  addConstraints(query: QueryBuilder<Post, any>) {
    return query.where('user_id', this.getParentKey());
  }

  async getResults() {
    return await this.get();
  }
}
```




## Relationship


Abstract base class for all relationship types in the ORM.
Provides common functionality for defining and querying relationships between models.
All specific relationship types (HasOne, HasMany, BelongsTo, etc.) extend this class.





## related


Creates a new instance of the related model.




  `returns` — New instance of the related model



## getQuery


Creates a new query builder for the related model.
Sets up the query with the correct table and model binding.




  `returns` — QueryBuilder instance for the related model



## get


Executes the relationship query and returns all matching records.
Applies relationship constraints and enables filtering for ScyllaDB compatibility.




  `returns` — Promise resolving to array of related models



## first


Executes the relationship query and returns the first matching record.




  `returns` — Promise resolving to first related model or null



## where


Adds a WHERE clause to the relationship query.
Allows for additional filtering beyond the basic relationship constraints.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name to filter on |
| `operator` | Comparison operator (optional) |
| `value` | Value to compare against |

### Example

```typescript
const activePosts = await user.postsRelation()
  .where('status', 'published')
  .get();
```



  `returns` — QueryBuilder instance with added constraints



## with


Specifies relationships to eager load with the query results.
Enables loading nested relationships through the relationship chain.


### Parameters

| Name | Description |
|------|-------------|
| `relations` | Relationship names to eager load |

### Example

```typescript
const postsWithComments = await user.postsRelation()
  .with('comments', 'tags')
  .get();
```



  `returns` — QueryBuilder instance with eager loading configured



## getParentKey


Gets the parent model&#x27;s key value for the relationship.
Used to build relationship constraints.




  `returns` — The parent model&#x27;s local key value



## getForeignKeyName


Gets the foreign key column name.




  `returns` — Foreign key column name



## getLocalKeyName


Gets the local key column name.




  `returns` — Local key column name



