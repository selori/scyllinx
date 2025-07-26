---
title: UserDefinedTypeBuilder
---

# UserDefinedTypeBuilder





### Parameters

| Name | Description |
|------|-------------|
| `typeName` | Name of the UDT to create or alter. |

### Example

```typescript
// Create a new UDT
const createSQL = new UserDefinedTypeBuilder("address")
  .ifNotExists()
  .field("street", "text")
  .field("city", "text")
  .field("zip", "int")
  .toSQL()
// Executes:
// CREATE TYPE IF NOT EXISTS address (
//   street text,
//   city text,
//   zip int
// )

// Add a field to existing UDT
const alterAdd = new UserDefinedTypeBuilder("address")
  .addField("country", "text")
// Executes: ALTER TYPE address ADD country text

// Rename a field in existing UDT
const alterRename = new UserDefinedTypeBuilder("address")
  .renameField("zip", "postal_code")
// Executes: ALTER TYPE address RENAME zip TO postal_code
```




## UserDefinedTypeBuilder


Builder for creating and altering user-defined types in ScyllaDB/Cassandra.
Chain methods to define fields and generate CQL statements.





## field


Define a single field in the UDT.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Field name. |
| `type` | ScyllaDB data type. |





## fields


Define multiple fields via an object map.


### Parameters

| Name | Description |
|------|-------------|
| `fields` | Record of field names to types. |





## ifNotExists


Include IF NOT EXISTS in the CREATE statement.





## toSQL


Build and return the CREATE TYPE CQL statement.





## addField


Generate an ALTER TYPE statement to add a new field.


### Parameters

| Name | Description |
|------|-------------|
| `name` | Field name to add. |
| `type` | Data type for the new field. |





## renameField


Generate an ALTER TYPE statement to rename an existing field.


### Parameters

| Name | Description |
|------|-------------|
| `oldName` | Current field name. |
| `newName` | New field name. |





