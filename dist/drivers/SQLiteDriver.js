"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteDriver = void 0;
const DatabaseDriver_1 = require("./DatabaseDriver");
const SQLiteGrammar_1 = require("./grammars/SQLiteGrammar");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
/**
 * SQLite driver implementation using better-sqlite3.
 */
class SQLiteDriver extends DatabaseDriver_1.DatabaseDriver {
    /**
     * Creates a new PostgreSQLDriver instance.
     *
     * @param config - Database configuration object
     */
    constructor(config) {
        super(config);
        this.db = null;
        this.transactionLevel = 0;
        this.grammar = new SQLiteGrammar_1.SQLiteGrammar();
    }
    /**
     * Connect to a SQLite database using the given configuration.
     *
     * @returns Promise that resolves when connection is established
     * @throws {Error} When connection fails
     *
     * @example
     * await driver.connect();
     * console.log('Connected to SQLite');
     * ```
     */
    async connect() {
        const dbPath = this.config.database || ":memory:";
        this.db = new better_sqlite3_1.default(dbPath, {
            verbose: this.config.verbose ? console.log : undefined,
            fileMustExist: this.config.fileMustExist || false,
            timeout: this.config.timeout || 5000,
            readonly: this.config.readonly || false,
            ...this.config,
        });
        // Enable foreign keys
        this.db.pragma("foreign_keys = ON");
        // Set journal mode for better performance
        this.db.pragma("journal_mode = WAL");
        this.connection = this.db;
    }
    /**
     * Disconnects from the SQLite database.
     */
    async disconnect() {
        if (this.db) {
            this.db.close();
            this.connection = null;
        }
    }
    /**
     * Execute a raw SQL query with optional bindings and options.
     *
     * @param sql - The raw SQL string to execute.
     * @param bindings - The parameter bindings for the SQL query.
     * @returns The result of the executed query.
     */
    async query(sql, bindings = []) {
        if (!this.db)
            throw new Error("SQLite connection is not initialized");
        try {
            const stmt = this.db.prepare(sql);
            if (sql.trim().toLowerCase().startsWith("select")) {
                const rows = stmt.all(bindings || []);
                return {
                    rows,
                    rowCount: rows.length,
                    //fields: this.getFieldInfo(stmt),
                };
            }
            else {
                const result = stmt.run(bindings || []);
                return {
                    rows: [],
                    rowCount: result.changes,
                    insertId: result.lastInsertRowid,
                    affectedRows: result.changes,
                };
            }
        }
        catch (error) {
            throw new Error(`SQLite query failed: ${error.message}`);
        }
    }
    /**
     * Prepares a SQL statement and returns a PreparedStatement wrapper.
     *
     * @param sql - The SQL statement to prepare.
     * @returns A prepared statement interface for reuse.
     */
    async prepare(sql) {
        return new SQLitePreparedStatement(this.db, sql);
    }
    async beginTransaction() {
        if (this.transactionLevel === 0) {
            this.db.exec("BEGIN TRANSACTION");
        }
        this.transactionLevel++;
        this.inTransaction = true;
    }
    async commit() {
        if (this.transactionLevel > 0) {
            this.transactionLevel--;
            if (this.transactionLevel === 0) {
                this.db.exec("COMMIT");
                this.inTransaction = false;
            }
        }
    }
    async rollback() {
        if (this.transactionLevel > 0) {
            this.db.exec("ROLLBACK");
            this.transactionLevel = 0;
            this.inTransaction = false;
        }
    }
    /**
     * Get the last inserted row ID.
     *
     * @returns The ID of the last inserted row.
     */
    async getLastInsertId() {
        const result = this.db.prepare("SELECT last_insert_rowid() as id").get();
        return result?.id || "";
    }
    /**
     * Escape an identifier (e.g. table or column name) for SQLite.
     *
     * @param value - The identifier to escape.
     * @returns The escaped identifier.
     * @example
     * ```ts
     * driver.escape("users") // => "`users`"
     * ```
     */
    escape(value) {
        if (value === null || value === undefined) {
            return "NULL";
        }
        if (typeof value === "string") {
            return `'${value.replace(/'/g, "''")}'`;
        }
        if (typeof value === "boolean") {
            return value ? "1" : "0";
        }
        if (value instanceof Date) {
            return `'${value.toISOString()}'`;
        }
        return String(value);
    }
    /**
     * Returns the SQLite grammar instance.
     */
    getGrammar() {
        return this.grammar;
    }
    /**
     * Checks whether a given feature is supported by the SQLite driver.
     *
     * @param feature - The name of the feature to check.
     * @returns Whether the feature is supported.
     */
    supportsFeature(feature) {
        switch (feature) {
            case "returning":
                return false;
            case "batch":
                return true;
            case "prepared-statements":
                return true;
            default:
                return false;
        }
    }
}
exports.SQLiteDriver = SQLiteDriver;
class SQLitePreparedStatement {
    constructor(db, sql) {
        this.stmt = db.prepare(sql);
    }
    async execute(bindings) {
        const result = this.stmt.run(bindings || []);
        return {
            rows: [],
            rowCount: result.changes,
            affectedRows: result.changes,
        };
    }
    async close() {
        // better-sqlite3 doesn't require explicit statement cleanup
    }
}
//# sourceMappingURL=SQLiteDriver.js.map