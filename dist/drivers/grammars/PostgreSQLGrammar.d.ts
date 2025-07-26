import { TableDefinition } from "@/types";
import { QueryGrammar } from "./QueryGrammar";
/**
 * PostgreSQL-specific query grammar implementation.
 * Compiles query components into SQL statements for PostgreSQL.
 * Supports features like CTEs, ON CONFLICT (UPSERT), RETURNING,
 * table inheritance, schema-qualified identifiers, and more.
 *
 * @extends QueryGrammar
 */
export declare class PostgreSQLGrammar extends QueryGrammar {
    /**
     * Compiles a SELECT query into SQL.
     *
     * @param query - Query components including ctes, columns, from, joins,
     *                wheres, groups, havings, orders, limit, offset.
     * @returns The compiled SQL SELECT statement.
     */
    compileSelect(query: any): string;
    /**
     * Compiles an INSERT query into SQL, supporting ON CONFLICT and RETURNING.
     *
     * @param query - Contains table, values, optional onConflict, and returning columns.
     * @returns The compiled SQL INSERT statement.
     */
    compileInsert(query: any): string;
    /**
     * Compiles an UPDATE query into SQL with optional RETURNING.
     *
     * @param query - Contains table, values, wheres, and optional returning columns.
     * @returns The compiled SQL UPDATE statement.
     */
    compileUpdate(query: any): string;
    /**
     * Compiles a DELETE query into SQL with optional RETURNING.
     *
     * @param query - Contains table, wheres, and optional returning columns.
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
     * Wraps a table name with double quotes for schema-qualified identifiers.
     *
     * @param table - Table name, optionally schema-qualified.
     * @returns The wrapped table name.
     */
    wrapTable(table: string): string;
    /**
     * Wraps a column name with double quotes.
     *
     * @param column - Column name, optionally table-qualified.
     * @returns The wrapped column name.
     */
    wrapColumn(column: string): string;
    /**
     * Returns the parameter placeholder for PostgreSQL ($1, $2,...).
     *
     * @param index - The 1-based index of the parameter.
     * @returns The placeholder string (e.g., $index).
     */
    parameter(index: number): string;
    /**
     * Maps a ColumnDefinition to its PostgreSQL column type.
     *
     * @param column - Column definition object.
     * @returns The SQL column type.
     */
    private getColumnType;
    /**
     * Formats default values for SQL.
     *
     * @param def - Default value.
     * @returns The formatted default clause.
     */
    private formatDefault;
    /**
     * Compiles a CREATE TABLE statement for PostgreSQL.
     * Supports column definitions, PRIMARY KEY, UNIQUE, DEFAULT, and INHERITS.
     *
     * @param definition - TableDefinition with columns and optional inherits.
     * @returns SQL CREATE TABLE string.
     */
    compileCreateTable(definition: TableDefinition): string;
    /**
     * Compiles an ALTER TABLE statement for PostgreSQL.
     * Supports adding columns only.
     *
     * @param definition - TableDefinition with new columns.
     * @returns SQL ALTER TABLE string.
     */
    compileAlterTable(definition: TableDefinition): string;
    /**
     * Checks if a table exists in the current schema.
     *
     * @param table - Table name to check.
     * @returns SQL SELECT against information_schema.tables.
     */
    compileTableExists(table: string): string;
    /**
     * Checks if a column exists in a given table.
     *
     * @param table - Table name.
     * @param column - Column name.
     * @returns SQL SELECT against information_schema.columns.
     */
    compileColumnExists(table: string, column: string): string;
    /**
     * Renames a table in PostgreSQL.
     *
     * @param from - Current table name.
     * @param to - New table name.
     * @throws Error directive; driver should execute generated SQL.
     */
    rename(from: string, to: string): Promise<void>;
    /**
     * Compiles a single column definition for CREATE TABLE.
     *
     * @param column - ColumnDefinition object.
     * @returns The compiled column definition string.
     */
    private compileColumnDefinition;
}
//# sourceMappingURL=PostgreSQLGrammar.d.ts.map