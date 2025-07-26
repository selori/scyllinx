---
title: MorphTo
---

# MorphTo



Creates a new MorphTo relationship instance.


### Parameters

| Name | Description |
|------|-------------|
| `parent` | Child model instance (the one with morph columns) |
| `morphType` | Column name storing the parent model type |
| `morphId` | Column name storing the parent model ID |
| `localKey` | Local key on parent models (usually primary key) |

### Example

```typescript
// In Comment model
commentable(): MorphTo<Comment, User | Post> {
  return new MorphTo(this, 'commentable_type', 'commentable_id', 'id')
    .registerModel('user', User)
    .registerModel('post', Post);
}

// Usage
const comment = await Comment.find(1);
const parent = await comment.commentable().getResults();

if (parent instanceof User) {
  console.log(`Comment on user: ${parent.name}`);
} else if (parent instanceof Post) {
  console.log(`Comment on post: ${parent.title}`);
}
```




## MorphTo


Represents a polymorphic belongs-to relationship.
Allows a model to belong to multiple different parent model types.
The inverse of MorphOne and MorphMany relationships.





## addConstraints


Adds constraints to the relationship query.
For MorphTo relationships, constraints are applied dynamically based on morph type.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query builder to add constraints to |




  `returns` — Query builder (unchanged for MorphTo)



## getResults


Gets the relationship results.
Determines the parent model type from morph type column and queries accordingly.




  `returns` — Promise resolving to parent model or null



## registerModel


Registers a model class for a specific morph type.
Required to map morph type strings to actual model classes.


### Parameters

| Name | Description |
|------|-------------|
| `type` | Morph type string (stored in morph type column) |
| `modelClass` | Model constructor for this type |

### Example

```typescript
const morphTo = new MorphTo(this, 'commentable_type', 'commentable_id', 'id')
  .registerModel('user', User)
  .registerModel('post', Post)
  .registerModel('page', Page);
```



  `returns` — This relationship instance for method chaining



## associate


Associates the child model with a parent model.
Sets both the morph type and morph ID columns.


### Parameters

| Name | Description |
|------|-------------|
| `model` | Parent model to associate with |

### Example

```typescript
const comment = new Comment();
const user = await User.find(1);

comment.commentable().associate(user);
console.log(comment.commentable_type); // 'user'
console.log(comment.commentable_id);   // user.id

await comment.save();
```



  `returns` — The child model for method chaining



## dissociate


Dissociates the child model from its parent.
Sets both morph type and morph ID columns to null.




  `returns` — The child model for method chaining



## getMorphType


Gets the morph type value from the child model.




  `returns` — The morph type string or null



## getMorphId


Gets the morph ID value from the child model.




  `returns` — The morph ID value or null



