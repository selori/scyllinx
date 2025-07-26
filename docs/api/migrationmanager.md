---
title: MigrationManager
---

# MigrationManager



Creates a new MigrationManager instance.


### Parameters

| Name | Description |
|------|-------------|
| `connManager` | ConnectionManager instance for database access |

### Example

```typescript
const connManager = ConnectionManager.getInstance();
const migrationManager = new MigrationManager(connManager);

const migrations = [
  new CreateUsersTable(),
  new CreatePostsTable(),
  new AddIndexesToUsers()
];

// Run all pending migrations
await migrationManager.migrate(migrations);

// Rollback last migration
await migrationManager.rollback(migrations, 1);

// Check migration status
const status = await migrationManager.status(migrations);
```




## MigrationManager


Manages database migrations including execution, rollback, and status tracking.
Provides comprehensive migration management with batch tracking and error handling.
Automatically creates and manages a migrations table to track executed migrations.





## migrate


Executes all pending migrations in order.
Creates the migrations tracking table if it doesn&#x27;t exist.
Skips migrations that have already been executed.


### Parameters

| Name | Description |
|------|-------------|
| `migrations` | Array of migration instances to execute |

### Example

```typescript
const migrations = [
  new CreateUsersTable(),
  new CreatePostsTable()
];

try {
  await migrationManager.migrate(migrations);
  console.log('All migrations completed successfully');
} catch (error) {
  console.error('Migration failed:', error);
}
```



  `returns` — Promise that resolves when all migrations are complete



## rollback


Rolls back the specified number of migrations.
Executes the &#x60;down()&#x60; method of migrations in reverse order.


### Parameters

| Name | Description |
|------|-------------|
| `migrations` | Array of all available migrations |
| `steps` | Number of migrations to rollback (default: 1) |

### Example

```typescript
// Rollback last migration
await migrationManager.rollback(migrations);

// Rollback last 3 migrations
await migrationManager.rollback(migrations, 3);
```



  `returns` — Promise that resolves when rollback is complete



## status


Gets the execution status of all migrations.
Shows which migrations have been executed and their batch numbers.


### Parameters

| Name | Description |
|------|-------------|
| `migrations` | Array of migration instances to check |

### Example

```typescript
const status = await migrationManager.status(migrations);
status.forEach(({ name, executed, batch }) => {
  console.log(`${name}: ${executed ? `Executed (batch ${batch})` : 'Pending'}`);
});
```



  `returns` — Promise resolving to array of migration status objects



## reset


Rolls back all executed migrations.
Executes all migrations&#x27; &#x60;down()&#x60; methods in reverse order.


### Parameters

| Name | Description |
|------|-------------|
| `migrations` | Array of all available migrations |

### Example

```typescript
await migrationManager.reset(migrations);
console.log('All migrations have been rolled back');
```



  `returns` — Promise that resolves when all migrations are rolled back



## refresh


Resets all migrations and then re-runs them.
Equivalent to calling &#x60;reset()&#x60; followed by &#x60;migrate()&#x60;.


### Parameters

| Name | Description |
|------|-------------|
| `migrations` | Array of migration instances |

### Example

```typescript
await migrationManager.refresh(migrations);
console.log('Database refreshed with latest migrations');
```



  `returns` — Promise that resolves when refresh is complete



## ensureMigrationsTable


Ensures the migrations tracking table exists.
Creates the table with appropriate schema for tracking migration execution.
Uses composite primary key for ScyllaDB compatibility.




  `returns` — Promise that resolves when table is ensured to exist



## getExecutedMigrations


Retrieves list of executed migration names.




  `returns` — Promise resolving to array of migration names



## getExecutedMigrationsWithBatch


Retrieves executed migrations with their batch information.




  `returns` — Promise resolving to array of migration objects with batch info



## recordMigration


Records a migration as executed in the migrations table.
Assigns the migration to the next available batch number.


### Parameters

| Name | Description |
|------|-------------|
| `migration` | Migration instance to record |




  `returns` — Promise that resolves when migration is recorded



## removeMigrationRecord


Removes a migration record from the migrations table.
Used during rollback operations.


### Parameters

| Name | Description |
|------|-------------|
| `migration` | Migration instance to remove |




  `returns` — Promise that resolves when record is removed



