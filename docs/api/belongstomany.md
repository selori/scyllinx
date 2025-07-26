---
title: BelongsToMany
---

# BelongsToMany



Creates a new BelongsToMany relationship instance.


### Parameters

| Name | Description |
|------|-------------|
| `parent` | Parent model instance |
| `related` | Related model constructor |
| `pivotTable` | Name of the pivot table |
| `foreignKey` | Foreign key for parent in pivot table |
| `relatedKey` | Foreign key for related model in pivot table |
| `parentKey` | Local key on parent model |
| `relatedPivotKey` | Local key on related model |

### Example

```typescript
// In User model
rolesRelation(): BelongsToMany<User, Role> {
  return new BelongsToMany(
    this,
    Role,
    'user_roles',    // pivot table
    'user_id',       // foreign key for parent
    'role_id',       // foreign key for related
    'id',            // parent key
    'id'             // related key
  );
}

// Usage
const user = await User.find(1);
const roles = await user.rolesRelation().getResults();

// Attach roles
await user.rolesRelation().attach([1, 2, 3]);

// With pivot data
await user.rolesRelation().attach(1, { assigned_at: new Date() });
```




## BelongsToMany


Represents a many-to-many relationship between two models.
Uses a pivot table to store the relationship data between the two models.
Supports additional pivot columns and constraints.





## addConstraints


Adds constraints to the relationship query.
For SQL databases, uses JOIN to connect through pivot table.
For ScyllaDB, uses separate queries due to limited JOIN support.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query builder to add constraints to |




  `returns` — Modified query builder with relationship constraints



## getResults


Gets the relationship results.
Handles both SQL and NoSQL database approaches for many-to-many relationships.




  `returns` — Promise resolving to array of related models with pivot data



## attach


Attaches related models to the parent through the pivot table.


### Parameters

| Name | Description |
|------|-------------|
| `ids` | ID or array of IDs to attach |
| `attributes` | Additional pivot table attributes |

### Example

```typescript
const user = await User.find(1);

// Attach single role
await user.rolesRelation().attach(1);

// Attach multiple roles
await user.rolesRelation().attach([1, 2, 3]);

// Attach with pivot data
await user.rolesRelation().attach(1, {
  assigned_at: new Date(),
  assigned_by: 'admin'
});
```



  `returns` — Promise that resolves when attachment is complete



## detach


Detaches related models from the parent by removing pivot table records.


### Parameters

| Name | Description |
|------|-------------|
| `ids` | Optional ID or array of IDs to detach. If not provided, detaches all |

### Example

```typescript
const user = await User.find(1);

// Detach specific roles
await user.rolesRelation().detach([1, 2]);

// Detach all roles
await user.rolesRelation().detach();
```



  `returns` — Promise resolving to number of detached records



## sync


Synchronizes the relationship to match the given array of IDs.
Attaches missing relationships and optionally detaches extra ones.


### Parameters

| Name | Description |
|------|-------------|
| `ids` | Array of IDs that should be attached |
| `detaching` | Whether to detach IDs not in the array (default: true) |

### Example

```typescript
const user = await User.find(1);

// Sync to specific roles (detaches others)
const result = await user.rolesRelation().sync([1, 2, 3]);
console.log(`Attached: ${result.attached.length}`);
console.log(`Detached: ${result.detached.length}`);

// Sync without detaching
await user.rolesRelation().sync([4, 5], false);
```



  `returns` — Promise resolving to sync results with attached/detached arrays



## toggle


Toggles the attachment of related models.
Attaches if not currently attached, detaches if currently attached.


### Parameters

| Name | Description |
|------|-------------|
| `ids` | ID or array of IDs to toggle |

### Example

```typescript
const user = await User.find(1);

// Toggle roles - attach if not attached, detach if attached
const result = await user.rolesRelation().toggle([1, 2, 3]);
console.log(`Attached: ${result.attached}`);
console.log(`Detached: ${result.detached}`);
```



  `returns` — Promise resolving to toggle results with attached/detached arrays



## updateExistingPivot


Updates existing pivot table records for a specific related model.


### Parameters

| Name | Description |
|------|-------------|
| `id` | ID of the related model |
| `attributes` | Attributes to update in the pivot table |

### Example

```typescript
const user = await User.find(1);

// Update pivot data for a specific role
await user.rolesRelation().updateExistingPivot(1, {
  updated_at: new Date(),
  notes: 'Role permissions updated'
});
```



  `returns` — Promise resolving to number of updated records



## withPivot


Specifies additional pivot table columns to include in query results.


### Parameters

| Name | Description |
|------|-------------|
| `columns` | Pivot column names to include |

### Example

```typescript
const user = await User.find(1);
const roles = await user.rolesRelation()
  .withPivot('assigned_at', 'assigned_by')
  .getResults();

roles.forEach(role => {
  console.log(`Assigned at: ${role.pivot.assigned_at}`);
  console.log(`Assigned by: ${role.pivot.assigned_by}`);
});
```



  `returns` — This relationship instance for method chaining



## wherePivot


Adds a WHERE constraint on pivot table columns.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Pivot column name |
| `operator` | Comparison operator or value if using 2-param form |
| `value` | Value to compare against |

### Example

```typescript
const user = await User.find(1);
const activeRoles = await user.rolesRelation()
  .wherePivot('status', 'active')
  .wherePivot('assigned_at', '>', lastWeek)
  .getResults();
```



  `returns` — This relationship instance for method chaining



## wherePivotIn


Adds a WHERE IN constraint on pivot table columns.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Pivot column name |
| `values` | Array of values to match against |

### Example

```typescript
const user = await User.find(1);
const roles = await user.rolesRelation()
  .wherePivotIn('status', ['active', 'pending'])
  .getResults();
```



  `returns` — This relationship instance for method chaining



## getPivotColumns


Gets the pivot table columns to select with proper aliasing.




  `returns` — Array of pivot column select statements



## newPivotQuery


Creates a new query builder for the pivot table.




  `returns` — QueryBuilder instance for pivot table operations



## getRelatedTable


Gets the related model&#x27;s table name.




  `returns` — Related model table name



