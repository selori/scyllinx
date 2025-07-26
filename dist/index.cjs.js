'use strict';

var cassandraDriver = require('cassandra-driver');
var util = require('util');
var faker = require('@faker-js/faker');
require('reflect-metadata');

/**
 * Represents a database connection with its associated driver and configuration.
 * Manages the lifecycle and operations of a single database connection.
 *
 * @example
 *
 * const connection = new Connection('scylladb', driver, {
 *   hosts: ['127.0.0.1'],
 *   keyspace: 'my_app'
 * });
 *
 * await connection.connect();
 * const result = await connection.query('SELECT * FROM users');
 * await connection.disconnect();
 *
 */
class Connection {
    /**
     * Creates a new database connection instance.
     *
     * @param name - Unique identifier for this connection
     * @param driver - Database driver instance to handle queries
     * @param config - Connection configuration options
     *
     * @example
     *
     * const connection = new Connection('default', new ScyllaDBDriver(), {
     *   hosts: ['localhost:9042'],
     *   keyspace: 'test_db',
     *   username: 'cassandra',
     *   password: 'cassandra'
     * });
     *
     */
    constructor(name, driver, config) {
        this.connected = false;
        this.name = name;
        this.driver = driver;
        this.config = config;
    }
    /**
     * Gets the connection name/identifier.
     *
     * @returns The unique name of this connection
     */
    getName() {
        return this.name;
    }
    /**
     * Gets the database driver instance.
     *
     * @returns The driver associated with this connection
     */
    getDriver() {
        return this.driver;
    }
    /**
     * Gets the connection configuration.
     *
     * @returns Configuration object used for this connection
     */
    getConfig() {
        return this.config;
    }
    /**
     * Establishes the database connection.
     * Initializes the driver and creates the actual database connection.
     *
     * @throws {Error} When connection fails or driver initialization fails
     *
     * @example
     *
     * try {
     *   await connection.connect();
     *   console.log('Connected successfully');
     * } catch (error) {
     *   console.error('Connection failed:', error);
     * }
     *
     */
    async connect() {
        if (this.connected) {
            return;
        }
        await this.driver.connect();
        this.connected = true;
    }
    /**
     * Closes the database connection.
     * Properly shuts down the driver and releases resources.
     *
     * @example
     *
     * await connection.disconnect();
     * console.log('Connection closed');
     *
     */
    async disconnect() {
        if (!this.connected) {
            return;
        }
        await this.driver.disconnect();
        this.connected = false;
    }
    /**
     * Checks if the connection is currently active.
     *
     * @returns True if connected, false otherwise
     */
    isConnected() {
        return this.connected;
    }
    /**
     * Executes a raw query against the database.
     *
     * @param query - SQL/CQL query string to execute
     * @param params - Optional parameters for the query
     * @returns Promise resolving to query results
     *
     * @throws {Error} When query execution fails or connection is not established
     *
     * @example
     *
     * // Simple query
     * const users = await connection.query('SELECT * FROM users');
     *
     * // Parameterized query
     * const user = await connection.query(
     *   'SELECT * FROM users WHERE id = ?',
     *   [userId]
     * );
     *
     */
    async query(query, params) {
        if (!this.connected) {
            throw new Error(`Connection '${this.name}' is not connected`);
        }
        return await this.driver.query(query, params);
    }
    /**
     * Begins a database transaction.
     * Note: ScyllaDB has limited transaction support compared to traditional RDBMS.
     *
     * @throws {Error} When transaction cannot be started
     *
     * @example
     *
     * await connection.beginTransaction();
     * try {
     *   await connection.query('INSERT INTO users ...');
     *   await connection.query('UPDATE profiles ...');
     *   await connection.commit();
     * } catch (error) {
     *   await connection.rollback();
     *   throw error;
     * }
     *
     */
    async beginTransaction() {
        await this.driver.beginTransaction();
    }
    /**
     * Commits the current transaction.
     *
     * @throws {Error} When commit fails or no active transaction
     */
    async commit() {
        await this.driver.commit();
    }
    /**
     * Rolls back the current transaction.
     *
     * @throws {Error} When rollback fails or no active transaction
     */
    async rollback() {
        await this.driver.rollback();
    }
}

/**
 * Abstract base class for database drivers.
 * Defines the interface that all database drivers must implement.
 * Provides common functionality and enforces consistent behavior across different database systems.
 *
 * @abstract
 *
 * @example
 *
 * class MyCustomDriver extends DatabaseDriver {
 *   async connect(): Promise<void> {
 *     // Implementation specific to your database
 *   }
 *
 *   async query(sql: string, bindings?: any[]): Promise<QueryResult> {
 *     // Execute query and return results
 *   }
 *
 *   // ... implement other abstract methods
 * }
 *
 */
class DatabaseDriver {
    /**
     * Creates a new DatabaseDriver instance.
     *
     * @param config - Database configuration object
     */
    constructor(config) {
        /** Transaction state flag */
        this.inTransaction = false;
        this.config = config;
    }
    /**
     * Checks if the driver is currently connected to the database.
     *
     * @returns True if connected, false otherwise
     *
     * @example
     *
     * if (driver.isConnected()) {
     *   console.log('Driver is connected');
     * }
     *
     */
    isConnected() {
        return !!this.connection;
    }
    /**
     * Checks if the driver is currently in a transaction.
     *
     * @returns True if in transaction, false otherwise
     *
     * @example
     *
     * if (driver.isInTransaction()) {
     *   console.log('Currently in transaction');
     * }
     *
     */
    isInTransaction() {
        return this.inTransaction;
    }
}

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
class QueryGrammar {
}

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
class ScyllaDBGrammar extends QueryGrammar {
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

/**
 * ScyllaDB database driver implementation.
 * Provides ScyllaDB-specific functionality including connection management,
 * query execution, batch operations, and data type mapping.
 *
 * @extends DatabaseDriver
 *
 * @example
 *
 * const config = {
 *   driver: 'scylladb',
 *   host: 'localhost',
 *   keyspace: 'myapp',
 *   localDataCenter: 'datacenter1',
 *   username: 'cassandra',
 *   password: 'cassandra'
 * };
 *
 * const driver = new ScyllaDBDriver(config);
 * await driver.connect();
 * const result = await driver.query('SELECT * FROM users');
 *
 */
class ScyllaDBDriver extends DatabaseDriver {
    /**
     * Creates a new ScyllaDBDriver instance.
     *
     * @param config - Database configuration object
     */
    constructor(config) {
        super(config);
        /** Cache for prepared statements */
        this.preparedStatements = new Map();
        this.grammar = new ScyllaDBGrammar();
    }
    /**
     * Establishes connection to ScyllaDB cluster.
     * Configures client options including contact points, data center, keyspace, and credentials.
     *
     * @returns Promise that resolves when connection is established
     * @throws {Error} When connection fails
     *
     * @example
     *
     * await driver.connect();
     * console.log('Connected to ScyllaDB');
     *
     */
    async connect() {
        const clientOptions = {
            contactPoints: [this.config.host || "localhost"],
            localDataCenter: this.config.localDataCenter || "datacenter1",
            keyspace: this.config.keyspace,
            credentials: this.config.username && this.config.password
                ? {
                    username: this.config.username,
                    password: this.config.password,
                }
                : undefined,
            ...this.config,
        };
        this.client = new cassandraDriver.Client(clientOptions);
        await this.client.connect();
        this.connection = this.client;
    }
    /**
     * Closes connection to ScyllaDB cluster.
     *
     * @returns Promise that resolves when connection is closed
     *
     * @example
     *
     * await driver.disconnect();
     * console.log('Disconnected from ScyllaDB');
     *
     */
    async disconnect() {
        if (this.client) {
            await this.client.shutdown();
            this.connection = null;
        }
    }
    /**
     * Executes a CQL query against ScyllaDB.
     * Automatically prepares statements for better performance and maps result rows.
     *
     * @param cql - The CQL query to execute
     * @param params - Optional parameters for the query
     * @returns Promise resolving to query results with mapped rows
     * @throws {Error} When query execution fails
     *
     * @example
     *
     * const result = await driver.query(
     *   'SELECT * FROM users WHERE status = ?',
     *   ['active']
     * );
     * console.log(`Found ${result.rowCount} users`);
     * result.rows.forEach(user => console.log(user.name));
     *
     */
    async query(cql, params) {
        try {
            const result = await this.client.execute(cql, params || [], { prepare: true });
            return {
                rows: result.rows?.map((row) => this.mapRow(row)),
                rowCount: result.rowLength || 0,
                // fields: result.columns?.map((col) => ({
                //   name: col.name,
                //   type: col.type.code.toString(),
                //   nullable: true,
                // })),
            };
        }
        catch (error) {
            throw new Error(`ScyllaDB query failed: ${error.message}`);
        }
    }
    /**
     * Prepares a CQL statement for repeated execution.
     * Caches prepared statements to avoid re-preparation overhead.
     *
     * @param cql - The CQL statement to prepare
     * @returns Promise resolving to prepared statement wrapper
     * @throws {Error} When statement preparation fails
     *
     * @example
     *
     * const prepared = await driver.prepare('INSERT INTO users (id, name) VALUES (?, ?)');
     * await prepared.execute(['123', 'John']);
     * await prepared.execute(['456', 'Jane']);
     *
     */
    async prepare(cql) {
        if (this.preparedStatements.has(cql)) {
            const prepared = this.preparedStatements.get(cql);
            return new ScyllaDBPreparedStatement(this.client, prepared);
        }
        const prepared = await this.client.execute(cql, { prepare: true });
        this.preparedStatements.set(cql, prepared);
        return new ScyllaDBPreparedStatement(this.client, prepared);
    }
    /**
     * Executes multiple queries as a batch operation.
     * Provides atomicity for related operations and better performance for bulk operations.
     *
     * @param queries - Array of query objects with CQL and parameters
     * @returns Promise resolving to batch execution result
     * @throws {Error} When batch execution fails
     *
     * @example
     *
     * await driver.batch([
     *   { query: 'INSERT INTO users (id, name) VALUES (?, ?)', params: ['1', 'John'] },
     *   { query: 'INSERT INTO profiles (user_id, bio) VALUES (?, ?)', params: ['1', 'Developer'] }
     * ]);
     *
     */
    async batch(queries) {
        const batch = queries.map((q) => ({ query: q.query, params: q.params || [] }));
        await this.client.batch(batch, {
            prepare: true,
            consistency: cassandraDriver.types.consistencies.localQuorum,
        });
        return {
            rows: [],
            rowCount: 0,
        };
    }
    /**
     * Begins a database transaction.
     * Note: ScyllaDB uses lightweight transactions (LWT) instead of traditional ACID transactions.
     *
     * @returns Promise that resolves when transaction begins
     */
    async beginTransaction() {
        // ScyllaDB uses lightweight transactions (LWT) instead
        this.inTransaction = true;
    }
    /**
     * Commits the current transaction.
     *
     * @returns Promise that resolves when transaction is committed
     */
    async commit() {
        this.inTransaction = false;
    }
    /**
     * Rolls back the current transaction.
     *
     * @returns Promise that resolves when transaction is rolled back
     */
    async rollback() {
        this.inTransaction = false;
    }
    /**
     * Gets the ID of the last inserted record.
     * Note: ScyllaDB doesn't have auto-increment, so this typically returns empty.
     *
     * @returns Promise resolving to empty string (ScyllaDB doesn't support auto-increment)
     */
    async getLastInsertId() {
        // ScyllaDB doesn't have auto-increment, return empty
        return "";
    }
    /**
     * Escapes a value for safe inclusion in CQL queries.
     * Handles null values, strings, booleans, and other data types.
     *
     * @param value - The value to escape
     * @returns Escaped string representation of the value
     *
     * @example
     *
     * const escaped = driver.escape("O'Reilly");
     * // Returns: "'O''Reilly'"
     *
     * const escapedBool = driver.escape(true);
     * // Returns: "true"
     *
     */
    escape(value) {
        if (value === null || value === undefined) {
            return "NULL";
        }
        if (typeof value === "string") {
            return `'${value.replace(/'/g, "''")}'`;
        }
        if (typeof value === "boolean") {
            return value ? "true" : "false";
        }
        return String(value);
    }
    /**
     * Gets the query grammar instance for this driver.
     *
     * @returns The ScyllaDBGrammar instance
     */
    getGrammar() {
        return this.grammar;
    }
    /**
     * Checks if the driver supports a specific feature.
     *
     * @param feature - The feature name to check
     * @returns True if feature is supported, false otherwise
     *
     * @example
     *
     * if (driver.supportsFeature('batch_operations')) {
     *   console.log('Batch operations are supported');
     * }
     *
     * if (driver.supportsFeature('ttl')) {
     *   console.log('TTL is supported');
     * }
     *
     */
    supportsFeature(feature) {
        const supportedFeatures = [
            "prepared_statements",
            "batch_operations",
            "lightweight_transactions",
            "materialized_views",
            "secondary_indexes",
            "collections",
            "user_defined_types",
            "counters",
            "ttl",
        ];
        return supportedFeatures.includes(feature);
    }
    /**
     * Maps a ScyllaDB row to a plain JavaScript object.
     * Handles ScyllaDB-specific data types and converts them to JavaScript equivalents.
     *
     * @private
     * @param row - The raw row from ScyllaDB
     * @returns Mapped plain object
     */
    mapRow(row) {
        const result = {};
        for (const [key, value] of Object.entries(row)) {
            result[key] = this.mapValue(value);
        }
        return result;
    }
    /**
     * Maps ScyllaDB values to JavaScript types.
     * Handles UUID, TimeUUID, BigDecimal, Long, Date, and other ScyllaDB-specific types.
     *
     * @private
     * @param value - The value to map
     * @returns Mapped JavaScript value
     *
     * @example
     *
     * // Internal usage - converts ScyllaDB types to JS types
     * const uuid = mapValue(scyllaUuid); // Returns string
     * const timestamp = mapValue(scyllaTimestamp); // Returns ISO string
     * const decimal = mapValue(scyllaBigDecimal); // Returns number
     *
     */
    mapValue(value) {
        if (value === null || value === undefined) {
            return null;
        }
        // Handle ScyllaDB-specific types
        if (value instanceof cassandraDriver.types.Uuid) {
            return value.toString();
        }
        if (value instanceof cassandraDriver.types.TimeUuid) {
            return value.toString();
        }
        if (value instanceof cassandraDriver.types.BigDecimal) {
            return value.toNumber();
        }
        if (value instanceof cassandraDriver.types.Long) {
            return value.toNumber();
        }
        if (value instanceof Date) {
            return value.toISOString();
        }
        return value;
    }
}
/**
 * ScyllaDB-specific prepared statement implementation.
 * Wraps the native ScyllaDB prepared statement with consistent interface.
 *
 * @implements PreparedStatement
 *
 * @example
 *
 * const prepared = await driver.prepare('SELECT * FROM users WHERE id = ?');
 * const result = await prepared.execute(['123']);
 * await prepared.close();
 *
 */
class ScyllaDBPreparedStatement {
    /**
     * Creates a new ScyllaDBPreparedStatement instance.
     *
     * @param client - The ScyllaDB client instance
     * @param prepared - The native prepared statement
     */
    constructor(client, prepared) {
        this.client = client;
        this.prepared = prepared;
    }
    /**
     * Executes the prepared statement with given parameters.
     *
     * @param bindings - Optional parameter bindings
     * @returns Promise resolving to query results
     * @throws {Error} When execution fails
     *
     * @example
     *
     * const result = await prepared.execute(['user123', 'active']);
     * console.log(`Found ${result.rowCount} rows`);
     *
     */
    async execute(bindings) {
        const result = await this.client.execute(this.prepared, bindings || [], {
            consistency: cassandraDriver.types.consistencies.localQuorum,
        });
        return {
            rows: result.rows || [],
            rowCount: result.rowLength || 0,
        };
    }
    /**
     * Closes the prepared statement.
     * Note: ScyllaDB prepared statements are cached, so this is a no-op.
     *
     * @returns Promise that resolves immediately
     */
    async close() {
        // Prepared statements are cached, no need to close
    }
}

var ScyllaDBDriver$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ScyllaDBDriver: ScyllaDBDriver
});

/**
 * Manages multiple database connections in a centralized manner.
 * Implements singleton pattern to ensure consistent connection management across the application.
 * Supports multiple named connections with different configurations and drivers.
 *
 * @example
 *
 * const manager = ConnectionManager.getInstance();
 *
 * // Add connections
 * manager.addConnection('default', driver1, config1);
 * manager.addConnection('analytics', driver2, config2);
 *
 * // Use connections
 * const defaultConn = manager.getConnection();
 * const analyticsConn = manager.getConnection('analytics');
 *
 */
