---
title: TableBuilder
---

# TableBuilder





### Parameters

| Name | Description |
|------|-------------|
| `tableName` | Name of the table to build. |

### Example

```typescript
const tableDef = new TableBuilder("users")
  .id()
  .string("name")
    .nullable()
  .string("email")
    .unique()
  .foreign("role_id")
    .references("id")
    .on("roles")
    .onDelete("cascade")
  .partitionKey("id")
  .clusteringKey("created_at")
  .withOptions(opts => {
    opts.compaction({ class: 'SizeTieredCompactionStrategy' })
  })
  .build()
```




## TableBuilder


Fluent builder for defining tables in migrations.
Supports columns, indexes, foreign keys, and ScyllaDB-specific options.





## setTableExists


Mark whether the table already exists (skip creation logic).





## id


Add an auto-incrementing integer primary key column.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Column name, defaults to &quot;id&quot;. |





## string


Add a VARCHAR column.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Column name. |
| `length` | Maximum length, defaults to 255. |





## uuid


Add a UUID column





## enum


Add an enum column





## set


Add a set column (ScyllaDB)





## list


Add a list column (ScyllaDB)





## map


Add a map column (ScyllaDB)





## counter


Add a counter column (ScyllaDB)





## timeUuid


Add a timeuuid column (ScyllaDB)





## foreign


Begin defining a foreign key on a column.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Local column name to reference. |





## index


Create a standard index.


### Parameters

| Name | Description |
|------|-------------|
| `columns` | Single column or array of columns to index. |
| `name` | Optional custom index name. |





## unique


Create a unique index.





## partitionKey


Define partition key columns (Cassandra/ScyllaDB).





## clusteringKey


Define clustering key columns.





## clusteringOrder


Specify clustering order for a column.





## withOptions


Configure table-level options via callback.





## build


Compile and return the final table definition.





