import { QueryGrammar } from "./QueryGrammar";
import type { WhereClause, QueryComponent, ColumnDefinition, TableDefinition } from "@/types";
/**
 * ScyllaDB-specific query grammar implementation.
 * Compiles query components into CQL (Cassandra Query Language) statements.
 * Supports ScyllaDB-specific features like TTL, ALLOW FILTERING, and TOKEN queries.
 *
 * @extends QueryGrammar
 *
 * @example
 *
 * const grammar = new ScyllaDBGrammar();
 * const sql = grammar.compileSelect({
 *   columns: ['id', 'name'],
 *   from: 'users',
 *   wheres: [{ type: 'basic', column: 'active', operator: '=', value: true }],
 *   allowFiltering: true
 * });
 * // Returns: "SELECT id, name FROM users WHERE active = ? ALLOW FILTERING"
 *
 */
export declare class ScyllaDBGrammar extends QueryGrammar {
    /**
     * Compiles a SELECT query into CQL.
     *
     * @param query - Query components object
     * @returns Compiled CQL SELECT statement
     *
     * @example
     *
     * const cql = grammar.compileSelect({
     *   columns: ['id', 'name', 'email'],
     *   from: 'users',
     *   wheres: [
     *     { type: 'basic', column: 'status', operator: '=', value: 'active' }
     *   ],
     *   orders: [{ column: 'created_at', direction: 'desc' }],
     *   limit: 10,
     *   allowFiltering: true
     * });
     *
     */
    compileSelect(query: QueryComponent): string;
    /**
     * Compiles an INSERT query into CQL.
     * Supports ScyllaDB-specific features like TTL and IF NOT EXISTS.
     *
     * @param query - Insert query components
     * @returns Compiled CQL INSERT statement
     *
     * @example
     *
     * const cql = grammar.compileInsert({
     *   table: 'users',
     *   values: { id: '123', name: 'John', email: 'john@example.com' },
     *   ttl: 3600,
     *   ifNotExists: true
     * });
     * // Returns: "INSERT INTO users (id, name, email) VALUES (?, ?, ?) USING TTL 3600 IF NOT EXISTS"
     *
     */
    compileInsert(query: {
        table: string;
        values: Record<string, any>;
        ttl?: number;
        ifNotExists?: boolean;
    }): string;
    /**
     * Compiles an UPDATE query into CQL.
     * Supports ScyllaDB-specific features like TTL and conditional updates.
     *
     * @param query - Update query components
     * @returns Compiled CQL UPDATE statement
     *
     * @example
     *
     * const cql = grammar.compileUpdate({
     *   table: 'users',
     *   values: { name: 'Jane', email: 'jane@example.com' },
     *   wheres: [{ type: 'basic', column: 'id', operator: '=', value: '123' }],
     *   ttl: 7200,
     *   ifConditions: [{ type: 'basic', column: 'version', operator: '=', value: 1 }]
     * });
     *
     */
    compileUpdate(query: {
        table: string;
        values: Record<string, any>;
        wheres?: WhereClause[];
        ttl?: number;
        ifConditions?: WhereClause[];
    }): string;
    /**
     * Compiles a DELETE query into CQL.
     * Supports partial column deletion and conditional deletes.
     *
     * @param query - Delete query components
     * @returns Compiled CQL DELETE statement
     *
     * @example
     *
     * const cql = grammar.compileDelete({
     *   table: 'users',
     *   columns: ['email', 'phone'], // Partial delete
     *   wheres: [{ type: 'basic', column: 'id', operator: '=', value: '123' }],
     *   ifConditions: [{ type: 'basic', column: 'status', operator: '=', value: 'inactive' }]
     * });
     *
     */
    compileDelete(query: {
        table: string;
        columns?: string[];
        wheres?: WhereClause[];
        ifConditions?: WhereClause[];
    }): string;
    /**
     * Compiles WHERE clauses into CQL.
     * Supports various WHERE types including basic, IN, BETWEEN, NULL checks, and TOKEN queries.
     *
     * @private
     * @param wheres - Array of WHERE clause objects
     * @returns Compiled WHERE clause string
     *
     * @example
     *
     * const whereClause = grammar.compileWheres([
     *   { type: 'basic', column: 'status', operator: '=', value: 'active', boolean: 'AND' },
     *   { type: 'in', column: 'role', values: ['admin', 'user'], boolean: 'AND' },
     *   { type: 'token', columns: ['user_id'], operator: '>', values: ['123'], boolean: 'AND' }
     * ]);
     *
     */
    private compileWheres;
    /**
     * Wraps a table name for ScyllaDB.
     * ScyllaDB typically doesn't require table name wrapping unless using reserved words.
     *
     * @param table - The table name to wrap
     * @returns The wrapped table name
     *
     * @example
     *
     * const wrapped = grammar.wrapTable('user_profiles');
     * // Returns: "user_profiles"
     *
     */
    wrapTable(table: string): string;
    /**
     * Wraps a column name for ScyllaDB.
     * ScyllaDB typically doesn't require column name wrapping unless using reserved words.
     *
     * @param column - The column name to wrap
     * @returns The wrapped column name
     *
     * @example
     *
     * const wrapped = grammar.wrapColumn('first_name');
     * // Returns: "first_name"
     *
     */
    wrapColumn(column: string): string;
    /**
     * Creates a parameter placeholder for prepared statements.
     * ScyllaDB uses "?" as parameter placeholders.
     *
     * @param value - The value to create a placeholder for
     * @returns Parameter placeholder string
     *
     * @example
     *
     * const placeholder = grammar.parameter('some_value');
     * // Returns: "?"
     *
     */
    parameter(value: any): string;
    /**
     * Maps column definition types to ScyllaDB CQL types.
     *
     * @param column - Column definition object
     * @returns ScyllaDB CQL type string
     *
     * @example
     *
     * const type = grammar.getColumnType({ type: 'string', name: 'email' });
     * // Returns: "text"
     *
     * const setType = grammar.getColumnType({ type: 'set', elementType: 'text', name: 'tags' });
     * // Returns: "set<text>"
     *
     */
    getColumnType(column: ColumnDefinition): string;
    /**
     * Compiles a column definition into CQL.
     *
     * @param column - Column definition object
     * @returns Compiled column definition string
     *
     * @example
     *
     * const columnDef = grammar.compileColumn({
     *   name: 'user_id',
     *   type: 'uuid',
     *   primary: true
     * });
     * // Returns: "user_id uuid"
     *
     */
    compileColumn(column: ColumnDefinition): string;
    /**
     * Compiles a CREATE TABLE statement for ScyllaDB.
     * Supports ScyllaDB-specific features like partition keys, clustering keys, and table options.
     *
     * @param definition - Table definition object
     * @returns Compiled CREATE TABLE CQL statement
     *
     * @example
     *
     * const cql = grammar.compileCreateTable({
     *   name: 'user_events',
     *   columns: [
     *     { name: 'user_id', type: 'uuid' },
     *     { name: 'event_time', type: 'timestamp' },
     *     { name: 'event_type', type: 'text' },
     *     { name: 'data', type: 'text' }
     *   ],
     *   partitionKeys: ['user_id'],
     *   clusteringKeys: ['event_time'],
     *   clusteringOrder: { event_time: 'DESC' },
     *   tableOptions: {
     *     compaction: { class: 'TimeWindowCompactionStrategy' },
     *     gc_grace_seconds: 86400
     *   }
     * });
     *
     */
    compileCreateTable({ name, columns, partitionKeys, clusteringKeys, clusteringOrder, tableOptions, }: TableDefinition): string;
    /**
   * Compiles an ALTER TABLE statement for ScyllaDB.
   * Şu anda yalnızca yeni kolon eklemeyi destekler.
   *
   * @param definition - Tablo tanımı; `columns` içinde sadece eklenmek istenen kolonlar olmalı.
   * @returns Compiled CQL ALTER TABLE statement
   *
   * @example
   * const cql = grammar.compileAlterTable({
   *   name: 'users',
   *   columns: [
   *     { name: 'last_login', type: 'timestamp' }
   *   ]
   * });
   * // "ALTER TABLE users ADD last_login timestamp"
   */
    compileAlterTable({ name, columns }: TableDefinition): string;
    /**
     * Checks if a table exists in the current keyspace.
     * Derlenen CQL’i kullanarak driver katmanında parametre olarak
     * [keyspace, table] bind edilmelidir.
     *
     * @param table - Kontrol edilecek tablo adı
     * @returns Compiled CQL statement to check table existence
     *
     * @example
     * const cql = grammar.compileTableExists('users');
     * // "SELECT table_name FROM system_schema.tables WHERE keyspace_name = ? AND table_name = ?"
     */
    compileTableExists(table: string): string;
    /**
     * Checks if a column exists in a given table.
     * Derlenen CQL’i kullanarak driver katmanında parametre olarak
     * [keyspace, table, column] bind edilmelidir.
     *
     * @param table - Tablo adı
     * @param column - Kontrol edilecek kolon adı
     * @returns Compiled CQL statement to check column existence
     *
     * @example
     * const cql = grammar.compileColumnExists('users', 'email');
     * // "SELECT column_name FROM system_schema.columns WHERE keyspace_name = ? AND table_name = ? AND column_name = ?"
     */
    compileColumnExists(table: string, column: string): string;
    /**
     * Renames a table in ScyllaDB.
     * ScyllaDB/Cassandra doğrudan tablo yeniden adlandırmayı desteklemez.
     *
     * @param from - Mevcut tablo adı
     * @param to - Yeni tablo adı
     * @throws {Error} Always throws since table rename is unsupported.
     */
    rename(from: string, to: string): Promise<void>;
}
//# sourceMappingURL=ScyllaDBGrammar.d.ts.map