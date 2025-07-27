import { DatabaseDriver } from "./DatabaseDriver";
import { MySQLGrammar } from "./grammars/MySQLGrammar";
/**
 * MySQL/MariaDB database driver implementation using `mysql2`.
 * Provides connection pooling, query execution, prepared statements, and grammar support.
 *
 * @extends DatabaseDriver
 *
 * @example
 *
 * const config = {
 *   driver: 'mysql',
 *   host: 'localhost',
 *   port: 3306,
 *   database: 'myapp',
 *   username: 'root',
 *   password: 'secret'
 * };
 *
 * const driver = new MySQLDriver(config);
 * await driver.connect();
 * const result = await driver.query('SELECT * FROM users');
 */
export class MySQLDriver extends DatabaseDriver {
    /** MySQL connection instance */
    mysqlConnection = null;
    mysqlModule;
    /** SQL grammar instance */
    grammar;
    /**
     * Creates a new MySQLDriver instance.
     *
     * @param config - Database configuration object
     */
    constructor(config) {
        super(config);
        this.grammar = new MySQLGrammar();
    }
    /**
     * Establishes a connection to the MySQL server.
     *
     * @returns Promise that resolves when connection is established
     * @throws {Error} When connection fails
     */
    async connect() {
        this.mysqlModule = await import("mysql2/promise");
        const { createConnection } = this.mysqlModule;
        this.mysqlConnection = await createConnection({
            host: this.config.host,
            port: this.config.port ?? 3306,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database,
            ...this.config,
        });
        this.mysqlConnection.connect();
        this.connection = this.mysqlConnection; // For shared abstraction
    }
    /**
     * Closes the database connection.
     *
     * @returns Promise that resolves when connection is closed
     */
    async disconnect() {
        await this.mysqlConnection?.end();
        this.mysqlConnection = null;
        this.connection = null;
    }
    /**
     * Executes a raw SQL query with optional parameter bindings.
     *
     * @param sql - The SQL query to execute
     * @param bindings - Optional parameter bindings
     * @returns Promise resolving to query results
     * @throws {Error} When query execution fails
     *
     * @example
     * const result = await driver.query('SELECT * FROM users WHERE active = ?', [1]);
     */
    async query(sql, bindings = []) {
        try {
            const [rows] = await this.connection.execute(sql, bindings);
            return {
                rows,
                rowCount: Array.isArray(rows) ? rows.length : 0,
            };
        }
        catch (error) {
            throw new Error(`MySQL query failed: ${error.message}`);
        }
    }
    /**
     * Prepares a SQL statement for repeated execution.
     *
     * @param sql - The SQL statement to prepare
     * @returns Promise resolving to a prepared statement
     * @throws {Error} When statement preparation fails
     *
     * @example
     * const prepared = await driver.prepare('INSERT INTO logs (id, message) VALUES (?, ?)');
     * await prepared.execute(['1', 'Hello']);
     */
    async prepare(sql) {
        const statement = await this.connection.prepare(sql);
        return new MySQLPreparedStatement(statement);
    }
    /**
     * Begins a transaction on the current connection.
     *
     * @returns Promise that resolves when transaction begins
     */
    async beginTransaction() {
        await this.connection.beginTransaction();
        this.inTransaction = true;
    }
    /**
     * Commits the current transaction.
     *
     * @returns Promise that resolves when transaction is committed
     */
    async commit() {
        await this.connection.commit();
        this.inTransaction = false;
    }
    /**
     * Rolls back the current transaction.
     *
     * @returns Promise that resolves when transaction is rolled back
     */
    async rollback() {
        await this.connection.rollback();
        this.inTransaction = false;
    }
    /**
     * Gets the ID of the last inserted record.
     *
     * @returns Promise resolving to the last insert ID
     *
     * @example
     * const id = await driver.getLastInsertId();
     */
    async getLastInsertId() {
        const [rows] = await this.connection.query("SELECT LAST_INSERT_ID() AS id");
        return rows?.[0]?.id ?? "";
    }
    /**
     * Escapes a value for safe inclusion in SQL queries.
     *
     * @param value - The value to escape
     * @returns Escaped string
     *
     * @example
     * const escaped = driver.escape("O'Reilly");
     * // "'O\\'Reilly'"
     */
    escape(value) {
        return this.mysqlModule.escape(value);
    }
    /**
     * Gets the SQL grammar instance for this driver.
     *
     * @returns The MySQLGrammar instance
     */
    getGrammar() {
        return this.grammar;
    }
    /**
     * Checks if the driver supports a specific feature.
     *
     * @param feature - The feature name
     * @returns True if supported, false otherwise
     *
     * @example
     * if (driver.supportsFeature('transactions')) {
     *   console.log('Supports transactions');
     * }
     */
    supportsFeature(feature) {
        const supported = [
            "prepared_statements",
            "transactions",
            "json",
            "batch_operations",
            "foreign_keys",
            "auto_increment",
        ];
        return supported.includes(feature);
    }
}
/**
 * MySQL prepared statement wrapper.
 *
 * @implements PreparedStatement
 *
 * @example
 * const stmt = await driver.prepare('SELECT * FROM posts WHERE user_id = ?');
 * const result = await stmt.execute(['123']);
 * await stmt.close();
 */
class MySQLPreparedStatement {
    statement;
    /**
     * Creates a new MySQLPreparedStatement instance.
     *
     * @param statement - The raw mysql2 statement object
     */
    constructor(statement) {
        this.statement = statement;
    }
    /**
     * Executes the prepared statement.
     *
     * @param bindings - Optional parameter bindings
     * @returns Promise resolving to query results
     */
    async execute(bindings) {
        const [rows] = await this.statement.execute(bindings || []);
        return {
            rows,
            rowCount: Array.isArray(rows) ? rows.length : 0,
        };
    }
    /**
     * Closes the prepared statement.
     *
     * @returns Promise that resolves when closed
     */
    async close() {
        await this.statement.close();
    }
}
//# sourceMappingURL=MySQLDriver.js.map