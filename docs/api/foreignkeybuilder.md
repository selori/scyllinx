---
title: ForeignKeyBuilder
---

# ForeignKeyBuilder





### Parameters

| Name | Description |
|------|-------------|
| `column` | Local column name for the foreign key. |
| `foreignKeys` | Array to collect ForeignKeyDefinition entries. |

### Example

```typescript
const foreignKeys: ForeignKeyDefinition[] = [];
new ForeignKeyBuilder("user_id", foreignKeys)
  .references("id")
  .on("users")
  .onDelete("cascade")
  .onUpdate("restrict");
// foreignKeys now contains:
// [{ column: "user_id", references: { table: "users", column: "id" }, onDelete: "cascade", onUpdate: "restrict" }]
```




## ForeignKeyBuilder


Fluent builder for constructing foreign key constraints in migrations.
Chain methods to define column references and actions.





## references


Specify the referenced column in the related table.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name in the foreign table. |




  `returns` — The builder instance for chaining.



## on


Specify the referenced table for the foreign key.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table name to reference. |




  `returns` — The builder instance for chaining.



## onDelete


Define the ON DELETE action for the foreign key.


### Parameters

| Name | Description |
|------|-------------|
| `action` | One of &#x27;cascade&#x27;, &#x27;set null&#x27;, or &#x27;restrict&#x27;. |




  `returns` — The builder instance for chaining.



## onUpdate


Define the ON UPDATE action for the foreign key.


### Parameters

| Name | Description |
|------|-------------|
| `action` | One of &#x27;cascade&#x27;, &#x27;set null&#x27;, or &#x27;restrict&#x27;. |




  `returns` — The builder instance for chaining.



