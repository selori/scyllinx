---
title: HasMany
---

# HasMany








## HasMany


Represents a one-to-many relationship where the parent model has multiple related models.
The foreign key is stored on the related model&#x27;s table.





## addConstraints


Adds constraints to the relationship query.
Filters the related models by the foreign key matching the parent&#x27;s local key.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query builder to add constraints to |

### Example

```typescript
// For User hasMany Posts relationship
// Adds: WHERE posts.user_id = ?
```



  `returns` — Modified query builder with relationship constraints



## getResults


Gets the relationship results.
Returns an array of all related model instances.




  `returns` — Promise resolving to array of related models



## create


Creates a new related model and associates it with the parent.
Sets the foreign key on the new model to link it to the parent.


### Parameters

| Name | Description |
|------|-------------|
| `attributes` | Attributes for the new related model |

### Example

```typescript
const user = await User.find(1);
const post = await user.postsRelation().create({
  title: 'My New Post',
  content: 'This is the content of my post...',
  status: 'published'
});

console.log(post.user_id); // Will be set to user.id
```



  `returns` — Promise resolving to the created model



## createMany


Creates multiple related models in a batch operation.
Each model will be associated with the parent via the foreign key.


### Parameters

| Name | Description |
|------|-------------|
| `records` | Array of attribute objects for the new models |

### Example

```typescript
const user = await User.find(1);
const posts = await user.postsRelation().createMany([
  { title: 'Post 1', content: 'Content 1' },
  { title: 'Post 2', content: 'Content 2' },
  { title: 'Post 3', content: 'Content 3' }
]);

console.log(`Created ${posts.length} posts`);
```



  `returns` — Promise resolving to array of created models



## save


Saves an existing related model and associates it with the parent.
Updates the foreign key on the model to link it to the parent.


### Parameters

| Name | Description |
|------|-------------|
| `model` | Related model instance to save |

### Example

```typescript
const user = await User.find(1);
const post = new Post();
post.title = 'New Post';
post.content = 'Post content';

await user.postsRelation().save(post);
console.log(post.user_id); // Will be set to user.id
```



  `returns` — Promise resolving to the saved model



## saveMany


Saves multiple existing models and associates them with the parent.


### Parameters

| Name | Description |
|------|-------------|
| `models` | Array of related model instances to save |

### Example

```typescript
const user = await User.find(1);
const posts = [post1, post2, post3];

await user.postsRelation().saveMany(posts);
// All posts will have their user_id set to user.id
```



  `returns` — Promise resolving to array of saved models



## find


Finds a related model by its ID.
Applies relationship constraints to ensure the model belongs to the parent.


### Parameters

| Name | Description |
|------|-------------|
| `id` | ID of the related model to find |

### Example

```typescript
const user = await User.find(1);
const post = await user.postsRelation().find(123);

if (post) {
  console.log(`Found post: ${post.title}`);
}
```



  `returns` — Promise resolving to the found model or null



## update


Updates all related models matching the relationship constraints.


### Parameters

| Name | Description |
|------|-------------|
| `attributes` | Attributes to update |

### Example

```typescript
const user = await User.find(1);
const updated = await user.postsRelation().update({
  status: 'archived'
});

console.log(`Updated ${updated} posts`);
```



  `returns` — Promise resolving to number of updated records



## delete


Deletes all related models matching the relationship constraints.




  `returns` — Promise resolving to number of deleted records



