---
title: Model
---

# Model



Creates a new Model instance.


### Parameters

| Name | Description |
|------|-------------|
| `attributes` | Initial attributes for the model |
| `forceFill` | Whether to bypass fillable restrictions |

### Example

```typescript
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
}

class User extends Model<UserAttributes> {
  protected static table = 'users';
  protected static primaryKey = 'id';
  protected static fillable = ['name', 'email'];

  // Define relationships
  posts() {
    return this.hasMany(Post);
  }

  profile() {
    return this.hasOne(Profile);
  }
}

// Usage
const user = await User.create({ name: 'John', email: 'john@example.com' });
const posts = await user.posts().get();
```




## Model


Base Model class implementing Active Record pattern for ScyllinX ORM.
Provides CRUD operations, relationships, attribute management, and ScyllaDB-specific features.





## attributes


Current attribute values





## original


Original attribute values from database





## changes


Changed attributes since last sync





## exists


Whether this model exists in the database





## wasRecentlyCreated


Whether this model was recently created





## defineAccessor


Defines a property accessor for an attribute.
Allows direct property access to model attributes.


### Parameters

| Name | Description |
|------|-------------|
| `key` | The attribute key to define accessor for |

### Example

```typescript
// Internal usage - creates property accessors
user.name = 'John'; // Calls setAttribute internally
console.log(user.name); // Calls getAttribute internally
```




## save


Saves the model to the database.
Handles both creating new records and updating existing ones.




  `returns` — Promise resolving to true if save was successful



## update


Updates the model with new attributes and saves to database.


### Parameters

| Name | Description |
|------|-------------|
| `attributes` | Attributes to update |

### Example

```typescript
const user = await User.find('123');
await user.update({ name: 'Jane Doe', email: 'jane@example.com' });
```



  `returns` — Promise resolving to true if update was successful



## delete


Deletes the model from the database.




  `returns` — Promise resolving to true if deletion was successful



## refresh


Refreshes the model from the database.
Reloads all attributes from the database, discarding any unsaved changes.




  `returns` — Promise resolving to the refreshed model instance



## replicate


Create an in-memory copy of this model, excluding its primary key,
and apply any attribute overrides. Does NOT persist to the database
until you call &#x60;save()&#x60; on the returned instance.


### Parameters

| Name | Description |
|------|-------------|
| `overrides` | — Attributes to override on the replica. |

### Example

```typescript
```ts
const user = await User.find('user-id-123');
// Clone with a new email
const newUser = user.replicate({
  email: 'new-email@example.com'
});
await newUser.save(); // Inserts as a new record
```
```



  `returnsthis` — A new model instance with copied attributes (primary key removed) and overrides applied.



## fill


Fills the model with attributes, respecting fillable/guarded rules.


### Parameters

| Name | Description |
|------|-------------|
| `attributes` | Attributes to fill |

### Example

```typescript
const user = new User();
user.fill({ name: 'John', email: 'john@example.com' });
// Only fillable attributes are set
```



  `returns` — The model instance with filled attributes



## forceFill


Fills the model with attributes, bypassing fillable/guarded rules.


### Parameters

| Name | Description |
|------|-------------|
| `attributes` | Attributes to fill |

### Example

```typescript
const user = new User();
user.forceFill({ id: '123', name: 'John', admin: true });
// All attributes are set, including guarded ones
```



  `returns` — The model instance with filled attributes



## touch


Update this model&#x27;s &#x60;updated_at&#x60; timestamp (and optionally touch related models).


### Parameters

| Name | Description |
|------|-------------|
| `relations` | Names of relations to touch after updating this model. |

### Example

```typescript
```ts
const user = await User.find('abc');
await user.touch();

// Also update timestamps on all related posts and comments
await user.touch(['posts', 'comments']);
```
```



  `returnsPromise.&lt;this&gt;` — Resolves to this model instance.



## getAttribute


Gets an attribute value from the model.
Applies mutators and casts if defined.


### Parameters

| Name | Description |
|------|-------------|
| `key` | The attribute key to get |

### Example

```typescript
const user = new User({ name: 'John' });
const name = user.getAttribute('name'); // 'John'
```



  `returns` — The attribute value



## setAttribute


Sets an attribute value on the model.
Applies mutators and tracks changes.


### Parameters

| Name | Description |
|------|-------------|
| `key` | The attribute key to set |
| `value` | The value to set |

### Example

