---
title: Connection
---

# Connection



Creates a new database connection instance.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Unique identifier for this connection |
| `driver` | Database driver instance to handle queries |
| `config` | Connection configuration options |

### Example

```typescript
const connection = new Connection('scylladb', driver, {
  hosts: ['127.0.0.1'],
  keyspace: 'my_app'
});

await connection.connect();
const result = await connection.query('SELECT * FROM users');
await connection.disconnect();
```




## Connection


Represents a database connection with its associated driver and configuration.
Manages the lifecycle and operations of a single database connection.





## getName


Gets the connection name/identifier.




  `returns` — The unique name of this connection



## getDriver


Gets the database driver instance.




  `returns` — The driver associated with this connection



## getConfig


Gets the connection configuration.




  `returns` — Configuration object used for this connection



## connect


Establishes the database connection.
Initializes the driver and creates the actual database connection.





## disconnect


Closes the database connection.
Properly shuts down the driver and releases resources.





## isConnected


Checks if the connection is currently active.




  `returns` — True if connected, false otherwise



## query


Executes a raw query against the database.


### Parameters

| Name | Description |
|------|-------------|
| `query` | SQL/CQL query string to execute |
| `params` | Optional parameters for the query |

### Example

```typescript
// Simple query
const users = await connection.query('SELECT * FROM users');

// Parameterized query
const user = await connection.query(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```



  `returns` — Promise resolving to query results



## beginTransaction


Begins a database transaction.
Note: ScyllaDB has limited transaction support compared to traditional RDBMS.





## commit


Commits the current transaction.





## rollback


Rolls back the current transaction.





