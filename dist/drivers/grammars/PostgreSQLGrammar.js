"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLGrammar = void 0;
const QueryGrammar_1 = require("./QueryGrammar");
/**
 * PostgreSQL-specific query grammar implementation.
 * Compiles query components into SQL statements for PostgreSQL.
 * Supports features like CTEs, ON CONFLICT (UPSERT), RETURNING,
 * table inheritance, schema-qualified identifiers, and more.
 *
 * @extends QueryGrammar
 */
class PostgreSQLGrammar extends QueryGrammar_1.QueryGrammar {
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
                ? `LIMIT ${query.limit} OFFSET ${query.offset}`
                : `LIMIT ${query.limit}`);
        }
        return components.join(' ');
    }
    /**
     * Compiles an INSERT query into SQL, supporting ON CONFLICT and RETURNING.
     *
     * @param query - Contains table, values, optional onConflict, and returning columns.
     * @returns The compiled SQL INSERT statement.
     */
    compileInsert(query) {
        const table = this.wrapTable(query.table);
        const cols = Object.keys(query.values).map(c => this.wrapColumn(c));
        const vals = Object.values(query.values).map(() => '?');
        let sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${vals.join(', ')})`;
        if (query.onConflict) {
            sql += ` ON CONFLICT ${query.onConflict}`;
        }
        if (query.returning?.length) {
            sql += ` RETURNING ${query.returning.join(', ')}`;
        }
        return sql;
    }
    /**
     * Compiles an UPDATE query into SQL with optional RETURNING.
     *
     * @param query - Contains table, values, wheres, and optional returning columns.
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
        if (query.returning?.length) {
            sql += ` RETURNING ${query.returning.join(', ')}`;
        }
        return sql;
    }
    /**
     * Compiles a DELETE query into SQL with optional RETURNING.
     *
     * @param query - Contains table, wheres, and optional returning columns.
     * @returns The compiled SQL DELETE statement.
     */
    compileDelete(query) {
        let sql = `DELETE FROM ${this.wrapTable(query.table)}`;
        if (query.wheres?.length) {
            sql += ` WHERE ${this.compileWheres(query.wheres)}`;
        }
        if (query.returning?.length) {
            sql += ` RETURNING ${query.returning.join(', ')}`;
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
     * Wraps a table name with double quotes for schema-qualified identifiers.
     *
     * @param table - Table name, optionally schema-qualified.
     * @returns The wrapped table name.
     */
    wrapTable(table) {
        if (table.includes('.')) {
            return table.split('.')
                .map(part => `"${part}"`)
                .join('.');
        }
        return `"${table}"`;
    }
    /**
     * Wraps a column name with double quotes.
     *
     * @param column - Column name, optionally table-qualified.
     * @returns The wrapped column name.
     */
    wrapColumn(column) {
        if (column === '*')
            return column;
        if (column.includes('.')) {
            return column.split('.')
                .map(p => p === '*' ? p : `"${p}"`)
                .join('.');
        }
        return `"${column}"`;
    }
    /**
     * Returns the parameter placeholder for PostgreSQL ($1, $2,...).
     *
     * @param index - The 1-based index of the parameter.
     * @returns The placeholder string (e.g., $index).
     */
    parameter(index) {
        return `$${index}`;
    }
    /**
     * Maps a ColumnDefinition to its PostgreSQL column type.
     *
     * @param column - Column definition object.
     * @returns The SQL column type.
     */
    getColumnType(column) {
        switch (column.type) {
            case 'serial': return 'SERIAL';
            case 'bigserial': return 'BIGSERIAL';
            case 'integer': return 'INTEGER';
            case 'bigInteger': return 'BIGINT';
            case 'string': return column.length ? `VARCHAR(${column.length})` : 'VARCHAR';
            case 'text': return 'TEXT';
            case 'boolean': return 'BOOLEAN';
            case 'decimal': return column.precision != null && column.scale != null
                ? `NUMERIC(${column.precision},${column.scale})`
                : 'NUMERIC';
            case 'float': return 'REAL';
            case 'double': return 'DOUBLE PRECISION';
            case 'date': return 'DATE';
            case 'timestamp': return 'TIMESTAMP';
            case 'timestamptz': return 'TIMESTAMPTZ';
            case 'time': return 'TIME';
            case 'interval': return 'INTERVAL';
            case 'json': return 'JSON';
            case 'jsonb': return 'JSONB';
            case 'uuid': return 'UUID';
            case 'binary': return 'BYTEA';
            default: return 'TEXT';
        }
    }
    /**
     * Formats default values for SQL.
     *
     * @param def - Default value.
     * @returns The formatted default clause.
     */
    formatDefault(def) {
        return typeof def === 'string' ? `'${def}'` : String(def);
    }
    /**
     * Compiles a CREATE TABLE statement for PostgreSQL.
     * Supports column definitions, PRIMARY KEY, UNIQUE, DEFAULT, and INHERITS.
     *
     * @param definition - TableDefinition with columns and optional inherits.
     * @returns SQL CREATE TABLE string.
     */
    compileCreateTable(definition) {
        const table = this.wrapTable(definition.name);
        const cols = definition.columns.map(col => this.compileColumnDefinition(col));
        let sql = `CREATE TABLE ${table} (${cols.join(', ')})`;
        if (definition.inherits?.length) {
            const parents = definition.inherits.map((p) => this.wrapTable(p)).join(', ');
            sql += ` INHERITS (${parents})`;
        }
        return sql;
    }
    /**
     * Compiles an ALTER TABLE statement for PostgreSQL.
     * Supports adding columns only.
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
            if (col.default != null)
                part += ` DEFAULT ${this.formatDefault(col.default)}`;
            if (col.unique)
                part += ' UNIQUE';
            return part;
        });
        return `ALTER TABLE ${table} ${adds.join(', ')}`;
    }
    /**
     * Checks if a table exists in the current schema.
     *
     * @param table - Table name to check.
     * @returns SQL SELECT against information_schema.tables.
     */
    compileTableExists(table) {
        return `SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = ?`;
    }
    /**
     * Checks if a column exists in a given table.
     *
     * @param table - Table name.
     * @param column - Column name.
     * @returns SQL SELECT against information_schema.columns.
     */
    compileColumnExists(table, column) {
        return `SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ? AND column_name = ?`;
    }
    /**
     * Renames a table in PostgreSQL.
     *
     * @param from - Current table name.
     * @param to - New table name.
     * @throws Error directive; driver should execute generated SQL.
     */
    async rename(from, to) {
        const sql = `ALTER TABLE ${this.wrapTable(from)} RENAME TO ${this.wrapTable(to)}`;
        throw new Error(`Execute SQL: ${sql}`);
    }
    /**
     * Compiles a single column definition for CREATE TABLE.
     *
     * @param column - ColumnDefinition object.
     * @returns The compiled column definition string.
     */
    compileColumnDefinition(column) {
        let sql = `${this.wrapColumn(column.name)} ${this.getColumnType(column)}`;
        if (column.nullable === false)
            sql += ' NOT NULL';
        if (column.default != null)
            sql += ` DEFAULT ${this.formatDefault(column.default)}`;
        if (column.primary)
            sql += ' PRIMARY KEY';
        if (column.unique)
            sql += ' UNIQUE';
        return sql;
    }
}
exports.PostgreSQLGrammar = PostgreSQLGrammar;
//# sourceMappingURL=PostgreSQLGrammar.js.map