```typescript
const user = new User();
user.setAttribute('name', 'John');
user.setAttribute('email', 'john@example.com');
```



  `returns` — The model instance



## getKey


Gets the model&#x27;s primary key value.




  `returns` — The primary key value



## getKeyName


Gets the primary key column name.




  `returns` — The primary key column name



## getTable


Gets the table name for this model.




  `returns` — The table name



## getConnection


Gets the database connection name for this model.




  `returns` — The connection name or undefined for default



## isDirty


Checks if the model has unsaved changes.


### Parameters

| Name | Description |
|------|-------------|
| `attributes` | Optional specific attributes to check |

### Example

```typescript
const user = await User.find('123');
user.name = 'New Name';
console.log(user.isDirty()); // true
console.log(user.isDirty(['email'])); // false
```



  `returns` — True if model has unsaved changes



## getDirty


Gets the dirty (changed) attributes.




  `returns` — Object containing changed attributes



## setAttributes


Sets the model&#x27;s attributes directly (internal use).


### Parameters

| Name | Description |
|------|-------------|
| `attrs` | Attributes to set |

### Example

```typescript
// Internal usage in hydration
model.setAttributes({ id: '123', name: 'John' });
```




## setExists


Sets the model&#x27;s existence state (internal use).


### Parameters

| Name | Description |
|------|-------------|
| `exists` | Whether the model exists in database |

### Example

```typescript
// Internal usage in hydration
model.setExists(true);
```




## setOriginal


Sets the model&#x27;s original attributes (internal use).


### Parameters

| Name | Description |
|------|-------------|
| `attrs` | Original attributes to set |

### Example

```typescript
// Internal usage in hydration
model.setOriginal({ id: '123', name: 'John' });
```




## getOriginal


Returns the original value of an attribute, or all original attributes if no key is given.


### Parameters

| Name | Description |
|------|-------------|
| `key` | (Optional) The attribute key to get the original value of |

### Example

```typescript
const user = await User.find('123');
user.name = 'Updated';
console.log(user.getOriginal('name')); // 'Old Name'
console.log(user.getOriginal()); // { id: '123', name: 'Old Name', ... }
```



  `returns` — The original value of the attribute, or all original attributes



## toObject


Converts the model to a plain object.
Applies visibility rules (hidden/visible attributes).




  `returns` — Plain object representation of the model



## toJSON


Converts the model to JSON string.




  `returns` — JSON string representation of the model



## newQuery


Creates a new query builder for this model instance.




  `returns` — QueryBuilder instance



## performInsert


Performs database insert operation.


### Parameters

| Name | Description |
|------|-------------|
| `query` | QueryBuilder instance |




  `returns` — Promise that resolves when insert is complete



## performUpdate


Performs database update operation.


### Parameters

| Name | Description |
|------|-------------|
| `query` | QueryBuilder instance |




  `returns` — Promise that resolves when update is complete



## performDeleteOnModel


Performs database delete operation.




  `returns` — Promise that resolves when delete is complete



## getAttributesForInsert


Gets attributes prepared for database insertion.




  `returns` — Attributes object for insertion



## updateTimestamps


Updates timestamp attributes.





## getTimestamps


Checks if timestamps are enabled for this model.




  `returns` — True if timestamps are enabled



## getFillable


Gets the fillable attributes list.




  `returns` — Array of fillable attribute names



## getGuarded


Gets the guarded attributes list.




  `returns` — Array of guarded attribute names



## getHidden


Gets the hidden attributes list.




  `returns` — Array of hidden attribute names



## getVisible


Gets the visible attributes list.




  `returns` — Array of visible attribute names



## getCasts


Gets the attribute casting definitions.




  `returns` — Object mapping attribute names to cast types



## getScopes


Gets the query scopes defined on this model.




  `returns` — Object mapping scope names to functions



## isFillable


Checks if an attribute is fillable.


### Parameters

| Name | Description |
|------|-------------|
| `key` | Attribute name to check |




  `returns` — True if attribute is fillable



## hasCast


Checks if an attribute has a cast defined.


### Parameters

| Name | Description |
|------|-------------|
| `key` | Attribute name to check |




  `returns` — True if attribute has a cast



## castAttribute


Casts an attribute value to the specified type.


### Parameters

| Name | Description |
|------|-------------|
| `key` | Attribute name |
| `value` | Value to cast |




  `returns` — Casted value



## castAttributeAsJson


Casts an attribute value for JSON storage.


### Parameters

