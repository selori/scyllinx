import { TableDefinition } from "@/types/index";
import { QueryGrammar } from "./QueryGrammar";
/**
 * MySQL-specific query grammar implementation.
 * Compiles query components into SQL statements for MySQL.
 * Supports features like CTEs, ON DUPLICATE KEY UPDATE, GROUP BY,
 * ORDER BY, LIMIT/OFFSET, and schema introspection.
 *
 * @extends QueryGrammar
 */
export declare class MySQLGrammar extends QueryGrammar {
    /**
     * Compiles a SELECT query into SQL.
     *
     * @param query - Query components including ctes, columns, from, joins,
     *                wheres, groups, havings, orders, limit, offset.
     * @returns The compiled SQL SELECT statement.
     */
    compileSelect(query: any): string;
    /**
     * Compiles an INSERT query into SQL, supporting ON DUPLICATE KEY UPDATE.
     *
     * @param query - Contains table and values, and optional onDuplicateKey map.
     * @returns The compiled SQL INSERT statement.
     */
    compileInsert(query: any): string;
    /**
     * Compiles an UPDATE query into SQL, with optional ORDER BY and LIMIT.
     *
     * @param query - Contains table, values, wheres, orders, and limit.
     * @returns The compiled SQL UPDATE statement.
     */
    compileUpdate(query: any): string;
    /**
     * Compiles a DELETE query into SQL, with optional ORDER BY and LIMIT.
     *
     * @param query - Contains table, wheres, orders, and limit.
     * @returns The compiled SQL DELETE statement.
     */
    compileDelete(query: any): string;
    /**
     * Compiles WHERE clauses into SQL.
     * Supports basic, IN, NOT IN, BETWEEN, NULL checks, EXISTS, and raw.
     *
     * @param wheres - Array of where clause objects.
     * @returns The compiled WHERE clause string.
     */
    private compileWheres;
    /**
     * Compiles JOIN clauses into SQL.
     *
     * @param joins - Array of join clause objects.
     * @returns The compiled JOIN clause string.
     */
    private compileJoins;
    /**
     * Compiles CTEs into SQL.
     *
     * @param ctes - Array of CTE definition objects.
     * @returns The compiled CTE list string.
     */
    private compileCtes;
    /**
     * Wraps a table name with backticks.
     *
     * @param table - Table name, optionally schema-qualified.
     * @returns The wrapped table name.
     */
    wrapTable(table: string): string;
    /**
     * Wraps a column name with backticks.
     *
     * @param column - Column name, optionally table-qualified.
     * @returns The wrapped column name.
     */
    wrapColumn(column: string): string;
    /**
     * Returns the parameter placeholder.
     *
     * @param _ - The value to bind (ignored).
     * @returns The placeholder string '?'.
     */
    parameter(_: any): string;
    /**
     * Maps a ColumnDefinition to its MySQL column type.
     *
     * @param column - Column definition object with type, length, precision, scale.
     * @returns The SQL column type.
     */
    private getColumnType;
    /**
     * Formats default values for SQL.
     *
     * @param def - Default value (string or number).
     * @returns Formatted default clause.
     */
    private formatDefault;
    /**
     * Compiles a CREATE TABLE statement for MySQL.
     *
     * @param definition - Table definition containing name and columns.
     * @returns SQL CREATE TABLE string.
     */
    compileCreateTable(definition: TableDefinition): string;
    /**
     * Compiles an ALTER TABLE statement for MySQL.
     * Supports adding columns only.
     *
     * @param definition - TableDefinition with new columns.
     * @returns SQL ALTER TABLE string.
     */
    compileAlterTable(definition: TableDefinition): string;
    /**
     * Compiles a table existence check.
     *
     * @param table - Table name to check.
     * @returns SQL SELECT against information_schema.tables.
     */
    compileTableExists(table: string): string;
    /**
     * Compiles a column existence check.
     *
     * @param table - Table name.
     * @param column - Column name.
     * @returns SQL SELECT against information_schema.columns.
     */
    compileColumnExists(table: string, column: string): string;
    /**
     * Renames a table in MySQL.
     *
     * @param from - Current table name.
     * @param to - New table name.
     * @returns Promise rejected with SQL to execute; driver layer should run it.
     */
    rename(from: string, to: string): Promise<void>;
}
//# sourceMappingURL=MySQLGrammar.d.ts.map