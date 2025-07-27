import { TableDefinition } from "@/types";
import { QueryGrammar } from "./QueryGrammar";
/**
 * SQLite-specific query grammar implementation.
 * Compiles query components into SQL statements for SQLite.
 * Supports features like CTEs, UPSERT, and schema introspection via PRAGMA.
 *
 * @extends QueryGrammar
 */
export declare class SQLiteGrammar extends QueryGrammar {
    /**
     * Compiles a SELECT query into SQL.
     *
     * @param query - Query components including ctes, columns, from, joins,
     *                wheres, groups, havings, orders, limit, offset.
     * @returns The compiled SQL SELECT statement.
     */
    compileSelect(query: any): string;
    /**
     * Compiles an INSERT query into SQL, supporting UPSERT (ON CONFLICT).
     *
     * @param query - Contains table, values, and optional onConflict clause.
     * @returns The compiled SQL INSERT statement.
     */
    compileInsert(query: any): string;
    /**
     * Compiles an UPDATE query into SQL.
     *
     * @param query - Contains table, values, and wheres clauses.
     * @returns The compiled SQL UPDATE statement.
     */
    compileUpdate(query: any): string;
    /**
     * Compiles a DELETE query into SQL.
     *
     * @param query - Contains table and wheres clauses.
     * @returns The compiled SQL DELETE statement.
     */
    compileDelete(query: any): string;
    /**
     * Compiles WHERE clauses into SQL.
     * Supports basic, IN, NOT IN, BETWEEN, NULL checks, EXISTS, and raw.
     *
     * @param wheres - Array of where clause objects.
     * @returns Compiled WHERE clause string.
     */
    private compileWheres;
    /**
     * Compiles JOIN clauses into SQL.
     *
     * @param joins - Array of join clause objects.
     * @returns Compiled JOIN clause string.
     */
    private compileJoins;
    /**
     * Compiles CTEs into SQL.
     *
     * @param ctes - Array of CTE definition objects.
     * @returns Compiled CTE list string.
     */
    private compileCtes;
    /**
     * Wraps a table name with double quotes.
     *
     * @param table - Table name.
     * @returns Wrapped table name.
     */
    wrapTable(table: string): string;
    /**
     * Wraps a column name with double quotes.
     *
     * @param column - Column name.
     * @returns Wrapped column name.
     */
    wrapColumn(column: string): string;
    /**
     * Returns parameter placeholder.
     *
     * @param _ - Parameter value (ignored).
     * @returns Placeholder string '?'.
     */
    parameter(_: any): string;
    /**
     * Maps a ColumnDefinition to its SQLite column type.
     *
     * @param column - Column definition object.
     * @returns SQL column type string.
     */
    private getColumnType;
    /**
     * Formats default values for SQL.
     *
     * @param def - Default value.
     * @returns Formatted default clause.
     */
    private formatDefault;
    /**
     * Compiles a single column definition for CREATE TABLE.
     *
     * @param column - ColumnDefinition object.
     * @returns Compiled column definition string.
     */
    private compileColumnDefinition;
    /**
     * Compiles a CREATE TABLE statement for SQLite.
     *
     * @param definition - Table definition with name and columns.
     * @returns SQL CREATE TABLE string.
     */
    compileCreateTable(definition: TableDefinition): string;
    /**
     * Compiles an ALTER TABLE statement for SQLite.
     * Supports only ADD COLUMN.
     *
     * @param definition - TableDefinition with new columns.
     * @returns SQL ALTER TABLE string.
     */
    compileAlterTable(definition: TableDefinition): string;
    /**
     * Compiles a query to check table existence via PRAGMA.
     *
     * @param table - Table name to check.
     * @returns SQL PRAGMA table_info statement.
     */
    compileTableExists(table: string): string;
    /**
     * Compiles a query to check column existence via PRAGMA.
     *
     * @param table - Table name.
     * @param column - Column name to check.
     * @returns SQL PRAGMA table_info statement (filter in driver).
     */
    compileColumnExists(table: string, column: string): string;
    /**
     * Compiles a RENAME TABLE operation for SQLite.
     *
     * @param from - Current table name.
     * @param to - New table name.
     * @throws Error directive; driver should execute generated SQL.
     */
    rename(from: string, to: string): Promise<void>;
}
//# sourceMappingURL=SQLiteGrammar.d.ts.map