| Name | Description |
|------|-------------|
| `key` | Attribute name |
| `value` | Value to cast |




  `returns` — Casted value for storage



## hasGetMutator


Checks if an attribute has a getter mutator.


### Parameters

| Name | Description |
|------|-------------|
| `key` | Attribute name to check |




  `returns` — True if getter mutator exists



## hasSetMutator


Checks if an attribute has a setter mutator.


### Parameters

| Name | Description |
|------|-------------|
| `key` | Attribute name to check |




  `returns` — True if setter mutator exists



## mutateAttribute


Applies a getter mutator to an attribute value.


### Parameters

| Name | Description |
|------|-------------|
| `key` | Attribute name |
| `value` | Value to mutate |




  `returns` — Mutated value



## mutateAttributeForArray


Applies a setter mutator to an attribute value.


### Parameters

| Name | Description |
|------|-------------|
| `key` | Attribute name |
| `value` | Value to mutate |




  `returns` — Mutated value



## studly


Converts a string to StudlyCase.


### Parameters

| Name | Description |
|------|-------------|
| `str` | String to convert |




  `returns` — StudlyCase string



## fireModelEvent


Fires a model event.


### Parameters

| Name | Description |
|------|-------------|
| `event` | Event name to fire |




  `returns` — Promise resolving to event result



## finishSave


Finalizes the save operation by syncing state.





## getPartitionKeys


Gets partition keys for ScyllaDB.




  `returns` — Array of partition key column names



## getClusteringKeys


Gets clustering keys for ScyllaDB.




  `returns` — Array of clustering key column names



## getKeyspace


Gets keyspace for ScyllaDB.




  `returns` — Keyspace name or undefined



## withTTL


Sets TTL for ScyllaDB operations.


### Parameters

| Name | Description |
|------|-------------|
| `seconds` | TTL in seconds |

### Example

```typescript
const user = new User();
await user.withTTL(3600).save(); // Expires in 1 hour
```



  `returns` — QueryBuilder with TTL set



## ifNotExists


Uses IF NOT EXISTS for ScyllaDB operations.




  `returns` — QueryBuilder with IF NOT EXISTS set



## load


Lazy loads relationships on this model instance.


### Parameters

| Name | Description |
|------|-------------|
| `relations` | Relationship names to load |

### Example

```typescript
const user = await User.find('123');
await user.load('posts', 'profile');
console.log(user.posts); // Now loaded
```



  `returns` — Promise resolving to this model with loaded relationships



## hasOne


Defines a one-to-one relationship.


### Parameters

| Name | Description |
|------|-------------|
| `related` | Related model class |
| `foreignKey` | Foreign key column name |
| `localKey` | Local key column name |

### Example

```typescript
class User extends Model {
  profile() {
    return this.hasOne(Profile, 'user_id', 'id');
  }
}
```



  `returns` — HasOne relationship instance



## hasMany


Defines a one-to-many relationship.


### Parameters

| Name | Description |
|------|-------------|
| `related` | Related model class |
| `foreignKey` | Foreign key column name |
| `localKey` | Local key column name |

### Example

```typescript
class User extends Model {
  posts() {
    return this.hasMany(Post, 'user_id', 'id');
  }
}
```



  `returns` — HasMany relationship instance



## belongsTo


Defines an inverse one-to-one or one-to-many relationship.


### Parameters

| Name | Description |
|------|-------------|
| `related` | Related model class |
| `foreignKey` | Foreign key column name |
| `ownerKey` | Owner key column name |

### Example

```typescript
class Post extends Model {
  user() {
    return this.belongsTo(User, 'user_id', 'id');
  }
}
```



  `returns` — BelongsTo relationship instance



## belongsToMany


Defines a many-to-many relationship.


### Parameters

| Name | Description |
|------|-------------|
| `related` | Related model class |
| `pivotTable` | Pivot table name |
| `foreignPivotKey` | Foreign pivot key column name |
| `relatedPivotKey` | Related pivot key column name |
| `parentKey` | Parent key column name |
| `relatedKey` | Related key column name |

### Example

```typescript
class User extends Model {
  roles() {
    return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
  }
}
```



  `returns` — BelongsToMany relationship instance



## morphOne


Defines a polymorphic one-to-one relationship.


### Parameters

| Name | Description |
|------|-------------|
| `related` | Related model class |
| `name` | Morph name |
| `type` | Morph type column name |
| `id` | Morph ID column name |
| `localKey` | Local key column name |

### Example

