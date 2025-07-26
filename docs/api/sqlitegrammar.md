---
title: SQLiteGrammar
---

# SQLiteGrammar



SQLite-specific query grammar implementation.
Compiles query components into SQL statements for SQLite.
Supports features like CTEs, UPSERT, and schema introspection via PRAGMA.





## compileSelect


Compiles a SELECT query into SQL.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query components including ctes, columns, from, joins,
               wheres, groups, havings, orders, limit, offset. |




  `returns` — The compiled SQL SELECT statement.



## compileInsert


Compiles an INSERT query into SQL, supporting UPSERT (ON CONFLICT).


### Parameters

| Name | Description |
|------|-------------|
| `query` | Contains table, values, and optional onConflict clause. |




  `returns` — The compiled SQL INSERT statement.



## compileUpdate


Compiles an UPDATE query into SQL.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Contains table, values, and wheres clauses. |




  `returns` — The compiled SQL UPDATE statement.



## compileDelete


Compiles a DELETE query into SQL.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Contains table and wheres clauses. |




  `returns` — The compiled SQL DELETE statement.



## compileWheres


Compiles WHERE clauses into SQL.
Supports basic, IN, NOT IN, BETWEEN, NULL checks, EXISTS, and raw.


### Parameters

| Name | Description |
|------|-------------|
| `wheres` | Array of where clause objects. |




  `returns` — Compiled WHERE clause string.



## compileJoins


Compiles JOIN clauses into SQL.


### Parameters

| Name | Description |
|------|-------------|
| `joins` | Array of join clause objects. |




  `returns` — Compiled JOIN clause string.



## compileCtes


Compiles CTEs into SQL.


### Parameters

| Name | Description |
|------|-------------|
| `ctes` | Array of CTE definition objects. |




  `returns` — Compiled CTE list string.



## wrapTable


Wraps a table name with double quotes.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table name. |




  `returns` — Wrapped table name.



## wrapColumn


Wraps a column name with double quotes.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name. |




  `returns` — Wrapped column name.



## parameter


Returns parameter placeholder.


### Parameters

| Name | Description |
|------|-------------|
| `_` | Parameter value (ignored). |




  `returns` — Placeholder string &#x27;?&#x27;.



## getColumnType


Maps a ColumnDefinition to its SQLite column type.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column definition object. |




  `returns` — SQL column type string.



## formatDefault


Formats default values for SQL.


### Parameters

| Name | Description |
|------|-------------|
| `def` | Default value. |




  `returns` — Formatted default clause.



## compileColumnDefinition


Compiles a single column definition for CREATE TABLE.


### Parameters

| Name | Description |
|------|-------------|
| `column` | ColumnDefinition object. |




  `returns` — Compiled column definition string.



## compileCreateTable


Compiles a CREATE TABLE statement for SQLite.


### Parameters

| Name | Description |
|------|-------------|
| `definition` | Table definition with name and columns. |




  `returns` — SQL CREATE TABLE string.



## compileAlterTable


Compiles an ALTER TABLE statement for SQLite.
Supports only ADD COLUMN.


### Parameters

| Name | Description |
|------|-------------|
| `definition` | TableDefinition with new columns. |




  `returns` — SQL ALTER TABLE string.



## compileTableExists


Compiles a query to check table existence via PRAGMA.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table name to check. |




  `returns` — SQL PRAGMA table_info statement.



## compileColumnExists


Compiles a query to check column existence via PRAGMA.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table name. |
| `column` | Column name to check. |




  `returns` — SQL PRAGMA table_info statement (filter in driver).



## rename


Compiles a RENAME TABLE operation for SQLite.


### Parameters

| Name | Description |
|------|-------------|
| `from` | Current table name. |
| `to` | New table name. |





