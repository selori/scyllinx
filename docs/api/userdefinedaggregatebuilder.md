---
title: UserDefinedAggregateBuilder
---

# UserDefinedAggregateBuilder





### Parameters

| Name | Description |
|------|-------------|
| `aggregateName` | Name of the aggregate to create or drop. |

### Example

```typescript
// Define an aggregate that sums integers
const createSQL = new UserDefinedAggregateBuilder("sum_ints")
  .orReplace()
  .withParameters(["int"])
  .stateFunction("state_sum")
  .stateTypeIs("int")
  .finalFunction("final_sum")
  .initialCondition("0")
  .toSQL()
// Executes:
// CREATE OR REPLACE AGGREGATE sum_ints(int)
// SFUNC state_sum
// STYPE int
// FINALFUNC final_sum
// INITCOND 0

// To drop the aggregate:
const dropSQL = new UserDefinedAggregateBuilder("sum_ints")
  .withParameters(["int"])
  .dropSQL()
// Executes: DROP AGGREGATE IF EXISTS sum_ints(int)
```




## UserDefinedAggregateBuilder


Builder for creating and dropping user-defined aggregates in ScyllaDB/Cassandra.
Chain methods to configure the aggregate signature, state/final functions, and options.





## orReplace


Add OR REPLACE to the CREATE statement.





## withParameters


Define the parameter types for the aggregate.


### Parameters

| Name | Description |
|------|-------------|
| `types` | List of Scylla primitive types. |





## stateFunction


Set the state transition function name (SFUNC).


### Parameters

| Name | Description |
|------|-------------|
| `name` | Name of the function. |





## stateTypeIs


Set the state data type (STYPE).


### Parameters

| Name | Description |
|------|-------------|
| `type` | Primitive ScyllaDB type. |





## finalFunction


(Optional) Set the final function name (FINALFUNC).


### Parameters

| Name | Description |
|------|-------------|
| `name` | Name of the final function. |





## initialCondition


(Optional) Set the initial condition (INITCOND).


### Parameters

| Name | Description |
|------|-------------|
| `condition` | Initial value expression. |





## toSQL


Build and return the CREATE AGGREGATE CQL statement.





## dropSQL


Build and return the DROP AGGREGATE CQL statement (IF EXISTS).





