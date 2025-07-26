import type { TableDefinition } from "@/types";
/**
 * Abstract base class for query grammars.
 * Defines the interface for compiling query components into database-specific SQL.
 * Each database driver should provide its own grammar implementation.
 *
 * @abstract
 *
 * @example
 *
 * class MySQLGrammar extends QueryGrammar {
 *   compileSelect(query: any): string {
 *     // MySQL-specific SELECT compilation
 *     return `SELECT ${query.columns.join(', ')} FROM ${query.table}`;
 *   }
 *
 *   wrapTable(table: string): string {
 *     return `\`${table}\``;
 *   }
 *
 *   // ... implement other abstract methods
 * }
 *
 */
export declare abstract class QueryGrammar {
    /**
     * Compiles a SELECT query into SQL.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param query - Query components object
     * @returns Compiled SELECT SQL string
     *
     * @example
     *
     * const sql = grammar.compileSelect({
     *   columns: ['name', 'email'],
     *   from: 'users',
     *   wheres: [{ column: 'active', operator: '=', value: true }]
     * });
     * // Returns: "SELECT name, email FROM users WHERE active = ?"
     *
     */
    abstract compileSelect(query: any): string;
    /**
     * Compiles an INSERT query into SQL.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param query - Query components object
     * @returns Compiled INSERT SQL string
     *
     * @example
     *
     * const sql = grammar.compileInsert({
     *   table: 'users',
     *   values: { name: 'John', email: 'john@example.com' }
     * });
     * // Returns: "INSERT INTO users (name, email) VALUES (?, ?)"
     *
     */
    abstract compileInsert(query: any): string;
    /**
     * Compiles an UPDATE query into SQL.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param query - Query components object
     * @returns Compiled UPDATE SQL string
     *
     * @example
     *
     * const sql = grammar.compileUpdate({
     *   table: 'users',
     *   values: { name: 'Jane' },
     *   wheres: [{ column: 'id', operator: '=', value: 1 }]
     * });
     * // Returns: "UPDATE users SET name = ? WHERE id = ?"
     *
     */
    abstract compileUpdate(query: any): string;
    /**
     * Compiles a DELETE query into SQL.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param query - Query components object
     * @returns Compiled DELETE SQL string
     *
     * @example
     *
     * const sql = grammar.compileDelete({
     *   table: 'users',
     *   wheres: [{ column: 'active', operator: '=', value: false }]
     * });
     * // Returns: "DELETE FROM users WHERE active = ?"
     *
     */
    abstract compileDelete(query: any): string;
    /**
     * Wraps a table name with appropriate identifiers.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param table - The table name to wrap
     * @returns Wrapped table name
     *
     * @example
     *
     * const wrapped = grammar.wrapTable('user_profiles');
     * // MySQL: "`user_profiles`"
     * // PostgreSQL: "\"user_profiles\""
     * // ScyllaDB: "user_profiles"
     *
     */
    abstract wrapTable(table: string): string;
    /**
     * Wraps a column name with appropriate identifiers.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param column - The column name to wrap
     * @returns Wrapped column name
     *
     * @example
     *
     * const wrapped = grammar.wrapColumn('first_name');
     * // MySQL: "`first_name`"
     * // PostgreSQL: "\"first_name\""
     * // ScyllaDB: "first_name"
     *
     */
    abstract wrapColumn(column: string): string;
    /**
     * Creates a parameter placeholder for prepared statements.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param value - The value to create a placeholder for
     * @returns Parameter placeholder string
     *
     * @example
     *
     * const placeholder = grammar.parameter('John');
     * // Most databases: "?"
     * // PostgreSQL: "$1", "$2", etc.
     *
     */
    abstract parameter(value: any): string;
    /**
     * Compiles a CREATE TABLE statement.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param definition - Table definition object
     * @returns Compiled CREATE TABLE SQL string
     *
     * @example
     *
     * const sql = grammar.compileCreateTable({
     *   name: 'users',
     *   columns: [
     *     { name: 'id', type: 'uuid', primary: true },
     *     { name: 'name', type: 'text' }
     *   ],
     *   partitionKeys: ['id']
     * });
     *
     */
    abstract compileCreateTable(definition: TableDefinition): string;
    /**
     * Compiles an ALTER TABLE statement.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param definition - Table definition object
     * @returns Compiled ALTER TABLE SQL string
     */
    abstract compileAlterTable(definition: TableDefinition): string;
    /**
     * Checks if a table exists in the database.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param table - The table name to check
     * @returns Compiled TABLE EXISTS CQL statement
     */
    abstract compileTableExists(table: string): string;
    /**
     * Checks if a column exists in a table.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param table - The table name
     * @param column - The column name to check
     * @returns Compiled COLUMMN EXISTS CQL statement
     */
    abstract compileColumnExists(table: string, column: string): string;
    /**
     * Renames a table.
     * Must be implemented by concrete grammar classes.
     *
     * @abstract
     * @param from - Current table name
     * @param to - New table name
     * @returns Promise that resolves when rename is complete
     */
    abstract rename(from: string, to: string): Promise<void>;
}
//# sourceMappingURL=QueryGrammar.d.ts.map