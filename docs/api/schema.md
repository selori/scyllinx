---
title: Schema
---

# Schema



Creates a new Schema instance.


### Parameters

| Name | Description |
|------|-------------|
| `driver` | Database driver for executing schema operations |

### Example

```typescript
const schema = new Schema(driver);

// Create a table
await schema.createTable('users', (table) => {
  table.id();
  table.string('name');
  table.string('email').unique();
  table.timestamps();
});

// Create a materialized view
await schema.createMaterializedView('users_by_email', 'users', (view) => {
  view.select('*');
  view.primaryKey('email', 'id');
});
```




## Schema


Schema builder for creating and managing database schema objects.
Provides a fluent interface for creating tables, materialized views, user-defined types,
functions, and aggregates. Supports both SQL and ScyllaDB/Cassandra-specific features.





## createTable


Creates a new table with the specified structure.


### Parameters

| Name | Description |
|------|-------------|
| `tableName` | Name of the table to create |
| `callback` | Function to define table structure |

### Example

```typescript
await schema.createTable('posts', (table) => {
  table.id();
  table.string('title');
  table.text('content');
  table.integer('user_id');
  table.foreign('user_id').references('id').on('users');
  table.timestamps();
});
```



  `returns` — Promise that resolves when table is created



## alterTable


Modifies an existing table structure.


### Parameters

| Name | Description |
|------|-------------|
| `tableName` | Name of the table to modify |
| `callback` | Function to define table modifications |

### Example

```typescript
await schema.alterTable('users', (table) => {
  table.addColumn('phone', 'text');
  table.dropColumn('old_field');
  table.addIndex('email');
});
```



  `returns` — Promise that resolves when table is modified



## dropTable


Drops a table from the database.


### Parameters

| Name | Description |
|------|-------------|
| `tableName` | Name of the table to drop |

### Example

```typescript
await schema.dropTable('old_table');
```



  `returns` — Promise that resolves when table is dropped



## dropTableIfExists


Drops a table only if it exists.


### Parameters

| Name | Description |
|------|-------------|
| `tableName` | Name of the table to drop |

### Example

```typescript
await schema.dropTableIfExists('temporary_table');
```



  `returns` — Promise that resolves when table is dropped or doesn&#x27;t exist



## truncateTable


Truncates a table, removing all data but keeping the structure.


### Parameters

| Name | Description |
|------|-------------|
| `tableName` | Name of the table to truncate |

### Example

```typescript
await schema.truncateTable('logs');
```



  `returns` — Promise that resolves when table is truncated



## createMaterializedView


Creates a materialized view (ScyllaDB/Cassandra specific).


### Parameters

| Name | Description |
|------|-------------|
| `viewName` | Name of the materialized view |
| `baseTable` | Base table for the view |
| `callback` | Function to define view structure |

### Example

```typescript
await schema.createMaterializedView('users_by_email', 'users', (view) => {
  view.select('id', 'name', 'email', 'created_at');
  view.where('email', 'IS NOT NULL');
  view.primaryKey('email', 'id');
});
```



  `returns` — Promise that resolves when view is created



## dropMaterializedView


Drops a materialized view.


### Parameters

| Name | Description |
|------|-------------|
| `viewName` | Name of the materialized view to drop |

### Example

```typescript
await schema.dropMaterializedView('users_by_email');
```



  `returns` — Promise that resolves when view is dropped



## createType


Creates a user-defined type (ScyllaDB/Cassandra specific).


### Parameters

| Name | Description |
|------|-------------|
| `typeName` | Name of the user-defined type |
| `callback` | Function to define type structure |

### Example

```typescript
await schema.createType('address', (type) => {
  type.field('street', 'text');
  type.field('city', 'text');
  type.field('zip_code', 'text');
  type.field('country', 'text');
});
```



  `returns` — Promise that resolves when type is created



## dropType


Drops a user-defined type.


### Parameters

| Name | Description |
|------|-------------|
| `typeName` | Name of the type to drop |

### Example

```typescript
await schema.dropType('address');
```



  `returns` — Promise that resolves when type is dropped



## createFunction


Creates a user-defined function (ScyllaDB/Cassandra specific).


### Parameters

| Name | Description |
|------|-------------|
| `functionName` | Name of the function |
| `callback` | Function to define function structure |

### Example

```typescript
await schema.createFunction('calculate_age', (func) => {
  func.parameter('birth_date', 'timestamp');
  func.returns('int');
  func.language('java');
  func.body(`
    return (int) ((System.currentTimeMillis() - birth_date.getTime())
      / (1000L * 60 * 60 * 24 * 365));
  `);
});
```



  `returns` — Promise that resolves when function is created



## dropFunction


Drops a user-defined function.


### Parameters

| Name | Description |
|------|-------------|
| `functionName` | Name of the function to drop |

### Example

```typescript
await schema.dropFunction('calculate_age');
```



  `returns` — Promise that resolves when function is dropped



## createAggregate


Creates a user-defined aggregate (ScyllaDB/Cassandra specific).


### Parameters

| Name | Description |
|------|-------------|
| `aggregateName` | Name of the aggregate |
| `callback` | Function to define aggregate structure |

### Example

```typescript
await schema.createAggregate('average', (agg) => {
  agg.parameter('val', 'int');
  agg.stateFunction('avg_state');
  agg.stateType('tuple<int, bigint>');
  agg.finalFunction('avg_final');
  agg.initialCondition('(0, 0)');
});
```



  `returns` — Promise that resolves when aggregate is created



## dropAggregate


Drops a user-defined aggregate.


### Parameters

| Name | Description |
|------|-------------|
| `aggregateName` | Name of the aggregate to drop |

### Example

```typescript
await schema.dropAggregate('average');
```



  `returns` — Promise that resolves when aggregate is dropped



## hasTable


Checks if a table exists in the database.


### Parameters

| Name | Description |
|------|-------------|
| `tableName` | Name of the table to check |

### Example

```typescript
if (await schema.hasTable('users')) {
  console.log('Users table exists');
}
```



  `returns` — Promise resolving to boolean indicating existence



## hasColumn


Checks if a column exists in a table.


### Parameters

| Name | Description |
|------|-------------|
| `tableName` | Name of the table |
| `columnName` | Name of the column to check |

### Example

```typescript
if (await schema.hasColumn('users', 'email')) {
  console.log('Email column exists in users table');
}
```



  `returns` — Promise resolving to boolean indicating existence



## raw


Executes a raw schema query.
Use with caution - bypasses query builder safety features.


### Parameters

| Name | Description |
|------|-------------|
| `sql` | Raw SQL/CQL query to execute |
| `params` | Optional query parameters |

### Example

```typescript
await schema.raw('CREATE KEYSPACE IF NOT EXISTS test_ks WITH replication = ?', [
  { 'class': 'SimpleStrategy', 'replication_factor': 1 }
]);
```



  `returns` — Promise resolving to query result



