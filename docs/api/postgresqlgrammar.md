---
title: PostgreSQLGrammar
---

# PostgreSQLGrammar



PostgreSQL-specific query grammar implementation.
Compiles query components into SQL statements for PostgreSQL.
Supports features like CTEs, ON CONFLICT (UPSERT), RETURNING,
table inheritance, schema-qualified identifiers, and more.





## compileSelect


Compiles a SELECT query into SQL.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Query components including ctes, columns, from, joins,
               wheres, groups, havings, orders, limit, offset. |




  `returns` — The compiled SQL SELECT statement.



## compileInsert


Compiles an INSERT query into SQL, supporting ON CONFLICT and RETURNING.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Contains table, values, optional onConflict, and returning columns. |




  `returns` — The compiled SQL INSERT statement.



## compileUpdate


Compiles an UPDATE query into SQL with optional RETURNING.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Contains table, values, wheres, and optional returning columns. |




  `returns` — The compiled SQL UPDATE statement.



## compileDelete


Compiles a DELETE query into SQL with optional RETURNING.


### Parameters

| Name | Description |
|------|-------------|
| `query` | Contains table, wheres, and optional returning columns. |




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


Wraps a table name with double quotes for schema-qualified identifiers.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table name, optionally schema-qualified. |




  `returns` — The wrapped table name.



## wrapColumn


Wraps a column name with double quotes.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column name, optionally table-qualified. |




  `returns` — The wrapped column name.



## parameter


Returns the parameter placeholder for PostgreSQL ($1, $2,...).


### Parameters

| Name | Description |
|------|-------------|
| `index` | The 1-based index of the parameter. |




  `returns` — The placeholder string (e.g., $index).



## getColumnType


Maps a ColumnDefinition to its PostgreSQL column type.


### Parameters

| Name | Description |
|------|-------------|
| `column` | Column definition object. |




  `returns` — The SQL column type.



## formatDefault


Formats default values for SQL.


### Parameters

| Name | Description |
|------|-------------|
| `def` | Default value. |




  `returns` — The formatted default clause.



## compileCreateTable


Compiles a CREATE TABLE statement for PostgreSQL.
Supports column definitions, PRIMARY KEY, UNIQUE, DEFAULT, and INHERITS.


### Parameters

| Name | Description |
|------|-------------|
| `definition` | TableDefinition with columns and optional inherits. |




  `returns` — SQL CREATE TABLE string.



## compileAlterTable


Compiles an ALTER TABLE statement for PostgreSQL.
Supports adding columns only.


### Parameters

| Name | Description |
|------|-------------|
| `definition` | TableDefinition with new columns. |




  `returns` — SQL ALTER TABLE string.



## compileTableExists


Checks if a table exists in the current schema.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table name to check. |




  `returns` — SQL SELECT against information_schema.tables.



## compileColumnExists


Checks if a column exists in a given table.


### Parameters

| Name | Description |
|------|-------------|
| `table` | Table name. |
| `column` | Column name. |




  `returns` — SQL SELECT against information_schema.columns.



## rename


Renames a table in PostgreSQL.


### Parameters

| Name | Description |
|------|-------------|
| `from` | Current table name. |
| `to` | New table name. |





## compileColumnDefinition


Compiles a single column definition for CREATE TABLE.


### Parameters

| Name | Description |
|------|-------------|
| `column` | ColumnDefinition object. |




  `returns` — The compiled column definition string.



