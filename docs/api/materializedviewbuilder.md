---
title: MaterializedViewBuilder
---

# MaterializedViewBuilder





### Parameters

| Name | Description |
|------|-------------|
| `viewName` | Name of the materialized view to create. |
| `baseTable` | Base table from which to select data. |

### Example

```typescript
const mv = new MaterializedViewBuilder("user_by_email", "users")
  .ifNotExists()
  .select("id", "email", "name")
  .where("email IS NOT NULL")
  .partitionKey("email")
  .clusteringKey("id")
  .clusteringOrder("id", "DESC")
const sql = mv.toSQL()
console.log(sql)
```




## MaterializedViewBuilder


Fluent builder for creating ScyllaDB/Cassandra materialized views.
Chain methods to configure view definition and generate the CREATE statement.





## select


Specify columns to include in the view.


### Parameters

| Name | Description |
|------|-------------|
| `columns` | Column names to select. |





## where


Add a WHERE clause condition.


### Parameters

| Name | Description |
|------|-------------|
| `condition` | Raw CQL condition string. |





## partitionKey


Define partition key columns (must include at least one).


### Parameters

| Name | Description |
|------|-------------|
| `columns` | Column names for the partition key. |





## clusteringKey


Define clustering key columns.


### Parameters

| Name | Description |
|------|-------------|
| `columns` | Column names for clustering. |





## clusteringOrder


Specify clustering order for a column.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name to order by. |
| `direction` | &#x27;ASC&#x27; or &#x27;DESC&#x27;. |





## ifNotExists


Add IF NOT EXISTS clause to avoid errors if view already exists.





## toSQL


Compile and return the CREATE MATERIALIZED VIEW CQL statement.





