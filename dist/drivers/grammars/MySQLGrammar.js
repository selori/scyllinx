"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLGrammar = void 0;
const QueryGrammar_1 = require("./QueryGrammar");
/**
 * MySQL-specific query grammar implementation.
 * Compiles query components into SQL statements for MySQL.
 * Supports features like CTEs, ON DUPLICATE KEY UPDATE, GROUP BY,
 * ORDER BY, LIMIT/OFFSET, and schema introspection.
 *
 * @extends QueryGrammar
 */
class MySQLGrammar extends QueryGrammar_1.QueryGrammar {
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
        if (query.from) {
            components.push(`FROM ${this.wrapTable(query.from)}`);
        }
        // JOIN clauses
        if (query.joins?.length) {
            components.push(this.compileJoins(query.joins));
        }
        // WHERE clause
        if (query.wheres?.length) {
            components.push(`WHERE ${this.compileWheres(query.wheres)}`);
        }
        // GROUP BY clause
        if (query.groups?.length) {
            components.push(`GROUP BY ${query.groups.map((c) => this.wrapColumn(c)).join(', ')}`);
        }
        // HAVING clause
        if (query.havings?.length) {
            components.push(`HAVING ${this.compileWheres(query.havings)}`);
        }
        // ORDER BY clause
        if (query.orders?.length) {
            const orderStr = query.orders
                .map((o) => `${this.wrapColumn(o.column)} ${o.direction.toUpperCase()}`)
                .join(', ');
            components.push(`ORDER BY ${orderStr}`);
        }
        // LIMIT & OFFSET
        if (query.limit != null) {
            components.push(query.offset != null
                ? `LIMIT ${query.offset}, ${query.limit}`
                : `LIMIT ${query.limit}`);
        }
        return components.join(' ');
    }
    /**
     * Compiles an INSERT query into SQL, supporting ON DUPLICATE KEY UPDATE.
     *
     * @param query - Contains table and values, and optional onDuplicateKey map.
     * @returns The compiled SQL INSERT statement.
     */
    compileInsert(query) {
        const table = this.wrapTable(query.table);
        const cols = Object.keys(query.values).map(c => this.wrapColumn(c));
        const vals = Object.values(query.values).map(() => '?');
        let sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${vals.join(', ')})`;
        if (query.onDuplicateKey) {
            const updates = Object.keys(query.onDuplicateKey)
                .map(c => `${this.wrapColumn(c)} = VALUES(${this.wrapColumn(c)})`)
                .join(', ');
            sql += ` ON DUPLICATE KEY UPDATE ${updates}`;
        }
        return sql;
    }
    /**
     * Compiles an UPDATE query into SQL, with optional ORDER BY and LIMIT.
     *
     * @param query - Contains table, values, wheres, orders, and limit.
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
        if (query.orders?.length) {
            const orderStr = query.orders
                .map((o) => `${this.wrapColumn(o.column)} ${o.direction.toUpperCase()}`)
                .join(', ');
            sql += ` ORDER BY ${orderStr}`;
        }
        if (query.limit != null) {
            sql += ` LIMIT ${query.limit}`;
        }
        return sql;
    }
    /**
     * Compiles a DELETE query into SQL, with optional ORDER BY and LIMIT.
     *
     * @param query - Contains table, wheres, orders, and limit.
     * @returns The compiled SQL DELETE statement.
     */
    compileDelete(query) {
        let sql = `DELETE FROM ${this.wrapTable(query.table)}`;
        if (query.wheres?.length) {
            sql += ` WHERE ${this.compileWheres(query.wheres)}`;
        }
        if (query.orders?.length) {
            const orderStr = query.orders
                .map((o) => `${this.wrapColumn(o.column)} ${o.direction.toUpperCase()}`)
                .join(', ');
            sql += ` ORDER BY ${orderStr}`;
        }
        if (query.limit != null) {
            sql += ` LIMIT ${query.limit}`;
        }
        return sql;
    }
    /**
     * Compiles WHERE clauses into SQL.
     * Supports basic, IN, NOT IN, BETWEEN, NULL checks, EXISTS, and raw.
     *
     * @param wheres - Array of where clause objects.
     * @returns The compiled WHERE clause string.
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
     * @returns The compiled JOIN clause string.
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
     * @returns The compiled CTE list string.
     */
    compileCtes(ctes) {
        return ctes.map(cte => `${cte.name} AS (${cte.query})`).join(', ');
    }
    /**
     * Wraps a table name with backticks.
     *
     * @param table - Table name, optionally schema-qualified.
     * @returns The wrapped table name.
     */
    wrapTable(table) {
        if (table.includes('.')) {
            return table.split('.').map(part => `\`${part}\``).join('.');
        }
        return `\`${table}\``;
    }
    /**
     * Wraps a column name with backticks.
     *
     * @param column - Column name, optionally table-qualified.
     * @returns The wrapped column name.
     */
    wrapColumn(column) {
        if (column === '*')
            return column;
        if (column.includes('.')) {
            return column.split('.').map(p => p === '*' ? p : `\`${p}\``).join('.');
        }
        return `\`${column}\``;
    }
    /**
     * Returns the parameter placeholder.
     *
     * @param _ - The value to bind (ignored).
     * @returns The placeholder string '?'.
     */
    parameter(_) {
        return '?';
    }
    /**
     * Maps a ColumnDefinition to its MySQL column type.
     *
     * @param column - Column definition object with type, length, precision, scale.
     * @returns The SQL column type.
     */
    getColumnType(column) {
        switch (column.type) {
            case 'bigIncrements':
            case 'integer': return 'INT';
            case 'bigInteger': return 'BIGINT';
            case 'string': return column.length ? `VARCHAR(${column.length})` : 'VARCHAR(255)';
            case 'text': return 'TEXT';
            case 'boolean': return 'TINYINT(1)';
            case 'decimal': return column.precision != null && column.scale != null
                ? `DECIMAL(${column.precision},${column.scale})`
                : 'DECIMAL';
            case 'float': return 'FLOAT';
            case 'double': return 'DOUBLE';
            case 'date': return 'DATE';
            case 'timestamp':
            case 'dateTime': return 'DATETIME';
            case 'time': return 'TIME';
            case 'binary': return 'BLOB';
            case 'json': return 'JSON';
            case 'uuid': return 'CHAR(36)';
            default: return 'TEXT';
        }
    }
    /**
     * Formats default values for SQL.
     *
     * @param def - Default value (string or number).
     * @returns Formatted default clause.
     */
    formatDefault(def) {
        return typeof def === 'string' ? `'${def}'` : String(def);
    }
    /**
     * Compiles a CREATE TABLE statement for MySQL.
     *
     * @param definition - Table definition containing name and columns.
     * @returns SQL CREATE TABLE string.
     */
    compileCreateTable(definition) {
        const table = this.wrapTable(definition.name);
        const cols = definition.columns.map((col) => {
            const parts = [];
            parts.push(this.wrapColumn(col.name));
            parts.push(this.getColumnType(col));
            if (col.unsigned)
                parts.push('UNSIGNED');
            parts.push(col.nullable ? 'NULL' : 'NOT NULL');
            if (col.autoIncrement)
                parts.push('AUTO_INCREMENT');
            if (col.default != null)
                parts.push(`DEFAULT ${this.formatDefault(col.default)}`);
            return parts.join(' ');
        });
        const primaryCols = definition.columns.filter(c => c.primary).map(c => this.wrapColumn(c.name));
        if (primaryCols.length)
            cols.push(`PRIMARY KEY (${primaryCols.join(', ')})`);
        return `CREATE TABLE ${table} (${cols.join(', ')})`;
    }
    /**
     * Compiles an ALTER TABLE statement for MySQL.
     * Supports adding columns only.
     *
     * @param definition - TableDefinition with new columns.
     * @returns SQL ALTER TABLE string.
     */
    compileAlterTable(definition) {
        if (!definition.columns?.length)
            throw new Error('No columns provided for ALTER TABLE.');
        const table = this.wrapTable(definition.name);
        const adds = definition.columns.map((col) => {
            const parts = [`ADD COLUMN`, this.wrapColumn(col.name), this.getColumnType(col), col.nullable ? 'NULL' : 'NOT NULL'];
            if (col.default != null)
                parts.push(`DEFAULT ${this.formatDefault(col.default)}`);
            return parts.join(' ');
        });
        return `ALTER TABLE ${table} ${adds.join(', ')}`;
    }
    /**
     * Compiles a table existence check.
     *
     * @param table - Table name to check.
     * @returns SQL SELECT against information_schema.tables.
     */
    compileTableExists(table) {
        return `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`;
    }
    /**
     * Compiles a column existence check.
     *
     * @param table - Table name.
     * @param column - Column name.
     * @returns SQL SELECT against information_schema.columns.
     */
    compileColumnExists(table, column) {
        return `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`;
    }
    /**
     * Renames a table in MySQL.
     *
     * @param from - Current table name.
     * @param to - New table name.
     * @returns Promise rejected with SQL to execute; driver layer should run it.
     */
    async rename(from, to) {
        const sql = `RENAME TABLE ${this.wrapTable(from)} TO ${this.wrapTable(to)}`;
        throw new Error(`Execute SQL: ${sql}`);
    }
}
exports.MySQLGrammar = MySQLGrammar;
//# sourceMappingURL=MySQLGrammar.js.map