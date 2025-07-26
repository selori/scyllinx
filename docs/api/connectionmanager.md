---
title: ConnectionManager
---

# ConnectionManager



Private constructor to enforce singleton pattern.
Use getInstance() to get the ConnectionManager instance.





## ConnectionManager


Manages multiple database connections in a centralized manner.
Implements singleton pattern to ensure consistent connection management across the application.
Supports multiple named connections with different configurations and drivers.





## initialize


Initializes the ConnectionManager with the given configuration object.


### Parameters

| Name | Description |
|------|-------------|
| `config` | An object containing global database settings |

### Example

```typescript
import { databaseConfig } from "@/database/config";

// Load all configured connections at once
const manager = ConnectionManager.getInstance();
manager.initialize(databaseConfig);

// Connect to every database in parallel
await manager.connectAll();

// Now you can retrieve named connections or use the default:
const defaultConn = manager.getConnection();          // uses config.default
const analyticsConn = manager.getConnection("report"); // uses named key
```




## addConnection


Adds a new database connection to the manager.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Unique identifier for the connection |
| `driver` | Database driver instance |
| `config` | Connection configuration options |

### Example

```typescript
manager.addConnection('primary', {
  driver: 'scyyladb',
  hosts: ['127.0.0.1:9042'],
  keyspace: 'main_db'
});

manager.addConnection('cache', {
  driver: 'scyyladb',
  hosts: ['cache-cluster:9042'],
  keyspace: 'cache_db'
});
```




## getConnection


Retrieves a connection by name.
If no name is provided, returns the default connection.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Optional connection name. Uses default if not provided |

### Example

```typescript
// Get default connection
const conn = manager.getConnection();

// Get named connection
const cacheConn = manager.getConnection('cache');
```



  `returns` — The requested connection instance



## setDefaultConnection


Sets the default connection name.
This connection will be used when no specific connection is requested.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Name of the connection to set as default |

### Example

```typescript
manager.setDefaultConnection('primary');

// Now this will use 'primary' connection
const conn = manager.getConnection();
```




## getDefaultConnectionName


Gets the name of the current default connection.




  `returns` — The name of the default connection



## hasConnection


Checks if a connection with the given name exists.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Connection name to check |

### Example

```typescript
if (manager.hasConnection('analytics')) {
  const conn = manager.getConnection('analytics');
  // Use analytics connection
}
```



  `returns` — True if connection exists, false otherwise



## removeConnection


Removes a connection from the manager.
Automatically disconnects the connection before removal.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Name of the connection to remove |

### Example

```typescript
await manager.removeConnection('old_connection');
```




## getConnections


Returns all managed Connection instances.




  `returnsArray.&lt;Connection&gt;` — Array of Connection objects.



## getConnectionNames


Returns all managed connection names.




  `returnsArray.&lt;string&gt;` — Array of connection name strings.



## testConnection


Tests the specified connection by connecting and disconnecting.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Connection name to test. |

### Example

```typescript
const isScyllaHealthy = await connectionManager.testConnection('scylladb')
console.log(isScyllaHealthy ? 'OK' : 'Failed');
```



  `returnsPromise.&lt;boolean&gt;` — True if connect/disconnect succeeds, false otherwise.



## connectAll


Connects all managed connections.
Useful for application startup to establish all database connections.





## disconnectAll


Disconnects all managed connections.
Useful for graceful application shutdown.





## getConnectionCount


Gets the total number of managed connections.




  `returns` — Number of connections



## clear


Clears all connections from the manager.
Disconnects all connections before clearing.





## getInstance


Gets the singleton instance of ConnectionManager.
Creates a new instance if one doesn&#x27;t exist.




  `returns` — The singleton ConnectionManager instance



