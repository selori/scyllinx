---
title: MongoDBDriver
---

# MongoDBDriver



Creates a new MongoDBDriver.


### Parameters

| Name | Description |
|------|-------------|
| `config` | Connection configuration options. |





## MongoDBPreparedStatement




### Parameters

| Name | Description |
|------|-------------|
| `driver` | The MongoDBDriver instance. |
| `operation` | The operation directive string. |





## MongoDBDriver


MongoDB driver implementation.
Handles connection, queries, and MongoDB-specific operations.





## MongoDBPreparedStatement


MongoDBPreparedStatement wraps a MongoDBDriver operation for deferred execution.





## connect


Establishes a connection to MongoDB.
Builds the URI, configures the client, and selects the database.




  `returns` — Promise&lt;void&gt;



## disconnect


Closes the MongoDB connection and clears the reference.




  `returns` — Promise&lt;void&gt;



## query


Parses a directive string in the format &quot;collection:method:payload&quot;,
optionally bypassing JSON parsing when &#x60;raw&#x60; is true.


### Parameters

| Name | Description |
|------|-------------|
| `operation` | The directive string, typically in &quot;collection:method:payload&quot; format. |
| `operationPayload` | Optional pre-parsed payload used only when &#x60;raw&#x60; is true. |
| `raw` | Optional flag to bypass JSON parsing and use &#x60;operationPayload&#x60; directly. |

### Example

```typescript
// Normal directive with JSON payload:
driver.query("users:find:{\"active\":true}")

// Raw directive with pre-parsed payload:
driver.query("users:insertOne", { name: "Ali" }, true)
```



  `returns` — Promise resolving to query results with mapped rows



## prepare


Prepares a MongoDB operation for later execution.
MongoDB does not support parameterized statements natively,
so this wraps the operation directive in a PreparedStatement.


### Parameters

| Name | Description |
|------|-------------|
| `operation` | The operation directive string. |




  `returns` — Promise&lt;PreparedStatement&gt;



## beginTransaction


Begins a transaction context.
MongoDB transactions require a replica set or sharded cluster.




  `returns` — Promise&lt;void&gt;



## commit


Commits the current transaction context.




  `returns` — Promise&lt;void&gt;



## rollback


Rolls back the current transaction context.




  `returns` — Promise&lt;void&gt;



## getLastInsertId


Retrieves the last inserted document ID.
For MongoDB, this is included in the result of insert operations.




  `returns` — Promise&lt;string | number&gt;



## escape


Escapes a value for inclusion in logging or introspection.
MongoDB uses JSON, so this serializes the value.


### Parameters

| Name | Description |
|------|-------------|
| `value` | Any JavaScript value. |




  `returns` — A JSON-stringified representation.



## getGrammar


Returns the grammar instance for query compilation.




  `returns` — MongoDBGrammar



## supportsFeature


Determines if the driver supports a given feature.


### Parameters

| Name | Description |
|------|-------------|
| `feature` | The feature name to check. |




  `returns` — boolean



## buildConnectionUri


Builds the MongoDB connection URI.




  `returns` — The MongoDB connection string.



## getCollection


Returns the MongoDB collection instance by name.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Collection name. |




  `returns` — Collection



## createIndex


Creates an index on a collection.


### Parameters

| Name | Description |
|------|-------------|
| `collection` | Collection name. |
| `keys` | Index specification object. |
| `options` | Optional index options. |




  `returns` — Promise&lt;void&gt;



## dropIndex


Drops an index from a collection.


### Parameters

| Name | Description |
|------|-------------|
| `collection` | Collection name. |
| `indexName` | Name of the index to drop. |




  `returns` — Promise&lt;void&gt;



## execute


Executes the prepared operation with given parameters.


### Parameters

| Name | Description |
|------|-------------|
| `params` | Parameters for the operation payload. |




  `returns` — Promise&lt;QueryResult&gt;



## close


Closes the prepared statement.
MongoDB does not require explicit cleanup.




  `returns` — Promise&lt;void&gt;



