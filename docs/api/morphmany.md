---
title: MorphMany
---

# MorphMany



Creates a new MorphMany relationship instance.


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
commentsRelation(): MorphMany<User, Comment> {
  return new MorphMany(this, Comment, 'commentable_type', 'commentable_id', 'id');
}

// In Post model
commentsRelation(): MorphMany<Post, Comment> {
  return new MorphMany(this, Comment, 'commentable_type', 'commentable_id', 'id');
}

// Usage
const post = await Post.find(1);
const comments = await post.commentsRelation().getResults();

// Create multiple comments
const newComments = await post.commentsRelation().createMany([
  { content: 'Great post!' },
  { content: 'Thanks for sharing!' }
]);
```




## MorphMany


Represents a polymorphic one-to-many relationship.
Allows a model to have multiple related models that can belong to different parent types.
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
// For Post morphMany Comments relationship
// Adds: WHERE commentable_type = 'post' AND commentable_id = ?
```



  `returns` — Modified query builder with polymorphic constraints



## getResults


Gets the relationship results.
Returns an array of all related model instances.




  `returns` — Promise resolving to array of related models



## create


Creates a new related model with polymorphic association.
Sets both the morph type and morph ID to link to the parent.


### Parameters

| Name | Description |
|------|-------------|
| `attributes` | Attributes for the new related model |

### Example

```typescript
const post = await Post.find(1);
const comment = await post.commentsRelation().create({
  content: 'This is a great post!',
  author_name: 'John Doe',
  author_email: 'john@example.com'
});

console.log(comment.commentable_type); // 'post'
console.log(comment.commentable_id);   // post.id
```



  `returns` — Promise resolving to the created model



## createMany


Creates multiple related models in a batch operation.
Each model will be associated with the parent via polymorphic keys.


### Parameters

| Name | Description |
|------|-------------|
| `records` | Array of attribute objects for the new models |

### Example

```typescript
const post = await Post.find(1);
const comments = await post.commentsRelation().createMany([
  { content: 'First comment', author_name: 'Alice' },
  { content: 'Second comment', author_name: 'Bob' },
  { content: 'Third comment', author_name: 'Charlie' }
]);

console.log(`Created ${comments.length} comments`);
```



  `returns` — Promise resolving to array of created models



## save


Saves an existing related model with polymorphic association.
Updates the morph type and morph ID to link to the parent.


### Parameters

| Name | Description |
|------|-------------|
| `model` | Related model instance to save |

### Example

```typescript
const post = await Post.find(1);
const comment = new Comment();
comment.content = 'New comment content';

await post.commentsRelation().save(comment);
console.log(comment.commentable_type); // 'post'
console.log(comment.commentable_id);   // post.id
```



  `returns` — Promise resolving to the saved model



## saveMany


Saves multiple existing models with polymorphic association.


### Parameters

| Name | Description |
|------|-------------|
| `models` | Array of related model instances to save |

### Example

```typescript
const post = await Post.find(1);
const comments = [comment1, comment2, comment3];

await post.commentsRelation().saveMany(comments);
// All comments will have their polymorphic keys set to post
```



  `returns` — Promise resolving to array of saved models



