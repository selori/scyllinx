---
title: UserDefinedFunctionBuilder
---

# UserDefinedFunctionBuilder





### Parameters

| Name | Description |
|------|-------------|
| `functionName` | Name of the UDF to create or drop. |

### Example

```typescript
// Define a Java-based add_numbers function
const createSQL = new UserDefinedFunctionBuilder("add_numbers")
  .replace()
  .param("a", "int")
  .param("b", "int")
  .returns("int")
  .usingLanguage("java")
  .returnsNullOnNullInput()
  .securityDefiner()
  .as("return a + b;")
  .toSQL()
// Executes:
// CREATE OR REPLACE FUNCTION add_numbers(a int, b int)
// RETURNS int
// LANGUAGE java
// RETURNS NULL ON NULL INPUT
// SECURITY DEFINER
// AS $$return a + b;$$;

// To drop the function:
const dropSQL = new UserDefinedFunctionBuilder("add_numbers")
  .param("a", "int")
  .param("b", "int")
  .dropSQL()
// Executes: DROP FUNCTION IF EXISTS add_numbers(int, int);
```




## UserDefinedFunctionBuilder


Builder for creating and dropping user-defined functions in ScyllaDB/Cassandra.
Chain methods to configure the function signature, return type, language, and options.





## ifNotExists


Add IF NOT EXISTS clause to CREATE.





## replace


Add OR REPLACE clause to CREATE.





## withParams


Define multiple parameters at once.


### Parameters

| Name | Description |
|------|-------------|
| `params` | Array of [name, type] tuples. |





## param


Add a single parameter.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Parameter name. |
| `type` | Parameter type. |





## returns


Set the return type.


### Parameters

| Name | Description |
|------|-------------|
| `type` | PrimitiveScyllaType to return. |





## usingLanguage


Specify the language (java or javascript).





## as


Define the function body.


### Parameters

| Name | Description |
|------|-------------|
| `body` | Code block without delimiters. |





## calledOnNullInput


Functions are called even if input is null.





## returnsNullOnNullInput


Functions return null when input is null.





## securityDefiner


Set SECURITY DEFINER.





## securityInvoker


Set SECURITY INVOKER.





## toSQL


Build and return the CREATE FUNCTION CQL statement.





## dropSQL


Build and return the DROP FUNCTION CQL statement.


### Parameters

| Name | Description |
|------|-------------|
| `ifExists` | Include IF EXISTS clause. |





