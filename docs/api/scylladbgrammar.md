---
title: ScyllaDBGrammar
---

# ScyllaDBGrammar








## ScyllaDBGrammar


ScyllaDB-specific query grammar implementation.
Compiles query components into CQL (Cassandra Query Language) statements.
Supports ScyllaDB-specific features like TTL, ALLOW FILTERING, and TOKEN queries.





## compileSelect


Compiles a SELECT query into CQL.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query components object |

### Example

```typescript
const cql = grammar.compileSelect({
  columns: ['id', 'name', 'email'],
  from: 'users',
  wheres: [
    { type: 'basic', column: 'status', operator: '=', value: 'active' }
  ],
  orders: [{ column: 'created_at', direction: 'desc' }],
  limit: 10,
  allowFiltering: true
});
```



  `returns` — Compiled CQL SELECT statement



## compileInsert


Compiles an INSERT query into CQL.
Supports ScyllaDB-specific features like TTL and IF NOT EXISTS.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Insert query components |

### Example

```typescript
const cql = grammar.compileInsert({
  table: 'users',
  values: { id: '123', name: 'John', email: 'john@example.com' },
  ttl: 3600,
  ifNotExists: true
});
// Returns: "INSERT INTO users (id, name, email) VALUES (?, ?, ?) USING TTL 3600 IF NOT EXISTS"
```



  `returns` — Compiled CQL INSERT statement



## compileUpdate


Compiles an UPDATE query into CQL.
Supports ScyllaDB-specific features like TTL and conditional updates.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Update query components |

### Example

```typescript
const cql = grammar.compileUpdate({
  table: 'users',
  values: { name: 'Jane', email: 'jane@example.com' },
  wheres: [{ type: 'basic', column: 'id', operator: '=', value: '123' }],
  ttl: 7200,
  ifConditions: [{ type: 'basic', column: 'version', operator: '=', value: 1 }]
});
```



  `returns` — Compiled CQL UPDATE statement



## compileDelete


Compiles a DELETE query into CQL.
Supports partial column deletion and conditional deletes.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Delete query components |

### Example

```typescript
const cql = grammar.compileDelete({
  table: 'users',
  columns: ['email', 'phone'], // Partial delete
  wheres: [{ type: 'basic', column: 'id', operator: '=', value: '123' }],
  ifConditions: [{ type: 'basic', column: 'status', operator: '=', value: 'inactive' }]
});
```



  `returns` — Compiled CQL DELETE statement



## compileWheres


Compiles WHERE clauses into CQL.
Supports various WHERE types including basic, IN, BETWEEN, NULL checks, and TOKEN queries.


### Parameters

| Name | Description |
|------|-------------|
| `wheres` | Array of WHERE clause objects |

### Example

```typescript
const whereClause = grammar.compileWheres([
  { type: 'basic', column: 'status', operator: '=', value: 'active', boolean: 'AND' },
  { type: 'in', column: 'role', values: ['admin', 'user'], boolean: 'AND' },
  { type: 'token', columns: ['user_id'], operator: '>', values: ['123'], boolean: 'AND' }
]);
```



  `returns` — Compiled WHERE clause string



## wrapTable


Wraps a table name for ScyllaDB.
ScyllaDB typically doesn&#x27;t require table name wrapping unless using reserved words.


### Parameters

| Name | Description |
|------|-------------|
| `table` | The table name to wrap |

### Example

```typescript
const wrapped = grammar.wrapTable('user_profiles');
// Returns: "user_profiles"
```



  `returns` — The wrapped table name



## wrapColumn


Wraps a column name for ScyllaDB.
ScyllaDB typically doesn&#x27;t require column name wrapping unless using reserved words.


### Parameters

| Name | Description |
|------|-------------|
| `column` | The column name to wrap |

### Example

```typescript
const wrapped = grammar.wrapColumn('first_name');
// Returns: "first_name"
```



  `returns` — The wrapped column name



## parameter


Creates a parameter placeholder for prepared statements.
ScyllaDB uses &quot;?&quot; as parameter placeholders.


### Parameters

| Name | Description |
|------|-------------|
| `value` | The value to create a placeholder for |

### Example

```typescript
const placeholder = grammar.parameter('some_value');
// Returns: "?"
```



  `returns` — Parameter placeholder string



## getColumnType


Maps column definition types to ScyllaDB CQL types.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column definition object |

### Example

```typescript
const type = grammar.getColumnType({ type: 'string', name: 'email' });
// Returns: "text"

const setType = grammar.getColumnType({ type: 'set', elementType: 'text', name: 'tags' });
// Returns: "set<text>"
```



  `returns` — ScyllaDB CQL type string



## compileColumn


Compiles a column definition into CQL.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column definition object |

### Example

```typescript
const columnDef = grammar.compileColumn({
  name: 'user_id',
  type: 'uuid',
  primary: true
});
// Returns: "user_id uuid"
```



  `returns` — Compiled column definition string



## compileCreateTable


Compiles a CREATE TABLE statement for ScyllaDB.
Supports ScyllaDB-specific features like partition keys, clustering keys, and table options.


### Parameters

| Name | Description |
|------|-------------|
| `definition` | Table definition object |

### Example

```typescript
const cql = grammar.compileCreateTable({
  name: 'user_events',
  columns: [
    { name: 'user_id', type: 'uuid' },
    { name: 'event_time', type: 'timestamp' },
    { name: 'event_type', type: 'text' },
    { name: 'data', type: 'text' }
  ],
  partitionKeys: ['user_id'],
  clusteringKeys: ['event_time'],
  clusteringOrder: { event_time: 'DESC' },
  tableOptions: {
    compaction: { class: 'TimeWindowCompactionStrategy' },
    gc_grace_seconds: 86400
  }
});
```



  `returns` — Compiled CREATE TABLE CQL statement



## compileAlterTable


Compiles an ALTER TABLE statement for ScyllaDB.
Şu anda yalnızca yeni kolon eklemeyi destekler.


### Parameters

| Name | Description |
|------|-------------|
| `definition` | Tablo tanımı; &#x60;columns&#x60; içinde sadece eklenmek istenen kolonlar olmalı. |

### Example

```typescript
const cql = grammar.compileAlterTable({
  name: 'users',
  columns: [
    { name: 'last_login', type: 'timestamp' }
  ]
});
// "ALTER TABLE users ADD last_login timestamp"
```



  `returns` — Compiled CQL ALTER TABLE statement



## compileTableExists


Checks if a table exists in the current keyspace.
Derlenen CQL’i kullanarak driver katmanında parametre olarak
[keyspace, table] bind edilmelidir.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Kontrol edilecek tablo adı |

### Example

```typescript
const cql = grammar.compileTableExists('users');
// "SELECT table_name FROM system_schema.tables WHERE keyspace_name = ? AND table_name = ?"
```



  `returns` — Compiled CQL statement to check table existence



## compileColumnExists


Checks if a column exists in a given table.
Derlenen CQL’i kullanarak driver katmanında parametre olarak
[keyspace, table, column] bind edilmelidir.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Tablo adı |
| `column` | Kontrol edilecek kolon adı |

### Example

```typescript
const cql = grammar.compileColumnExists('users', 'email');
// "SELECT column_name FROM system_schema.columns WHERE keyspace_name = ? AND table_name = ? AND column_name = ?"
```



  `returns` — Compiled CQL statement to check column existence



## rename


Renames a table in ScyllaDB.
ScyllaDB/Cassandra doğrudan tablo yeniden adlandırmayı desteklemez.


### Parameters

| Name | Description |
|------|-------------|
| `from` | Mevcut tablo adı |
| `to` | Yeni tablo adı |





