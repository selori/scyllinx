---
title: MySQLDriver
---

# MySQLDriver



Creates a new MySQLDriver instance.


### Parameters

| Name | Description |
|------|-------------|
| `config` | Database configuration object |

### Example

```typescript
const config = {
  driver: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'myapp',
  username: 'root',
  password: 'secret'
};

const driver = new MySQLDriver(config);
await driver.connect();
const result = await driver.query('SELECT * FROM users');
```




## MySQLPreparedStatement


Creates a new MySQLPreparedStatement instance.


### Parameters

| Name | Description |
|------|-------------|
| `statement` | The raw mysql2 statement object |

### Example

```typescript
const stmt = await driver.prepare('SELECT * FROM posts WHERE user_id = ?');
const result = await stmt.execute(['123']);
await stmt.close();
```




## MySQLDriver


MySQL/MariaDB database driver implementation using &#x60;mysql2&#x60;.
Provides connection pooling, query execution, prepared statements, and grammar support.





## MySQLPreparedStatement


MySQL prepared statement wrapper.





## mysqlConnection


MySQL connection instance





## connect


Establishes a connection to the MySQL server.




  `returns` — Promise that resolves when connection is established



## disconnect


Closes the database connection.




  `returns` — Promise that resolves when connection is closed



## query


Executes a raw SQL query with optional parameter bindings.


### Parameters

| Name | Description |
|------|-------------|
| `sql` | The SQL query to execute |
| `bindings` | Optional parameter bindings |

### Example

```typescript
const result = await driver.query('SELECT * FROM users WHERE active = ?', [1]);
```



  `returns` — Promise resolving to query results



## prepare


Prepares a SQL statement for repeated execution.


### Parameters

| Name | Description |
|------|-------------|
| `sql` | The SQL statement to prepare |

### Example

```typescript
const prepared = await driver.prepare('INSERT INTO logs (id, message) VALUES (?, ?)');
await prepared.execute(['1', 'Hello']);
```



  `returns` — Promise resolving to a prepared statement



## beginTransaction


Begins a transaction on the current connection.




  `returns` — Promise that resolves when transaction begins



## commit


Commits the current transaction.




  `returns` — Promise that resolves when transaction is committed



## rollback


Rolls back the current transaction.




  `returns` — Promise that resolves when transaction is rolled back



## getLastInsertId


Gets the ID of the last inserted record.




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
// "'O\\'Reilly'"
```



  `returns` — Escaped string



## getGrammar


Gets the SQL grammar instance for this driver.




  `returns` — The MySQLGrammar instance



## supportsFeature


Checks if the driver supports a specific feature.


### Parameters

| Name | Description |
|------|-------------|
| `feature` | The feature name |

### Example

```typescript
if (driver.supportsFeature('transactions')) {
  console.log('Supports transactions');
}
```



  `returns` — True if supported, false otherwise



## execute


Executes the prepared statement.


### Parameters

| Name | Description |
|------|-------------|
| `bindings` | Optional parameter bindings |




  `returns` — Promise resolving to query results



## close


Closes the prepared statement.




  `returns` — Promise that resolves when closed



