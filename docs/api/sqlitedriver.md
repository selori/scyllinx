---
title: SQLiteDriver
---

# SQLiteDriver



Creates a new PostgreSQLDriver instance.


### Parameters

| Name | Description |
|------|-------------|
| `config` | Database configuration object |





## SQLiteDriver


SQLite driver implementation using better-sqlite3.





## connect


Connect to a SQLite database using the given configuration.




  `returns` — Promise that resolves when connection is established



## disconnect


Disconnects from the SQLite database.





## query


Execute a raw SQL query with optional bindings and options.


### Parameters

| Name | Description |
|------|-------------|
| `sql` | The raw SQL string to execute. |
| `bindings` | The parameter bindings for the SQL query. |




  `returns` — The result of the executed query.



## prepare


Prepares a SQL statement and returns a PreparedStatement wrapper.


### Parameters

| Name | Description |
|------|-------------|
| `sql` | The SQL statement to prepare. |




  `returns` — A prepared statement interface for reuse.



## getLastInsertId


Get the last inserted row ID.




  `returns` — The ID of the last inserted row.



## escape


Escape an identifier (e.g. table or column name) for SQLite.


### Parameters

| Name | Description |
|------|-------------|
| `value` | The identifier to escape. |

### Example

```typescript
```ts
driver.escape("users") // => "`users`"
```
```



  `returns` — The escaped identifier.



## getGrammar


Returns the SQLite grammar instance.





## supportsFeature


Checks whether a given feature is supported by the SQLite driver.


### Parameters

| Name | Description |
|------|-------------|
| `feature` | The name of the feature to check. |




  `returns` — Whether the feature is supported.



