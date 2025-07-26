---
title: ScyllaDBDriver
---

# ScyllaDBDriver



Creates a new ScyllaDBDriver instance.


### Parameters

| Name | Description |
|------|-------------|
| `config` | Database configuration object |

### Example

```typescript
const config = {
  driver: 'scylladb',
  host: 'localhost',
  keyspace: 'myapp',
  localDataCenter: 'datacenter1',
  username: 'cassandra',
  password: 'cassandra'
};

const driver = new ScyllaDBDriver(config);
await driver.connect();
const result = await driver.query('SELECT * FROM users');
```




## ScyllaDBPreparedStatement


Creates a new ScyllaDBPreparedStatement instance.


### Parameters

| Name | Description |
|------|-------------|
| `client` | The ScyllaDB client instance |
| `prepared` | The native prepared statement |

### Example

```typescript
const prepared = await driver.prepare('SELECT * FROM users WHERE id = ?');
const result = await prepared.execute(['123']);
await prepared.close();
```




## ScyllaDBDriver


ScyllaDB database driver implementation.
Provides ScyllaDB-specific functionality including connection management,
query execution, batch operations, and data type mapping.





## ScyllaDBPreparedStatement


ScyllaDB-specific prepared statement implementation.
Wraps the native ScyllaDB prepared statement with consistent interface.





## preparedStatements


Cache for prepared statements





## connect


Establishes connection to ScyllaDB cluster.
Configures client options including contact points, data center, keyspace, and credentials.




  `returns` — Promise that resolves when connection is established



## disconnect


Closes connection to ScyllaDB cluster.




  `returns` — Promise that resolves when connection is closed



## query


Executes a CQL query against ScyllaDB.
Automatically prepares statements for better performance and maps result rows.


### Parameters

| Name | Description |
|------|-------------|
| `cql` | The CQL query to execute |
| `params` | Optional parameters for the query |

### Example

```typescript
const result = await driver.query(
  'SELECT * FROM users WHERE status = ?',
  ['active']
);
console.log(`Found ${result.rowCount} users`);
result.rows.forEach(user => console.log(user.name));
```



  `returns` — Promise resolving to query results with mapped rows



## prepare


Prepares a CQL statement for repeated execution.
Caches prepared statements to avoid re-preparation overhead.


### Parameters

| Name | Description |
|------|-------------|
| `cql` | The CQL statement to prepare |

### Example

```typescript
const prepared = await driver.prepare('INSERT INTO users (id, name) VALUES (?, ?)');
await prepared.execute(['123', 'John']);
await prepared.execute(['456', 'Jane']);
```



  `returns` — Promise resolving to prepared statement wrapper



## batch


Executes multiple queries as a batch operation.
Provides atomicity for related operations and better performance for bulk operations.


### Parameters

| Name | Description |
|------|-------------|
| `queries` | Array of query objects with CQL and parameters |

### Example

```typescript
await driver.batch([
  { query: 'INSERT INTO users (id, name) VALUES (?, ?)', params: ['1', 'John'] },
  { query: 'INSERT INTO profiles (user_id, bio) VALUES (?, ?)', params: ['1', 'Developer'] }
]);
```



  `returns` — Promise resolving to batch execution result



## beginTransaction


Begins a database transaction.
Note: ScyllaDB uses lightweight transactions (LWT) instead of traditional ACID transactions.




  `returns` — Promise that resolves when transaction begins



## commit


Commits the current transaction.




  `returns` — Promise that resolves when transaction is committed



## rollback


Rolls back the current transaction.




  `returns` — Promise that resolves when transaction is rolled back



## getLastInsertId


Gets the ID of the last inserted record.
Note: ScyllaDB doesn&#x27;t have auto-increment, so this typically returns empty.




  `returns` — Promise resolving to empty string (ScyllaDB doesn&#x27;t support auto-increment)



## escape


Escapes a value for safe inclusion in CQL queries.
Handles null values, strings, booleans, and other data types.


### Parameters

| Name | Description |
|------|-------------|
| `value` | The value to escape |

### Example

```typescript
const escaped = driver.escape("O'Reilly");
// Returns: "'O''Reilly'"

const escapedBool = driver.escape(true);
// Returns: "true"
```



  `returns` — Escaped string representation of the value



## getGrammar


Gets the query grammar instance for this driver.




  `returns` — The ScyllaDBGrammar instance



## supportsFeature


Checks if the driver supports a specific feature.


### Parameters

| Name | Description |
|------|-------------|
| `feature` | The feature name to check |

### Example

```typescript
if (driver.supportsFeature('batch_operations')) {
  console.log('Batch operations are supported');
}

if (driver.supportsFeature('ttl')) {
  console.log('TTL is supported');
}
```



  `returns` — True if feature is supported, false otherwise



## mapRow


Maps a ScyllaDB row to a plain JavaScript object.
Handles ScyllaDB-specific data types and converts them to JavaScript equivalents.


### Parameters

| Name | Description |
|------|-------------|
| `row` | The raw row from ScyllaDB |




  `returns` — Mapped plain object



## mapValue


Maps ScyllaDB values to JavaScript types.
Handles UUID, TimeUUID, BigDecimal, Long, Date, and other ScyllaDB-specific types.


### Parameters

| Name | Description |
|------|-------------|
| `value` | The value to map |

### Example

```typescript
// Internal usage - converts ScyllaDB types to JS types
const uuid = mapValue(scyllaUuid); // Returns string
const timestamp = mapValue(scyllaTimestamp); // Returns ISO string
const decimal = mapValue(scyllaBigDecimal); // Returns number
```



  `returns` — Mapped JavaScript value



## execute


Executes the prepared statement with given parameters.


### Parameters

| Name | Description |
|------|-------------|
| `bindings` | Optional parameter bindings |

### Example

```typescript
const result = await prepared.execute(['user123', 'active']);
console.log(`Found ${result.rowCount} rows`);
```



  `returns` — Promise resolving to query results



## close


Closes the prepared statement.
Note: ScyllaDB prepared statements are cached, so this is a no-op.




  `returns` — Promise that resolves immediately