class ConnectionManager {
    /**
     * Private constructor to enforce singleton pattern.
     * Use getInstance() to get the ConnectionManager instance.
     */
    constructor() {
        this.connections = new Map();
        this.defaultConnection = "default";
    }
    /**
     * Gets the singleton instance of ConnectionManager.
     * Creates a new instance if one doesn't exist.
     *
     * @returns The singleton ConnectionManager instance
     *
     * @example
     *
     * const manager = ConnectionManager.getInstance();
     *
     */
    static getInstance() {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager();
        }
        return ConnectionManager.instance;
    }
    /**
     * Initializes the ConnectionManager with the given configuration object.
     *
     * @param {DatabaseConfig} config - An object containing global database settings
     *
     * @example
     * import { databaseConfig } from "@/database/config";
     *
     * // Load all configured connections at once
     * const manager = ConnectionManager.getInstance();
     * manager.initialize(databaseConfig);
     *
     * // Connect to every database in parallel
     * await manager.connectAll();
     *
     * // Now you can retrieve named connections or use the default:
     * const defaultConn = manager.getConnection();          // uses config.default
     * const analyticsConn = manager.getConnection("report"); // uses named key
     */
    initialize(config) {
        // Set the default connection name
        this.defaultConnection = config.default;
        // Add each configured connection
        for (const [name, connConfig] of Object.entries(config.connections)) {
            this.addConnection(name, connConfig);
        }
    }
    /**
     * Adds a new database connection to the manager.
     *
     * @param name - Unique identifier for the connection
     * @param driver - Database driver instance
     * @param config - Connection configuration options
     *
     * @throws {Error} When a connection with the same name already exists
     *
     * @example
     *
     * manager.addConnection('primary', {
     *   driver: 'scyyladb',
     *   hosts: ['127.0.0.1:9042'],
     *   keyspace: 'main_db'
     * });
     *
     * manager.addConnection('cache', {
     *   driver: 'scyyladb',
     *   hosts: ['cache-cluster:9042'],
     *   keyspace: 'cache_db'
     * });
     *
     */
    addConnection(name, config) {
        if (this.connections.has(name)) {
            throw new Error(`Connection '${name}' already exists`);
        }
        let driver;
        switch (config.driver) {
            case "scylladb":
                driver = new ScyllaDBDriver(config);
                break;
            default:
                throw new Error(`Unsupported database driver: ${config.driver}`);
        }
        const connection = new Connection(name, driver, config);
        this.connections.set(name, connection);
    }
    /**
     * Retrieves a connection by name.
     * If no name is provided, returns the default connection.
     *
     * @param name - Optional connection name. Uses default if not provided
     * @returns The requested connection instance
     *
     * @throws {Error} When the requested connection doesn't exist
     *
     * @example
     *
     * // Get default connection
     * const conn = manager.getConnection();
     *
     * // Get named connection
     * const cacheConn = manager.getConnection('cache');
     *
     */
    getConnection(name) {
        const connectionName = name || this.defaultConnection;
        const connection = this.connections.get(connectionName);
        if (!connection) {
            throw new Error(`Connection '${connectionName}' not found`);
        }
        return connection;
    }
    /**
     * Sets the default connection name.
     * This connection will be used when no specific connection is requested.
     *
     * @param name - Name of the connection to set as default
     *
     * @throws {Error} When the specified connection doesn't exist
     *
     * @example
     *
     * manager.setDefaultConnection('primary');
     *
     * // Now this will use 'primary' connection
     * const conn = manager.getConnection();
     *
     */
    setDefaultConnection(name) {
        if (!this.connections.has(name)) {
            throw new Error(`Connection '${name}' not found`);
        }
        this.defaultConnection = name;
    }
    /**
     * Gets the name of the current default connection.
     *
     * @returns The name of the default connection
     */
    getDefaultConnectionName() {
        return this.defaultConnection;
    }
    /**
     * Checks if a connection with the given name exists.
     *
     * @param name - Connection name to check
     * @returns True if connection exists, false otherwise
     *
     * @example
     *
     * if (manager.hasConnection('analytics')) {
     *   const conn = manager.getConnection('analytics');
     *   // Use analytics connection
     * }
     *
     */
    hasConnection(name) {
        return this.connections.has(name);
    }
    /**
     * Removes a connection from the manager.
     * Automatically disconnects the connection before removal.
     *
     * @param name - Name of the connection to remove
     *
     * @throws {Error} When trying to remove a non-existent connection
     *
     * @example
     *
     * await manager.removeConnection('old_connection');
     *
     */
    async removeConnection(name) {
        const connection = this.connections.get(name);
        if (!connection) {
            throw new Error(`Connection '${name}' not found`);
        }
        if (connection.isConnected()) {
            await connection.disconnect();
        }
        this.connections.delete(name);
        // If we removed the default connection, reset to 'default'
        if (this.defaultConnection === name) {
            this.defaultConnection = "default";
        }
    }
    /**
   * Returns all managed Connection instances.
   *
   * @returns {Connection[]} Array of Connection objects.
   */
    getConnections() {
        return Array.from(this.connections.values());
    }
    /**
     * Returns all managed connection names.
     *
     * @returns {string[]} Array of connection name strings.
     * @example
     *
     * const names = manager.getConnectionNames();
     * console.log('Available connections:', names);
     */
    getConnectionNames() {
        return Array.from(this.connections.keys());
    }
    /**
     * Tests the specified connection by connecting and disconnecting.
     *
     * @param {string} name - Connection name to test.
     * @returns {Promise<boolean>} True if connect/disconnect succeeds, false otherwise.
     * @throws {Error} If the connection name is not found.
     * @example
     *
     * const isScyllaHealthy = await connectionManager.testConnection('scylladb')
     * console.log(isScyllaHealthy ? 'OK' : 'Failed');
     */
    async testConnection(name) {
        const connection = this.getConnection(name);
        try {
            await connection.connect();
            await connection.disconnect();
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Connects all managed connections.
     * Useful for application startup to establish all database connections.
     *
     * @throws {Error} When any connection fails to connect
     *
     * @example
     *
     * try {
     *   await manager.connectAll();
     *   console.log('All connections established');
     * } catch (error) {
     *   console.error('Failed to connect:', error);
     * }
     *
     */
    async connectAll() {
        const promises = Array.from(this.connections.values()).map((conn) => conn.connect());
        await Promise.all(promises);
    }
    /**
     * Disconnects all managed connections.
     * Useful for graceful application shutdown.
     *
     * @example
     *
     * // During app shutdown
     * await manager.disconnectAll();
     * console.log('All connections closed');
     *
     */
    async disconnectAll() {
        const promises = Array.from(this.connections.values()).map((conn) => conn.disconnect());
        await Promise.all(promises);
    }
    /**
     * Gets the total number of managed connections.
     *
     * @returns Number of connections
     */
    getConnectionCount() {
        return this.connections.size;
    }
    /**
     * Clears all connections from the manager.
     * Disconnects all connections before clearing.
     *
     * @example
     *
     * await manager.clear();
     * console.log('All connections removed');
     *
     */
    async clear() {
        await this.disconnectAll();
        this.connections.clear();
        this.defaultConnection = "default";
    }
}

/**
 * Registry for managing model classes and their aliases.
 * Provides centralized model registration and retrieval with support for aliases and auto-discovery.
 *
 * @example
 *
 * const registry = ModelRegistry.getInstance();
 *
 * // Register models
 * registry.register('User', User, ['user', 'users']);
 * registry.register('Post', Post);
 *
 * // Retrieve models
 * const UserModel = registry.get('User');
 * const user = new UserModel({ name: 'John' });
 *
 * // Use aliases
 * const SameUserModel = registry.get('users');
 *
 */
class ModelRegistry {
    constructor() {
        /** Map of model names to model classes */
        this.models = new Map();
        /** Map of aliases to model names */
        this.aliases = new Map();
    }
    /**
     * Gets the singleton instance of ModelRegistry.
     *
     * @returns The ModelRegistry instance
     *
     * @example
     *
     * const registry = ModelRegistry.getInstance();
     *
     */
    static getInstance() {
        if (!ModelRegistry.instance) {
            ModelRegistry.instance = new ModelRegistry();
        }
        return ModelRegistry.instance;
    }
    /**
     * Registers a model class with optional aliases.
     *
     * @template TAttrs - Model attributes type
     * @param name - Primary name for the model
     * @param modelClass - Model class constructor
     * @param aliases - Optional array of alias names
     * @returns This registry instance for chaining
     *
     * @example
     *
     * registry.register('User', User, ['user', 'users'])
     *   .register('Post', Post, ['post', 'posts'])
     *   .register('Comment', Comment);
     *
     */
    register(name, modelClass, aliases = []) {
        this.models.set(name, modelClass);
        aliases.forEach((alias) => {
            this.aliases.set(alias, name);
        });
        this.aliases.set(name.toLowerCase(), name);
        this.aliases.set(this.pluralize(name.toLowerCase()), name);
        return this;
    }
    /**
     * Retrieves a model class by name or alias.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param name - Model name or alias
     * @returns Model class constructor
     * @throws {Error} When model is not found
     *
     * @example
     *
     * const User = registry.get<UserAttributes, User>('User');
     * const user = new User({ name: 'John' });
     *
     * // Using alias
     * const SameUser = registry.get('users');
     *
     */
    get(name) {
        const ModelClass = this.models.get(name) || this.models.get(this.aliases.get(name));
        if (!ModelClass) {
            throw new Error(`Model '${name}' not found`);
        }
        return ModelClass;
    }
    /**
     * Checks if a model is registered.
     *
     * @param name - Model name or alias to check
     * @returns True if model exists in registry
     *
     * @example
     *
     * if (registry.has('User')) {
     *   console.log('User model is registered');
     * }
     *
     * if (registry.has('users')) {
     *   console.log('User model found by alias');
     * }
     *
     */
    has(name) {
        return this.models.has(name) || this.aliases.has(name);
    }
    /**
     * Gets all registered models.
     *
     * @returns Map of model names to model classes
     *
     * @example
     *
     * const allModels = registry.all();
     * for (const [name, ModelClass] of allModels) {
     *   console.log(`Registered model: ${name}`);
     * }
     *
     */
    all() {
        return new Map(this.models);
    }
    /**
     * Gets all registered model names.
     *
     * @returns Array of model names
     *
     * @example
     *
     * const modelNames = registry.getModelNames();
     * console.log('Registered models:', modelNames); // ['User', 'Post', 'Comment']
     *
     */
    getModelNames() {
        return Array.from(this.models.keys());
    }
    /**
     * Auto-discovers models in a directory.
     * Note: This is a placeholder implementation for future enhancement.
     *
     * @param directory - Directory path to scan for models
     *
     * @example
     *
     * registry.autoDiscover('./app/Models');
     *
     */
    autoDiscover(directory = "./app/Models") {
        console.log(`Auto-discovering models in ${directory}...`);
        // TODO: Implement directory scanning and model registration
    }
    /**
     * Converts a singular word to plural form.
     * Simple pluralization rules for English words.
     *
     * @private
     * @param word - Word to pluralize
     * @returns Pluralized word
     *
     * @example
     *
     * pluralize('user') // 'users'
     * pluralize('category') // 'categories'
     * pluralize('box') // 'boxes'
     *
     */
    pluralize(word) {
        if (word.endsWith("y"))
            return word.slice(0, -1) + "ies";
        if (word.match(/(s|sh|ch|x|z)$/))
            return word + "es";
        return word + "s";
    }
}

/**
 * QueryBuilder class for building and executing database queries.
 * Provides a fluent interface for constructing SQL/CQL queries with support for:
 * - Basic CRUD operations (SELECT, INSERT, UPDATE, DELETE)
 * - Complex WHERE clauses and joins
 * - ScyllaDB-specific features (ALLOW FILTERING, TTL, lightweight transactions)
 * - Eager loading of relationships
 * - Query optimization and debugging
 *
 * @template TModel - The model type this query builder operates on
 * @template TAttrs - The attributes/columns available for this model
 *
 * @example
 *
 * // Basic usage
 * const users = await new QueryBuilder('users')
 *   .where('active', true)
 *   .orderBy('created_at', 'desc')
 *   .limit(10)
 *   .get();
 *
 * // With model binding
 * const query = User.query()
 *   .where('email', 'john@example.com')
 *   .with('posts', 'comments');
 *
 * // ScyllaDB specific
 * const result = await new QueryBuilder('analytics')
 *   .where('user_id', userId)
 *   .allowFiltering()
 *   .get();
 * ```
 */
class QueryBuilder {
    /**
     * Creates a new QueryBuilder instance. haha
     *
     * @param table - The table name to query
     * @param connection - Optional connection name to use
     *
     * @example
     *
     * const qb = new QueryBuilder('users');
     * const qbWithConn = new QueryBuilder('users', 'analytics');
     * ```
     */
    constructor(table, connection) {
        // Query components
        this._select = ["*"];
        this._joins = [];
        this._wheres = [];
        this._groups = [];
        this._havings = [];
        this._orders = [];
        this._unions = [];
        this.eager = [];
        // ScyllaDB specific
        this._allowFiltering = false;
        this._ifNotExists = false;
        this._ifConditions = [];
        this._from = table;
        this.connection = connection;
        const connManager = ConnectionManager.getInstance();
        this.driver = connManager.getConnection(connection).getDriver();
        this.grammar = this.driver.getGrammar();
    }
    /**
     * Sets the model class for this query builder.
     * Enables model hydration and relationship loading.
     *
     * @param model - Model constructor function
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * const query = new QueryBuilder('users').setModel(User);
     * const users = await query.get(); // Returns User instances
     * ```
     */
    setModel(model) {
        this.model = model;
        return this;
    }
    /**
     * Specifies the columns to select in the query.
     * Replaces any previously selected columns.
     *
     * @param columns - Column names to select
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * // Select specific columns
     * query.select('id', 'name', 'email');
     *
     * // Select all columns (default)
     * query.select();
     * ```
     */
    select(...columns) {
        this._select = columns.length > 0 ? columns.map(String) : ["*"];
        return this;
    }
    /**
     * Adds additional columns to the existing SELECT clause.
     *
     * @param columns - Additional column names to select
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.select('id', 'name')
     *      .addSelect('email', 'created_at');
     * ```
     */
    addSelect(...columns) {
        if (this._select.length === 1 && this._select[0] === "*") {
            this._select = columns.map(String);
        }
        else {
            for (const col of columns) {
                const colStr = String(col);
                if (!this._select.includes(colStr)) {
                    this._select.push(colStr);
                }
            }
        }
        return this;
    }
    where(column, operatorOrValue, value) {
        const args = arguments;
        if (typeof column === "object") {
            Object.entries(column).forEach(([key, val]) => {
                this._wheres.push({
                    type: "basic",
                    column: key,
                    operator: "=",
                    value: val,
                    boolean: "and",
                });
            });
        }
        else if (args.length === 2) {
            this._wheres.push({
                type: "basic",
                column,
                operator: "=",
                value: operatorOrValue,
                boolean: "and",
            });
        }
        else {
            this._wheres.push({
                type: "basic",
                column,
                operator: operatorOrValue,
                value,
                boolean: "and",
            });
        }
        return this;
    }
    orWhere(column, operatorOrValue, value) {
        const args = arguments;
        if (args.length === 2) {
            this._wheres.push({
                type: "basic",
                column,
                operator: "=",
                value: operatorOrValue,
                boolean: "or",
            });
        }
        else {
            this._wheres.push({
                type: "basic",
                column,
                operator: operatorOrValue,
                value,
                boolean: "or",
            });
        }
        return this;
    }
    /**
     * Adds a WHERE IN clause to filter by multiple values.
     *
     * @param column - Column name to filter on
     * @param values - Array of values to match against
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereIn('status', ['active', 'pending', 'verified']);
     * query.whereIn('id', [1, 2, 3, 4, 5]);
     * ```
     */
    whereIn(column, values) {
        this._wheres.push({
            type: "in",
            column,
            values,
            boolean: "and",
        });
        return this;
    }
    /**
     * Adds a WHERE NOT IN clause to exclude multiple values.
     *
     * @param column - Column name to filter on
     * @param values - Array of values to exclude
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereNotIn('status', ['deleted', 'banned']);
     * ```
     */
    whereNotIn(column, values) {
        this._wheres.push({
            type: "notIn",
            column,
            values,
            boolean: "and",
        });
        return this;
    }
    /**
     * Adds a WHERE BETWEEN clause for range filtering.
     *
     * @param column - Column name to filter on
     * @param values - Tuple of [min, max] values
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereBetween('age', [18, 65]);
     * query.whereBetween('created_at', [startDate, endDate]);
     * ```
     */
    whereBetween(column, values) {
        this._wheres.push({
            type: "between",
            column,
            values,
            boolean: "and",
        });
        return this;
    }
    /**
     * Adds a WHERE NULL clause to filter for null values.
     *
     * @param column - Column name to check for null
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereNull('deleted_at');
     * ```
     */
    whereNull(column) {
        this._wheres.push({
            type: "null",
            column,
            boolean: "and",
        });
        return this;
    }
    /**
     * Adds a WHERE NOT NULL clause to filter for non-null values.
     *
     * @param column - Column name to check for non-null
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereNotNull('email_verified_at');
     * ```
     */
    whereNotNull(column) {
        this._wheres.push({
            type: "notNull",
            column,
            boolean: "and",
        });
        return this;
    }
    /**
     * Adds an INNER JOIN clause to the query.
     *
     * @param table - Table to join with
     * @param first - First column in the join condition
     * @param operator - Comparison operator
     * @param second - Second column in the join condition
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.join('profiles', 'users.id', '=', 'profiles.user_id');
     * ```
     */
    join(table, first, operator, second) {
        this._joins.push({
            type: "inner",
            table,
            first,
            operator,
            second,
        });
        return this;
    }
    /**
     * Adds a LEFT JOIN clause to the query.
     *
     * @param table - Table to join with
     * @param first - First column in the join condition
     * @param operator - Comparison operator
     * @param second - Second column in the join condition
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.leftJoin('profiles', 'users.id', '=', 'profiles.user_id');
     * ```
     */
    leftJoin(table, first, operator, second) {
        this._joins.push({
            type: "left",
            table,
            first,
            operator,
            second,
        });
        return this;
    }
    /**
     * Adds a RIGHT JOIN clause to the query.
     *
     * @param table - Table to join with
     * @param first - First column in the join condition
     * @param operator - Comparison operator
     * @param second - Second column in the join condition
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.rightJoin('profiles', 'users.id', '=', 'profiles.user_id');
     * ```
     */
    rightJoin(table, first, operator, second) {
        this._joins.push({
            type: "right",
            table,
            first,
            operator,
            second,
        });
        return this;
    }
    /**
     * Adds an ORDER BY clause to sort results.
     *
     * @param column - Column name to sort by
     * @param direction - Sort direction ('asc' or 'desc')
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.orderBy('created_at', 'desc');
     * query.orderBy('name'); // defaults to 'asc'
     * ```
     */
    orderBy(column, direction = "asc") {
        this._orders.push({
            column,
            direction: direction.toLowerCase(),
        });
        return this;
    }
    /**
     * Adds a GROUP BY clause for result grouping.
     *
     * @param columns - Column names to group by
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.groupBy('department', 'status');
     * ```
     */
    groupBy(...columns) {
        this._groups.push(...columns.map(String));
        return this;
    }
    /**
     * Adds a HAVING clause for filtering grouped results.
     *
     * @param column - Column name to filter on
     * @param operator - Comparison operator (optional, defaults to '=')
     * @param value - Value to compare against
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.groupBy('department')
     *      .having('count(*)', '>', 5);
     * ```
     */
    having(column, operator, value) {
        const args = arguments;
        if (args.length === 2) {
            value = operator;
            operator = "=";
        }
        this._havings.push({
            type: "basic",
            column,
            operator,
            value,
            boolean: "and",
        });
        return this;
    }
    /**
     * Sets the maximum number of results to return.
     *
     * @param value - Maximum number of results
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.limit(10); // Get only 10 results
     * ```
     */
    limit(value) {
        this._limit = value;
        return this;
    }
    /**
     * Sets the number of results to skip.
     *
     * @param value - Number of results to skip
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.offset(20); // Skip first 20 results
     * ```
     */
    offset(value) {
        this._offset = value;
        return this;
    }
    /**
     * Alias for limit() method.
     *
     * @param value - Maximum number of results
     * @returns QueryBuilder instance for method chaining
     */
    take(value) {
        return this.limit(value);
    }
    /**
     * Alias for offset() method.
     *
     * @param value - Number of results to skip
     * @returns QueryBuilder instance for method chaining
     */
    skip(value) {
        return this.offset(value);
    }
    // ScyllaDB specific methods
    /**
     * Adds ALLOW FILTERING to the query (ScyllaDB specific).
     * Use sparingly as it can impact performance significantly.
     *
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.where('non_indexed_column', 'value')
     *      .allowFiltering(); // Required for non-indexed columns
     * ```
     */
    allowFiltering() {
        this._allowFiltering = true;
        return this;
    }
    /**
     * Sets TTL (Time To Live) for INSERT/UPDATE operations (ScyllaDB specific).
     *
     * @param seconds - TTL in seconds
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.ttl(3600).insert(data); // Data expires in 1 hour
     * ```
     */
    ttl(seconds) {
        this._ttl = seconds;
        return this;
    }
    /**
     * Adds IF NOT EXISTS condition for lightweight transactions (ScyllaDB specific).
     *
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.ifNotExists().insert(data); // Only insert if doesn't exist
     * ```
     */
    ifNotExists() {
        this._ifNotExists = true;
        return this;
    }
    /**
     * Adds IF condition for lightweight transactions (ScyllaDB specific).
     *
     * @param column - Column name to check
     * @param operator - Comparison operator
     * @param value - Value to compare against
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.if('version', '=', 1).update(data); // Only update if version is 1
     * ```
     */
    if(column, operator, value) {
        this._ifConditions.push({
            type: "basic",
            column,
            operator,
            value,
            boolean: "AND",
        });
        return this;
    }
    /**
     * Adds TOKEN-based WHERE clause for ScyllaDB partition key filtering.
     *
     * @param columns - Partition key columns
     * @param operator - Comparison operator
     * @param values - Values to compare against
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * query.whereToken(['user_id'], '>', [1000]);
     * ```
     */
    whereToken(columns, operator, values) {
        this._wheres.push({
            type: "token",
            columns,
            operator,
            values,
            boolean: "and",
        });
        return this;
    }
    // Execution methods
    /**
     * Executes the query and returns all matching results.
     * If a model is bound, returns hydrated model instances.
     *
     * @returns Promise resolving to array of results
     *
     * @example
     *
     * const users = await User.query()
     *   .where('active', true)
     *   .get();
     * ```
     */
    async get() {
        const sql = this.grammar.compileSelect(this.toBase());
        const params = this.getParams();
        const result = await this.driver.query(sql, params);
        let models = [];
        if (this.model) {
            models = result.rows.map((row) => this.hydrate(row));
        }
        else {
            models = result.rows;
        }
        if (this.eager.length) {
            await Promise.all(models.map((m) => this.loadEagerFor(m, this.eager)));
        }
        return models;
    }
    /**
     * Specifies relationships to eager load with the query results.
     * Supports dot notation for nested relationships.
     *
     * @param relations - Relationship names to load
     * @returns QueryBuilder instance for method chaining
     *
     * @example
     *
     * const users = await User.query()
     *   .with('posts', 'profile')
     *   .get();
     *
     * // Nested relationships
     * const users = await User.query()
     *   .with('posts.comments', 'posts.tags')
     *   .get();
     * ```
     */
    with(...relations) {
        const items = Array.isArray(relations) ? relations : [relations];
        this.eager.push(...items);
        return this;
    }
    /**
     * Loads eager relationships for a single model instance.
     * Supports nested relationship loading with dot notation.
     *
     * @param model - Model instance to load relationships for
     * @param relations - Array of relationship names to load
     *
     * @example
     *
     * await query.loadEagerFor(user, ['posts', 'profile']);
     * await query.loadEagerFor(user, ['posts.comments']);
     * ```
     */
    async loadEagerFor(model, relations) {
        for (const rel of relations) {
            const [head, ...tail] = rel.split(".");
            const relInstance = model[`${head}Relation`]();
            const result = await relInstance.getResults();
            model.setAttribute(head, result);
            if (tail.length && result) {
                const babies = Array.isArray(result) ? result : [result];
                await Promise.all(babies.map((b) => this.loadEagerFor(b, [tail.join(".")])));
            }
        }
    }
    /**
     * Executes the query and returns the first matching result.
     *
     * @returns Promise resolving to first result or null if none found
     *
     * @example
     *
     * const user = await User.query()
     *   .where('email', 'john@example.com')
     *   .first();
     * ```
     */
    async first() {
        const results = await this.take(1).get();
        return results.length > 0 ? results[0] : null;
    }
    /**
     * Gets the count of records matching the query.
     *
     * @param column - Column to count (defaults to '*')
     * @returns Promise resolving to count number
     *
     * @example
     *
     * const userCount = await User.query()
     *   .where('active', true)
     *   .count();
     *
     * const emailCount = await User.query()
     *   .count('email');
     * ```
     */
    async count(column = "*") {
        const clone = this.clone();
        clone._select = [`COUNT(${column}) as aggregate`];
        const result = await clone.get();
        return result[0]?.aggregate || 0;
    }
    /**
     * Checks if any records exist matching the query.
     *
     * @returns Promise resolving to boolean
     *
     * @example
     *
     * const hasActiveUsers = await User.query()
     *   .where('active', true)
     *   .exists();
     * ```
     */
    async exists() {
        const count = await this.count();
        return count > 0;
    }
    /**
     * Inserts new record(s) into the database.
     * Supports both single record and batch insert operations.
     *
     * @param values - Record data or array of records to insert
     * @returns Promise resolving to boolean indicating success
     *
     * @example
     *
     * // Single insert
     * await query.insert({
     *   name: 'John Doe',
     *   email: 'john@example.com'
     * });
     *
     * // Batch insert
     * await query.insert([
     *   { name: 'John', email: 'john@example.com' },
     *   { name: 'Jane', email: 'jane@example.com' }
     * ]);
     * ```
     */
    async insert(values) {
        if (Array.isArray(values)) {
            const queries = values.map((value) => ({
                query: this.grammar.compileInsert({
                    table: this._from,
                    values: value,
                    ttl: this._ttl,
                    ifNotExists: this._ifNotExists,
                }),
                params: Object.values(value),
            }));
            if (this.driver instanceof (await Promise.resolve().then(function () { return ScyllaDBDriver$1; })).ScyllaDBDriver) {
                await this.driver.batch(queries);
            }
            else {
                for (const query of queries) {
                    await this.driver.query(query.query, query.params);
                }
            }
        }
        else {
            const sql = this.grammar.compileInsert({
                table: this._from,
                values,
                ttl: this._ttl,
                ifNotExists: this._ifNotExists,
            });
            const params = Object.values(values);
            await this.driver.query(sql, params);
        }
        return true;
    }
    /**
     * Inserts a new record and returns the generated ID.
     *
     * @param values - Record data to insert
     * @returns Promise resolving to the generated ID
     *
     * @example
     *
     * const userId = await query.insertGetId({
     *   name: 'John Doe',
     *   email: 'john@example.com'
     * });
     * ```
     */
    async insertGetId(values) {
        await this.insert(values);
        return await this.driver.getLastInsertId();
    }
    /**
     * Updates records matching the current query conditions.
     *
     * @param values - Data to update
     * @returns Promise resolving to number of affected rows
     *
     * @example
     *
     * const updated = await User.query()
     *   .where('active', false)
     *   .update({ status: 'inactive' });
     * ```
     */
    async update(values) {
        const sql = this.grammar.compileUpdate({
            table: this._from,
            values,
            wheres: this._wheres,
            ttl: this._ttl,
            ifConditions: this._ifConditions,
        });
        const params = [
            ...Object.values(values),
            ...this.getWhereParams(this._wheres),
            ...this.getWhereParams(this._ifConditions),
        ];
        const result = await this.driver.query(sql, params);
        return result.affectedRows || 0;
    }
    /**
     * Updates an existing record or inserts a new one if it doesn't exist.
     *
     * @param attributes - Attributes to search by
     * @param values - Values to update or insert
     * @returns Promise resolving to boolean indicating success
     *
     * @example
     *
     * await query.updateOrInsert(
     *   { email: 'john@example.com' },
     *   { name: 'John Doe', active: true }
     * );
     * ```
     */
    async updateOrInsert(attributes, values = {}) {
        const exists = await this.where(attributes).exists();
        if (exists) {
            return (await this.where(attributes).update(values)) > 0;
        }
        else {
            return await this.insert({ ...attributes, ...values });
        }
    }
    /**
     * Deletes records matching the current query conditions.
     *
     * If the model uses soft deletes (`static softDeletes = true`), this method
     * will perform an UPDATE setting the `deleted_at` timestamp instead of a hard delete.
     *
     * @returns {Promise<number>}
     *   The number of rows affected (hard-deleted or soft-deleted).
     *
     * @example
     * // Hard delete:
     * const removed = await User.query()
     *   .where('active', false)
     *   .delete();
     *
     * @example
     * // Soft delete (if User.softDeletes = true):
     * const trashed = await User.query()
     *   .where('role', 'guest')
     *   .delete();
     */
    async delete() {
        // Determine if we should soft-delete
        this._model;
        // if (modelClass.softDeletes) {
        //   // Soft delete: set deleted_at = now()
        //   const column = 'deleted_at'
        //   const now = new Date().toISOString()
        //   const sql = this.grammar.compileUpdate({
        //     table: this._from,
        //     wheres: this._wheres,
        //     updates: [{ column, value: '?' }],
        //     ifConditions: this._ifConditions,
        //   })
        //   const params = [ now, 
        //     ...this.getWhereParams(this._wheres),
        //     ...this.getWhereParams(this._ifConditions),
        //   ]
        //   const result = await this.driver.query(sql, params)
        //   return result.affectedRows || 0
        // }
        // Hard delete fallback
        const sql = this.grammar.compileDelete({
            table: this._from,
            wheres: this._wheres,
            ifConditions: this._ifConditions,
        });
        const params = [
            ...this.getWhereParams(this._wheres),
            ...this.getWhereParams(this._ifConditions),
        ];
        const result = await this.driver.query(sql, params);
        return result.affectedRows || 0;
    }
    /**
     * Truncates the entire table, removing all records.
     *
     * @example
     *
     * await query.truncate(); // Removes all records from table
     * ```
     */
    async truncate() {
        const sql = `TRUNCATE ${this.grammar.wrapTable(this._from)}`;
        await this.driver.query(sql);
    }
    // Helper methods
    /**
     * Converts the query builder to a base query object for grammar compilation.
     *
     * @returns Base query object
     */
    toBase() {
        return {
            columns: this._select,
            from: this._from,
            joins: this._joins,
            wheres: this._wheres,
            groups: this._groups,
            havings: this._havings,
            orders: this._orders,
            limit: this._limit,
            offset: this._offset,
            unions: this._unions,
            allowFiltering: this._allowFiltering,
        };
    }
    /**
     * Gets all query parameters in the correct order.
     *
     * @returns Array of parameter values
     */
    getParams() {
        return [...this.getWhereParams(this._wheres), ...this.getHavingParams()];
    }
    /**
     * Extracts parameter values from WHERE clauses.
     *
     * @param wheres - Array of WHERE clause objects
     * @returns Array of parameter values
     */
    getWhereParams(wheres) {
        const params = [];
        for (const where of wheres) {
            switch (where.type) {
                case "basic":
                    params.push(where.value);
                    break;
                case "in":
                case "notIn":
                    params.push(...(where.values ?? []));
                    break;
                case "between":
                    params.push(...(where.values ?? []));
                    break;
                case "token":
                    params.push(...(where.values ?? []));
                    break;
            }
        }
        return params;
    }
    /**
     * Extracts parameter values from HAVING clauses.
     *
     * @returns Array of parameter values
     */
    getHavingParams() {
        const params = [];
        for (const having of this._havings) {
            if (having.type === "basic") {
                params.push(having.value);
            }
        }
        return params;
    }
    /**
     * Creates a model instance from a database row.
     * Sets up the model with attributes, existence state, and original values.
     *
     * @param row - Raw database row data
     * @returns Hydrated model instance
     *
     * @throws {Error} When no model is bound to the query builder
     */
    hydrate(row) {
        if (!this.model) {
            throw new Error("Model is not set on QueryBuilder");
        }
        const inst = new this.model();
        inst.setAttributes(row);
        inst.setExists(true);
        inst.setOriginal(row);
        return inst;
    }
    /**
     * Creates a deep copy of the query builder.
     * Useful for creating variations of a query without affecting the original.
     *
     * @returns New QueryBuilder instance with copied state
     *
     * @example
     *
     * const baseQuery = User.query().where('active', true);
     * const adminQuery = baseQuery.clone().where('role', 'admin');
     * const userQuery = baseQuery.clone().where('role', 'user');
     * ```
     */
    clone() {
        const clone = new QueryBuilder(this._from, this.connection);
        clone._select = [...this._select];
        clone._joins = [...this._joins];
        clone._wheres = [...this._wheres];
        clone._groups = [...this._groups];
        clone._havings = [...this._havings];
        clone._orders = [...this._orders];
        clone._limit = this._limit;
        clone._offset = this._offset;
        clone._unions = [...this._unions];
        clone._allowFiltering = this._allowFiltering;
        clone._ttl = this._ttl;
        clone._ifNotExists = this._ifNotExists;
        clone._ifConditions = [...this._ifConditions];
        clone.model = this.model;
        return clone;
    }
    /**
     * Converts the query to its SQL/CQL string representation.
     * Useful for debugging and logging.
     *
     * @returns SQL/CQL query string
     *
     * @example
     *
     * const sql = User.query()
     *   .where('active', true)
     *   .toSql();
     * console.log(sql); // SELECT * FROM users WHERE active = ?
     * ```
     */
    toSql() {
        return this.grammar.compileSelect(this.toBase());
    }
    /**
     * Converts the query to SQL/CQL with parameter values interpolated.
     * Useful for debugging (do not use for actual query execution).
     *
     * @returns SQL/CQL query string with values
     *
     * @example
     *
     * const sql = User.query()
     *   .where('active', true)
     *   .toRawSql();
     * console.log(sql); // SELECT * FROM users WHERE active = true
     * ```
     */
    toRawSql() {
        const sql = this.toSql();
        const params = this.getParams();
        let index = 0;
        return sql.replace(/\?/g, () => {
            const param = params[index++];
            return typeof param === "string" ? `'${param}'` : String(param);
        });
    }
}

/**
 * Abstract base class for all relationship types in the ORM.
 * Provides common functionality for defining and querying relationships between models.
 * All specific relationship types (HasOne, HasMany, BelongsTo, etc.) extend this class.
 *
 * @template T - The parent model type
 * @template R - The related model type
 *
 * @abstract
 *
 * @example
 *
 * // This is typically used internally by specific relationship classes
 * class CustomRelationship extends Relationship<User, Post> {
 *   addConstraints(query: QueryBuilder<Post, any>) {
 *     return query.where('user_id', this.getParentKey());
 *   }
 *
 *   async getResults() {
 *     return await this.get();
 *   }
 * }
 *
 */
class Relationship {
    /**
     * Creates a new relationship instance.
     *
     * @param parent - The parent model instance
     * @param relatedCtor - Constructor function for the related model
     * @param foreignKey - Foreign key column name
     * @param localKey - Local key column name (usually primary key)
     *
     * @example
     *
     * // Typically called by specific relationship constructors
     * super(user, Post, 'user_id', 'id');
     *
     */
    constructor(parent, relatedCtor, foreignKey, localKey) {
        this.parent = parent;
        this.relatedCtor = relatedCtor;
        this.foreignKey = foreignKey;
        this.localKey = localKey;
    }
    /**
     * Creates a new instance of the related model.
     *
     * @protected
     * @returns New instance of the related model
     */
    related() {
        return new this.relatedCtor();
    }
    /**
     * Creates a new query builder for the related model.
     * Sets up the query with the correct table and model binding.
     *
     * @protected
     * @returns QueryBuilder instance for the related model
     */
    getQuery() {
        const instance = this.related();
        return new QueryBuilder(instance.getTable(), instance.getConnection()).setModel(this.relatedCtor);
    }
    /**
     * Executes the relationship query and returns all matching records.
     * Applies relationship constraints and enables filtering for ScyllaDB compatibility.
     *
     * @returns Promise resolving to array of related models
     *
     * @example
     *
     * const posts = await user.postsRelation().get();
     *
     */
    async get() {
        const query = this.getQuery();
        this.addConstraints(query).allowFiltering();
        return await query.get();
    }
    /**
     * Executes the relationship query and returns the first matching record.
     *
     * @returns Promise resolving to first related model or null
     *
     * @example
     *
     * const profile = await user.profileRelation().first();
     *
     */
    async first() {
        const query = this.getQuery();
        this.addConstraints(query);
        return await query.first();
    }
    /**
     * Adds a WHERE clause to the relationship query.
     * Allows for additional filtering beyond the basic relationship constraints.
     *
     * @param column - Column name to filter on
     * @param operator - Comparison operator (optional)
     * @param value - Value to compare against
     * @returns QueryBuilder instance with added constraints
     *
     * @example
     *
     * const activePosts = await user.postsRelation()
     *   .where('status', 'published')
     *   .get();
     *
     */
    where(column, operator, value) {
        const query = this.getQuery();
        this.addConstraints(query);
        return query.where(column, operator, value);
    }
    /**
     * Specifies relationships to eager load with the query results.
     * Enables loading nested relationships through the relationship chain.
     *
     * @param relations - Relationship names to eager load
     * @returns QueryBuilder instance with eager loading configured
     *
     * @example
     *
     * const postsWithComments = await user.postsRelation()
     *   .with('comments', 'tags')
     *   .get();
     *
     */
    with(...relations) {
        const query = this.getQuery();
        this.addConstraints(query).allowFiltering();
        return query.with(...relations);
    }
    /**
     * Gets the parent model's key value for the relationship.
     * Used to build relationship constraints.
     *
     * @protected
     * @returns The parent model's local key value
     */
    getParentKey() {
        return this.parent.getAttribute(this.localKey);
    }
    /**
     * Gets the foreign key column name.
     *
     * @returns Foreign key column name
     */
    getForeignKeyName() {
        return this.foreignKey;
    }
    /**
     * Gets the local key column name.
     *
     * @returns Local key column name
     */
    getLocalKeyName() {
        return this.localKey;
    }
}

/**
 * Represents an inverse one-to-one or one-to-many relationship.
 * The foreign key is stored on the parent model's table, pointing to the related model.
 * This is the "inverse" side of HasOne and HasMany relationships.
 *
 * @template T - The parent model type (the one with the foreign key)
 * @template R - The related model type (the one being referenced)
 *
 * @example
 *
 * // In Post model
 * userRelation(): BelongsTo<Post, User> {
 *   return new BelongsTo(this, User, 'user_id', 'id');
 * }
 *
 * // Usage
 * const post = await Post.find(1);
 * const user = await post.userRelation().getResults();
 *
 * // Associate with different user
 * const newUser = await User.find(2);
 * post.userRelation().associate(newUser);
 * await post.save();
 *
 */
class BelongsTo extends Relationship {
    /**
     * Adds constraints to the relationship query.
     * Filters the related model by its local key matching the parent's foreign key value.
     *
     * @param query - Query builder to add constraints to
     * @returns Modified query builder with relationship constraints
     *
     * @example
     *
     * // For Post belongsTo User relationship
     * // Adds: WHERE users.id = ? (where ? is post.user_id)
     *
     */
    addConstraints(query) {
        const foreignKey = this.getParentKey();
        if (foreignKey !== null && foreignKey !== undefined) {
            query.where(this.localKey, foreignKey);
        }
        return query;
    }
    /**
     * Gets the relationship results.
     * Returns a single related model instance or null if none exists.
     *
     * @returns Promise resolving to related model or null
     *
     * @example
     *
     * const post = await Post.find(1);
     * const user = await post.userRelation().getResults();
     *
     * if (user) {
     *   console.log(`Post author: ${user.name}`);
     * }
     *
     */
    async getResults() {
        return await this.first();
    }
    /**
     * Associates the parent model with a related model.
     * Sets the foreign key on the parent to point to the related model.
     * Does not save the parent model - you must call save() separately.
     *
     * @param model - Related model to associate with
     * @returns The parent model for method chaining
     *
     * @example
     *
     * const post = await Post.find(1);
     * const user = await User.find(2);
     *
     * post.userRelation().associate(user);
     * await post.save(); // Don't forget to save!
     *
     * console.log(post.user_id); // Will be set to user.id
     *
     */
    associate(model) {
        const parentKey = model.getAttribute(this.localKey);
        this.parent.setAttribute(this.foreignKey, parentKey);
        return this.parent;
    }
    /**
     * Dissociates the parent model from its related model.
     * Sets the foreign key on the parent to null.
     * Does not save the parent model - you must call save() separately.
     *
     * @returns The parent model for method chaining
     *
     * @example
     *
     * const post = await Post.find(1);
     *
     * post.userRelation().dissociate();
     * await post.save(); // Don't forget to save!
     *
     * console.log(post.user_id); // Will be null
     *
     * // Verify dissociation
     * const user = await post.userRelation().getResults();
     * console.log(user); // null
     *
     */
    dissociate() {
        this.parent.setAttribute(this.foreignKey, null);
        return this.parent;
    }
    /**
     * Gets the foreign key value from the parent model.
     * Overridden for BelongsTo since the foreign key is on the parent.
     *
     * @protected
     * @returns The foreign key value from the parent model
     */
    getParentKey() {
        return this.parent.getAttribute(this.foreignKey);
    }
}

/**
 * Represents a many-to-many relationship between two models.
 * Uses a pivot table to store the relationship data between the two models.
 * Supports additional pivot columns and constraints.
 *
 * @template Parent - The parent model type
 * @template Related - The related model type
 *
 * @example
 *
 * // In User model
 * rolesRelation(): BelongsToMany<User, Role> {
 *   return new BelongsToMany(
 *     this,
 *     Role,
 *     'user_roles',    // pivot table
 *     'user_id',       // foreign key for parent
 *     'role_id',       // foreign key for related
 *     'id',            // parent key
 *     'id'             // related key
 *   );
 * }
 *
 * // Usage
 * const user = await User.find(1);
 * const roles = await user.rolesRelation().getResults();
 *
 * // Attach roles
 * await user.rolesRelation().attach([1, 2, 3]);
 *
 * // With pivot data
 * await user.rolesRelation().attach(1, { assigned_at: new Date() });
 *
 */
class BelongsToMany extends Relationship {
    /**
     * Creates a new BelongsToMany relationship instance.
     *
     * @param parent - Parent model instance
     * @param related - Related model constructor
     * @param pivotTable - Name of the pivot table
     * @param foreignKey - Foreign key for parent in pivot table
     * @param relatedKey - Foreign key for related model in pivot table
     * @param parentKey - Local key on parent model
     * @param relatedPivotKey - Local key on related model
     *
     * @example
     *
     * // User belongs to many Roles through user_roles table
     * new BelongsToMany(
     *   this,           // User instance
     *   Role,           // Role constructor
     *   'user_roles',   // pivot table
     *   'user_id',      // parent foreign key
     *   'role_id',      // related foreign key
     *   'id',           // parent local key
     *   'id'            // related local key
     * );
     *
     */
    constructor(parent, related, pivotTable, foreignKey, relatedKey, parentKey, relatedPivotKey) {
        super(parent, related, foreignKey, parentKey);
        this.pivotColumns = [];
        this.pivotWheres = [];
        this.pivotTable = pivotTable;
        this.parentPivotKey = foreignKey;
        this.relatedPivotKey = relatedPivotKey;
        this.relatedKey = relatedKey;
        this.parentKey = parentKey;
    }
    /**
     * Adds constraints to the relationship query.
     * For SQL databases, uses JOIN to connect through pivot table.
     * For ScyllaDB, uses separate queries due to limited JOIN support.
     *
     * @param query - Query builder to add constraints to
     * @returns Modified query builder with relationship constraints
     */
    addConstraints(query) {
        const connection = this.parent.getConnection();
        if (connection !== "default") {
            const parentKey = this.getParentKey();
            query
                .select("*")
                .addSelect(...this.getPivotColumns())
                .join(this.pivotTable, `${this.getRelatedTable()}.${this.relatedPivotKey}`, "=", `${this.pivotTable}.${this.relatedPivotKey}`)
                .where(`${this.pivotTable}.${this.parentPivotKey}`, parentKey);
            for (const where of this.pivotWheres) {
                if (where.type === "in") {
                    query.whereIn(where.column, where.values ?? []);
                }
                else {
                    query.where(where.column, where.operator, where.value);
                }
            }
        }
        return query;
    }
    /**
     * Gets the relationship results.
     * Handles both SQL and NoSQL database approaches for many-to-many relationships.
     *
     * @returns Promise resolving to array of related models with pivot data
     *
     * @example
     *
     * const user = await User.find(1);
     * const roles = await user.rolesRelation().getResults();
     *
     * roles.forEach(role => {
     *   console.log(`Role: ${role.name}`);
     *   console.log(`Assigned at: ${role.pivot.assigned_at}`);
     * });
     *
     */
    async getResults() {
        const connection = this.parent.getConnection();
        if (connection === "default") {
            const parentId = this.getParentKey();
            // Get pivot records
            const pivotQuery = this.newPivotQuery();
            for (const where of this.pivotWheres) {
                if (where.type === "in") {
                    pivotQuery.whereIn(where.column, where.values ?? []);
                }
                else {
                    pivotQuery.where(where.column, where.operator, where.value);
                }
            }
            const allPivotRows = await pivotQuery.get();
            // Filter for composite partition key
            const pivotRows = allPivotRows.filter((row) => row[this.parentPivotKey] === parentId);
            const relatedIds = pivotRows.map((row) => row[this.relatedPivotKey]);
            if (!relatedIds.length)
                return [];
            // Get related models
            const relatedQuery = new QueryBuilder(this.getRelatedTable(), connection)
                .setModel(this.relatedCtor)
                .whereIn(this.relatedKey, relatedIds);
            const relatedModels = await relatedQuery.get();
            // Attach pivot data
            for (const model of relatedModels) {
                const pivot = pivotRows.find((pivot) => pivot[this.relatedPivotKey] === model.getAttribute(this.relatedPivotKey));
                model.setAttribute("pivot", pivot);
            }
            return relatedModels;
        }
        // SQL-supported driver with native join
        return this.get();
    }
    /**
     * Attaches related models to the parent through the pivot table.
     *
     * @param ids - ID or array of IDs to attach
     * @param attributes - Additional pivot table attributes
     * @returns Promise that resolves when attachment is complete
     *
     * @example
     *
     * const user = await User.find(1);
     *
     * // Attach single role
     * await user.rolesRelation().attach(1);
     *
     * // Attach multiple roles
     * await user.rolesRelation().attach([1, 2, 3]);
     *
     * // Attach with pivot data
     * await user.rolesRelation().attach(1, {
     *   assigned_at: new Date(),
     *   assigned_by: 'admin'
     * });
     *
     */
    async attach(ids, attributes = {}) {
        const idsArray = Array.isArray(ids) ? ids : [ids];
        const parentKey = this.getParentKey();
        const records = idsArray.map((id) => ({
            [this.parentPivotKey]: parentKey,
            [this.relatedPivotKey]: id,
            ...attributes,
        }));
        await this.newPivotQuery().insert(records);
    }
    /**
     * Detaches related models from the parent by removing pivot table records.
     *
     * @param ids - Optional ID or array of IDs to detach. If not provided, detaches all
     * @returns Promise resolving to number of detached records
     *
     * @example
     *
     * const user = await User.find(1);
     *
     * // Detach specific roles
     * await user.rolesRelation().detach([1, 2]);
     *
     * // Detach all roles
     * await user.rolesRelation().detach();
     *
     */
    async detach(ids) {
        const qb = this.newPivotQuery().where(this.parentPivotKey, this.getParentKey());
        if (ids != null) {
            const idsArray = Array.isArray(ids) ? ids : [ids];
            qb.whereIn(this.relatedPivotKey, idsArray);
        }
        return qb.delete();
    }
    /**
     * Synchronizes the relationship to match the given array of IDs.
     * Attaches missing relationships and optionally detaches extra ones.
     *
     * @param ids - Array of IDs that should be attached
     * @param detaching - Whether to detach IDs not in the array (default: true)
     * @returns Promise resolving to sync results with attached/detached arrays
     *
     * @example
     *
     * const user = await User.find(1);
     *
     * // Sync to specific roles (detaches others)
     * const result = await user.rolesRelation().sync([1, 2, 3]);
     * console.log(`Attached: ${result.attached.length}`);
     * console.log(`Detached: ${result.detached.length}`);
     *
     * // Sync without detaching
     * await user.rolesRelation().sync([4, 5], false);
     *
     */
    async sync(ids, detaching = true) {
        const changes = {
            attached: [],
            detached: [],
            updated: [],
        };
        const current = await this.newPivotQuery().where(this.parentPivotKey, this.getParentKey()).get();
        const currentIds = current.map((r) => r[this.relatedPivotKey]);
        const newIds = ids;
        const toAttach = newIds.filter((id) => !currentIds.includes(id));
        const toDetach = detaching ? currentIds.filter((id) => !newIds.includes(id)) : [];
        if (toAttach.length) {
            await this.attach(toAttach);
            changes.attached = toAttach;
        }
        if (toDetach.length) {
            await this.detach(toDetach);
            changes.detached = toDetach;
        }
        return changes;
    }
    /**
     * Toggles the attachment of related models.
     * Attaches if not currently attached, detaches if currently attached.
     *
     * @param ids - ID or array of IDs to toggle
     * @returns Promise resolving to toggle results with attached/detached arrays
     *
     * @example
     *
     * const user = await User.find(1);
     *
     * // Toggle roles - attach if not attached, detach if attached
     * const result = await user.rolesRelation().toggle([1, 2, 3]);
     * console.log(`Attached: ${result.attached}`);
     * console.log(`Detached: ${result.detached}`);
     *
     */
    async toggle(ids) {
        const idsArray = Array.isArray(ids) ? ids : [ids];
        const changes = { attached: [], detached: [] };
        const current = await this.newPivotQuery()
            .where(this.parentPivotKey, this.getParentKey())
            .whereIn(this.relatedPivotKey, idsArray)
            .get();
        const currentIds = current.map((r) => r[this.relatedPivotKey]);
        const toAttach = idsArray.filter((id) => !currentIds.includes(id));
        const toDetach = currentIds;
        if (toAttach.length) {
            await this.attach(toAttach);
            changes.attached = toAttach;
        }
        if (toDetach.length) {
            await this.detach(toDetach);
            changes.detached = toDetach;
        }
        return changes;
    }
    /**
     * Updates existing pivot table records for a specific related model.
     *
     * @param id - ID of the related model
     * @param attributes - Attributes to update in the pivot table
     * @returns Promise resolving to number of updated records
     *
     * @example
     *
     * const user = await User.find(1);
     *
     * // Update pivot data for a specific role
     * await user.rolesRelation().updateExistingPivot(1, {
     *   updated_at: new Date(),
     *   notes: 'Role permissions updated'
     * });
     *
     */
    async updateExistingPivot(id, attributes) {
        return this.newPivotQuery()
            .where(this.parentPivotKey, this.getParentKey())
            .where(this.relatedPivotKey, id)
            .update(attributes);
    }
    /**
     * Specifies additional pivot table columns to include in query results.
     *
     * @param columns - Pivot column names to include
     * @returns This relationship instance for method chaining
     *
     * @example
     *
     * const user = await User.find(1);
     * const roles = await user.rolesRelation()
     *   .withPivot('assigned_at', 'assigned_by')
     *   .getResults();
     *
     * roles.forEach(role => {
     *   console.log(`Assigned at: ${role.pivot.assigned_at}`);
     *   console.log(`Assigned by: ${role.pivot.assigned_by}`);
     * });
     *
     */
    withPivot(...columns) {
        this.pivotColumns.push(...columns);
        return this;
    }
    /**
     * Adds a WHERE constraint on pivot table columns.
     *
     * @param column - Pivot column name
     * @param operator - Comparison operator or value if using 2-param form
     * @param value - Value to compare against
     * @returns This relationship instance for method chaining
     *
     * @example
     *
     * const user = await User.find(1);
     * const activeRoles = await user.rolesRelation()
     *   .wherePivot('status', 'active')
     *   .wherePivot('assigned_at', '>', lastWeek)
     *   .getResults();
     *
     */
    wherePivot(column, operator, value) {
        if (value === undefined) {
            value = operator;
            operator = "=";
        }
        this.pivotWheres.push({
            column: `${this.pivotTable}.${column}`,
            operator,
            value,
        });
        return this;
    }
    /**
     * Adds a WHERE IN constraint on pivot table columns.
     *
     * @param column - Pivot column name
     * @param values - Array of values to match against
     * @returns This relationship instance for method chaining
     *
     * @example
     *
     * const user = await User.find(1);
     * const roles = await user.rolesRelation()
     *   .wherePivotIn('status', ['active', 'pending'])
     *   .getResults();
     *
     */
    wherePivotIn(column, values) {
        this.pivotWheres.push({
            type: "in",
            column: `${this.pivotTable}.${column}`,
            values,
        });
        return this;
    }
    /**
     * Gets the pivot table columns to select with proper aliasing.
     *
     * @protected
     * @returns Array of pivot column select statements
     */
    getPivotColumns() {
        const cols = [
            `${this.pivotTable}.${this.parentPivotKey} as pivot_${this.parentPivotKey}`,
            `${this.pivotTable}.${this.relatedPivotKey} as pivot_${this.relatedPivotKey}`,
        ];
        for (const c of this.pivotColumns) {
            cols.push(`${this.pivotTable}.${c} as pivot_${c}`);
        }
        return cols;
    }
    /**
     * Creates a new query builder for the pivot table.
     *
     * @protected
     * @returns QueryBuilder instance for pivot table operations
     */
    newPivotQuery() {
        const related = this.related();
        return new QueryBuilder(this.pivotTable, related.getConnection()).allowFiltering();
    }
    /**
     * Gets the related model's table name.
     *
     * @protected
     * @returns Related model table name
     */
    getRelatedTable() {
        return this.related().getTable();
    }
}

/**
 * Represents a one-to-many relationship where the parent model has multiple related models.
 * The foreign key is stored on the related model's table.
 *
 * @template T - The parent model type
 * @template R - The related model type
 *
 * @example
 *
 * // In User model
 * postsRelation(): HasMany<User, Post> {
 *   return new HasMany(this, Post, 'user_id', 'id');
 * }
 *
 * // Usage
 * const user = await User.find(1);
 * const posts = await user.postsRelation().getResults();
 *
 * // Create multiple related models
 * const newPosts = await user.postsRelation().createMany([
 *   { title: 'First Post', content: '...' },
 *   { title: 'Second Post', content: '...' }
 * ]);
 *
 */
class HasMany extends Relationship {
    /**
     * Adds constraints to the relationship query.
     * Filters the related models by the foreign key matching the parent's local key.
     *
     * @param query - Query builder to add constraints to
     * @returns Modified query builder with relationship constraints
     *
     * @example
     *
     * // For User hasMany Posts relationship
     * // Adds: WHERE posts.user_id = ?
     *
     */
    addConstraints(query) {
        const parentKey = this.getParentKey();
        if (parentKey !== null && parentKey !== undefined) {
            query.where(this.foreignKey, parentKey);
        }
        return query;
    }
    /**
     * Gets the relationship results.
     * Returns an array of all related model instances.
     *
     * @returns Promise resolving to array of related models
     *
     * @example
     *
     * const user = await User.find(1);
     * const posts = await user.postsRelation().getResults();
     *
     * posts.forEach(post => {
     *   console.log(post.title);
     * });
     *
     */
    async getResults() {
        return await this.get();
    }
    /**
     * Creates a new related model and associates it with the parent.
     * Sets the foreign key on the new model to link it to the parent.
     *
     * @param attributes - Attributes for the new related model
     * @returns Promise resolving to the created model
     *
     * @example
     *
     * const user = await User.find(1);
     * const post = await user.postsRelation().create({
     *   title: 'My New Post',
     *   content: 'This is the content of my post...',
     *   status: 'published'
     * });
     *
     * console.log(post.user_id); // Will be set to user.id
     *
     */
    async create(attributes) {
        const instance = new this.relatedCtor();
        instance.setAttribute(this.foreignKey, this.getParentKey());
        instance.fill(attributes);
        await instance.save();
        return instance;
    }
    /**
     * Creates multiple related models in a batch operation.
     * Each model will be associated with the parent via the foreign key.
     *
     * @param records - Array of attribute objects for the new models
     * @returns Promise resolving to array of created models
     *
     * @example
     *
     * const user = await User.find(1);
     * const posts = await user.postsRelation().createMany([
     *   { title: 'Post 1', content: 'Content 1' },
     *   { title: 'Post 2', content: 'Content 2' },
     *   { title: 'Post 3', content: 'Content 3' }
     * ]);
     *
     * console.log(`Created ${posts.length} posts`);
     *
     */
    async createMany(records) {
        const instances = [];
        for (const attributes of records) {
            const instance = await this.create(attributes);
            instances.push(instance);
        }
        return instances;
    }
    /**
     * Saves an existing related model and associates it with the parent.
     * Updates the foreign key on the model to link it to the parent.
     *
     * @param model - Related model instance to save
     * @returns Promise resolving to the saved model
     *
     * @example
     *
     * const user = await User.find(1);
     * const post = new Post();
     * post.title = 'New Post';
     * post.content = 'Post content';
     *
     * await user.postsRelation().save(post);
     * console.log(post.user_id); // Will be set to user.id
     *
     */
    async save(model) {
        model.setAttribute(this.foreignKey, this.getParentKey());
        await model.save();
        return model;
    }
    /**
     * Saves multiple existing models and associates them with the parent.
     *
     * @param models - Array of related model instances to save
     * @returns Promise resolving to array of saved models
     *
     * @example
     *
     * const user = await User.find(1);
     * const posts = [post1, post2, post3];
     *
     * await user.postsRelation().saveMany(posts);
     * // All posts will have their user_id set to user.id
     *
     */
    async saveMany(models) {
        for (const model of models) {
            await this.save(model);
        }
        return models;
    }
    /**
     * Finds a related model by its ID.
     * Applies relationship constraints to ensure the model belongs to the parent.
     *
     * @param id - ID of the related model to find
     * @returns Promise resolving to the found model or null
     *
     * @example
     *
     * const user = await User.find(1);
     * const post = await user.postsRelation().find(123);
     *
     * if (post) {
     *   console.log(`Found post: ${post.title}`);
     * }
     *
     */
    async find(id) {
        const query = this.getQuery();
        this.addConstraints(query);
        return await query.find(id);
    }
    /**
     * Updates all related models matching the relationship constraints.
     *
     * @param attributes - Attributes to update
     * @returns Promise resolving to number of updated records
     *
     * @example
     *
     * const user = await User.find(1);
     * const updated = await user.postsRelation().update({
     *   status: 'archived'
     * });
     *
     * console.log(`Updated ${updated} posts`);
     *
     */
    async update(attributes) {
        const query = this.getQuery();
        this.addConstraints(query);
        return await query.update(attributes);
    }
    /**
     * Deletes all related models matching the relationship constraints.
     *
     * @returns Promise resolving to number of deleted records
     *
     * @example
     *
     * const user = await User.find(1);
     * const deleted = await user.postsRelation().delete();
     *
     * console.log(`Deleted ${deleted} posts`);
     *
     */
    async delete() {
        const query = this.getQuery();
        this.addConstraints(query);
        return await query.delete();
    }
}

/**
 * Represents a one-to-one relationship where the parent model has one related model.
 * The foreign key is stored on the related model's table.
 *
 * @template T - The parent model type
 * @template R - The related model type
 *
 * @example
 *
 * // In User model
 * profileRelation(): HasOne<User, Profile> {
 *   return new HasOne(this, Profile, 'user_id', 'id');
 * }
 *
 * // Usage
 * const user = await User.find(1);
 * const profile = await user.profileRelation().getResults();
 *
 * // Create new related model
 * const newProfile = await user.profileRelation().create({
 *   bio: 'Software developer',
 *   avatar: 'avatar.jpg'
 * });
 *
 */
class HasOne extends Relationship {
    /**
     * Adds constraints to the relationship query.
     * Filters the related model by the foreign key matching the parent's local key.
     *
     * @param query - Query builder to add constraints to
     * @returns Modified query builder with relationship constraints
     *
     * @example
     *
     * // For User hasOne Profile relationship
     * // Adds: WHERE profiles.user_id = ?
     *
     */
    addConstraints(query) {
        const parentKey = this.getParentKey();
        if (parentKey !== null && parentKey !== undefined) {
            query.where(this.foreignKey, parentKey);
        }
        return query;
    }
    /**
     * Gets the relationship results.
     * Returns a single related model instance or null if none exists.
     *
     * @returns Promise resolving to related model or null
     *
     * @example
     *
     * const user = await User.find(1);
     * const profile = await user.profileRelation().getResults();
     *
     * if (profile) {
     *   console.log(profile.bio);
     * }
     *
     */
    async getResults() {
        return await this.first();
    }
    /**
     * Creates a new related model and associates it with the parent.
     * Sets the foreign key on the new model to link it to the parent.
     *
     * @param attributes - Attributes for the new related model
     * @returns Promise resolving to the created model
     *
     * @example
     *
     * const user = await User.find(1);
     * const profile = await user.profileRelation().create({
     *   bio: 'Full-stack developer',
     *   website: 'https://example.com',
     *   location: 'San Francisco'
     * });
     *
     * console.log(profile.user_id); // Will be set to user.id
     *
     */
    async create(attributes) {
        const instance = new this.relatedCtor();
        instance.setAttribute(this.foreignKey, this.getParentKey());
        instance.fill(attributes);
        await instance.save();
        return instance;
    }
    /**
     * Saves an existing related model and associates it with the parent.
     * Updates the foreign key on the model to link it to the parent.
     *
     * @param model - Related model instance to save
     * @returns Promise resolving to the saved model
     *
     * @example
     *
     * const user = await User.find(1);
     * const profile = new Profile();
     * profile.bio = 'New bio';
     *
     * await user.profileRelation().save(profile);
     * console.log(profile.user_id); // Will be set to user.id
     *
     */
    async save(model) {
        model.setAttribute(this.foreignKey, this.getParentKey());
        await model.save();
        return model;
    }
    /**
     * Associates an existing model with the parent without saving.
     * Sets the foreign key on the model but doesn't persist the change.
     *
     * @param model - Related model instance to associate
     * @returns The associated model
     *
     * @example
     *
     * const user = await User.find(1);
     * const profile = await Profile.find(5);
     *
     * user.profileRelation().associate(profile);
     * console.log(profile.user_id); // Will be set to user.id
     *
     * // Remember to save the profile to persist the association
     * await profile.save();
     *
     */
    associate(model) {
        model.setAttribute(this.foreignKey, this.getParentKey());
        return model;
    }
    /**
     * Dissociates the related model from the parent.
     * Sets the foreign key to null and saves the change.
     *
     * @returns Promise that resolves when dissociation is complete
     *
     * @example
     *
     * const user = await User.find(1);
     * await user.profileRelation().dissociate();
     *
     * // The profile's user_id will be set to null
     * const profile = await user.profileRelation().getResults();
     * console.log(profile); // null
     *
     */
    async dissociate() {
        const related = await this.getResults();
        if (related) {
            related.setAttribute(this.foreignKey, null);
            await related.save();
        }
    }
}

/**
 * Represents a polymorphic one-to-many relationship.
 * Allows a model to have multiple related models that can belong to different parent types.
 * Uses morph type and morph ID columns to identify the parent model type and ID.
 *
 * @template T - The parent model type
 * @template R - The related model type
 *
 * @example
 *
 * // In User model
 * commentsRelation(): MorphMany<User, Comment> {
 *   return new MorphMany(this, Comment, 'commentable_type', 'commentable_id', 'id');
 * }
 *
 * // In Post model
 * commentsRelation(): MorphMany<Post, Comment> {
 *   return new MorphMany(this, Comment, 'commentable_type', 'commentable_id', 'id');
 * }
 *
 * // Usage
 * const post = await Post.find(1);
 * const comments = await post.commentsRelation().getResults();
 *
 * // Create multiple comments
 * const newComments = await post.commentsRelation().createMany([
 *   { content: 'Great post!' },
 *   { content: 'Thanks for sharing!' }
 * ]);
 *
 */
class MorphMany extends Relationship {
    /**
     * Creates a new MorphMany relationship instance.
     *
     * @param parent - Parent model instance
     * @param related - Related model constructor
     * @param morphType - Column name storing the parent model type
     * @param morphId - Column name storing the parent model ID
     * @param localKey - Local key on parent model (usually primary key)
     *
     * @example
     *
     * // Comments belong to User or Post polymorphically
     * new MorphMany(
     *   this,               // Post instance
     *   Comment,            // Comment constructor
     *   'commentable_type', // stores 'user' or 'post'
     *   'commentable_id',   // stores the ID
     *   'id'                // parent's primary key
     * );
     *
     */
    constructor(parent, related, morphType, morphId, localKey) {
        super(parent, related, morphId, localKey);
        this.morphType = morphType;
        this.morphId = morphId;
    }
    /**
     * Adds constraints to the relationship query.
     * Filters by both the morph type (parent model class name) and morph ID.
     *
     * @param query - Query builder to add constraints to
     * @returns Modified query builder with polymorphic constraints
     *
     * @example
     *
     * // For Post morphMany Comments relationship
     * // Adds: WHERE commentable_type = 'post' AND commentable_id = ?
     *
     */
    addConstraints(query) {
        const parentKey = this.getParentKey();
        const morphType = this.parent.constructor.name.toLowerCase();
        if (parentKey !== null && parentKey !== undefined) {
            query.where(this.morphId, parentKey).where(this.morphType, morphType);
        }
        return query;
    }
    /**
     * Gets the relationship results.
     * Returns an array of all related model instances.
     *
     * @returns Promise resolving to array of related models
     *
     * @example
     *
     * const post = await Post.find(1);
     * const comments = await post.commentsRelation().getResults();
     *
     * comments.forEach(comment => {
     *   console.log(`Comment: ${comment.content}`);
     * });
     *
     */
    async getResults() {
        return await this.get();
    }
    /**
     * Creates a new related model with polymorphic association.
     * Sets both the morph type and morph ID to link to the parent.
     *
     * @param attributes - Attributes for the new related model
     * @returns Promise resolving to the created model
     *
     * @example
     *
     * const post = await Post.find(1);
     * const comment = await post.commentsRelation().create({
     *   content: 'This is a great post!',
     *   author_name: 'John Doe',
     *   author_email: 'john@example.com'
     * });
     *
     * console.log(comment.commentable_type); // 'post'
     * console.log(comment.commentable_id);   // post.id
     *
     */
    async create(attributes) {
        const instance = new this.relatedCtor();
        const morphType = this.parent.constructor.name.toLowerCase();
        instance.setAttribute(this.morphType, morphType);
        instance.setAttribute(this.morphId, this.getParentKey());
        instance.fill(attributes);
        await instance.save();
        return instance;
    }
    /**
     * Creates multiple related models in a batch operation.
     * Each model will be associated with the parent via polymorphic keys.
     *
     * @param records - Array of attribute objects for the new models
     * @returns Promise resolving to array of created models
     *
     * @example
     *
     * const post = await Post.find(1);
     * const comments = await post.commentsRelation().createMany([
     *   { content: 'First comment', author_name: 'Alice' },
     *   { content: 'Second comment', author_name: 'Bob' },
     *   { content: 'Third comment', author_name: 'Charlie' }
     * ]);
     *
     * console.log(`Created ${comments.length} comments`);
     *
     */
    async createMany(records) {
        const instances = [];
        for (const attributes of records) {
            const instance = await this.create(attributes);
            instances.push(instance);
        }
        return instances;
    }
    /**
     * Saves an existing related model with polymorphic association.
     * Updates the morph type and morph ID to link to the parent.
     *
     * @param model - Related model instance to save
     * @returns Promise resolving to the saved model
     *
     * @example
     *
     * const post = await Post.find(1);
     * const comment = new Comment();
     * comment.content = 'New comment content';
     *
     * await post.commentsRelation().save(comment);
     * console.log(comment.commentable_type); // 'post'
     * console.log(comment.commentable_id);   // post.id
     *
     */
    async save(model) {
        const morphType = this.parent.constructor.name.toLowerCase();
        model.setAttribute(this.morphType, morphType);
        model.setAttribute(this.morphId, this.getParentKey());
        await model.save();
        return model;
    }
    /**
     * Saves multiple existing models with polymorphic association.
     *
     * @param models - Array of related model instances to save
     * @returns Promise resolving to array of saved models
     *
     * @example
     *
     * const post = await Post.find(1);
     * const comments = [comment1, comment2, comment3];
     *
     * await post.commentsRelation().saveMany(comments);
     * // All comments will have their polymorphic keys set to post
     *
     */
    async saveMany(models) {
        for (const model of models) {
            await this.save(model);
        }
        return models;
    }
}

/**
 * Represents a polymorphic one-to-one relationship.
 * Allows a model to belong to multiple other model types through a single association.
 * Uses morph type and morph ID columns to identify the parent model type and ID.
 *
 * @template T - The parent model type
 * @template R - The related model type
 *
 * @example
 *
 * // In User model
 * imageRelation(): MorphOne<User, Image> {
 *   return new MorphOne(this, Image, 'imageable_type', 'imageable_id', 'id');
 * }
 *
 * // In Post model
 * imageRelation(): MorphOne<Post, Image> {
 *   return new MorphOne(this, Image, 'imageable_type', 'imageable_id', 'id');
 * }
 *
 * // Usage
 * const user = await User.find(1);
 * const image = await user.imageRelation().getResults();
 *
 * // Create polymorphic relationship
 * const newImage = await user.imageRelation().create({
 *   url: 'avatar.jpg',
 *   alt_text: 'User avatar'
 * });
 *
 */
class MorphOne extends Relationship {
    /**
     * Creates a new MorphOne relationship instance.
     *
     * @param parent - Parent model instance
     * @param related - Related model constructor
     * @param morphType - Column name storing the parent model type
     * @param morphId - Column name storing the parent model ID
     * @param localKey - Local key on parent model (usually primary key)
     *
     * @example
     *
     * // Image belongs to User or Post polymorphically
     * new MorphOne(
     *   this,              // User instance
     *   Image,             // Image constructor
     *   'imageable_type',  // stores 'user' or 'post'
     *   'imageable_id',    // stores the ID
     *   'id'               // parent's primary key
     * );
     *
     */
    constructor(parent, related, morphType, morphId, localKey) {
        super(parent, related, morphId, localKey);
        this.morphType = morphType;
        this.morphId = morphId;
    }
    /**
     * Adds constraints to the relationship query.
     * Filters by both the morph type (parent model class name) and morph ID.
     *
     * @param query - Query builder to add constraints to
     * @returns Modified query builder with polymorphic constraints
     *
     * @example
     *
     * // For User morphOne Image relationship
     * // Adds: WHERE imageable_type = 'user' AND imageable_id = ?
     *
     */
    addConstraints(query) {
        const parentKey = this.getParentKey();
        const morphType = this.parent.constructor.name.toLowerCase();
        if (parentKey !== null && parentKey !== undefined) {
            query.where(this.morphId, parentKey).where(this.morphType, morphType);
        }
        return query;
    }
    /**
     * Gets the relationship results.
     * Returns a single related model instance or null if none exists.
     *
     * @returns Promise resolving to related model or null
     *
     * @example
     *
     * const user = await User.find(1);
     * const image = await user.imageRelation().getResults();
     *
     * if (image) {
     *   console.log(`User avatar: ${image.url}`);
     * }
     *
     */
    async getResults() {
        return await this.first();
    }
    /**
     * Creates a new related model with polymorphic association.
     * Sets both the morph type and morph ID to link to the parent.
     *
     * @param attributes - Attributes for the new related model
     * @returns Promise resolving to the created model
     *
     * @example
     *
     * const user = await User.find(1);
     * const image = await user.imageRelation().create({
     *   url: 'profile-pic.jpg',
     *   alt_text: 'User profile picture',
     *   size: 'large'
     * });
     *
     * console.log(image.imageable_type); // 'user'
     * console.log(image.imageable_id);   // user.id
     *
     */
    async create(attributes) {
        const instance = new this.relatedCtor();
        const morphType = this.parent.constructor.name.toLowerCase();
        instance.setAttribute(this.morphType, morphType);
        instance.setAttribute(this.morphId, this.getParentKey());
        instance.fill(attributes);
        await instance.save();
        return instance;
    }
    /**
     * Saves an existing related model with polymorphic association.
     * Updates the morph type and morph ID to link to the parent.
     *
     * @param model - Related model instance to save
     * @returns Promise resolving to the saved model
     *
     * @example
     *
     * const user = await User.find(1);
     * const image = new Image();
     * image.url = 'new-avatar.jpg';
     *
     * await user.imageRelation().save(image);
     * console.log(image.imageable_type); // 'user'
     * console.log(image.imageable_id);   // user.id
     *
     */
    async save(model) {
        const morphType = this.parent.constructor.name.toLowerCase();
        model.setAttribute(this.morphType, morphType);
        model.setAttribute(this.morphId, this.getParentKey());
        await model.save();
        return model;
    }
}

/**
 * Represents a polymorphic belongs-to relationship.
 * Allows a model to belong to multiple different parent model types.
 * The inverse of MorphOne and MorphMany relationships.
 *
 * @template T - The child model type (the one with morph columns)
 * @template R - The parent model type (can be multiple types)
 *
 * @example
 *
 * // In Comment model
 * commentable(): MorphTo<Comment, User | Post> {
 *   return new MorphTo(this, 'commentable_type', 'commentable_id', 'id')
 *     .registerModel('user', User)
 *     .registerModel('post', Post);
 * }
 *
 * // Usage
 * const comment = await Comment.find(1);
 * const parent = await comment.commentable().getResults();
 *
 * if (parent instanceof User) {
 *   console.log(`Comment on user: ${parent.name}`);
 * } else if (parent instanceof Post) {
 *   console.log(`Comment on post: ${parent.title}`);
 * }
 *
 */
class MorphTo extends Relationship {
    /**
     * Creates a new MorphTo relationship instance.
     *
     * @param parent - Child model instance (the one with morph columns)
     * @param morphType - Column name storing the parent model type
     * @param morphId - Column name storing the parent model ID
     * @param localKey - Local key on parent models (usually primary key)
     *
     * @example
     *
     * // Comment belongs to User or Post polymorphically
     * new MorphTo(
     *   this,               // Comment instance
     *   'commentable_type', // stores 'user' or 'post'
     *   'commentable_id',   // stores the parent ID
     *   'id'                // parent's primary key
     * );
     *
     */
    constructor(parent, morphType, morphId, localKey) {
        super(parent, null, morphId, localKey);
        this.models = new Map();
        this.morphType = morphType;
        this.morphId = morphId;
    }
    /**
     * Adds constraints to the relationship query.
     * For MorphTo relationships, constraints are applied dynamically based on morph type.
     *
     * @param query - Query builder to add constraints to
     * @returns Query builder (unchanged for MorphTo)
     */
    addConstraints(query) {
        // MorphTo constraints are applied dynamically in getResults()
        return query;
    }
    /**
     * Gets the relationship results.
     * Determines the parent model type from morph type column and queries accordingly.
     *
     * @returns Promise resolving to parent model or null
     *
     * @example
     *
     * const comment = await Comment.find(1);
     * const parent = await comment.commentable().getResults();
     *
     * // Parent could be User, Post, or any registered model type
     * if (parent) {
     *   console.log(`Parent type: ${comment.commentable_type}`);
     *   console.log(`Parent ID: ${comment.commentable_id}`);
     * }
     *
     */
    async getResults() {
        const morphType = this.parent.getAttribute(this.morphType);
        const morphId = this.parent.getAttribute(this.morphId);
        if (!morphType || !morphId) {
            return null;
        }
        const ModelClass = this.models.get(morphType);
        if (!ModelClass) {
            throw new Error(`Model not registered for morph type: ${morphType}`);
        }
        const instance = new ModelClass();
        new QueryBuilder(instance.getTable(), instance.getConnection()).setModel(ModelClass);
        // return await query.where(this.localKey as any, morphId).first()
        return null;
    }
    /**
     * Registers a model class for a specific morph type.
     * Required to map morph type strings to actual model classes.
     *
     * @param type - Morph type string (stored in morph type column)
     * @param modelClass - Model constructor for this type
     * @returns This relationship instance for method chaining
     *
     * @example
     *
     * const morphTo = new MorphTo(this, 'commentable_type', 'commentable_id', 'id')
     *   .registerModel('user', User)
     *   .registerModel('post', Post)
     *   .registerModel('page', Page);
     *
     */
    registerModel(type, modelClass) {
        this.models.set(type, modelClass);
        return this;
    }
    /**
     * Associates the child model with a parent model.
     * Sets both the morph type and morph ID columns.
     *
     * @param model - Parent model to associate with
     * @returns The child model for method chaining
     *
     * @example
     *
     * const comment = new Comment();
     * const user = await User.find(1);
     *
     * comment.commentable().associate(user);
     * console.log(comment.commentable_type); // 'user'
     * console.log(comment.commentable_id);   // user.id
     *
     * await comment.save();
     *
     */
    associate(model) {
        const morphType = model.constructor.name.toLowerCase();
        const morphId = model.getAttribute(this.localKey);
        this.parent.setAttribute(this.morphType, morphType);
        this.parent.setAttribute(this.morphId, morphId);
        return this.parent;
    }
    /**
     * Dissociates the child model from its parent.
     * Sets both morph type and morph ID columns to null.
     *
     * @returns The child model for method chaining
     *
     * @example
     *
     * const comment = await Comment.find(1);
     *
     * comment.commentable().dissociate();
     * console.log(comment.commentable_type); // null
     * console.log(comment.commentable_id);   // null
     *
     * await comment.save();
     *
     */
    dissociate() {
        this.parent.setAttribute(this.morphType, null);
        this.parent.setAttribute(this.morphId, null);
        return this.parent;
    }
    /**
     * Gets the morph type value from the child model.
     *
     * @returns The morph type string or null
     *
     * @example
     *
     * const comment = await Comment.find(1);
     * const type = comment.commentable().getMorphType();
     * console.log(type); // 'user', 'post', etc.
     *
     */
    getMorphType() {
        return this.parent.getAttribute(this.morphType);
    }
    /**
     * Gets the morph ID value from the child model.
     *
     * @returns The morph ID value or null
     *
     * @example
     *
     * const comment = await Comment.find(1);
     * const id = comment.commentable().getMorphId();
     * console.log(id); // 123, 456, etc.
     *
     */
    getMorphId() {
        return this.parent.getAttribute(this.morphId);
    }
}

/**
 * Base Model class implementing Active Record pattern for ScyllinX ORM.
 * Provides CRUD operations, relationships, attribute management, and ScyllaDB-specific features.
 *
 * @template TAttrs - Type definition for model attributes
 *
 * @example
 *
 * interface UserAttributes {
 *   id: string;
 *   name: string;
 *   email: string;
 *   created_at?: Date;
 *   updated_at?: Date;
 * }
 *
 * class User extends Model<UserAttributes> {
 *   protected static table = 'users';
 *   protected static primaryKey = 'id';
 *   protected static fillable = ['name', 'email'];
 *
 *   // Define relationships
 *   posts() {
 *     return this.hasMany(Post);
 *   }
 *
 *   profile() {
 *     return this.hasOne(Profile);
 *   }
 * }
 *
 * // Usage
 * const user = await User.create({ name: 'John', email: 'john@example.com' });
 * const posts = await user.posts().get();
 *
 */
class Model {
    /**
     * Creates a new Model instance.
     *
     * @param attributes - Initial attributes for the model
     * @param forceFill - Whether to bypass fillable restrictions
     *
     * @example
     *
     * const user = new User({ name: 'John', email: 'john@example.com' });
     * const userWithGuarded = new User({ id: '123', name: 'John' }, true);
     *
     */
    constructor(attributes = {}, forceFill = false) {
        // Instance properties for model state
        /** Current attribute values */
        this.attributes = {};
        /** Original attribute values from database */
        this.original = {};
        /** Changed attributes since last sync */
        this.changes = {};
        /** Whether this model exists in the database */
        this.exists = false;
        /** Whether this model was recently created */
        this.wasRecentlyCreated = false;
        forceFill === true ? this.forceFill(attributes) : this.fill(attributes);
    }
    /**
     * Custom inspect method for better debugging output.
     *
     * @returns Object representation for debugging
     *
     * @example
     *
     * const user = new User({ name: 'John' });
     * console.log(user); // Shows model state, attributes, changes, etc.
     *
     */
    [util.inspect.custom]() {
        return {
            __model__: this.constructor.name,
            attributes: this.attributes,
            original: this.original,
            changes: this.getDirty(),
            dirty: this.isDirty(),
            exists: this.exists,
            wasRecentlyCreated: this.wasRecentlyCreated,
        };
    }
    /**
     * Defines a property accessor for an attribute.
     * Allows direct property access to model attributes.
     *
     * @protected
     * @template K - The attribute key type
     * @param key - The attribute key to define accessor for
     *
     * @example
     *
     * // Internal usage - creates property accessors
     * user.name = 'John'; // Calls setAttribute internally
     * console.log(user.name); // Calls getAttribute internally
     *
     */
    defineAccessor(key) {
        if (!Object.prototype.hasOwnProperty.call(this, key)) {
            Object.defineProperty(this, key, {
                get: () => this.getAttribute(key),
                set: (val) => this.setAttribute(key, val),
                enumerable: true,
                configurable: true,
            });
        }
    }
    /**
     * Creates a new query builder for the model.
     * Entry point for all database queries on this model.
     *
     * @template TModel - The model class type
     * @param this - The model class (static context)
     * @returns QueryBuilder instance configured for this model
     *
     * @example
     *
     * const activeUsers = await User.query().where('status', 'active').get();
     * const user = await User.query().where('id', '123').first();
     * const count = await User.query().count();
     *
     */
    static query() {
        const instance = new this();
        const builder = new QueryBuilder(instance.getTable(), instance.getConnection()).setModel(this);
        // const scopes = instance.getScopes?.() ?? {};
        // for (const [name, fn] of Object.entries(scopes)) {
        //   (builder as any)[name] = (...args: any[]) => fn.call(this, builder, ...args);
        // }
        return builder;
    }
    /**
     * Finds a model by its primary key.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @param id - The primary key value to search for
     * @returns Promise resolving to model instance or null if not found
     *
     * @example
     *
     * const user = await User.find('123');
     * if (user) {
     *   console.log(user.name);
     * }
     *
     * const nonExistent = await User.find('999'); // Returns null
     *
     */
    static async find(id) {
        const inst = new this({});
        return await this.query()
            .where(inst.getKeyName(), id)
            .first();
    }
    /**
     * Finds a model by its primary key or throws an exception.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @param id - The primary key value to search for
     * @returns Promise resolving to model instance
     * @throws {Error} When model is not found
     *
     * @example
     *
     * try {
     *   const user = await User.findOrFail('123');
     *   console.log(user.name);
     * } catch (error) {
     *   console.log('User not found');
     * }
     *
     */
    static async findOrFail(id) {
        const model = await this.find(id);
        if (!model) {
            throw new Error(`Model not found with id: ${id}`);
        }
        return model;
    }
    /**
     * Creates a new model instance and saves it to the database.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @param attrs - Attributes for the new model
     * @returns Promise resolving to the created model instance
     *
     * @example
     *
     * const user = await User.create({
     *   name: 'John Doe',
     *   email: 'john@example.com'
     * });
     * console.log(user.id); // Auto-generated ID
     *
     */
    static async create(attrs) {
        const inst = new this(attrs, true);
        await inst.save();
        return inst;
    }
    /**
     * Creates multiple records in bulk.
     *
     * For each attribute set in `items`, a new model instance is created (bypassing fillable),
     * saved to the database, and collected into an array.
     *
     * @template TModel
     * @param - Array of attribute objects to insert.
     * @returns - Resolves with an array of newly created model instances.
     *
     * @example
     * // Create multiple users at once
     * const users = await User.createMany([
     *   { name: 'Alice', email: 'alice@example.com' },
     *   { name: 'Bob', email: 'bob@example.com' },
     *   { name: 'Charlie', email: 'charlie@example.com' }
     * ]);
     *
     * console.log(`Created ${users.length} users`);
     */
    static async createMany(items) {
        const created = [];
        for (const attrs of items) {
            const inst = new this(attrs, true);
            await inst.save();
            created.push(inst);
        }
        return created;
    }
    /**
     * Retrieves all models from the database.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @returns Promise resolving to array of model instances
     *
     * @example
     *
     * const allUsers = await User.all();
     * console.log(`Found ${allUsers.length} users`);
     *
     */
    static async all() {
        return await this.query().get();
    }
    /**
     * Gets the first model matching the query.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @returns Promise resolving to first model instance or null
     *
     * @example
     *
     * const firstUser = await User.first();
     * if (firstUser) {
     *   console.log('First user:', firstUser.name);
     * }
     *
     */
    static async first() {
        return await this.query().first();
    }
    /**
     * Updates an existing model or creates a new one.
     *
     * @template TAttrs - Model attributes type
     * @template TModel - Model class type
     * @param this - The model class (static context)
     * @param attributes - Attributes to search by
     * @param values - Values to update or create with
     * @returns Promise resolving to the model instance
     *
     * @example
     *
     * const user = await User.updateOrCreate(
     *   { email: 'john@example.com' },
     *   { name: 'John Doe', status: 'active' }
     * );
     *
     */
    static async updateOrCreate(attributes, values = {}) {
        const instance = await this.query().where(attributes).first();
        if (instance) {
            instance.fill(values);
            await instance.save();
            return instance;
        }
        return await this.create({ ...attributes, ...values });
    }
    /**
     * Saves the model to the database.
     * Handles both creating new records and updating existing ones.
     *
     * @returns Promise resolving to true if save was successful
     *
     * @example
     *
     * const user = new User({ name: 'John' });
     * await user.save(); // Creates new record
     *
     * user.name = 'Jane';
     * await user.save(); // Updates existing record
     *
     */
    async save() {
        const query = this.newQuery();
        // Fire saving event
        if ((await this.fireModelEvent("saving")) === false) {
            return false;
        }
        if (this.exists) {
            // Update existing model
            if ((await this.fireModelEvent("updating")) === false) {
                return false;
            }
            if (this.isDirty()) {
                await this.performUpdate(query);
                this.fireModelEvent("updated", false);
            }
        }
        else {
            // Create new model
            if ((await this.fireModelEvent("creating")) === false) {
                return false;
            }
            await this.performInsert(query);
            this.exists = true;
            this.wasRecentlyCreated = true;
            this.fireModelEvent("created", false);
        }
        this.finishSave();
        this.fireModelEvent("saved", false);
        return true;
    }
    /**
     * Updates the model with new attributes and saves to database.
     *
     * @param attributes - Attributes to update
     * @returns Promise resolving to true if update was successful
     *
     * @example
     *
     * const user = await User.find('123');
     * await user.update({ name: 'Jane Doe', email: 'jane@example.com' });
     *
     */
    async update(attributes) {
        if (!this.exists) {
            return false;
        }
        this.fill(attributes);
        return await this.save();
    }
    /**
     * Deletes the model from the database.
     *
     * @returns Promise resolving to true if deletion was successful
     *
     * @example
     *
     * const user = await User.find('123');
     * if (user) {
     *   await user.delete();
     *   console.log('User deleted');
     * }
     *
     */
    async delete() {
        if (!this.exists) {
            return false;
        }
        if ((await this.fireModelEvent("deleting")) === false) {
            return false;
        }
        await this.performDeleteOnModel();
        this.exists = false;
        this.fireModelEvent("deleted", false);
        return true;
    }
    /**
     * Refreshes the model from the database.
     * Reloads all attributes from the database, discarding any unsaved changes.
     *
     * @returns Promise resolving to the refreshed model instance
     *
     * @example
     *
     * const user = await User.find('123');
     * user.name = 'Changed Name'; // Not saved
     * await user.refresh(); // Discards changes and reloads from DB
     *
     */
    async refresh() {
        if (!this.exists) {
            return this;
        }
        const fresh = await this.newQuery().where(this.getKeyName(), this.getKey()).first();
        if (fresh) {
            this.attributes = fresh.attributes;
            this.original = { ...this.attributes };
            this.changes = {};
        }
        return this;
    }
    /**
   * Create an in-memory copy of this model, excluding its primary key,
   * and apply any attribute overrides. Does NOT persist to the database
   * until you call `save()` on the returned instance.
   *
   * @param {Partial<TAttrs>} [overrides={}] — Attributes to override on the replica.
   * @returns {this} A new model instance with copied attributes (primary key removed) and overrides applied.
   *
   * @example
   * ```ts
   * const user = await User.find('user-id-123');
   * // Clone with a new email
   * const newUser = user.replicate({
   *   email: 'new-email@example.com'
   * });
   * await newUser.save(); // Inserts as a new record
   * ```
   */
    replicate(overrides = {}) {
        // Determine primary key field
        const pk = this.getKeyName();
        // Clone attributes and remove primary key
        const attrs = { ...this.attributes };
        delete attrs[pk];
        // Instantiate a fresh model, bypassing fillable/guarded
        const ModelClass = this.constructor;
        const replica = new ModelClass(attrs, true);
        // Reset internal state so it will be treated as new
        replica.setExists(false);
        replica.setOriginal({});
        replica.changes = {};
        // Apply any overrides (using fill to respect fillable)
        replica.fill(overrides);
        return replica;
    }
    /**
     * Fills the model with attributes, respecting fillable/guarded rules.
     *
     * @param attributes - Attributes to fill
     * @returns The model instance with filled attributes
     *
     * @example
     *
     * const user = new User();
     * user.fill({ name: 'John', email: 'john@example.com' });
     * // Only fillable attributes are set
     *
     */
    fill(attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            if (this.isFillable(key)) {
                this.setAttribute(key, value);
            }
        }
        return this;
    }
    /**
     * Fills the model with attributes, bypassing fillable/guarded rules.
     *
     * @param attributes - Attributes to fill
     * @returns The model instance with filled attributes
     *
     * @example
     *
     * const user = new User();
     * user.forceFill({ id: '123', name: 'John', admin: true });
     * // All attributes are set, including guarded ones
     *
     */
    forceFill(attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            this.setAttribute(key, value);
        });
        return this;
    }
    /**
   * Update this model's `updated_at` timestamp (and optionally touch related models).
   *
   * @param {string[]} [relations] - Names of relations to touch after updating this model.
   * @returns {Promise<this>} Resolves to this model instance.
   *
   * @example
   * ```ts
   * const user = await User.find('abc');
   * await user.touch();
   *
   * // Also update timestamps on all related posts and comments
   * await user.touch(['posts', 'comments']);
   * ```
   */
    async touch(relations) {
        // Update this.updated_at
        const now = new Date();
        this.setAttribute('updated_at', now);
        // Save only the timestamp change
        await this.save();
        // If relations requested, touch each related model instance
        if (relations && relations.length) {
            for (const rel of relations) {
                const loader = this[rel + "Relation"];
                if (typeof loader === 'function') {
                    const related = await loader.call(this).get();
                    for (const inst of related) {
                        if (typeof inst.touch === 'function') {
                            await inst.touch();
                        }
                    }
                }
            }
        }
        return this;
    }
    /**
     * Gets an attribute value from the model.
     * Applies mutators and casts if defined.
     *
     * @template K - The attribute key type
     * @param key - The attribute key to get
     * @returns The attribute value
     *
     * @example
     *
     * const user = new User({ name: 'John' });
     * const name = user.getAttribute('name'); // 'John'
     *
     */
    getAttribute(key) {
        if (this.hasGetMutator(key)) {
            return this.mutateAttribute(key, this.attributes[key]);
        }
        if (this.hasCast(key)) {
            return this.castAttribute(key, this.attributes[key]);
        }
        return this.attributes[key];
    }
    /**
     * Sets an attribute value on the model.
     * Applies mutators and tracks changes.
     *
     * @template K - The attribute key type
     * @param key - The attribute key to set
     * @param value - The value to set
     * @returns The model instance
     *
     * @example
     *
     * const user = new User();
     * user.setAttribute('name', 'John');
     * user.setAttribute('email', 'john@example.com');
     *
     */
    setAttribute(key, value) {
        if (this.hasSetMutator(key)) {
            value = this.mutateAttributeForArray(key, value);
        }
        if (this.hasCast(key)) {
            value = this.castAttributeAsJson(key, value);
        }
        const current = this.attributes[key];
        this.original[key];
        // If original not set (e.g., first time filling), set it
        if (!this.original.hasOwnProperty(key)) {
            this.original[key] = current;
        }
        // If there's a change, write to changes, otherwise clean it
        if (value !== this.original[key]) {
            this.changes[key] = value;
        }
        else {
            delete this.changes[key];
        }
        this.attributes[key] = value;
        this.defineAccessor(key);
        return this;
    }
    /**
     * Gets the model's primary key value.
     *
     * @returns The primary key value
     *
     * @example
     *
     * const user = await User.find('123');
     * console.log(user.getKey()); // '123'
     *
     */
    getKey() {
        return this.getAttribute(this.getKeyName());
    }
    /**
     * Gets the primary key column name.
     *
     * @returns The primary key column name
     *
     * @example
     *
     * const user = new User();
     * console.log(user.getKeyName()); // 'id'
     *
     */
    getKeyName() {
        return this.constructor.primaryKey;
    }
    /**
     * Gets the table name for this model.
     *
     * @returns The table name
     *
     * @example
     *
     * const user = new User();
     * console.log(user.getTable()); // 'users'
     *
     */
    getTable() {
        const table = this.constructor.table;
        if (!table) {
            // Convert class name to snake_case table name
            const className = this.constructor.name;
            return (className
                .replace(/([A-Z])/g, "_$1")
                .toLowerCase()
                .slice(1) + "s");
        }
        return table;
    }
    /**
     * Gets the database connection name for this model.
     *
     * @returns The connection name or undefined for default
     *
     * @example
     *
     * const user = new User();
     * console.log(user.getConnection()); // undefined or 'analytics'
     *
     */
    getConnection() {
        return this.constructor.connection;
    }
    /**
     * Checks if the model has unsaved changes.
     *
     * @param attributes - Optional specific attributes to check
     * @returns True if model has unsaved changes
     *
     * @example
     *
     * const user = await User.find('123');
     * user.name = 'New Name';
     * console.log(user.isDirty()); // true
     * console.log(user.isDirty(['email'])); // false
     *
     */
    isDirty(attributes) {
        if (attributes) {
            return attributes.some((attr) => this.changes.hasOwnProperty(attr));
        }
        return Object.keys(this.changes).length > 0;
    }
    /**
     * Gets the dirty (changed) attributes.
     *
     * @returns Object containing changed attributes
     *
     * @example
     *
     * const user = await User.find('123');
     * user.name = 'New Name';
     * user.email = 'new@example.com';
     * console.log(user.getDirty()); // { name: 'New Name', email: 'new@example.com' }
     *
     */
    getDirty() {
        return { ...this.changes };
    }
    /**
     * Sets the model's attributes directly (internal use).
     *
     * @param attrs - Attributes to set
     *
     * @example
     *
     * // Internal usage in hydration
     * model.setAttributes({ id: '123', name: 'John' });
     *
     */
    setAttributes(attrs) {
        this.attributes = { ...attrs };
        Object.keys(this.attributes).forEach((key) => {
            this.defineAccessor(key);
        });
        this.changes = {}; // Reset changes
    }
    /**
     * Sets the model's existence state (internal use).
     *
     * @param exists - Whether the model exists in database
     *
     * @example
     *
     * // Internal usage in hydration
     * model.setExists(true);
     *
     */
    setExists(exists) {
        this.exists = exists;
    }
    /**
     * Sets the model's original attributes (internal use).
     *
     * @param attrs - Original attributes to set
     *
     * @example
     *
     * // Internal usage in hydration
     * model.setOriginal({ id: '123', name: 'John' });
     *
     */
    setOriginal(attrs) {
        this.original = { ...attrs };
        this.changes = {}; // Reset changes
    }
    /**
     * Converts the model to a plain object.
     * Applies visibility rules (hidden/visible attributes).
     *
     * @returns Plain object representation of the model
     *
     * @example
     *
     * const user = new User({ name: 'John', password: 'secret' });
     * const obj = user.toObject(); // { name: 'John' } (password hidden)
     *
     */
    toObject() {
        const attributes = { ...this.attributes };
        const hidden = this.getHidden();
        const visible = this.getVisible();
        // Apply visibility rules
        if (visible.length > 0) {
            for (const key of Object.keys(attributes)) {
                if (!visible.includes(key)) {
                    delete attributes[key];
                }
            }
        }
        for (const key of hidden) {
            delete attributes[key];
        }
        return attributes;
    }
    /**
     * Converts the model to JSON string.
     *
     * @returns JSON string representation of the model
     *
     * @example
     *
     * const user = new User({ name: 'John' });
     * const json = user.toJSON(); // '{"name":"John"}'
     *
     */
    toJSON() {
        return JSON.stringify(this.toObject());
    }
    // Protected methods for internal operations
    /**
     * Creates a new query builder for this model instance.
     *
     * @protected
     * @returns QueryBuilder instance
     */
    newQuery() {
        return new QueryBuilder(this.getTable(), this.getConnection()).setModel(this.constructor);
    }
    /**
     * Performs database insert operation.
     *
     * @protected
     * @param query - QueryBuilder instance
     * @returns Promise that resolves when insert is complete
     */
    async performInsert(query) {
        if (this.getTimestamps()) {
            this.updateTimestamps();
        }
        const attributes = this.getAttributesForInsert();
        await query.insert(attributes);
    }
    /**
     * Performs database update operation.
     *
     * @protected
     * @param query - QueryBuilder instance
     * @returns Promise that resolves when update is complete
     */
    async performUpdate(query) {
        if (this.getTimestamps()) {
            this.updateTimestamps();
        }
        const dirty = this.getDirty();
        if (Object.keys(dirty).length === 0) {
            return;
        }
        await query.where(this.getKeyName(), this.getKey()).update(dirty);
    }
    /**
     * Performs database delete operation.
     *
     * @protected
     * @returns Promise that resolves when delete is complete
     */
    async performDeleteOnModel() {
        await this.newQuery().where(this.getKeyName(), this.getKey()).delete();
    }
    /**
     * Gets attributes prepared for database insertion.
     *
     * @protected
     * @returns Attributes object for insertion
     */
    getAttributesForInsert() {
        return { ...this.attributes };
    }
    /**
     * Updates timestamp attributes.
     *
     * @protected
     */
    updateTimestamps() {
        const time = new Date();
        if (!this.exists && !this.attributes.created_at) {
            this.setAttribute("created_at", time);
        }
        this.setAttribute("updated_at", time);
    }
    /**
     * Checks if timestamps are enabled for this model.
     *
     * @protected
     * @returns True if timestamps are enabled
     */
    getTimestamps() {
        return this.constructor.timestamps;
    }
    /**
     * Gets the fillable attributes list.
     *
     * @protected
     * @returns Array of fillable attribute names
     */
    getFillable() {
        return this.constructor.fillable;
    }
    /**
     * Gets the guarded attributes list.
     *
     * @protected
     * @returns Array of guarded attribute names
     */
    getGuarded() {
        return this.constructor.guarded;
    }
    /**
     * Gets the hidden attributes list.
     *
     * @protected
     * @returns Array of hidden attribute names
     */
    getHidden() {
        return this.constructor.hidden;
    }
    /**
     * Gets the visible attributes list.
     *
     * @protected
     * @returns Array of visible attribute names
     */
    getVisible() {
        return this.constructor.visible;
    }
    /**
     * Gets the attribute casting definitions.
     *
     * @protected
     * @returns Object mapping attribute names to cast types
     */
    getCasts() {
        return this.constructor.casts;
    }
    /**
     * Gets the query scopes defined on this model.
     *
     * @protected
     * @returns Object mapping scope names to functions
     */
    getScopes() {
        return this.constructor.scopes;
    }
    /**
     * Checks if an attribute is fillable.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if attribute is fillable
     */
    isFillable(key) {
        const fillable = this.getFillable();
        const guarded = this.getGuarded();
        if (fillable.length > 0 && !fillable.includes(key)) {
            return false;
        }
        if (guarded.includes("*")) {
            return fillable.includes(key);
        }
        return !guarded.includes(key);
    }
    /**
     * Checks if an attribute has a cast defined.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if attribute has a cast
     */
    hasCast(key) {
        return this.getCasts().hasOwnProperty(String(key));
    }
    /**
     * Casts an attribute value to the specified type.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to cast
     * @returns Casted value
     */
    castAttribute(key, value) {
        const castType = this.getCasts()[String(key)];
        if (value === null) {
            return null;
        }
        switch (castType) {
            case "int":
            case "integer":
                return Number.parseInt(value, 10);
            case "real":
            case "float":
            case "double":
                return Number.parseFloat(value);
            case "string":
                return String(value);
            case "bool":
            case "boolean":
                return Boolean(value);
            case "object":
            case "array":
            case "json":
                return typeof value === "string" ? JSON.parse(value) : value;
            case "date":
            case "datetime":
                return new Date(value);
            default:
                return value;
        }
    }
    /**
     * Casts an attribute value for JSON storage.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to cast
     * @returns Casted value for storage
     */
    castAttributeAsJson(key, value) {
        const castType = this.getCasts()[String(key)];
        if (["object", "array", "json"].includes(castType)) {
            return typeof value === "object" ? JSON.stringify(value) : value;
        }
        return value;
    }
    /**
     * Checks if an attribute has a getter mutator.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if getter mutator exists
     */
    hasGetMutator(key) {
        return typeof this[`get${this.studly(String(key))}Attribute`] === "function";
    }
    /**
     * Checks if an attribute has a setter mutator.
     *
     * @protected
     * @param key - Attribute name to check
     * @returns True if setter mutator exists
     */
    hasSetMutator(key) {
        return typeof this[`set${this.studly(String(key))}Attribute`] === "function";
    }
    /**
     * Applies a getter mutator to an attribute value.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to mutate
     * @returns Mutated value
     */
    mutateAttribute(key, value) {
        return this[`get${this.studly(String(key))}Attribute`](value);
    }
    /**
     * Applies a setter mutator to an attribute value.
     *
     * @protected
     * @param key - Attribute name
     * @param value - Value to mutate
     * @returns Mutated value
     */
    mutateAttributeForArray(key, value) {
        return this[`set${this.studly(String(key))}Attribute`](value);
    }
    /**
     * Converts a string to StudlyCase.
     *
     * @protected
     * @param str - String to convert
     * @returns StudlyCase string
     */
    studly(str) {
        return str.replace(/_(.)/g, (_, char) => char.toUpperCase()).replace(/^(.)/, (char) => char.toUpperCase());
    }
    /**
     * Fires a model event.
     *
     * @protected
     * @param event - Event name to fire
     * @param halt - Whether to halt on false return
     * @returns Promise resolving to event result
     */
    async fireModelEvent(event, halt = true) {
        const eventName = `scyllinx.${event}: ${this.constructor.name}`;
        console.log("Method not implemented", "for debug", eventName);
        return true;
    }
    /**
     * Finalizes the save operation by syncing state.
     *
     * @protected
     */
    finishSave() {
        this.original = { ...this.attributes };
        this.changes = {};
    }
    // ScyllaDB specific methods
    /**
     * Gets partition keys for ScyllaDB.
     *
     * @returns Array of partition key column names
     *
     * @example
     *
     * const user = new User();
     * console.log(user.getPartitionKeys()); // ['user_id']
     *
     */
    getPartitionKeys() {
        return this.constructor.partitionKeys;
    }
    /**
     * Gets clustering keys for ScyllaDB.
     *
     * @returns Array of clustering key column names
     *
     * @example
     *
     * const event = new UserEvent();
     * console.log(event.getClusteringKeys()); // ['created_at']
     *
     */
    getClusteringKeys() {
        return this.constructor.clusteringKeys;
    }
    /**
     * Gets keyspace for ScyllaDB.
     *
     * @returns Keyspace name or undefined
     *
     * @example
     *
     * const user = new User();
     * console.log(user.getKeyspace()); // 'myapp'
     *
     */
    getKeyspace() {
        return this.constructor.keyspace;
    }
    /**
     * Sets TTL for ScyllaDB operations.
     *
     * @param seconds - TTL in seconds
     * @returns QueryBuilder with TTL set
     *
     * @example
     *
     * const user = new User();
     * await user.withTTL(3600).save(); // Expires in 1 hour
     *
     */
    withTTL(seconds) {
        return this.newQuery().ttl(seconds);
    }
    /**
     * Uses IF NOT EXISTS for ScyllaDB operations.
     *
     * @returns QueryBuilder with IF NOT EXISTS set
     *
     * @example
     *
     * const user = new User();
     * await user.ifNotExists().save(); // Only insert if doesn't exist
     *
     */
    ifNotExists() {
        return this.newQuery().ifNotExists();
    }
    /**
     * Lazy loads relationships on this model instance.
     *
     * @param relations - Relationship names to load
     * @returns Promise resolving to this model with loaded relationships
     *
     * @example
     *
     * const user = await User.find('123');
     * await user.load('posts', 'profile');
     * console.log(user.posts); // Now loaded
     *
     */
    async load(...relations) {
        const list = Array.isArray(relations) ? relations : [relations];
        // Use QueryBuilder.loadEagerFor
        await new QueryBuilder(this.getTable(), this.getConnection())
            .setModel(this.constructor)
            .loadEagerFor(this, list);
        return this;
    }
    // Relationship methods
    /**
     * Defines a one-to-one relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param foreignKey - Foreign key column name
     * @param localKey - Local key column name
     * @returns HasOne relationship instance
     *
     * @example
     *
     * class User extends Model {
     *   profile() {
     *     return this.hasOne(Profile, 'user_id', 'id');
     *   }
     * }
     *
     */
    hasOne(related, foreignKey, localKey) {
        const fk = foreignKey || `${this.getTable()}_id`;
        const lk = localKey || this.getKeyName();
        return new HasOne(this, related, fk, lk);
    }
    /**
     * Defines a one-to-many relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param foreignKey - Foreign key column name
     * @param localKey - Local key column name
     * @returns HasMany relationship instance
     *
     * @example
     *
     * class User extends Model {
     *   posts() {
     *     return this.hasMany(Post, 'user_id', 'id');
     *   }
     * }
     *
     */
    hasMany(related, foreignKey, localKey) {
        const fk = foreignKey || `${this.getTable()}_id`;
        const lk = localKey || this.getKeyName();
        return new HasMany(this, related, fk, lk);
    }
    /**
     * Defines an inverse one-to-one or one-to-many relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param foreignKey - Foreign key column name
     * @param ownerKey - Owner key column name
     * @returns BelongsTo relationship instance
     *
     * @example
     *
     * class Post extends Model {
     *   user() {
     *     return this.belongsTo(User, 'user_id', 'id');
     *   }
     * }
     *
     */
    belongsTo(related, foreignKey, ownerKey) {
        const instance = new related();
        const fk = foreignKey || `${instance.getTable()}_id`;
        const ok = ownerKey || instance.getKeyName();
        return new BelongsTo(this, related, fk, ok);
    }
    /**
     * Defines a many-to-many relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param pivotTable - Pivot table name
     * @param foreignPivotKey - Foreign pivot key column name
     * @param relatedPivotKey - Related pivot key column name
     * @param parentKey - Parent key column name
     * @param relatedKey - Related key column name
     * @returns BelongsToMany relationship instance
     *
     * @example
     *
     * class User extends Model {
     *   roles() {
     *     return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
     *   }
     * }
     *
     */
    belongsToMany(related, pivotTable, foreignPivotKey, relatedPivotKey, parentKey, relatedKey) {
        const relatedInstance = new related();
        const pivot = pivotTable || [this.getTable(), relatedInstance.getTable()].sort().join("_");
        const fpk = foreignPivotKey || `${this.getTable()}_id`;
        const rpk = relatedPivotKey || `${relatedInstance.getTable()}_id`;
        const pk = parentKey || this.getKeyName();
        const rk = relatedKey || relatedInstance.getKeyName();
        return new BelongsToMany(this, related, pivot, fpk, rk, pk, rpk);
    }
    /**
     * Defines a polymorphic one-to-one relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param name - Morph name
     * @param type - Morph type column name
     * @param id - Morph ID column name
     * @param localKey - Local key column name
     * @returns MorphOne relationship instance
     *
     * @example
     *
     * class User extends Model {
     *   avatar() {
     *     return this.morphOne(Image, 'imageable');
     *   }
     * }
     *
     */
    morphOne(related, name, type, id, localKey) {
        const morphType = type || `${name}_type`;
        const morphId = id || `${name}_id`;
        const lk = localKey || this.getKeyName();
        return new MorphOne(this, related, morphType, morphId, lk);
    }
    /**
     * Defines a polymorphic one-to-many relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param related - Related model class
     * @param name - Morph name
     * @param type - Morph type column name
     * @param id - Morph ID column name
     * @param localKey - Local key column name
     * @returns MorphMany relationship instance
     *
     * @example
     *
     * class Post extends Model {
     *   comments() {
     *     return this.morphMany(Comment, 'commentable');
     *   }
     * }
     *
     */
    morphMany(related, name, type, id, localKey) {
        const morphType = type || `${name}_type`;
        const morphId = id || `${name}_id`;
        const lk = localKey || this.getKeyName();
        return new MorphMany(this, related, morphType, morphId, lk);
    }
    /**
     * Defines a polymorphic belongs-to relationship.
     *
     * @protected
     * @template Related - The related model type
     * @param name - Morph name
     * @param type - Morph type column name
     * @param id - Morph ID column name
     * @param ownerKey - Owner key column name
     * @returns MorphTo relationship instance
     *
     * @example
     *
     * class Comment extends Model {
     *   commentable() {
     *     return this.morphTo('commentable');
     *   }
     * }
     *
     */
    morphTo(name, type, id, ownerKey) {
        const morphName = name || "morphable";
        const morphType = type || `${morphName}_type`;
        const morphId = id || `${morphName}_id`;
        const ok = ownerKey || "id";
        return new MorphTo(this, morphType, morphId, ok);
    }
}
/** The primary key column name */
Model.primaryKey = "id";
/** ScyllaDB partition key columns */
Model.partitionKeys = [];
/** ScyllaDB clustering key columns */
Model.clusteringKeys = [];
/** Attributes that are mass assignable */
Model.fillable = [];
/** Attributes that are not mass assignable */
Model.guarded = ["*"];
/** Attributes that should be hidden from serialization */
Model.hidden = [];
/** Attributes that should be visible in serialization */
Model.visible = [];
/** Attribute casting definitions */
Model.casts = {};
/** Date attribute names */
Model.dates = ["created_at", "updated_at"];
/** Whether to automatically manage timestamps */
Model.timestamps = true;
/** Whether to use soft deletes */
Model.softDeletes = false;
/** Query scopes defined on this model */
Model.scopes = {};

