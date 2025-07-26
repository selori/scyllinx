import { Pool, QueryResult as PgQueryResult } from "pg"
import { DatabaseDriver } from "./DatabaseDriver"
import { PostgreSQLGrammar } from "./grammars/PostgreSQLGrammar"
import { ConnectionConfig, PreparedStatement, QueryResult } from "@/types/index"

/**
 * PostgreSQL database driver implementation using `pg`.
 * Provides PostgreSQL-specific functionality including connection pooling,
 * query execution, prepared statements via named queries, and SQL grammar support.
 *
 * @extends DatabaseDriver
 *
 * @example
 *
 * const config = {
 *   driver: 'pgsql',
 *   host: 'localhost',
 *   port: 5432,
 *   database: 'mydb',
 *   username: 'user',
 *   password: 'secret'
 * };
 *
 * const driver = new PostgreSQLDriver(config);
 * await driver.connect();
 * const result = await driver.query('SELECT * FROM users');
 * console.log(result.rows);
 */
export class PostgreSQLDriver extends DatabaseDriver {
  /** PostgreSQL connection pool instance */
  private pool!: Pool

  /** Query grammar for SQL compilation */
  private grammar: PostgreSQLGrammar

  /**
   * Creates a new PostgreSQLDriver instance.
   *
   * @param config - Database configuration object
   */
  constructor(config: ConnectionConfig) {
    super(config)
    this.grammar = new PostgreSQLGrammar()
  }

  /**
   * Establishes connection to PostgreSQL using a connection pool.
   *
   * @returns Promise that resolves when connection is established
   * @throws {Error} When connection fails
   *
   * @example
   * await driver.connect();
   * console.log('Connected to PostgreSQL');
   */
  async connect(): Promise<void> {
    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port ?? 5432,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database,
      ...this.config,
    })

    this.connection = await this.pool.connect()
  }

  /**
   * Closes the PostgreSQL connection pool.
   *
   * @returns Promise that resolves when connection is closed
   *
   * @example
   * await driver.disconnect();
   * console.log('Disconnected from PostgreSQL');
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.connection = null
    }
  }

  /**
   * Executes a SQL query against PostgreSQL.
   *
   * @param sql - The SQL query to execute
   * @param bindings - Optional parameter bindings for the query
   * @returns Promise resolving to query results
   * @throws {Error} When query execution fails
   *
   * @example
   * const result = await driver.query(
   *   'SELECT * FROM users WHERE status = $1',
   *   ['active']
   * );
   * console.log(`Found ${result.rowCount} users`);
   */
  async query(sql: string, bindings: any[] = []): Promise<QueryResult> {
    try {
      const result: PgQueryResult = await this.pool.query(sql, bindings)
      return {
        rows: result.rows,
        rowCount: result.rowCount ? result.rowCount : 0,
      }
    } catch (error: any) {
      throw new Error(`PostgreSQL query failed: ${error.message}`)
    }
  }

  /**
   * Prepares a SQL statement for repeated execution.
   * Uses named prepared statements under the hood.
   *
   * @param sql - The SQL statement to prepare
   * @returns Promise resolving to prepared statement
   * @throws {Error} When statement preparation fails
   *
   * @example
   * const prepared = await driver.prepare('INSERT INTO users (id, name) VALUES ($1, $2)');
   * await prepared.execute(['123', 'John']);
   */
  async prepare(sql: string): Promise<PreparedStatement> {
    const name = `stmt_${Math.random().toString(36).substring(2, 15)}`
    return new PgPreparedStatement(this.pool, sql, name)
  }

  /**
   * Begins a database transaction.
   *
   * @returns Promise that resolves when transaction begins
   *
   * @example
   * await driver.beginTransaction();
   */
  async beginTransaction(): Promise<void> {
    await this.query("BEGIN")
    this.inTransaction = true
  }

  /**
   * Commits the current transaction.
   *
   * @returns Promise that resolves when transaction is committed
   *
   * @example
   * await driver.commit();
   */
  async commit(): Promise<void> {
    await this.query("COMMIT")
    this.inTransaction = false
  }

  /**
   * Rolls back the current transaction.
   *
   * @returns Promise that resolves when transaction is rolled back
   *
   * @example
   * await driver.rollback();
   */
  async rollback(): Promise<void> {
    await this.query("ROLLBACK")
    this.inTransaction = false
  }

  /**
   * Gets the ID of the last inserted record.
   * Relies on PostgreSQL's `LASTVAL()` function.
   *
   * @returns Promise resolving to the last insert ID
   * @throws {Error} When ID cannot be retrieved
   *
   * @example
   * const id = await driver.getLastInsertId();
   */
  async getLastInsertId(): Promise<string | number> {
    const result = await this.query("SELECT LASTVAL() as id")
    return result.rows?.[0]?.id ?? ""
  }

  /**
   * Escapes a value for safe inclusion in SQL queries.
   *
   * @param value - The value to escape
   * @returns Escaped string representation of the value
   *
   * @example
   * const escaped = driver.escape("O'Reilly");
   * // Returns: "'O''Reilly'"
   */
  escape(value: any): string {
    if (value === null || value === undefined) return "NULL"
    if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
    return String(value)
  }

  /**
   * Gets the query grammar instance for this driver.
   *
   * @returns The PostgreSQLGrammar instance
   */
  getGrammar(): PostgreSQLGrammar {
    return this.grammar
  }

  /**
   * Checks if the driver supports a specific feature.
   *
   * @param feature - The feature name to check
   * @returns True if feature is supported, false otherwise
   *
   * @example
   * if (driver.supportsFeature('returning')) {
   *   console.log('RETURNING is supported');
   * }
   */
  supportsFeature(feature: string): boolean {
    const supported = [
      "prepared_statements",
      "batch_operations",
      "json",
      "transactions",
      "serial_primary_key",
      "returning",
    ]
    return supported.includes(feature)
  }
}

/**
 * PostgreSQL-specific prepared statement implementation using named statements.
 *
 * @implements PreparedStatement
 *
 * @example
 * const prepared = await driver.prepare('SELECT * FROM users WHERE id = $1');
 * const result = await prepared.execute(['123']);
 */
class PgPreparedStatement implements PreparedStatement {
  /**
   * Creates a new PgPreparedStatement instance.
   *
   * @param pool - PostgreSQL connection pool
   * @param sql - SQL string
   * @param name - Unique statement name
   */
  constructor(
    private pool: Pool,
    private sql: string,
    private name: string,
  ) {}

  /**
   * Executes the prepared statement with given parameters.
   *
   * @param bindings - Optional parameter bindings
   * @returns Promise resolving to query results
   * @throws {Error} When execution fails
   */
  async execute(bindings?: any[]): Promise<QueryResult> {
    const result = await this.pool.query({
      name: this.name,
      text: this.sql,
      values: bindings || [],
    })

    return {
      rows: result.rows,
      rowCount: result.rowCount ? result.rowCount : 0,
    }
  }

  /**
   * Closes the prepared statement.
   * Note: pg handles caching internally, so this is a no-op.
   *
   * @returns Promise that resolves immediately
   */
  async close(): Promise<void> {
    // No-op
  }
}
