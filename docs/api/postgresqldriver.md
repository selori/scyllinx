---
title: PostgreSQLDriver
---

# PostgreSQLDriver



Creates a new PostgreSQLDriver instance.


### Parameters

| Name | Description |
|------|-------------|
| `config` | Database configuration object |

### Example

```typescript
const config = {
  driver: 'pgsql',
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  username: 'user',
  password: 'secret'
};

const driver = new PostgreSQLDriver(config);
await driver.connect();
const result = await driver.query('SELECT * FROM users');
console.log(result.rows);
```




## PgPreparedStatement


Creates a new PgPreparedStatement instance.


### Parameters

| Name | Description |
|------|-------------|
| `pool` | PostgreSQL connection pool |
| `sql` | SQL string |
| `name` | Unique statement name |

### Example

```typescript
const prepared = await driver.prepare('SELECT * FROM users WHERE id = $1');
const result = await prepared.execute(['123']);
```




## PostgreSQLDriver


PostgreSQL database driver implementation using &#x60;pg&#x60;.
Provides PostgreSQL-specific functionality including connection pooling,
query execution, prepared statements via named queries, and SQL grammar support.





## PgPreparedStatement


PostgreSQL-specific prepared statement implementation using named statements.





## connect


Establishes connection to PostgreSQL using a connection pool.




  `returns` — Promise that resolves when connection is established



## disconnect


Closes the PostgreSQL connection pool.




  `returns` — Promise that resolves when connection is closed



## query


Executes a SQL query against PostgreSQL.


### Parameters

| Name | Description |
|------|-------------|
| `sql` | The SQL query to execute |
| `bindings` | Optional parameter bindings for the query |

### Example

```typescript
const result = await driver.query(
  'SELECT * FROM users WHERE status = $1',
  ['active']
);
console.log(`Found ${result.rowCount} users`);
```



  `returns` — Promise resolving to query results



## prepare


Prepares a SQL statement for repeated execution.
Uses named prepared statements under the hood.


### Parameters

| Name | Description |
|------|-------------|
| `sql` | The SQL statement to prepare |

### Example

```typescript
const prepared = await driver.prepare('INSERT INTO users (id, name) VALUES ($1, $2)');
await prepared.execute(['123', 'John']);
```



  `returns` — Promise resolving to prepared statement



## beginTransaction


Begins a database transaction.




  `returns` — Promise that resolves when transaction begins



## commit


Commits the current transaction.




  `returns` — Promise that resolves when transaction is committed



## rollback


Rolls back the current transaction.




  `returns` — Promise that resolves when transaction is rolled back



## getLastInsertId


Gets the ID of the last inserted record.
Relies on PostgreSQL&#x27;s &#x60;LASTVAL()&#x60; function.




  `returns` — Promise resolving to the last insert ID



## escape


Escapes a value for safe inclusion in SQL queries.


### Parameters

| Name | Description |
|------|-------------|
| `value` | The value to escape |

### Example

```typescript
const escaped = driver.escape("O'Reilly");
// Returns: "'O''Reilly'"
```



  `returns` — Escaped string representation of the value



## getGrammar


Gets the query grammar instance for this driver.




  `returns` — The PostgreSQLGrammar instance



## supportsFeature


Checks if the driver supports a specific feature.


### Parameters

| Name | Description |
|------|-------------|
| `feature` | The feature name to check |

### Example

```typescript
if (driver.supportsFeature('returning')) {
  console.log('RETURNING is supported');
}
```



  `returns` — True if feature is supported, false otherwise



## execute


Executes the prepared statement with given parameters.


### Parameters

| Name | Description |
|------|-------------|
| `bindings` | Optional parameter bindings |




  `returns` — Promise resolving to query results



## close


Closes the prepared statement.
Note: pg handles caching internally, so this is a no-op.




  `returns` — Promise that resolves immediately