/**
 * Fluent builder for constructing foreign key constraints in migrations.
 * Chain methods to define column references and actions.
 *
 * @example
 * const foreignKeys: ForeignKeyDefinition[] = [];
 * new ForeignKeyBuilder("user_id", foreignKeys)
 *   .references("id")
 *   .on("users")
 *   .onDelete("cascade")
 *   .onUpdate("restrict");
 * // foreignKeys now contains:
 * // [{ column: "user_id", references: { table: "users", column: "id" }, onDelete: "cascade", onUpdate: "restrict" }]
 */
class ForeignKeyBuilder {
    /**
     * @param column - Local column name for the foreign key.
     * @param foreignKeys - Array to collect ForeignKeyDefinition entries.
     */
    constructor(column, foreignKeys) {
        this.column = column;
        this.foreignKeys = foreignKeys;
    }
    /**
     * Specify the referenced column in the related table.
     * @param column - Column name in the foreign table.
     * @returns The builder instance for chaining.
     */
    references(column) {
        const existing = this.foreignKeys.find((fk) => fk.column === this.column);
        if (existing) {
            existing.references.column = column;
        }
        else {
            this.foreignKeys.push({
                column: this.column,
                references: { table: "", column },
            });
        }
        return this;
    }
    /**
     * Specify the referenced table for the foreign key.
     * @param table - Table name to reference.
     * @returns The builder instance for chaining.
     */
    on(table) {
        const existing = this.foreignKeys.find((fk) => fk.column === this.column);
        if (existing) {
            existing.references.table = table;
        }
        return this;
    }
    /**
     * Define the ON DELETE action for the foreign key.
     * @param action - One of 'cascade', 'set null', or 'restrict'.
     * @returns The builder instance for chaining.
     */
    onDelete(action) {
        const existing = this.foreignKeys.find((fk) => fk.column === this.column);
        if (existing) {
            existing.onDelete = action;
        }
        return this;
    }
    /**
     * Define the ON UPDATE action for the foreign key.
     * @param action - One of 'cascade', 'set null', or 'restrict'.
     * @returns The builder instance for chaining.
     */
    onUpdate(action) {
        const existing = this.foreignKeys.find((fk) => fk.column === this.column);
        if (existing) {
            existing.onUpdate = action;
        }
        return this;
    }
}

