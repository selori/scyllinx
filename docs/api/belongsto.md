---
title: BelongsTo
---

# BelongsTo








## BelongsTo


Represents an inverse one-to-one or one-to-many relationship.
The foreign key is stored on the parent model&#x27;s table, pointing to the related model.
This is the &quot;inverse&quot; side of HasOne and HasMany relationships.





## addConstraints


Adds constraints to the relationship query.
Filters the related model by its local key matching the parent&#x27;s foreign key value.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query builder to add constraints to |

### Example

```typescript
// For Post belongsTo User relationship
// Adds: WHERE users.id = ? (where ? is post.user_id)
```



  `returns` — Modified query builder with relationship constraints



## getResults


Gets the relationship results.
Returns a single related model instance or null if none exists.




  `returns` — Promise resolving to related model or null



## associate


Associates the parent model with a related model.
Sets the foreign key on the parent to point to the related model.
Does not save the parent model - you must call save() separately.


### Parameters

| Name | Description |
|------|-------------|
| `model` | Related model to associate with |

### Example

```typescript
const post = await Post.find(1);
const user = await User.find(2);

post.userRelation().associate(user);
await post.save(); // Don't forget to save!

console.log(post.user_id); // Will be set to user.id
```



  `returns` — The parent model for method chaining



## dissociate


Dissociates the parent model from its related model.
Sets the foreign key on the parent to null.
Does not save the parent model - you must call save() separately.




  `returns` — The parent model for method chaining



## getParentKey


Gets the foreign key value from the parent model.
Overridden for BelongsTo since the foreign key is on the parent.




  `returns` — The foreign key value from the parent model