```typescript
class User extends Model {
  avatar() {
    return this.morphOne(Image, 'imageable');
  }
}
```



  `returns` — MorphOne relationship instance



## morphMany


Defines a polymorphic one-to-many relationship.


### Parameters

| Name | Description |
|------|-------------|
| `related` | Related model class |
| `name` | Morph name |
| `type` | Morph type column name |
| `id` | Morph ID column name |
| `localKey` | Local key column name |

### Example

```typescript
class Post extends Model {
  comments() {
    return this.morphMany(Comment, 'commentable');
  }
}
```



  `returns` — MorphMany relationship instance



## morphTo


Defines a polymorphic belongs-to relationship.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Morph name |
| `type` | Morph type column name |
| `id` | Morph ID column name |
| `ownerKey` | Owner key column name |

### Example

```typescript
class Comment extends Model {
  commentable() {
    return this.morphTo('commentable');
  }
}
```



  `returns` — MorphTo relationship instance



## primaryKey


The primary key column name





## partitionKeys


ScyllaDB partition key columns





## clusteringKeys


ScyllaDB clustering key columns





## fillable


Attributes that are mass assignable





## guarded


Attributes that are not mass assignable





## hidden


Attributes that should be hidden from serialization





## visible


Attributes that should be visible in serialization





## casts


Attribute casting definitions





## dates


Date attribute names





## timestamps


Whether to automatically manage timestamps





## softDeletes


Whether to use soft deletes





## scopes


Query scopes defined on this model





## custom


Custom inspect method for better debugging output.




  `returns` — Object representation for debugging



## query


Creates a new query builder for the model.
Entry point for all database queries on this model.


### Parameters

| Name | Description |
|------|-------------|
| `this` | The model class (static context) |

### Example

```typescript
const activeUsers = await User.query().where('status', 'active').get();
const user = await User.query().where('id', '123').first();
const count = await User.query().count();
```



  `returns` — QueryBuilder instance configured for this model



## find


Finds a model by its primary key.


### Parameters

| Name | Description |
|------|-------------|
| `this` | The model class (static context) |
| `id` | The primary key value to search for |

### Example

```typescript
const user = await User.find('123');
if (user) {
  console.log(user.name);
}

const nonExistent = await User.find('999'); // Returns null
```



  `returns` — Promise resolving to model instance or null if not found



## findOrFail


Finds a model by its primary key or throws an exception.


### Parameters

| Name | Description |
|------|-------------|
| `this` | The model class (static context) |
| `id` | The primary key value to search for |

### Example

```typescript
try {
  const user = await User.findOrFail('123');
  console.log(user.name);
} catch (error) {
  console.log('User not found');
}
```



  `returns` — Promise resolving to model instance



## create


Creates a new model instance and saves it to the database.


### Parameters

| Name | Description |
|------|-------------|
| `this` | The model class (static context) |
| `attrs` | Attributes for the new model |

### Example

```typescript
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com'
});
console.log(user.id); // Auto-generated ID
```



  `returns` — Promise resolving to the created model instance



## createMany


Creates multiple records in bulk.

For each attribute set in &#x60;items&#x60;, a new model instance is created (bypassing fillable),
saved to the database, and collected into an array.


### Parameters

| Name | Description |
|------|-------------|
| `items` | Array of attribute objects to insert. |

### Example

```typescript
// Create multiple users at once
const users = await User.createMany([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' }
]);

console.log(`Created ${users.length} users`);
```



  `returns` — - Resolves with an array of newly created model instances.



## all


Retrieves all models from the database.


### Parameters

| Name | Description |
|------|-------------|
| `this` | The model class (static context) |

### Example

```typescript
const allUsers = await User.all();
console.log(`Found ${allUsers.length} users`);
```



  `returns` — Promise resolving to array of model instances



## first


Gets the first model matching the query.


### Parameters

| Name | Description |
|------|-------------|
| `this` | The model class (static context) |

### Example

```typescript
const firstUser = await User.first();
if (firstUser) {
  console.log('First user:', firstUser.name);
}
```



  `returns` — Promise resolving to first model instance or null



## updateOrCreate


Updates an existing model or creates a new one.


### Parameters

| Name | Description |
|------|-------------|
| `this` | The model class (static context) |
| `attributes` | Attributes to search by |
| `values` | Values to update or create with |

### Example

```typescript
const user = await User.updateOrCreate(
  { email: 'john@example.com' },
  { name: 'John Doe', status: 'active' }
);
```



  `returns` — Promise resolving to the model instance