/**
 * Fluent builder for column definitions in migrations.
 * Provides chainable methods to configure column attributes.
 *
 * @example
 * const column: ColumnDefinition = { name: 'age', type: 'int' }
 * new ColumnBuilder(column)
 *   .nullable()
 *   .default(18)
 *   .unique()
 * // column now: { name: 'age', type: 'int', nullable: true, default: 18, unique: true }
 */
class ColumnBuilder {
    /**
     * Create a new ColumnBuilder instance.
     * @param column - The underlying ColumnDefinition to configure.
     */
    constructor(column) {
        this.column = column;
    }
    /**
     * Mark the column as nullable.
     * @returns The builder instance for chaining.
     */
    nullable() {
        this.column.nullable = true;
        return this;
    }
    /**
     * Mark the column as not nullable.
     * @returns The builder instance for chaining.
     */
    notNullable() {
        this.column.nullable = false;
        return this;
    }
    /**
     * Set a default value for the column.
     * @param value - The default value to use.
     * @returns The builder instance for chaining.
     */
    default(value) {
        this.column.default = value;
        return this;
    }
    /**
     * Add a UNIQUE constraint to the column.
     * @returns The builder instance for chaining.
     */
    unique() {
        this.column.unique = true;
        return this;
    }
    /**
     * Mark the column as PRIMARY KEY.
     * @returns The builder instance for chaining.
     */
    primary() {
        this.column.primary = true;
        return this;
    }
    /**
     * Enable auto-increment for the column (if supported by the dialect).
     * @returns The builder instance for chaining.
     */
    autoIncrement() {
        this.column.autoIncrement = true;
        return this;
    }
}

