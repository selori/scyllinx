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



## required


Mark the column as required.




  `returns` — The builder instance for chaining.



## default


Set a default value for the column.


### Parameters

| Name | Description |
|------|-------------|
| `value` | The default value to use. |




  `returns` — The builder instance for chaining.



## comment


Set a human-readable description for the field.
This is useful for documentation or schema introspection tools.


### Parameters

| Name | Description |
|------|-------------|
| `text` | A brief description of the field&#x27;s purpose. |

### Example

```typescript
column.string('email').description('The user\'s email address.')
```



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



## minLength


Set the minimum length constraint for a string field. (MongoDB Schema)
Applies to string-based fields (e.g., text, varchar).


### Parameters

| Name | Description |
|------|-------------|
| `length` | Minimum number of characters allowed. |

### Example

```typescript
table.string('username').minLength(3)
```



  `returns` — The builder instance for chaining.



## maxLength


Set the maximum length constraint for a string field. (MongoDB Schema)
Applies to string-based fields (e.g., text, varchar).


### Parameters

| Name | Description |
|------|-------------|
| `length` | Maximum number of characters allowed. |

### Example

```typescript
table.string('username').maxLength(30)
```



  `returns` — The builder instance for chaining.



## min


Set the minimum numeric value constraint for the field. (MongoDB Schema)
Applies to integer or float fields.


### Parameters

| Name | Description |
|------|-------------|
| `value` | Minimum allowed value. |

### Example

```typescript
table.integer('age').min(18)
```



  `returns` — The builder instance for chaining.



## max


Set the maximum numeric value constraint for the field. (MongoDB Schema)
Applies to integer or float fields.


### Parameters

| Name | Description |
|------|-------------|
| `value` | Maximum allowed value. |

### Example

```typescript
table.integer('age').max(100)
```



  `returns` — The builder instance for chaining.



## pattern


Set a regular expression pattern constraint for a string field. (MongoDB Schema)
Ensures that the value matches the given regex.

Applies only to string-based fields (e.g., text, varchar).


### Parameters

| Name | Description |
|------|-------------|
| `regex` | A string or RegExp representing the pattern to match. |

### Example

```typescript
column.string('email').pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
```
```typescript
column.string('slug').pattern("^[a-z0-9-]+$")
```



  `returns` — The builder instance for chaining.



## format


Set a predefined format for the field. (MongoDB Schema)
Formats are used for semantic validation (e.g., email, uri, date-time).

Common formats: &#x60;&quot;email&quot;&#x60;, &#x60;&quot;uri&quot;&#x60;, &#x60;&quot;uuid&quot;&#x60;, &#x60;&quot;date&quot;&#x60;, &#x60;&quot;date-time&quot;&#x60;, &#x60;&quot;ipv4&quot;&#x60;, &#x60;&quot;ipv6&quot;&#x60;, etc.

Format constraints are typically used in JSON Schema or validation libraries.


### Parameters

| Name | Description |
|------|-------------|
| `format` | A string representing the expected format. |

### Example

```typescript
column.string('email').format('email')
```
```typescript
column.string('website').format('uri')
```



  `returns` — The builder instance for chaining.



