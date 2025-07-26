---
title: HasOne
---

# HasOne








## HasOne


Represents a one-to-one relationship where the parent model has one related model.
The foreign key is stored on the related model&#x27;s table.





## addConstraints


Adds constraints to the relationship query.
Filters the related model by the foreign key matching the parent&#x27;s local key.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query builder to add constraints to |

### Example

```typescript
// For User hasOne Profile relationship
// Adds: WHERE profiles.user_id = ?
```



  `returns` — Modified query builder with relationship constraints



## getResults


Gets the relationship results.
Returns a single related model instance or null if none exists.




  `returns` — Promise resolving to related model or null



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
const profile = await user.profileRelation().create({
  bio: 'Full-stack developer',
  website: 'https://example.com',
  location: 'San Francisco'
});

console.log(profile.user_id); // Will be set to user.id
```



  `returns` — Promise resolving to the created model



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
const profile = new Profile();
profile.bio = 'New bio';

await user.profileRelation().save(profile);
console.log(profile.user_id); // Will be set to user.id
```



  `returns` — Promise resolving to the saved model



## associate


Associates an existing model with the parent without saving.
Sets the foreign key on the model but doesn&#x27;t persist the change.


### Parameters

| Name | Description |
|------|-------------|
| `model` | Related model instance to associate |

### Example

```typescript
const user = await User.find(1);
const profile = await Profile.find(5);

user.profileRelation().associate(profile);
console.log(profile.user_id); // Will be set to user.id

// Remember to save the profile to persist the association
await profile.save();
```



  `returns` — The associated model



## dissociate


Dissociates the related model from the parent.
Sets the foreign key to null and saves the change.




  `returns` — Promise that resolves when dissociation is complete



