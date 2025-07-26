---
title: MorphOne
---

# MorphOne



Creates a new MorphOne relationship instance.


### Parameters

| Name | Description |
|------|-------------|
| `parent` | Parent model instance |
| `related` | Related model constructor |
| `morphType` | Column name storing the parent model type |
| `morphId` | Column name storing the parent model ID |
| `localKey` | Local key on parent model (usually primary key) |

### Example

```typescript
// In User model
imageRelation(): MorphOne<User, Image> {
  return new MorphOne(this, Image, 'imageable_type', 'imageable_id', 'id');
}

// In Post model
imageRelation(): MorphOne<Post, Image> {
  return new MorphOne(this, Image, 'imageable_type', 'imageable_id', 'id');
}

// Usage
const user = await User.find(1);
const image = await user.imageRelation().getResults();

// Create polymorphic relationship
const newImage = await user.imageRelation().create({
  url: 'avatar.jpg',
  alt_text: 'User avatar'
});
```




## MorphOne


Represents a polymorphic one-to-one relationship.
Allows a model to belong to multiple other model types through a single association.
Uses morph type and morph ID columns to identify the parent model type and ID.





## addConstraints


Adds constraints to the relationship query.
Filters by both the morph type (parent model class name) and morph ID.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query builder to add constraints to |

### Example

```typescript
// For User morphOne Image relationship
// Adds: WHERE imageable_type = 'user' AND imageable_id = ?
```



  `returns` — Modified query builder with polymorphic constraints



## getResults


Gets the relationship results.
Returns a single related model instance or null if none exists.




  `returns` — Promise resolving to related model or null



## create


Creates a new related model with polymorphic association.
Sets both the morph type and morph ID to link to the parent.


### Parameters

| Name | Description |
|------|-------------|
| `attributes` | Attributes for the new related model |

### Example

```typescript
const user = await User.find(1);
const image = await user.imageRelation().create({
  url: 'profile-pic.jpg',
  alt_text: 'User profile picture',
  size: 'large'
});

console.log(image.imageable_type); // 'user'
console.log(image.imageable_id);   // user.id
```



  `returns` — Promise resolving to the created model



## save


Saves an existing related model with polymorphic association.
Updates the morph type and morph ID to link to the parent.


### Parameters

| Name | Description |
|------|-------------|
| `model` | Related model instance to save |

### Example

```typescript
const user = await User.find(1);
const image = new Image();
image.url = 'new-avatar.jpg';

await user.imageRelation().save(image);
console.log(image.imageable_type); // 'user'
console.log(image.imageable_id);   // user.id
```



  `returns` — Promise resolving to the saved model