/**
 * Fluent builder for table-level options (Cassandra/ScyllaDB).
 * Chain methods to configure compaction, compression, caching, and more.
 *
 * @example
 * const options = new TableOptionsBuilder()
 *   .compaction("SizeTieredCompactionStrategy", { min_threshold: 4 })
 *   .compression({ class: "LZ4Compressor" })
 *   .gcGraceSeconds(86400)
 *   .caching("ALL", "NONE")
 *   .defaultTTL(3600)
 *   .speculativeRetry("NONE")
 *   .comment("User data by email materialized view")
 *   .addCustomOption("read_repair_chance", 0.2)
 *   .build()
 */
class TableOptionsBuilder {
    constructor() {
        this.options = {};
    }
    /**
     * Set compaction strategy and options.
     * @param strategy - Fully qualified compaction class name.
     * @param options - Additional compaction parameters.
     */
    compaction(strategy, options = {}) {
        this.options.compaction = { class: strategy, ...options };
        return this;
    }
    /**
     * @param {Object} options - Compression map.
     * @example
     * {
     *   class: 'LZ4Compressor'
     * }
     */
    compression(options) {
        this.options.compression = options;
        return this;
    }
    /**
     * Set GC grace seconds.
     * @param seconds - Number of seconds before tombstones are dropped.
     */
    gcGraceSeconds(seconds) {
        this.options.gc_grace_seconds = seconds;
        return this;
    }
    /**
     * Configure caching options.
     * @param keys - 'ALL' or 'NONE'.
     * @param rows - 'ALL', 'NONE', or a fractional string (e.g., '0.01').
     */
    caching(keys, rows) {
        this.options.caching = { keys, rows_per_partition: rows };
        return this;
    }
    /**
     * Set default TTL for the table.
     * @param seconds - Time-to-live in seconds.
     */
    defaultTTL(seconds) {
        this.options.default_time_to_live = seconds;
        return this;
    }
    /**
     * Set speculative retry policy.
     * @param value - Retry policy (e.g., 'NONE', 'ALWAYS', 'NUM_N', 'CUSTOM').
     */
    speculativeRetry(value) {
        this.options.speculative_retry = value;
        return this;
    }
    /**
     * Add a comment to the table.
     * @param text - Comment text.
     */
    comment(text) {
        this.options.comment = text;
        return this;
    }
    /**
     * Add a custom option not covered by built-ins.
     * @param key - Option key.
     * @param value - Option value.
     */
    addCustomOption(key, value) {
        this.options[key] = value;
        return this;
    }
    /**
     * Build and return the configured TableOptions object.
     */
    build() {
        return this.options;
    }
}

