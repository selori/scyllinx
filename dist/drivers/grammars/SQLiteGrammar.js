"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteGrammar = void 0;
const QueryGrammar_1 = require("./QueryGrammar");
/**
 * SQLite-specific query grammar implementation.
 * Compiles query components into SQL statements for SQLite.
 * Supports features like CTEs, UPSERT, and schema introspection via PRAGMA.
 *
 * @extends QueryGrammar
 */
class SQLiteGrammar extends QueryGrammar_1.QueryGrammar {
    /**
     * Compiles a SELECT query into SQL.
     *
     * @param query - Query components including ctes, columns, from, joins,
     *                wheres, groups, havings, orders, limit, offset.
     * @returns The compiled SQL SELECT statement.
     */
    compileSelect(query) {
        const components = [];
        // WITH (CTE)
        if (query.ctes?.length) {
            components.push(`WITH ${this.compileCtes(query.ctes)}`);
        }
        // SELECT clause
        components.push(query.columns?.length
            ? `SELECT ${query.columns.join(', ')}`
            : 'SELECT *');
        // FROM clause
        if (query.from)
            components.push(`FROM ${this.wrapTable(query.from)}`);
        // JOIN clauses
        if (query.joins?.length)
            components.push(this.compileJoins(query.joins));
        // WHERE clause
        if (query.wheres?.length)
            components.push(`WHERE ${this.compileWheres(query.wheres)}`);
        // GROUP BY clause
        if (query.groups?.length) {
            components.push(`GROUP BY ${query.groups.map((c) => this.wrapColumn(c)).join(', ')}`);
        }
        // HAVING clause
        if (query.havings?.length)
            components.push(`HAVING ${this.compileWheres(query.havings)}`);
        // ORDER BY clause
        if (query.orders?.length) {
            const orderStr = query.orders
                .map((o) => `${this.wrapColumn(o.column)} ${o.direction.toUpperCase()}`)
                .join(', ');
            components.push(`ORDER BY ${orderStr}`);
        }
        // LIMIT & OFFSET
        if (query.limit != null)
            components.push(`LIMIT ${query.limit}`);
        if (query.offset != null)
            components.push(`OFFSET ${query.offset}`);
        return components.join(' ');
    }
    /**
     * Compiles an INSERT query into SQL, supporting UPSERT (ON CONFLICT).
     *
     * @param query - Contains table, values, and optional onConflict clause.
     * @returns The compiled SQL INSERT statement.
     */
    compileInsert(query) {
        const table = this.wrapTable(query.table);
        const cols = Object.keys(query.values).map(c => this.wrapColumn(c));
        const vals = Object.values(query.values).map(() => '?');
        let sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${vals.join(', ')})`;
        if (query.onConflict)
            sql += ` ON CONFLICT ${query.onConflict}`;
        return sql;
    }
    /**
     * Compiles an UPDATE query into SQL.
     *
     * @param query - Contains table, values, and wheres clauses.
     * @returns The compiled SQL UPDATE statement.
     */
    compileUpdate(query) {
        const table = this.wrapTable(query.table);
        const sets = Object.keys(query.values)
            .map(c => `${this.wrapColumn(c)} = ?`)
            .join(', ');
        let sql = `UPDATE ${table} SET ${sets}`;
        if (query.wheres?.length) {
            sql += ` WHERE ${this.compileWheres(query.wheres)}`;
        }
        return sql;
    }
    /**
     * Compiles a DELETE query into SQL.
     *
     * @param query - Contains table and wheres clauses.
     * @returns The compiled SQL DELETE statement.
     */
    compileDelete(query) {
        let sql = `DELETE FROM ${this.wrapTable(query.table)}`;
        if (query.wheres?.length) {
            sql += ` WHERE ${this.compileWheres(query.wheres)}`;
        }
        return sql;
    }
    /**
     * Compiles WHERE clauses into SQL.
     * Supports basic, IN, NOT IN, BETWEEN, NULL checks, EXISTS, and raw.
     *
     * @param wheres - Array of where clause objects.
     * @returns Compiled WHERE clause string.
     */
    compileWheres(wheres) {
        return wheres.map((w, i) => {
            const prefix = i > 0 ? ` ${w.boolean.toUpperCase()} ` : '';
            switch (w.type) {
                case 'basic': return `${prefix}${this.wrapColumn(w.column)} ${w.operator} ?`;
                case 'in': return `${prefix}${this.wrapColumn(w.column)} IN (${w.values.map(() => '?').join(', ')})`;
                case 'notIn': return `${prefix}${this.wrapColumn(w.column)} NOT IN (${w.values.map(() => '?').join(', ')})`;
                case 'between': return `${prefix}${this.wrapColumn(w.column)} BETWEEN ? AND ?`;
                case 'null': return `${prefix}${this.wrapColumn(w.column)} IS NULL`;
                case 'notNull': return `${prefix}${this.wrapColumn(w.column)} IS NOT NULL`;
                case 'exists': return `${prefix}EXISTS (${w.query})`;
                case 'notExists': return `${prefix}NOT EXISTS (${w.query})`;
                case 'raw': return `${prefix}${w.sql}`;
                default: return '';
            }
        }).join('');
    }
    /**
     * Compiles JOIN clauses into SQL.
     *
     * @param joins - Array of join clause objects.
     * @returns Compiled JOIN clause string.
     */
    compileJoins(joins) {
        return joins.map(j => {
            const type = j.type.toUpperCase();
            return `${type} JOIN ${this.wrapTable(j.table)} ON ${this.compileWheres(j.wheres)}`;
        }).join(' ');
    }
    /**
     * Compiles CTEs into SQL.
     *
     * @param ctes - Array of CTE definition objects.
     * @returns Compiled CTE list string.
     */
    compileCtes(ctes) {
        return ctes.map(cte => `${cte.name} AS (${cte.query})`).join(', ');
    }
    /**
     * Wraps a table name with double quotes.
     *
     * @param table - Table name.
     * @returns Wrapped table name.
     */
    wrapTable(table) {
        if (table.includes('.')) {
            return table.split('.').map(part => `"${part}"`).join('.');
        }
        return `"${table}"`;
    }
    /**
     * Wraps a column name with double quotes.
     *
     * @param column - Column name.
     * @returns Wrapped column name.
     */
    wrapColumn(column) {
        if (column === '*')
            return column;
        if (column.includes('.')) {
            return column.split('.').map(p => p === '*' ? p : `"${p}"`).join('.');
        }
        return `"${column}"`;
    }
    /**
     * Returns parameter placeholder.
     *
     * @param _ - Parameter value (ignored).
     * @returns Placeholder string '?'.
     */
    parameter(_) {
        return '?';
    }
    /**
     * Maps a ColumnDefinition to its SQLite column type.
     *
     * @param column - Column definition object.
     * @returns SQL column type string.
     */
    getColumnType(column) {
        switch (column.type) {
            case 'integer': return 'INTEGER';
            case 'string': return 'TEXT';
            case 'text': return 'TEXT';
            case 'boolean': return 'INTEGER';
            case 'decimal':
            case 'float':
            case 'double': return 'REAL';
            case 'date':
            case 'dateTime':
            case 'timestamp': return 'TEXT';
            case 'binary': return 'BLOB';
            case 'json': return 'TEXT';
            case 'uuid': return 'TEXT';
            default: return 'TEXT';
        }
    }
    /**
     * Formats default values for SQL.
     *
     * @param def - Default value.
     * @returns Formatted default clause.
     */
    formatDefault(def) {
        return typeof def === 'string' ? `"${def}"` : String(def);
    }
    /**
     * Compiles a single column definition for CREATE TABLE.
     *
     * @param column - ColumnDefinition object.
     * @returns Compiled column definition string.
     */
    compileColumnDefinition(column) {
        let sql = `${this.wrapColumn(column.name)} ${this.getColumnType(column)}`;
        if (column.primary)
            sql += ' PRIMARY KEY';
        if (column.autoIncrement)
            sql += ' AUTOINCREMENT';
        if (column.nullable === false)
            sql += ' NOT NULL';
        if (column.unique)
            sql += ' UNIQUE';
        if (column.default !== undefined)
            sql += ` DEFAULT ${this.formatDefault(column.default)}`;
        return sql;
    }
    /**
     * Compiles a CREATE TABLE statement for SQLite.
     *
     * @param definition - Table definition with name and columns.
     * @returns SQL CREATE TABLE string.
     */
    compileCreateTable(definition) {
        const table = this.wrapTable(definition.name);
        const cols = definition.columns.map(col => this.compileColumnDefinition(col));
        return `CREATE TABLE ${table} (${cols.join(', ')})`;
    }
    /**
     * Compiles an ALTER TABLE statement for SQLite.
     * Supports only ADD COLUMN.
     *
     * @param definition - TableDefinition with new columns.
     * @returns SQL ALTER TABLE string.
     */
    compileAlterTable(definition) {
        if (!definition.columns?.length) {
            throw new Error('No columns provided for ALTER TABLE.');
        }
        const table = this.wrapTable(definition.name);
        const adds = definition.columns.map(col => {
            let part = `ADD COLUMN ${this.wrapColumn(col.name)} ${this.getColumnType(col)}`;
            if (col.nullable === false)
                part += ' NOT NULL';
            if (col.default !== undefined)
                part += ` DEFAULT ${this.formatDefault(col.default)}`;
            if (col.unique)
                part += ' UNIQUE';
            return part;
        });
        return `ALTER TABLE ${table} ${adds.join(', ')}`;
    }
    /**
     * Compiles a query to check table existence via PRAGMA.
     *
     * @param table - Table name to check.
     * @returns SQL PRAGMA table_info statement.
     */
    compileTableExists(table) {
        return `PRAGMA table_info(${this.wrapTable(table)})`;
    }
    /**
     * Compiles a query to check column existence via PRAGMA.
     *
     * @param table - Table name.
     * @param column - Column name to check.
     * @returns SQL PRAGMA table_info statement (filter in driver).
     */
    compileColumnExists(table, column) {
        return this.compileTableExists(table);
    }
    /**
     * Compiles a RENAME TABLE operation for SQLite.
     *
     * @param from - Current table name.
     * @param to - New table name.
     * @throws Error directive; driver should execute generated SQL.
     */
    async rename(from, to) {
        const sql = `ALTER TABLE ${this.wrapTable(from)} RENAME TO ${this.wrapTable(to)}`;
        throw new Error(`Execute SQL: ${sql}`);
    }
}
exports.SQLiteGrammar = SQLiteGrammar;
//# sourceMappingURL=SQLiteGrammar.js.map