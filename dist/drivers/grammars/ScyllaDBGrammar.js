"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScyllaDBGrammar = void 0;
const QueryGrammar_1 = require("./QueryGrammar");
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
class ScyllaDBGrammar extends QueryGrammar_1.QueryGrammar {
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
    compileSelect(query) {
        const components = [];
        // SELECT clause
        if (query.columns && query.columns.length > 0) {
            components.push(`SELECT ${query.columns.map((col) => this.wrapColumn(col)).join(", ")}`);
        }
        else {
            components.push("SELECT *");
        }
        // FROM clause
        if (query.from) {
            components.push(`FROM ${this.wrapTable(query.from)}`);
        }
        // WHERE clause
        if (query.wheres && query.wheres.length > 0) {
            components.push(`WHERE ${this.compileWheres(query.wheres)}`);
        }
        // ORDER BY clause
        if (query.orders && query.orders.length > 0) {
            const orderBy = query.orders
                .map((order) => `${this.wrapColumn(order.column)} ${order.direction.toUpperCase()}`)
                .join(", ");
            components.push(`ORDER BY ${orderBy}`);
        }
        // LIMIT clause
        if (query.limit) {
            components.push(`LIMIT ${query.limit}`);
        }
        // ALLOW FILTERING
        if (query.allowFiltering) {
            components.push("ALLOW FILTERING");
        }
        return components.join(" ");
    }
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
    compileInsert(query) {
        const table = this.wrapTable(query.table);
        const columns = Object.keys(query.values).map((col) => this.wrapColumn(col));
        const values = Object.values(query.values).map(() => "?");
        let cql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")})`;
        if (query.ttl) {
            cql += ` USING TTL ${query.ttl}`;
        }
        if (query.ifNotExists) {
            cql += " IF NOT EXISTS";
        }
        return cql;
    }
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
    compileUpdate(query) {
        const table = this.wrapTable(query.table);
        const sets = Object.keys(query.values).map((col) => `${this.wrapColumn(col)} = ?`);
        let cql = `UPDATE ${table}`;
        if (query.ttl) {
            cql += ` USING TTL ${query.ttl}`;
        }
        cql += ` SET ${sets.join(", ")}`;
        if (query.wheres && query.wheres.length > 0) {
            cql += ` WHERE ${this.compileWheres(query.wheres)}`;
        }
        if (query.ifConditions && query.ifConditions.length > 0) {
            cql += ` IF ${this.compileWheres(query.ifConditions)}`;
        }
        return cql;
    }
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
    compileDelete(query) {
        let cql = "DELETE";
        if (query.columns && query.columns.length > 0) {
            cql += ` ${query.columns.map((col) => this.wrapColumn(col)).join(", ")}`;
        }
        cql += ` FROM ${this.wrapTable(query.table)}`;
        if (query.wheres && query.wheres.length > 0) {
            cql += ` WHERE ${this.compileWheres(query.wheres)}`;
        }
        if (query.ifConditions && query.ifConditions.length > 0) {
            cql += ` IF ${this.compileWheres(query.ifConditions)}`;
        }
        return cql;
    }
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
    compileWheres(wheres) {
        return wheres
            .map((where, index) => {
            if (!where)
                return "";
            const boolean = index > 0 ? where.boolean || "AND" : "";
            const prefix = index > 0 ? ` ${boolean.toUpperCase()} ` : "";
            switch (where.type) {
                case "basic":
                    return where.column ? `${prefix}${this.wrapColumn(where.column)} ${where.operator || "="} ?` : "";
                case "in":
                    return where.column && where.values
                        ? `${prefix}${this.wrapColumn(where.column)} IN (${where.values.map(() => "?").join(", ")})`
                        : "";
                case "notIn":
                    return where.column && where.values
                        ? `${prefix}${this.wrapColumn(where.column)} NOT IN (${where.values.map(() => "?").join(", ")})`
                        : "";
                case "between":
                    return where.column
                        ? `${prefix}${this.wrapColumn(where.column)} >= ? AND ${this.wrapColumn(where.column)} <= ?`
                        : "";
                case "null":
                    return where.column ? `${prefix}${this.wrapColumn(where.column)} IS NULL` : "";
                case "notNull":
                    return where.column ? `${prefix}${this.wrapColumn(where.column)} IS NOT NULL` : "";
                case "token":
                    return where.columns && where.values && where.operator
                        ? `${prefix}TOKEN(${where.columns.map((col) => this.wrapColumn(col)).join(", ")}) ${where.operator} TOKEN(${where.values.map(() => "?").join(", ")})`
                        : "";
                case "raw":
                    return where.raw || "";
                default:
                    return "";
            }
        })
            .filter(Boolean)
            .join("");
    }
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
    wrapTable(table) {
        return table.includes(".") ? table : `${table}`;
    }
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
    wrapColumn(column) {
        // const reserved = ['batch', 'select', 'from', 'to', 'where', 'and', 'or', 'order', 'group'] // expandable
        // if (/[^a-zA-Z0-9_]/.test(column) || reserved.includes(column.toLowerCase())) {
        //   return `"${column}"`
        // }
        return column;
    }
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
    parameter(value) {
        return "?";
    }
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
    getColumnType(column) {
        switch (column.type) {
            case "bigIncrements":
            case "bigInteger":
                return "bigint";
            case "integer":
            case "int":
                return "int";
            case "string":
                return "text";
            case "text":
                return "text";
            case "boolean":
                return "boolean";
            case "decimal":
            case "float":
            case "double":
                return "decimal";
            case "date":
            case "dateTime":
            case "timestamp":
                return "timestamp";
            case "json":
                return "text";
            case "uuid":
                return "uuid";
            case "timeuuid":
                return "timeuuid";
            case "counter":
                return "counter";
            case "set":
                return `set<${column.elementType}>`;
            case "list":
                return `list<${column.elementType}>`;
            case "map":
                return `map<${column.keyType}, ${column.valueType}>`;
            default:
                return "text";
        }
    }
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
    compileColumn(column) {
        const definition = `${this.wrapColumn(column.name)} ${this.getColumnType(column)}`;
        // ScyllaDB doesn't support DEFAULT values in the same way as SQL databases
        // Default values are typically handled at the application level
        return definition;
    }
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
    compileCreateTable({ name, columns, partitionKeys, clusteringKeys, clusteringOrder = {}, tableOptions = {}, }) {
        const columnDefs = columns.map((col) => this.compileColumn(col));
        let primaryKey = "";
        if (partitionKeys.length > 0) {
            if (clusteringKeys.length > 0) {
                primaryKey = `PRIMARY KEY ((${partitionKeys.join(", ")}), ${clusteringKeys.join(", ")})`;
            }
            else {
                primaryKey = `PRIMARY KEY ((${partitionKeys.join(", ")}))`;
            }
        }
        else {
            const primaryCols = columns.filter((col) => col.primary);
            if (primaryCols.length > 0) {
                if (clusteringKeys.length > 0) {
                    primaryKey = `PRIMARY KEY ((${primaryCols.map((col) => col.name).join(", ")}), ${clusteringKeys.join(", ")})`;
                }
                else {
                    primaryKey = `PRIMARY KEY ((${primaryCols.map((col) => col.name).join(", ")}))`;
                }
            }
        }
        if (primaryKey) {
            columnDefs.push(primaryKey);
        }
        let clusteringOrderClause = "";
        const orderEntries = Object.entries(clusteringOrder);
        if (orderEntries.length > 0) {
            const orderStr = orderEntries.map(([key, dir]) => `${key} ${dir}`).join(", ");
            clusteringOrderClause = ` WITH CLUSTERING ORDER BY (${orderStr})`;
        }
        const optionsClauses = [];
        for (const [key, value] of Object.entries(tableOptions)) {
            if (typeof value === "object" && value !== null) {
                const inner = Object.entries(value)
                    .map(([k, v]) => `'${k}': ${typeof v === "string" ? `'${v}'` : v}`)
                    .join(", ");
                optionsClauses.push(`${key} = { ${inner} }`);
            }
            else {
                optionsClauses.push(`${key} = ${typeof value === "string" ? `'${value}'` : value}`);
            }
        }
        let withOptionsClause = "";
        if (clusteringOrderClause || optionsClauses.length > 0) {
            const withs = [
                clusteringOrderClause,
                ...optionsClauses.map((opt, i) => `${i === 0 && !clusteringOrderClause ? "WITH" : "AND"} ${opt}`),
            ];
            withOptionsClause = ` ${withs.join(" ")}`;
        }
        return `CREATE TABLE ${this.wrapTable(name)} (${columnDefs.join(", ")})${withOptionsClause}`;
    }
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
    compileAlterTable({ name, columns }) {
        if (!columns || columns.length === 0) {
            throw new Error("No columns provided for ALTER TABLE.");
        }
        const table = this.wrapTable(name);
        const adds = columns.map(col => `ADD ${this.wrapColumn(col.name)} ${this.getColumnType(col)}`);
        return `ALTER TABLE ${table} ${adds.join(", ")}`;
    }
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
    compileTableExists(table) {
        return `
      SELECT table_name
      FROM system_schema.tables
      WHERE keyspace_name = ?
        AND table_name = ?
    `.trim().replace(/\s+/g, " ");
    }
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
    compileColumnExists(table, column) {
        return `
      SELECT column_name
      FROM system_schema.columns
      WHERE keyspace_name = ?
        AND table_name = ?
        AND column_name = ?
    `.trim().replace(/\s+/g, " ");
    }
    /**
     * Renames a table in ScyllaDB.
     * ScyllaDB/Cassandra doğrudan tablo yeniden adlandırmayı desteklemez.
     *
     * @param from - Mevcut tablo adı
     * @param to - Yeni tablo adı
     * @throws {Error} Always throws since table rename is unsupported.
     */
    rename(from, to) {
        return Promise.reject(new Error(`Table rename from "${from}" to "${to}" is not supported by ScyllaDB.`));
    }
}
exports.ScyllaDBGrammar = ScyllaDBGrammar;
//# sourceMappingURL=ScyllaDBGrammar.js.map