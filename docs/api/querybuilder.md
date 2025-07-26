---
title: QueryBuilder
---

# QueryBuilder



Creates a new QueryBuilder instance. haha


### Parameters

| Name | Description |
|------|-------------|
| `table` | The table name to query |
| `connection` | Optional connection name to use |

### Example

```typescript
// Basic usage
const users = await new QueryBuilder('users')
  .where('active', true)
  .orderBy('created_at', 'desc')
  .limit(10)
  .get();

// With model binding
const query = User.query()
  .where('email', 'john@example.com')
  .with('posts', 'comments');

// ScyllaDB specific
const result = await new QueryBuilder('analytics')
  .where('user_id', userId)
  .allowFiltering()
  .get();
```
```




## QueryBuilder


QueryBuilder class for building and executing database queries.
Provides a fluent interface for constructing SQL/CQL queries with support for:
- Basic CRUD operations (SELECT, INSERT, UPDATE, DELETE)
- Complex WHERE clauses and joins
- ScyllaDB-specific features (ALLOW FILTERING, TTL, lightweight transactions)
- Eager loading of relationships
- Query optimization and debugging





## setModel


Sets the model class for this query builder.
Enables model hydration and relationship loading.


### Parameters

| Name | Description |
|------|-------------|
| `model` | Model constructor function |

### Example

```typescript
const query = new QueryBuilder('users').setModel(User);
const users = await query.get(); // Returns User instances
```
```



  `returns` — QueryBuilder instance for method chaining



## select


Specifies the columns to select in the query.
Replaces any previously selected columns.


### Parameters

| Name | Description |
|------|-------------|
| `columns` | Column names to select |

### Example

```typescript
// Select specific columns
query.select('id', 'name', 'email');

// Select all columns (default)
query.select();
```
```



  `returns` — QueryBuilder instance for method chaining



## addSelect


Adds additional columns to the existing SELECT clause.


### Parameters

| Name | Description |
|------|-------------|
| `columns` | Additional column names to select |

### Example

```typescript
query.select('id', 'name')
     .addSelect('email', 'created_at');
```
```



  `returns` — QueryBuilder instance for method chaining



## whereIn


Adds a WHERE IN clause to filter by multiple values.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name to filter on |
| `values` | Array of values to match against |

### Example

```typescript
query.whereIn('status', ['active', 'pending', 'verified']);
query.whereIn('id', [1, 2, 3, 4, 5]);
```
```



  `returns` — QueryBuilder instance for method chaining



## whereNotIn


Adds a WHERE NOT IN clause to exclude multiple values.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name to filter on |
| `values` | Array of values to exclude |

### Example

```typescript
query.whereNotIn('status', ['deleted', 'banned']);
```
```



  `returns` — QueryBuilder instance for method chaining



## whereBetween


Adds a WHERE BETWEEN clause for range filtering.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name to filter on |
| `values` | Tuple of [min, max] values |

### Example

```typescript
query.whereBetween('age', [18, 65]);
query.whereBetween('created_at', [startDate, endDate]);
```
```



  `returns` — QueryBuilder instance for method chaining



## whereNull


Adds a WHERE NULL clause to filter for null values.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name to check for null |

### Example

```typescript
query.whereNull('deleted_at');
```
```



  `returns` — QueryBuilder instance for method chaining



## whereNotNull


Adds a WHERE NOT NULL clause to filter for non-null values.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name to check for non-null |

### Example

```typescript
query.whereNotNull('email_verified_at');
```
```



  `returns` — QueryBuilder instance for method chaining



## join


Adds an INNER JOIN clause to the query.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table to join with |
| `first` | First column in the join condition |
| `operator` | Comparison operator |
| `second` | Second column in the join condition |

### Example

```typescript
query.join('profiles', 'users.id', '=', 'profiles.user_id');
```
```



  `returns` — QueryBuilder instance for method chaining



## leftJoin


Adds a LEFT JOIN clause to the query.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table to join with |
| `first` | First column in the join condition |
| `operator` | Comparison operator |
| `second` | Second column in the join condition |

### Example

