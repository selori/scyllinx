---
title: ColumnBuilder
---

# ColumnBuilder



Create a new ColumnBuilder instance.


### Parameters

| Name | Description |
|------|-------------|
| `column` | The underlying ColumnDefinition to configure. |

### Example

```typescript
const column: ColumnDefinition = { name: 'age', type: 'int' }
new ColumnBuilder(column)
  .nullable()
  .default(18)
  .unique()
// column now: { name: 'age', type: 'int', nullable: true, default: 18, unique: true }
```




## ColumnBuilder


Fluent builder for column definitions in migrations.
Provides chainable methods to configure column attributes.





## nullable


Mark the column as nullable.




  `returns` — The builder instance for chaining.



## notNullable


Mark the column as not nullable.




  `returns` — The builder instance for chaining.



## default


Set a default value for the column.


### Parameters

| Name | Description |
|------|-------------|
| `value` | The default value to use. |




  `returns` — The builder instance for chaining.



## unique


Add a UNIQUE constraint to the column.




  `returns` — The builder instance for chaining.



## primary


Mark the column as PRIMARY KEY.




  `returns` — The builder instance for chaining.



## autoIncrement


Enable auto-increment for the column (if supported by the dialect).




  `returns` — The builder instance for chaining.



