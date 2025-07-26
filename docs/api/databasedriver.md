---
title: DatabaseDriver
---

# DatabaseDriver



Creates a new DatabaseDriver instance.


### Parameters

| Name | Description |
|------|-------------|
| `config` | Database configuration object |

### Example

```typescript
class MyCustomDriver extends DatabaseDriver {
  async connect(): Promise<void> {
    // Implementation specific to your database
  }

  async query(sql: string, bindings?: any[]): Promise<QueryResult> {
    // Execute query and return results
  }

  // ... implement other abstract methods
}
```




## DatabaseDriver


Abstract base class for database drivers.
Defines the interface that all database drivers must implement.
Provides common functionality and enforces consistent behavior across different database systems.





## inTransaction


Transaction state flag





## isConnected


Checks if the driver is currently connected to the database.




  `returns` — True if connected, false otherwise



## isInTransaction


Checks if the driver is currently in a transaction.




  `returns` — True if in transaction, false otherwise