/**
 * Fluent builder for defining tables in migrations.
 * Supports columns, indexes, foreign keys, and ScyllaDB-specific options.
 *
 * @example
 * const tableDef = new TableBuilder("users")
 *   .id()
 *   .string("name")
 *     .nullable()
 *   .string("email")
 *     .unique()
 *   .foreign("role_id")
 *     .references("id")
 *     .on("roles")
 *     .onDelete("cascade")
 *   .partitionKey("id")
 *   .clusteringKey("created_at")
 *   .withOptions(opts => {
 *     opts.compaction({ class: 'SizeTieredCompactionStrategy' })
 *   })
 *   .build()
 */
class TableBuilder {
    /**
     * @param tableName - Name of the table to build.
     */
    constructor(tableName) {
        this.tableName = tableName;
        this.columns = [];
        this.indexes = [];
        this.foreignKeys = [];
        this.partitionKeys = [];
        this.clusteringKeys = [];
        this._clusteringOrder = {};
        this.tableOptions = {};
        this.tableExists = false;
    }
    /**
     * Mark whether the table already exists (skip creation logic).
     */
    setTableExists(exists) {
        this.tableExists = exists;
    }
    /**
     * Add an auto-incrementing integer primary key column.
     * @param name - Column name, defaults to "id".
     */
    id(name = "id") {
        this.columns.push({ name, type: "integer", primary: true, autoIncrement: true, nullable: false });
        return this;
    }
    /**
     * Add a VARCHAR column.
     * @param name - Column name.
     * @param length - Maximum length, defaults to 255.
     */
    string(name, length = 255) {
        const col = { name, type: "string", length };
        this.columns.push(col);
        return new ColumnBuilder(col);
    }
    text(name) {
        const column = {
            name,
            type: "text",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    integer(name) {
        const column = {
            name,
            type: "integer",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    bigInteger(name) {
        const column = {
            name,
            type: "bigInteger",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    float(name) {
        const column = {
            name,
            type: "float",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    double(name) {
        const column = {
            name,
            type: "double",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    decimal(name, precision = 8, scale = 2) {
        const column = {
            name,
            type: `decimal(${precision},${scale})`,
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    boolean(name) {
        const column = {
            name,
            type: "boolean",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    date(name) {
        const column = {
            name,
            type: "date",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    dateTime(name) {
        const column = {
            name,
            type: "dateTime",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    timestamp(name) {
        const column = {
            name,
            type: "timestamp",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    timestamps() {
        this.timestamp("created_at").nullable();
        this.timestamp("updated_at").nullable();
        return this;
    }
    json(name) {
        const column = {
            name,
            type: "json",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add a UUID column
     */
    uuid(name) {
        const column = {
            name,
            type: "uuid",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add an enum column
     */
    enum(name, values) {
        const column = {
            name,
            type: "enum",
            allowed: values,
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    // ScyllaDB specific column types
    /**
     * Add a set column (ScyllaDB)
     */
    set(name, type) {
        const column = {
            name,
            type: "set",
            elementType: type,
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add a list column (ScyllaDB)
     */
    list(name, type) {
        const column = {
            name,
            type: "list",
            elementType: type,
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add a map column (ScyllaDB)
     */
    map(name, keyType, valueType) {
        const column = {
            name,
            type: "map",
            keyType: keyType,
            valueType: valueType,
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add a counter column (ScyllaDB)
     */
    counter(name) {
        const column = {
            name,
            type: "counter",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add a timeuuid column (ScyllaDB)
     */
    timeUuid(name) {
        const column = {
            name,
            type: "timeuuid",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Begin defining a foreign key on a column.
     * @param column - Local column name to reference.
     */
    foreign(column) {
        return new ForeignKeyBuilder(column, this.foreignKeys);
    }
    /**
     * Create a standard index.
     * @param columns - Single column or array of columns to index.
     * @param name - Optional custom index name.
     */
    index(columns, name) {
        const cols = Array.isArray(columns) ? columns : [columns];
        this.indexes.push({ name: name || `idx_${this.tableName}_${cols.join("_")}`, columns: cols });
        return this;
    }
    /**
     * Create a unique index.
     */
    unique(columns, name) {
        const cols = Array.isArray(columns) ? columns : [columns];
        this.indexes.push({ name: name || `unq_${this.tableName}_${cols.join("_")}`, columns: cols, unique: true });
        return this;
    }
    /**
     * Define partition key columns (Cassandra/ScyllaDB).
     */
    partitionKey(...columns) {
        this.partitionKeys = columns;
        return this;
    }
    /**
     * Define clustering key columns.
     */
    clusteringKey(...columns) {
        this.clusteringKeys = columns;
        return this;
    }
    /**
     * Specify clustering order for a column.
     */
    clusteringOrder(column, direction) {
        this._clusteringOrder[column] = direction;
        return this;
    }
    /**
     * Configure table-level options via callback.
     */
    withOptions(callback) {
        const optsBuilder = new TableOptionsBuilder();
        callback(optsBuilder);
        this.tableOptions = optsBuilder.build();
        return this;
    }
    /**
     * Compile and return the final table definition.
     */
    build() {
        return {
            name: this.tableName,
            columns: this.columns,
            indexes: this.indexes,
            foreignKeys: this.foreignKeys,
            partitionKeys: this.partitionKeys,
            clusteringKeys: this.clusteringKeys,
            clusteringOrder: this._clusteringOrder,
            tableOptions: this.tableOptions,
        };
    }
}

/**
 * Fluent builder for creating ScyllaDB/Cassandra materialized views.
 * Chain methods to configure view definition and generate the CREATE statement.
 *
 * @example
 * const mv = new MaterializedViewBuilder("user_by_email", "users")
 *   .ifNotExists()
 *   .select("id", "email", "name")
 *   .where("email IS NOT NULL")
 *   .partitionKey("email")
 *   .clusteringKey("id")
 *   .clusteringOrder("id", "DESC")
 * const sql = mv.toSQL()
 * console.log(sql)
 */
class MaterializedViewBuilder {
    /**
     * @param viewName - Name of the materialized view to create.
     * @param baseTable - Base table from which to select data.
     */
    constructor(viewName, baseTable) {
        this.selectColumns = ["*"];
        this.whereConditions = [];
        this.partitionKeys = [];
        this.clusteringKeys = [];
        this._clusteringOrder = {};
        this._ifNotExists = false;
        this.viewName = viewName;
        this.baseTable = baseTable;
    }
    /**
     * Specify columns to include in the view.
     * @param columns - Column names to select.
     */
    select(...columns) {
        this.selectColumns = columns;
        return this;
    }
    /**
     * Add a WHERE clause condition.
     * @param condition - Raw CQL condition string.
     */
    where(condition) {
        this.whereConditions.push(condition);
        return this;
    }
    /**
     * Define partition key columns (must include at least one).
     * @param columns - Column names for the partition key.
     */
    partitionKey(...columns) {
        this.partitionKeys = columns;
        return this;
    }
    /**
     * Define clustering key columns.
     * @param columns - Column names for clustering.
     */
    clusteringKey(...columns) {
        this.clusteringKeys = columns;
        return this;
    }
    /**
     * Specify clustering order for a column.
     * @param column - Column name to order by.
     * @param direction - 'ASC' or 'DESC'.
     */
    clusteringOrder(column, direction) {
        this._clusteringOrder[column] = direction;
        return this;
    }
    /**
     * Add IF NOT EXISTS clause to avoid errors if view already exists.
     */
    ifNotExists() {
        this._ifNotExists = true;
        return this;
    }
    /**
     * Compile and return the CREATE MATERIALIZED VIEW CQL statement.
     * @throws Error if no partition keys are defined.
     */
    toSQL() {
        if (this.partitionKeys.length === 0) {
            throw new Error("Materialized view must have at least one partition key");
        }
        let sql = `CREATE MATERIALIZED VIEW ${this._ifNotExists ? "IF NOT EXISTS " : ""}${this.viewName} AS\n`;
        sql += `SELECT ${this.selectColumns.join(", ")}\n`;
        sql += `FROM ${this.baseTable}\n`;
        if (this.whereConditions.length > 0) {
            sql += `WHERE ${this.whereConditions.join(" AND ")}\n`;
        }
        else {
            sql += `WHERE ${this.partitionKeys[0]} IS NOT NULL\n`;
        }
        sql += "PRIMARY KEY (";
        if (this.partitionKeys.length === 1 && this.clusteringKeys.length === 0) {
            sql += this.partitionKeys[0];
        }
        else {
            sql += `(${this.partitionKeys.join(", ")})`;
            if (this.clusteringKeys.length > 0) {
                sql += `, ${this.clusteringKeys.join(", ")}`;
            }
        }
        sql += ")";
        if (this.clusteringKeys.length > 0 && Object.keys(this._clusteringOrder).length > 0) {
            const orderClauses = this.clusteringKeys.map((key) => {
                const dir = this._clusteringOrder[key] || "ASC";
                return `${key} ${dir}`;
            });
            sql += `\nWITH CLUSTERING ORDER BY (${orderClauses.join(", ")})`;
        }
        return sql;
    }
}

/**
 * User-Defined Type Builder - For creating custom types
 */
/**
 * Builder for creating and altering user-defined types in ScyllaDB/Cassandra.
 * Chain methods to define fields and generate CQL statements.
 *
 * @example
 * // Create a new UDT
 * const createSQL = new UserDefinedTypeBuilder("address")
 *   .ifNotExists()
 *   .field("street", "text")
 *   .field("city", "text")
 *   .field("zip", "int")
 *   .toSQL()
 * // Executes:
 * // CREATE TYPE IF NOT EXISTS address (
 * //   street text,
 * //   city text,
 * //   zip int
 * // )
 *
 * // Add a field to existing UDT
 * const alterAdd = new UserDefinedTypeBuilder("address")
 *   .addField("country", "text")
 * // Executes: ALTER TYPE address ADD country text
 *
 * // Rename a field in existing UDT
 * const alterRename = new UserDefinedTypeBuilder("address")
 *   .renameField("zip", "postal_code")
 * // Executes: ALTER TYPE address RENAME zip TO postal_code
 */
class UserDefinedTypeBuilder {
    /**
     * @param typeName - Name of the UDT to create or alter.
     */
    constructor(typeName) {
        this._fields = [];
        this._ifNotExists = false;
        this.typeName = typeName;
    }
    /**
     * Define a single field in the UDT.
     * @param name - Field name.
     * @param type - ScyllaDB data type.
     */
    field(name, type) {
        this._fields.push({ name, type });
        return this;
    }
    /**
     * Define multiple fields via an object map.
     * @param fields - Record of field names to types.
     */
    fields(fields) {
        for (const [name, type] of Object.entries(fields)) {
            this.field(name, type);
        }
        return this;
    }
    /**
     * Include IF NOT EXISTS in the CREATE statement.
     */
    ifNotExists() {
        this._ifNotExists = true;
        return this;
    }
    /**
     * Build and return the CREATE TYPE CQL statement.
     * @throws Error if no fields are defined.
     */
    toSQL() {
        if (this._fields.length === 0) {
            throw new Error("User-defined type must have at least one field");
        }
        const existsClause = this._ifNotExists ? "IF NOT EXISTS " : "";
        const defs = this._fields.map(f => `  ${f.name} ${f.type}`);
        return `CREATE TYPE ${existsClause}${this.typeName} (
${defs.join(",\n")}
)`;
    }
    /**
     * Generate an ALTER TYPE statement to add a new field.
     * @param name - Field name to add.
     * @param type - Data type for the new field.
     */
    addField(name, type) {
        return `ALTER TYPE ${this.typeName} ADD ${name} ${type}`;
    }
    /**
     * Generate an ALTER TYPE statement to rename an existing field.
     * @param oldName - Current field name.
     * @param newName - New field name.
     */
    renameField(oldName, newName) {
        return `ALTER TYPE ${this.typeName} RENAME ${oldName} TO ${newName}`;
    }
}

/**
 * Builder for creating and dropping user-defined functions in ScyllaDB/Cassandra.
 * Chain methods to configure the function signature, return type, language, and options.
 *
 * @example
 * // Define a Java-based add_numbers function
 * const createSQL = new UserDefinedFunctionBuilder("add_numbers")
 *   .replace()
 *   .param("a", "int")
 *   .param("b", "int")
 *   .returns("int")
 *   .usingLanguage("java")
 *   .returnsNullOnNullInput()
 *   .securityDefiner()
 *   .as("return a + b;")
 *   .toSQL()
 * // Executes:
 * // CREATE OR REPLACE FUNCTION add_numbers(a int, b int)
 * // RETURNS int
 * // LANGUAGE java
 * // RETURNS NULL ON NULL INPUT
 * // SECURITY DEFINER
 * // AS $$return a + b;$$;
 *
 * // To drop the function:
 * const dropSQL = new UserDefinedFunctionBuilder("add_numbers")
 *   .param("a", "int")
 *   .param("b", "int")
 *   .dropSQL()
 * // Executes: DROP FUNCTION IF EXISTS add_numbers(int, int);
 */
class UserDefinedFunctionBuilder {
    /**
     * @param functionName - Name of the UDF to create or drop.
     */
    constructor(functionName) {
        this.parameters = [];
        this.returnType = "text";
        this.language = "java";
        this.body = "";
        this._calledOnNullInput = true;
        this._ifNotExists = false;
        this._orReplace = false;
        this._security = null;
        this.functionName = functionName;
    }
    /**
     * Add IF NOT EXISTS clause to CREATE.
     */
    ifNotExists() {
        this._ifNotExists = true;
        return this;
    }
    /**
     * Add OR REPLACE clause to CREATE.
     */
    replace() {
        this._orReplace = true;
        return this;
    }
    /**
     * Define multiple parameters at once.
     * @param params - Array of [name, type] tuples.
     */
    withParams(params) {
        this.parameters = params;
        return this;
    }
    /**
     * Add a single parameter.
     * @param name - Parameter name.
     * @param type - Parameter type.
     */
    param(name, type) {
        this.parameters.push([name, type]);
        return this;
    }
    /**
     * Set the return type.
     * @param type - PrimitiveScyllaType to return.
     */
    returns(type) {
        this.returnType = type;
        return this;
    }
    /**
     * Specify the language (java or javascript).
     */
    usingLanguage(lang) {
        this.language = lang;
        return this;
    }
    /**
     * Define the function body.
     * @param body - Code block without delimiters.
     */
    as(body) {
        this.body = body;
        return this;
    }
    /**
     * Functions are called even if input is null.
     */
    calledOnNullInput() {
        this._calledOnNullInput = true;
        return this;
    }
    /**
     * Functions return null when input is null.
     */
    returnsNullOnNullInput() {
        this._calledOnNullInput = false;
        return this;
    }
    /**
     * Set SECURITY DEFINER.
     */
    securityDefiner() {
        this._security = "DEFINER";
        return this;
    }
    /**
     * Set SECURITY INVOKER.
     */
    securityInvoker() {
        this._security = "INVOKER";
        return this;
    }
    /**
     * Build and return the CREATE FUNCTION CQL statement.
     * @throws Error if no parameters defined.
     */
    toSQL() {
        if (this.parameters.length === 0) {
            throw new Error("User-defined function must have at least one parameter");
        }
        const prefix = this._orReplace
            ? "CREATE OR REPLACE FUNCTION"
            : this._ifNotExists
                ? "CREATE FUNCTION IF NOT EXISTS"
                : "CREATE FUNCTION";
        const params = this.parameters.map(([n, t]) => `${n} ${t}`).join(", ");
        const nullBehavior = this._calledOnNullInput
            ? "CALLED ON NULL INPUT"
            : "RETURNS NULL ON NULL INPUT";
        const securityClause = this._security ? `SECURITY ${this._security}` : "";
        return `
${prefix} ${this.functionName}(${params})
RETURNS ${this.returnType}
LANGUAGE ${this.language}
${nullBehavior}
${securityClause}
AS $$${this.body}$$;
    `.trim();
    }
    /**
     * Build and return the DROP FUNCTION CQL statement.
     * @param ifExists - Include IF EXISTS clause.
     */
    dropSQL(ifExists = true) {
        const types = this.parameters.map(([, t]) => t).join(", ");
        const clause = ifExists ? "IF EXISTS " : "";
        return `DROP FUNCTION ${clause}${this.functionName}(${types});`;
    }
}

/**
 * Builder for creating and dropping user-defined aggregates in ScyllaDB/Cassandra.
 * Chain methods to configure the aggregate signature, state/final functions, and options.
 *
 * @example
 * // Define an aggregate that sums integers
 * const createSQL = new UserDefinedAggregateBuilder("sum_ints")
 *   .orReplace()
 *   .withParameters(["int"])
 *   .stateFunction("state_sum")
 *   .stateTypeIs("int")
 *   .finalFunction("final_sum")
 *   .initialCondition("0")
 *   .toSQL()
 * // Executes:
 * // CREATE OR REPLACE AGGREGATE sum_ints(int)
 * // SFUNC state_sum
 * // STYPE int
 * // FINALFUNC final_sum
 * // INITCOND 0
 *
 * // To drop the aggregate:
 * const dropSQL = new UserDefinedAggregateBuilder("sum_ints")
 *   .withParameters(["int"])
 *   .dropSQL()
 * // Executes: DROP AGGREGATE IF EXISTS sum_ints(int)
 */
class UserDefinedAggregateBuilder {
    /**
     * @param aggregateName - Name of the aggregate to create or drop.
     */
    constructor(aggregateName) {
        this.parameters = [];
        this.stateFunctionName = "";
        this.stateType = "int";
        this._orReplace = false;
        this.aggregateName = aggregateName;
    }
    /**
     * Add OR REPLACE to the CREATE statement.
     */
    orReplace() {
        this._orReplace = true;
        return this;
    }
    /**
     * Define the parameter types for the aggregate.
     * @param types - List of Scylla primitive types.
     */
    withParameters(types) {
        this.parameters = types;
        return this;
    }
    /**
     * Set the state transition function name (SFUNC).
     * @param name - Name of the function.
     */
    stateFunction(name) {
        this.stateFunctionName = name;
        return this;
    }
    /**
     * Set the state data type (STYPE).
     * @param type - Primitive ScyllaDB type.
     */
    stateTypeIs(type) {
        this.stateType = type;
        return this;
    }
    /**
     * (Optional) Set the final function name (FINALFUNC).
     * @param name - Name of the final function.
     */
    finalFunction(name) {
        this.finalFunctionName = name;
        return this;
    }
    /**
     * (Optional) Set the initial condition (INITCOND).
     * @param condition - Initial value expression.
     */
    initialCondition(condition) {
        this.initCondition = condition;
        return this;
    }
    /**
     * Build and return the CREATE AGGREGATE CQL statement.
     * @throws Error if required fields are missing.
     */
    toSQL() {
        if (!this.aggregateName || this.parameters.length === 0 || !this.stateFunctionName) {
            throw new Error("Aggregate name, parameters, and state function must be provided");
        }
        const replace = this._orReplace ? "OR REPLACE " : "";
        const paramStr = this.parameters.join(", ");
        let sql = `CREATE ${replace}AGGREGATE ${this.aggregateName}(${paramStr})\n`;
        sql += `SFUNC ${this.stateFunctionName}\n`;
        sql += `STYPE ${this.stateType}`;
        if (this.finalFunctionName) {
            sql += `\nFINALFUNC ${this.finalFunctionName}`;
        }
        if (this.initCondition !== undefined) {
            sql += `\nINITCOND ${this.initCondition}`;
        }
        return sql;
    }
    /**
     * Build and return the DROP AGGREGATE CQL statement (IF EXISTS).
     */
    dropSQL() {
        const paramStr = this.parameters.join(", ");
        return `DROP AGGREGATE IF EXISTS ${this.aggregateName}(${paramStr})`;
    }
}

/**
 * Schema builder for creating and managing database schema objects.
 * Provides a fluent interface for creating tables, materialized views, user-defined types,
 * functions, and aggregates. Supports both SQL and ScyllaDB/Cassandra-specific features.
 *
 * @example
 *
 * const schema = new Schema(driver);
 *
 * // Create a table
 * await schema.createTable('users', (table) => {
 *   table.id();
 *   table.string('name');
 *   table.string('email').unique();
 *   table.timestamps();
 * });
 *
 * // Create a materialized view
 * await schema.createMaterializedView('users_by_email', 'users', (view) => {
 *   view.select('*');
 *   view.primaryKey('email', 'id');
 * });
 *
 */
class Schema {
    /**
     * Creates a new Schema instance.
     *
     * @param driver - Database driver for executing schema operations
     *
     * @example
     *
     * const connection = connectionManager.getConnection();
     * const schema = new Schema(connection.getDriver());
     *
     */
    constructor(driver) {
        this.driver = driver;
    }
    /**
     * Creates a new table with the specified structure.
     *
     * @param tableName - Name of the table to create
     * @param callback - Function to define table structure
     * @returns Promise that resolves when table is created
     *
     * @example
     *
     * await schema.createTable('posts', (table) => {
     *   table.id();
     *   table.string('title');
     *   table.text('content');
     *   table.integer('user_id');
     *   table.foreign('user_id').references('id').on('users');
     *   table.timestamps();
     * });
     *
     */
    async createTable(table, callback) {
        const builder = new TableBuilder(table);
        callback(builder);
        const definition = builder.build();
        const grammar = this.driver.getGrammar();
        const sql = grammar.compileCreateTable(definition);
        await this.driver.query(sql);
    }
    /**
     * Creates a new table only if it doesn't already exist.
     *
     * @param tableName - Name of the table to create
     * @param callback - Function to define table structure
     * @returns Promise that resolves when table is created or already exists
     *
     * @example
     *
     * await schema.createTableIfNotExists('cache', (table) => {
     *   table.string('key').primary();
     *   table.text('value');
     *   table.integer('ttl');
     * });
     *
     */
    // public async createTableIfNotExists(tableName: string, callback: (table: TableBuilder) => void): Promise<void> {
    //   const builder = new TableBuilder(tableName, this.driver)
    //   callback(builder)
    //   await builder.createIfNotExists()
    // }
    /**
     * Modifies an existing table structure.
     *
     * @param tableName - Name of the table to modify
     * @param callback - Function to define table modifications
     * @returns Promise that resolves when table is modified
     *
     * @example
     *
     * await schema.alterTable('users', (table) => {
     *   table.addColumn('phone', 'text');
     *   table.dropColumn('old_field');
     *   table.addIndex('email');
     * });
     *
     */
    async alterTable(table, callback) {
        const builder = new TableBuilder(table);
        builder.setTableExists(true);
        callback(builder);
        const definition = builder.build();
        const grammar = this.driver.getGrammar();
        const sql = grammar.compileAlterTable(definition);
        await this.driver.query(sql);
    }
    /**
     * Drops a table from the database.
     *
     * @param tableName - Name of the table to drop
     * @returns Promise that resolves when table is dropped
     *
     * @example
     *
     * await schema.dropTable('old_table');
     *
     */
    async dropTable(table) {
        const grammar = this.driver.getGrammar();
        const sql = `DROP TABLE ${grammar.wrapTable(table)}`;
        await this.driver.query(sql);
    }
    /**
     * Drops a table only if it exists.
     *
     * @param tableName - Name of the table to drop
     * @returns Promise that resolves when table is dropped or doesn't exist
     *
     * @example
     *
     * await schema.dropTableIfExists('temporary_table');
     *
     */
    async dropTableIfExists(table) {
        const grammar = this.driver.getGrammar();
        if (this.driver.constructor.name === "ScyllaDBDriver") {
            const sql = `DROP TABLE IF EXISTS ${grammar.wrapTable(table)}`;
            await this.driver.query(sql);
        }
        else {
            const exists = await this.hasTable(table);
            if (exists) {
                await this.dropTable(table);
            }
        }
    }
    /**
     * Truncates a table, removing all data but keeping the structure.
     *
     * @param tableName - Name of the table to truncate
     * @returns Promise that resolves when table is truncated
     *
     * @example
     *
     * await schema.truncateTable('logs');
     *
     */
    async truncateTable(tableName) {
        const grammar = this.driver.getGrammar();
        const sql = `TRUNCATE ${grammar.wrapTable(tableName)}`;
        await this.driver.query(sql);
    }
    /**
     * Creates a materialized view (ScyllaDB/Cassandra specific).
     *
     * @param viewName - Name of the materialized view
     * @param baseTable - Base table for the view
     * @param callback - Function to define view structure
     * @returns Promise that resolves when view is created
     *
     * @example
     *
     * await schema.createMaterializedView('users_by_email', 'users', (view) => {
     *   view.select('id', 'name', 'email', 'created_at');
     *   view.where('email', 'IS NOT NULL');
     *   view.primaryKey('email', 'id');
     * });
     *
     */
    async createMaterializedView(viewName, baseTable, callback) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("Materialized views are only supported in ScyllaDB");
        }
        const builder = new MaterializedViewBuilder(viewName, baseTable);
        callback(builder);
        const sql = builder.toSQL();
        await this.driver.query(sql);
    }
    /**
     * Drops a materialized view.
     *
     * @param viewName - Name of the materialized view to drop
     * @returns Promise that resolves when view is dropped
     *
     * @example
     *
     * await schema.dropMaterializedView('users_by_email');
     *
     */
    async dropMaterializedView(viewName) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("Materialized views are only supported in ScyllaDB");
        }
        // const builder = new MaterializedViewBuilder(viewName, "")
        // await builder.drop()
        const cql = `DROP MATERIALIZED VIEW IF EXISTS ${viewName}`;
        await this.driver.query(cql);
    }
    /**
     * Creates a user-defined type (ScyllaDB/Cassandra specific).
     *
     * @param typeName - Name of the user-defined type
     * @param callback - Function to define type structure
     * @returns Promise that resolves when type is created
     *
     * @example
     *
     * await schema.createType('address', (type) => {
     *   type.field('street', 'text');
     *   type.field('city', 'text');
     *   type.field('zip_code', 'text');
     *   type.field('country', 'text');
     * });
     *
     */
    async createType(typeName, callback) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined types are only supported in ScyllaDB");
        }
        const builder = new UserDefinedTypeBuilder(typeName);
        callback(builder);
        const sql = builder.toSQL();
        await this.driver.query(sql);
    }
    /**
     * Drops a user-defined type.
     *
     * @param typeName - Name of the type to drop
     * @returns Promise that resolves when type is dropped
     *
     * @example
     *
     * await schema.dropType('address');
     *
     */
    async dropType(typeName) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined types are only supported in ScyllaDB");
        }
        // const builder = new UserDefinedTypeBuilder(typeName)
        // await builder.drop()
        const cql = `DROP TYPE IF EXISTS ${typeName}`;
        await this.driver.query(cql);
    }
    /**
     * Creates a user-defined function (ScyllaDB/Cassandra specific).
     *
     * @param functionName - Name of the function
     * @param callback - Function to define function structure
     * @returns Promise that resolves when function is created
     *
     * @example
     *
     * await schema.createFunction('calculate_age', (func) => {
     *   func.parameter('birth_date', 'timestamp');
     *   func.returns('int');
     *   func.language('java');
     *   func.body(`
     *     return (int) ((System.currentTimeMillis() - birth_date.getTime())
     *       / (1000L * 60 * 60 * 24 * 365));
     *   `);
     * });
     *
     */
    async createFunction(functionName, callback) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined functions are only supported in ScyllaDB");
        }
        const builder = new UserDefinedFunctionBuilder(functionName);
        callback(builder);
        const sql = builder.toSQL();
        await this.driver.query(sql);
    }
    /**
     * Drops a user-defined function.
     *
     * @param functionName - Name of the function to drop
     * @returns Promise that resolves when function is dropped
     *
     * @example
     *
     * await schema.dropFunction('calculate_age');
     *
     */
    async dropFunction(functionName, parameterTypes) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined functions are only supported in ScyllaDB");
        }
        // const builder = new UserDefinedFunctionBuilder(functionName)
        // await builder.drop()
        if (parameterTypes.length === 0) {
            throw new Error("Parameter types are required to drop a UDF in ScyllaDB");
        }
        const paramStr = parameterTypes.join(", ");
        const sql = `DROP FUNCTION IF EXISTS ${functionName}(${paramStr})`;
        await this.driver.query(sql);
    }
    /**
     * Creates a user-defined aggregate (ScyllaDB/Cassandra specific).
     *
     * @param aggregateName - Name of the aggregate
     * @param callback - Function to define aggregate structure
     * @returns Promise that resolves when aggregate is created
     *
     * @example
     *
     * await schema.createAggregate('average', (agg) => {
     *   agg.parameter('val', 'int');
     *   agg.stateFunction('avg_state');
     *   agg.stateType('tuple<int, bigint>');
     *   agg.finalFunction('avg_final');
     *   agg.initialCondition('(0, 0)');
     * });
     *
     */
    async createAggregate(aggregateName, callback) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined aggregates are only supported in ScyllaDB");
        }
        const builder = new UserDefinedAggregateBuilder(aggregateName);
        callback(builder);
        const sql = builder.toSQL();
        await this.driver.query(sql);
    }
    /**
     * Drops a user-defined aggregate.
     *
     * @param aggregateName - Name of the aggregate to drop
     * @returns Promise that resolves when aggregate is dropped
     *
     * @example
     *
     * await schema.dropAggregate('average');
     *
     */
    async dropAggregate(aggregateName, parameterTypes) {
        if (this.driver.constructor.name !== "ScyllaDBDriver") {
            throw new Error("User-defined aggregates are only supported in ScyllaDB");
        }
        if (parameterTypes.length === 0) {
            throw new Error("Parameter types are required to drop a UDA in ScyllaDB");
        }
        const builder = new UserDefinedAggregateBuilder(aggregateName).withParameters(parameterTypes);
        const sql = builder.dropSQL();
        await this.driver.query(sql);
    }
    /**
     * Checks if a table exists in the database.
     *
     * @param tableName - Name of the table to check
     * @returns Promise resolving to boolean indicating existence
     *
     * @example
     *
     * if (await schema.hasTable('users')) {
     *   console.log('Users table exists');
     * }
     *
     */
    async hasTable(tableName) {
        const grammar = this.driver.getGrammar();
        const sql = grammar.compileTableExists(tableName);
        const result = await this.driver.query(sql);
        return result.rows.length > 0;
    }
    /**
     * Checks if a column exists in a table.
     *
     * @param tableName - Name of the table
     * @param columnName - Name of the column to check
     * @returns Promise resolving to boolean indicating existence
     *
     * @example
     *
     * if (await schema.hasColumn('users', 'email')) {
     *   console.log('Email column exists in users table');
     * }
     *
     */
    async hasColumn(tableName, columnName) {
        const grammar = this.driver.getGrammar();
        const sql = grammar.compileColumnExists(tableName, columnName);
        const result = await this.driver.query(sql);
        return result.rows.length > 0;
    }
    /**
     * Gets information about table columns.
     *
     * @param tableName - Name of the table
     * @returns Promise resolving to array of column information
     *
     * @example
     *
     * const columns = await schema.getColumnListing('users');
     * columns.forEach(column => {
     *   console.log(`Column: ${column.name}, Type: ${column.type}`);
     * });
     *
     */
    // public async getColumnListing(tableName: string): Promise<Array<{ name: string; type: string; nullable: boolean }>> {
    //   const grammar = this.driver.getGrammar()
    //   const sql = grammar.compileColumnListing(tableName)
    //   const result = await this.driver.query(sql)
    //   return result.rows
    // }
    /**
     * Executes a raw schema query.
     * Use with caution - bypasses query builder safety features.
     *
     * @param sql - Raw SQL/CQL query to execute
     * @param params - Optional query parameters
     * @returns Promise resolving to query result
     *
     * @example
     *
     * await schema.raw('CREATE KEYSPACE IF NOT EXISTS test_ks WITH replication = ?', [
     *   { 'class': 'SimpleStrategy', 'replication_factor': 1 }
     * ]);
     *
     */
    async raw(sql, params) {
        return await this.driver.query(sql, params);
    }
}

/**
 * Abstract base class for database migrations.
 * Provides structure for creating reversible database schema changes.
 * Each migration should implement both `up()` and `down()` methods to support
 * forward and backward migration operations.
 *
 * @abstract
 *
 * @example
 *
 * export class CreateUsersTable extends Migration {
 *   async up(schema: Schema): Promise<void> {
 *     await schema.createTable('users', (table) => {
 *       table.id();
 *       table.string('name');
 *       table.string('email').unique();
 *       table.timestamps();
 *     });
 *   }
 *
 *   async down(schema: Schema): Promise<void> {
 *     await schema.dropTable('users');
 *   }
 * }
 *
 */
class Migration {
    /**
     * Gets the migration class name.
     * Used for tracking which migrations have been executed.
     *
     * @returns The class name of the migration
     *
     * @example
     *
     * const migration = new CreateUsersTable();
     * console.log(migration.getName()); // "CreateUsersTable"
     *
     */
    getName() {
        return this.constructor.name;
    }
    /**
     * Extracts timestamp from migration class name or generates current timestamp.
     * Migration class names should follow the format: YYYY_MM_DD_HHMMSS_MigrationName
     * If no timestamp is found in the class name, returns current timestamp.
     *
     * @returns Timestamp string in format YYYYMMDDHHMMSS
     *
     * @example
     *
     * // For class name "2024_01_15_143022_CreateUsersTable"
     * const migration = new CreateUsersTable();
     * console.log(migration.getTimestamp()); // "2024_01_15_143022"
     *
     * // For class name without timestamp
     * console.log(migration.getTimestamp()); // Current timestamp
     *
     */
    getTimestamp() {
        const match = this.constructor.name.match(/^(\d{4}_\d{2}_\d{2}_\d{6})/);
        return match
            ? match[1]
            : new Date()
                .toISOString()
                .replace(/[-:T.]/g, "")
                .slice(0, 15);
    }
}

/**
 * Manages database migrations including execution, rollback, and status tracking.
 * Provides comprehensive migration management with batch tracking and error handling.
 * Automatically creates and manages a migrations table to track executed migrations.
 *
 * @example
 *
 * const connManager = ConnectionManager.getInstance();
 * const migrationManager = new MigrationManager(connManager);
 *
 * const migrations = [
 *   new CreateUsersTable(),
 *   new CreatePostsTable(),
 *   new AddIndexesToUsers()
 * ];
 *
 * // Run all pending migrations
 * await migrationManager.migrate(migrations);
 *
 * // Rollback last migration
 * await migrationManager.rollback(migrations, 1);
 *
 * // Check migration status
 * const status = await migrationManager.status(migrations);
 *
 */
class MigrationManager {
    /**
     * Creates a new MigrationManager instance.
     *
     * @param connManager - ConnectionManager instance for database access
     *
     * @example
     *
     * const connManager = ConnectionManager.getInstance();
     * const migrationManager = new MigrationManager(connManager);
     *
     */
    constructor(connManager) {
        this.migrationsTable = "migrations";
        this.connManager = connManager;
        this.connection = this.connManager.getConnection();
    }
    /**
     * Executes all pending migrations in order.
     * Creates the migrations tracking table if it doesn't exist.
     * Skips migrations that have already been executed.
     *
     * @param migrations - Array of migration instances to execute
     * @returns Promise that resolves when all migrations are complete
     *
     * @throws {Error} When any migration fails to execute
     *
     * @example
     *
     * const migrations = [
     *   new CreateUsersTable(),
     *   new CreatePostsTable()
     * ];
     *
     * try {
     *   await migrationManager.migrate(migrations);
     *   console.log('All migrations completed successfully');
     * } catch (error) {
     *   console.error('Migration failed:', error);
     * }
     *
     */
    async migrate(migrations) {
        await this.ensureMigrationsTable();
        const executed = await this.getExecutedMigrations();
        const pending = migrations.filter((migration) => !executed.includes(migration.getName()));
        for (const migration of pending) {
            console.log(`Running migration: ${migration.getName()}`);
            try {
                const schema = new Schema(this.connection.getDriver());
                await migration.up(schema);
                await this.recordMigration(migration);
                console.log(`Migrated: ${migration.getName()}`);
            }
            catch (error) {
                console.error(`Migration failed: ${migration.getName()}`, error);
                throw error;
            }
        }
    }
    /**
     * Rolls back the specified number of migrations.
     * Executes the `down()` method of migrations in reverse order.
     *
     * @param migrations - Array of all available migrations
     * @param steps - Number of migrations to rollback (default: 1)
     * @returns Promise that resolves when rollback is complete
     *
     * @throws {Error} When any rollback operation fails
     *
     * @example
     *
     * // Rollback last migration
     * await migrationManager.rollback(migrations);
     *
     * // Rollback last 3 migrations
     * await migrationManager.rollback(migrations, 3);
     *
     */
    async rollback(migrations, steps = 1) {
        const executed = await this.getExecutedMigrations();
        const toRollback = executed.slice(-steps).reverse();
        for (const migrationName of toRollback) {
            const migration = migrations.find((m) => m.getName() === migrationName);
            if (!migration) {
                console.warn(`Migration not found: ${migrationName}`);
                continue;
            }
            console.log(`Rolling back: ${migrationName}`);
            try {
                const schema = new Schema(this.connection.getDriver());
                await migration.down(schema);
                await this.removeMigrationRecord(migration);
                console.log(`Rolled back: ${migrationName}`);
            }
            catch (error) {
                console.error(`Rollback failed: ${migrationName}`, error);
                throw error;
            }
        }
    }
    /**
     * Gets the execution status of all migrations.
     * Shows which migrations have been executed and their batch numbers.
     *
     * @param migrations - Array of migration instances to check
     * @returns Promise resolving to array of migration status objects
     *
     * @example
     *
     * const status = await migrationManager.status(migrations);
     * status.forEach(({ name, executed, batch }) => {
     *   console.log(`${name}: ${executed ? `Executed (batch ${batch})` : 'Pending'}`);
     * });
     *
     */
    async status(migrations) {
        await this.ensureMigrationsTable();
        const executed = await this.getExecutedMigrationsWithBatch();
        return migrations.map((migration) => {
            const executedMigration = executed.find((e) => e.migration === migration.getName());
            return {
                name: migration.getName(),
                executed: !!executedMigration,
                batch: executedMigration?.batch,
            };
        });
    }
    /**
     * Rolls back all executed migrations.
     * Executes all migrations' `down()` methods in reverse order.
     *
     * @param migrations - Array of all available migrations
     * @returns Promise that resolves when all migrations are rolled back
     *
     * @example
     *
     * await migrationManager.reset(migrations);
     * console.log('All migrations have been rolled back');
     *
     */
    async reset(migrations) {
        const executed = await this.getExecutedMigrations();
        const toRollback = executed.reverse();
        for (const migrationName of toRollback) {
            const migration = migrations.find((m) => m.getName() === migrationName);
            if (!migration) {
                continue;
            }
            try {
                const schema = new Schema(this.connection.getDriver());
                await migration.down(schema);
                await this.removeMigrationRecord(migration);
            }
            catch (error) {
                console.error(`Reset failed: ${migrationName}`, error);
            }
        }
    }
    /**
     * Resets all migrations and then re-runs them.
     * Equivalent to calling `reset()` followed by `migrate()`.
     *
     * @param migrations - Array of migration instances
     * @returns Promise that resolves when refresh is complete
     *
     * @example
     *
     * await migrationManager.refresh(migrations);
     * console.log('Database refreshed with latest migrations');
     *
     */
    async refresh(migrations) {
        await this.reset(migrations);
        await this.migrate(migrations);
    }
    /**
     * Ensures the migrations tracking table exists.
     * Creates the table with appropriate schema for tracking migration execution.
     * Uses composite primary key for ScyllaDB compatibility.
     *
     * @private
     * @returns Promise that resolves when table is ensured to exist
     */
    async ensureMigrationsTable() {
        const driver = this.connection.getDriver();
        driver.getGrammar();
        await driver.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        batch_number int,
        migration text,
        executed_at timestamp,
        PRIMARY KEY (batch_number, migration)
      )
    `);
    }
    /**
     * Retrieves list of executed migration names.
     *
     * @private
     * @returns Promise resolving to array of migration names
     */
    async getExecutedMigrations() {
        const driver = this.connection.getDriver();
        const grammar = driver.getGrammar();
        const result = await driver.query(`SELECT migration FROM ${grammar.wrapTable(this.migrationsTable)}`);
        return result.rows.map((row) => row.migration);
    }
    /**
     * Retrieves executed migrations with their batch information.
     *
     * @private
     * @returns Promise resolving to array of migration objects with batch info
     */
    async getExecutedMigrationsWithBatch() {
        const driver = this.connection.getDriver();
        const grammar = driver.getGrammar();
        const result = await driver.query(`SELECT migration, batch_number FROM ${grammar.wrapTable(this.migrationsTable)}`);
        return result.rows.map((row) => ({
            migration: row.migration,
            batch: row.batch_number,
        }));
    }
    /**
     * Records a migration as executed in the migrations table.
     * Assigns the migration to the next available batch number.
     *
     * @private
     * @param migration - Migration instance to record
     * @returns Promise that resolves when migration is recorded
     */
    async recordMigration(migration) {
        const driver = this.connection.getDriver();
        const grammar = driver.getGrammar();
        const batchResult = await driver.query(`SELECT MAX(batch_number) as max_batch FROM ${grammar.wrapTable(this.migrationsTable)}`);
        const nextBatch = (batchResult.rows[0]?.max_batch || 0) + 1;
        const insertSql = grammar.compileInsert({
            table: this.migrationsTable,
            values: {
                batch_number: nextBatch,
                migration: migration.getName(),
                executed_at: new Date(),
            },
        });
        await driver.query(insertSql, [nextBatch, migration.getName(), new Date()]);
    }
    /**
     * Removes a migration record from the migrations table.
     * Used during rollback operations.
     *
     * @private
     * @param migration - Migration instance to remove
     * @returns Promise that resolves when record is removed
     */
    async removeMigrationRecord(migration) {
        const driver = this.connection.getDriver();
        const grammar = driver.getGrammar();
        const deleteSql = grammar.compileDelete({
            table: this.migrationsTable,
            wheres: [
                {
                    type: "basic",
                    column: "migration",
                    operator: "=",
                    value: migration.getName(),
                },
            ],
        });
        await driver.query(deleteSql, [migration.getName()]);
    }
}

/**
 * Factory class to generate model instances, raw data, or persist records.
 *
 * @template TModel - Model class extending Model<TAttrs>
 * @template TAttrs - Attribute shape for the model
 *
 * @example
 * // Define a factory for User model:
 * import { defineFactory } from "@/factories/ModelFactory"
 * import { User } from "@/models/User"
 *
 * defineFactory<User, UserAttributes>("User", {
 *   id: () => faker.string.uuid(),
 *   first_name: () => faker.person.firstName(),
 *   last_name: () => faker.person.lastName(),
 *   email: () => faker.internet.email(),
 *   created_at: () => new Date(),
 *   updated_at: () => new Date(),
 * })
 */
class ModelFactory {
    constructor(modelName, definition) {
        this.modelName = modelName;
        this.definition = {};
        this.states = new Map();
        this.count = 1;
        this.currentStates = [];
        this.definition = definition;
    }
    /**
     * Register a factory definition under a model name.
     *
     * @param modelName - Unique key matching ModelRegistry.
     * @param definition - Default attribute definitions.
     * @returns The defined factory instance.
     */
    static define(modelName, definition) {
        const factory = new ModelFactory(modelName, definition);
        this.factories.set(modelName, factory);
        return factory;
    }
    /**
     * Retrieve a cloned factory for a model.
     *
     * @param modelName - Key of the registered factory.
     * @returns A fresh factory instance.
     * @throws If factory not found.
     */
    static for(modelName) {
        const factory = this.factories.get(modelName);
        if (!factory)
            throw new Error(`Factory for model '${modelName}' not found`);
        return factory.clone();
    }
    /**
     * Define a named state with specific overrides.
     * @param name - State identifier
     * @param definition - Partial overrides or function to generate them
     */
    state(name, definition) {
        this.states.set(name, definition);
        return this;
    }
    /**
     * Apply a named state to the factory.
     */
    as(stateName) {
        this.currentStates.push(stateName);
        return this;
    }
    /**
     * Specify how many instances to create or make.
     */
    times(count) {
        this.count = count;
        return this;
    }
    /**
     * Persist multiple model instances.
     *
     * @param overrides - Attribute overrides for generation.
     * @returns Array of persisted model instances.
     */
    async create(overrides = {}) {
        const models = [];
        for (let i = 0; i < this.count; i++) {
            const attrs = this.generateAttributes(overrides);
            const ModelClass = ModelRegistry.getInstance().get(this.modelName);
            const model = await ModelClass.create(attrs);
            models.push(model);
        }
        return models;
    }
    /**
     * Persist and return a single model instance.
     */
    async createOne(overrides = {}) {
        const [first] = await this.times(1).create(overrides);
        return first;
    }
    /**
     * Build model instances without saving.
     */
    make(overrides = {}) {
        const arr = [];
        for (let i = 0; i < this.count; i++) {
            const attrs = this.generateAttributes(overrides);
            const ModelClass = ModelRegistry.getInstance().get(this.modelName);
            arr.push(new ModelClass(attrs));
        }
        return this.count === 1 ? arr[0] : arr;
    }
    /**
     * Generate raw attribute data without Model wrapping.
     */
    raw(overrides = {}) {
        const data = [];
        for (let i = 0; i < this.count; i++)
            data.push(this.generateAttributes(overrides));
        return this.count === 1 ? data[0] : data;
    }
    /**
     * Internal: combine definition, states, and overrides, resolving functions.
     */
    generateAttributes(overrides) {
        let attrs = { ...this.definition };
        for (const state of this.currentStates) {
            const def = this.states.get(state);
            const stateAttrs = typeof def === 'function' ? def(faker.faker) : def;
            attrs = { ...attrs, ...stateAttrs };
        }
        attrs = { ...attrs, ...overrides };
        const result = {};
        for (const [k, v] of Object.entries(attrs)) {
            result[k] = typeof v === 'function' ? v(faker.faker) : v;
        }
        return result;
    }
    /** Clone this factory with existing states. */
    clone() {
        const c = new ModelFactory(this.modelName, this.definition);
        c.states = new Map(this.states);
        return c;
    }
}
ModelFactory.factories = new Map();
/**
 * Shortcut to define a new factory.
 */
function defineFactory(modelName, definition) {
    return ModelFactory.define(modelName, definition);
}

/**
 * Base class for database seeders.
 * Extend this class and implement the `run()` method to insert or manipulate data.
 *
 * @example
 * // Example seeder:
 * import { Seeder } from "@/seeders/Seeder"
 * import { User } from "@/models/User"
 *
 * export class UserSeeder extends Seeder {
 *   async run() {
 *     // Clear existing records
 *     await this.truncate("users")
 *
 *     // Insert new records via factory
 *     const users = this.factory(() => User.factory()).makeMany(10)
 *     for (const user of users) {
 *       await user.save()
 *     }
 *   }
 * }
 *
 * // Register and run:
 * SeederRunner.register(UserSeeder)
 * await SeederRunner.run()
 */
class Seeder {
    constructor() {
        /** Underlying database connection */
        this.connection = ConnectionManager.getInstance().getConnection();
    }
    /**
     * Invoke another seeder from within this seeder.
     *
     * @param SeederClass - The seeder class to call.
     * @example
     * // Within a seeder:
     * await this.call(OtherSeeder)
     */
    async call(SeederClass) {
        const instance = new SeederClass();
        await instance.run();
    }
    /**
     * Access a model factory for generating test data.
     *
     * @template TFactory - A subclass of ModelFactory
     * @param factory - A function returning the factory instance
     * @returns The factory instance
     * @example
     * // Get the Post factory:
     * const postFactory = this.factory(() => Post.factory())
     * const posts = postFactory.makeMany(5)
     */
    factory(factory) {
        return factory();
    }
    /**
     * Truncate (empty) the given table.
     *
     * @param tableName - Name of the table to truncate.
     * @returns Promise that resolves when truncation is complete.
     * @example
     * // Clear the comments table:
     * await this.truncate("comments")
     */
    async truncate(tableName) {
        await this.connection.query(`TRUNCATE ${tableName}`);
    }
}
/**
 * Manages and runs registered seeders.
 *
 * @example
 * import { SeederRunner } from "@/seeders/Seeder"
 * import { UserSeeder } from "@/seeders/UserSeeder"
 *
 * // Register multiple:
 * SeederRunner.register(UserSeeder)
 *
 * // Run all:
 * await SeederRunner.run()
 *
 * // Or run a single:
 * await SeederRunner.runOne(UserSeeder)
 */
class SeederRunner {
    /**
     * Register a seeder class to be run later.
     *
     * @param seederClass - Seeder class constructor.
     */
    static register(seederClass) {
        this.seeders.push(seederClass);
    }
    /**
     * Run all registered seeders, or a provided list.
     *
     * @param seeders - Optional array of seeder classes to run instead of all registered.
     * @returns Promise that resolves when all runs complete.
     */
    static async run(seeders) {
        const toRun = seeders ?? this.seeders;
        for (const SeederClass of toRun) {
            console.log(`Seeding: ${SeederClass.name}`);
            const seeder = new SeederClass();
            await seeder.run();
            console.log(`Seeded: ${SeederClass.name}`);
        }
    }
    /**
     * Run a single seeder class.
     *
     * @param seederClass - The seeder class to execute.
     * @returns Promise that resolves when the run completes.
     */
    static async runOne(seederClass) {
        console.log(`Seeding: ${seederClass.name}`);
        const seeder = new seederClass();
        await seeder.run();
        console.log(`Seeded: ${seederClass.name}`);
    }
}
/** Internal list of registered seeder classes */
SeederRunner.seeders = [];

/**
 * Decorator that marks a method as a query scope.
 * Scopes are reusable query constraints that can be applied to models.
 *
 * @returns Method decorator function
 *
 * @example
 *
 * class User extends Model {
 *   @Scope()
 *   static active(query: QueryBuilder) {
 *     return query.where('status', 'active');
 *   }
 *
 *   @Scope()
 *   static byRole(query: QueryBuilder, role: string) {
 *     return query.where('role', role);
 *   }
 * }
 *
 * // Usage:
 * const activeUsers = await User.query().active().get();
 * const admins = await User.query().byRole('admin').get();
 *
 */
function Scope() {
    return (target, context) => {
        const methodName = context.name.toString();
        const actualTarget = typeof target === "function" ? target : target.constructor;
        // Get existing scopes or create new object
        const scopes = Reflect.getMetadata("__scopes", actualTarget) || {};
        // Add method to scopes
        scopes[methodName] = target[methodName];
        // Update metadata
        Reflect.defineMetadata("__scopes", scopes, actualTarget);
    };
}

exports.BelongsTo = BelongsTo;
exports.BelongsToMany = BelongsToMany;
exports.Connection = Connection;
exports.ConnectionManager = ConnectionManager;
exports.DatabaseDriver = DatabaseDriver;
exports.HasMany = HasMany;
exports.HasOne = HasOne;
exports.Migration = Migration;
exports.MigrationManager = MigrationManager;
exports.Model = Model;
exports.ModelFactory = ModelFactory;
exports.ModelRegistry = ModelRegistry;
exports.MorphMany = MorphMany;
exports.MorphOne = MorphOne;
exports.MorphTo = MorphTo;
exports.QueryBuilder = QueryBuilder;
exports.QueryGrammar = QueryGrammar;
exports.Relationship = Relationship;
exports.Schema = Schema;
exports.Scope = Scope;
exports.ScyllaDBDriver = ScyllaDBDriver;
exports.ScyllaDBGrammar = ScyllaDBGrammar;
exports.Seeder = Seeder;
exports.SeederRunner = SeederRunner;
exports.defineFactory = defineFactory;
//# sourceMappingURL=index.cjs.js.map
