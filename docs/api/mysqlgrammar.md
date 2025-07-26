---
title: MySQLGrammar
---

# MySQLGrammar



MySQL-specific query grammar implementation.
Compiles query components into SQL statements for MySQL.
Supports features like CTEs, ON DUPLICATE KEY UPDATE, GROUP BY,
ORDER BY, LIMIT/OFFSET, and schema introspection.





## compileSelect


Compiles a SELECT query into SQL.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query components including ctes, columns, from, joins,
               wheres, groups, havings, orders, limit, offset. |




  `returns` — The compiled SQL SELECT statement.



## compileInsert


Compiles an INSERT query into SQL, supporting ON DUPLICATE KEY UPDATE.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Contains table and values, and optional onDuplicateKey map. |




  `returns` — The compiled SQL INSERT statement.



## compileUpdate


Compiles an UPDATE query into SQL, with optional ORDER BY and LIMIT.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Contains table, values, wheres, orders, and limit. |




  `returns` — The compiled SQL UPDATE statement.



## compileDelete


Compiles a DELETE query into SQL, with optional ORDER BY and LIMIT.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Contains table, wheres, orders, and limit. |




  `returns` — The compiled SQL DELETE statement.



## compileWheres


Compiles WHERE clauses into SQL.
Supports basic, IN, NOT IN, BETWEEN, NULL checks, EXISTS, and raw.


### Parameters

| Name | Description |
|------|-------------|
| `wheres` | Array of where clause objects. |




  `returns` — The compiled WHERE clause string.



## compileJoins


Compiles JOIN clauses into SQL.


### Parameters

| Name | Description |
|------|-------------|
| `joins` | Array of join clause objects. |




  `returns` — The compiled JOIN clause string.



## compileCtes


Compiles CTEs into SQL.


### Parameters

| Name | Description |
|------|-------------|
| `ctes` | Array of CTE definition objects. |




  `returns` — The compiled CTE list string.



## wrapTable


Wraps a table name with backticks.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table name, optionally schema-qualified. |




  `returns` — The wrapped table name.



## wrapColumn


Wraps a column name with backticks.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name, optionally table-qualified. |




  `returns` — The wrapped column name.



## parameter


Returns the parameter placeholder.


### Parameters

| Name | Description |
|------|-------------|
| `_` | The value to bind (ignored). |




  `returns` — The placeholder string &#x27;?&#x27;.



## getColumnType


Maps a ColumnDefinition to its MySQL column type.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column definition object with type, length, precision, scale. |




  `returns` — The SQL column type.



## formatDefault


Formats default values for SQL.


### Parameters

| Name | Description |
|------|-------------|
| `def` | Default value (string or number). |




  `returns` — Formatted default clause.



## compileCreateTable


Compiles a CREATE TABLE statement for MySQL.


### Parameters

| Name | Description |
|------|-------------|
| `definition` | Table definition containing name and columns. |




  `returns` — SQL CREATE TABLE string.



## compileAlterTable


Compiles an ALTER TABLE statement for MySQL.
Supports adding columns only.


### Parameters

| Name | Description |
|------|-------------|
| `definition` | TableDefinition with new columns. |




  `returns` — SQL ALTER TABLE string.



## compileTableExists


Compiles a table existence check.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table name to check. |




  `returns` — SQL SELECT against information_schema.tables.



## compileColumnExists


Compiles a column existence check.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table name. |
| `column` | Column name. |




  `returns` — SQL SELECT against information_schema.columns.



## rename


Renames a table in MySQL.


### Parameters

| Name | Description |
|------|-------------|
| `from` | Current table name. |
| `to` | New table name. |




  `returns` — Promise rejected with SQL to execute; driver layer should run it.



