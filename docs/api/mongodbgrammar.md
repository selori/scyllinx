---
title: MongoDBGrammar
---

# MongoDBGrammar



MongoDB query grammar (converts SQL-like operations to MongoDB operations)
Outputs string directives like &quot;collection:operation:payload&quot; to be interpreted by the driver.





## compileSelect


Converts a SQL-like SELECT into a MongoDB find directive.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query components including from, wheres, orders, etc. |




  `returnsstring` — - Directive string &quot;collection:find:{filter,options}&quot;.



## compileInsert


Converts INSERT into insertOne or insertMany directive.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query components including table and values. |




  `returnsstring` — - Directive string for insert operation.



## compileUpdate


Converts UPDATE into updateMany directive with $set.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query components including table, wheres, and values. |




  `returnsstring` — - Directive string for update operation.



## compileDelete


Converts DELETE into deleteMany directive.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query components including table and wheres. |




  `returnsstring` — - Directive string for delete operation.



## compileWheres


Builds MongoDB filter object from SQL-like where clauses.


### Parameters

| Name | Description |
|------|-------------|
| `wheres` | Array of where clause objects. |




  `returnsstring` — - MongoDB filter object.



## addBasicWhere


Adds basic comparison operators to MongoDB filter.


### Parameters

| Name | Description |
|------|-------------|
| `filter` | The filter object to mutate. |
| `w` | Where clause object. |





## compileOptions


Builds MongoDB cursor options (projection, sort, skip, limit).


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query components including columns, orders, limit, offset. |




  `returnsstring` — - MongoDB find options object.



## wrapTable


Wraps a collection name.
MongoDB collections require no special wrapping.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Collection name. |




  `returnsstring` — - The unmodified collection name.



## wrapColumn


Wraps a field/column name.
MongoDB fields require no special wrapping.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Field name. |




  `returnsstring` — - The unmodified field name.



## parameter


Formats a parameter for directive payload.
JSON-stringifies the value.


### Parameters

| Name | Description |
|------|-------------|
| `value` | Any JavaScript value. |




  `returnsstring` — - JSON string of the value.



## compileCreateTable


Compiles a create-collection operation for MongoDB.
Note: MongoDB creates collections implicitly on insert,
but explicit creation can include options like validator.


### Parameters

| Name | Description |
|------|-------------|
| `definition` | TableDefinition with collection name and options. |




  `returnsstring` — - Directive string for creating a collection.



## compileAlterTable


Compiles an alter-collection operation for MongoDB.
Supports limited alterations like updating validation rules.


### Parameters

| Name | Description |
|------|-------------|
| `definition` | TableDefinition with new validation rules. |




  `returnsstring` — - Directive string for modifying collection.



## compileTableExists


Compiles a check for collection existence.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Collection name to check. |




  `returnsstring` — - Directive string for listing collections.



## compileColumnExists


Compiles a check for field existence in a collection.
Note: MongoDB requires sampling or schema overview.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Collection name. |
| `column` | Field name to check. |




  `returnsstring` — - Directive string for field existence check.



## rename


Compiles a rename-collection operation.


### Parameters

| Name | Description |
|------|-------------|
| `from` | Current collection name. |
| `to` | New collection name. |