```typescript
query.leftJoin('profiles', 'users.id', '=', 'profiles.user_id');
```
```



  `returns` — QueryBuilder instance for method chaining



## rightJoin


Adds a RIGHT JOIN clause to the query.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table to join with |
| `first` | First column in the join condition |
| `operator` | Comparison operator |
| `second` | Second column in the join condition |

### Example

```typescript
query.rightJoin('profiles', 'users.id', '=', 'profiles.user_id');
```
```



  `returns` — QueryBuilder instance for method chaining



## orderBy


Adds an ORDER BY clause to sort results.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name to sort by |
| `direction` | Sort direction (&#x27;asc&#x27; or &#x27;desc&#x27;) |

### Example

```typescript
query.orderBy('created_at', 'desc');
query.orderBy('name'); // defaults to 'asc'
```
```



  `returns` — QueryBuilder instance for method chaining



## groupBy


Adds a GROUP BY clause for result grouping.


### Parameters

| Name | Description |
|------|-------------|
| `columns` | Column names to group by |

### Example

```typescript
query.groupBy('department', 'status');
```
```



  `returns` — QueryBuilder instance for method chaining



## having


Adds a HAVING clause for filtering grouped results.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name to filter on |
| `operator` | Comparison operator (optional, defaults to &#x27;&#x3D;&#x27;) |
| `value` | Value to compare against |

### Example

```typescript
query.groupBy('department')
     .having('count(*)', '>', 5);
```
```



  `returns` — QueryBuilder instance for method chaining



## limit


Sets the maximum number of results to return.


### Parameters

| Name | Description |
|------|-------------|
| `value` | Maximum number of results |

### Example

```typescript
query.limit(10); // Get only 10 results
```
```



  `returns` — QueryBuilder instance for method chaining



## offset


Sets the number of results to skip.


### Parameters

| Name | Description |
|------|-------------|
| `value` | Number of results to skip |

### Example

```typescript
query.offset(20); // Skip first 20 results
```
```



  `returns` — QueryBuilder instance for method chaining



## take


Alias for limit() method.


### Parameters

| Name | Description |
|------|-------------|
| `value` | Maximum number of results |




  `returns` — QueryBuilder instance for method chaining



## skip


Alias for offset() method.


### Parameters

| Name | Description |
|------|-------------|
| `value` | Number of results to skip |




  `returns` — QueryBuilder instance for method chaining



## allowFiltering


Adds ALLOW FILTERING to the query (ScyllaDB specific).
Use sparingly as it can impact performance significantly.




  `returns` — QueryBuilder instance for method chaining



## ttl


Sets TTL (Time To Live) for INSERT/UPDATE operations (ScyllaDB specific).


### Parameters

| Name | Description |
|------|-------------|
| `seconds` | TTL in seconds |

### Example

```typescript
query.ttl(3600).insert(data); // Data expires in 1 hour
```
```



  `returns` — QueryBuilder instance for method chaining



## ifNotExists


Adds IF NOT EXISTS condition for lightweight transactions (ScyllaDB specific).




  `returns` — QueryBuilder instance for method chaining



## if


Adds IF condition for lightweight transactions (ScyllaDB specific).


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name to check |
| `operator` | Comparison operator |
| `value` | Value to compare against |

### Example

```typescript
query.if('version', '=', 1).update(data); // Only update if version is 1
```
```



  `returns` — QueryBuilder instance for method chaining



## whereToken


Adds TOKEN-based WHERE clause for ScyllaDB partition key filtering.


### Parameters

| Name | Description |
|------|-------------|
| `columns` | Partition key columns |
| `operator` | Comparison operator |
| `values` | Values to compare against |

### Example

```typescript
query.whereToken(['user_id'], '>', [1000]);
```
```



  `returns` — QueryBuilder instance for method chaining



## get


Executes the query and returns all matching results.
If a model is bound, returns hydrated model instances.




  `returns` — Promise resolving to array of results



## with


Specifies relationships to eager load with the query results.
Supports dot notation for nested relationships.


### Parameters

| Name | Description |
|------|-------------|
| `relations` | Relationship names to load |

### Example

```typescript
const users = await User.query()
  .with('posts', 'profile')
  .get();

// Nested relationships
const users = await User.query()
  .with('posts.comments', 'posts.tags')
  .get();
```
```



  `returns` — QueryBuilder instance for method chaining



## loadEagerFor


Loads eager relationships for a single model instance.
Supports nested relationship loading with dot notation.


### Parameters

| Name | Description |
|------|-------------|
| `model` | Model instance to load relationships for |
| `relations` | Array of relationship names to load |

### Example

```typescript
await query.loadEagerFor(user, ['posts', 'profile']);
await query.loadEagerFor(user, ['posts.comments']);
```
```




## first


Executes the query and returns the first matching result.




  `returns` — Promise resolving to first result or null if none found



## count


Gets the count of records matching the query.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column to count (defaults to &#x27;*&#x27;) |

### Example

```typescript
const userCount = await User.query()
  .where('active', true)
  .count();

const emailCount = await User.query()
  .count('email');
```
```



  `returns` — Promise resolving to count number



## exists


Checks if any records exist matching the query.




  `returns` — Promise resolving to boolean



## insert


Inserts new record(s) into the database.
Supports both single record and batch insert operations.


### Parameters

| Name | Description |
|------|-------------|
| `values` | Record data or array of records to insert |

### Example

```typescript
// Single insert
await query.insert({
  name: 'John Doe',
  email: 'john@example.com'
});

// Batch insert
await query.insert([
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
]);
```
```



  `returns` — Promise resolving to boolean indicating success



## insertGetId


Inserts a new record and returns the generated ID.


### Parameters

| Name | Description |
|------|-------------|
| `values` | Record data to insert |

### Example

```typescript
const userId = await query.insertGetId({
  name: 'John Doe',
  email: 'john@example.com'
});
```
```



  `returns` — Promise resolving to the generated ID



## update


Updates records matching the current query conditions.


### Parameters

| Name | Description |
|------|-------------|
| `values` | Data to update |

### Example

```typescript
const updated = await User.query()
  .where('active', false)
  .update({ status: 'inactive' });
```
```



  `returns` — Promise resolving to number of affected rows



## updateOrInsert


Updates an existing record or inserts a new one if it doesn&#x27;t exist.


### Parameters

| Name | Description |
|------|-------------|
| `attributes` | Attributes to search by |
| `values` | Values to update or insert |

### Example

```typescript
await query.updateOrInsert(
  { email: 'john@example.com' },
  { name: 'John Doe', active: true }
);
```
```



  `returns` — Promise resolving to boolean indicating success



## delete


Deletes records matching the current query conditions.

If the model uses soft deletes (&#x60;static softDeletes &#x3D; true&#x60;), this method
will perform an UPDATE setting the &#x60;deleted_at&#x60; timestamp instead of a hard delete.




  `returnsPromise.&lt;number&gt;` — The number of rows affected (hard-deleted or soft-deleted).



## truncate


Truncates the entire table, removing all records.





## toBase


Converts the query builder to a base query object for grammar compilation.




  `returns` — Base query object



## getParams


Gets all query parameters in the correct order.




  `returns` — Array of parameter values



## getWhereParams


Extracts parameter values from WHERE clauses.


### Parameters

| Name | Description |
|------|-------------|
| `wheres` | Array of WHERE clause objects |




  `returns` — Array of parameter values



## getHavingParams


Extracts parameter values from HAVING clauses.




  `returns` — Array of parameter values



## hydrate


Creates a model instance from a database row.
Sets up the model with attributes, existence state, and original values.


### Parameters

| Name | Description |
|------|-------------|
| `row` | Raw database row data |




  `returns` — Hydrated model instance



## clone


Creates a deep copy of the query builder.
Useful for creating variations of a query without affecting the original.




  `returns` — New QueryBuilder instance with copied state



## toSql


Converts the query to its SQL/CQL string representation.
Useful for debugging and logging.




  `returns` — SQL/CQL query string



## toRawSql


Converts the query to SQL/CQL with parameter values interpolated.
Useful for debugging (do not use for actual query execution).




  `returns` — SQL/CQL query string with values



