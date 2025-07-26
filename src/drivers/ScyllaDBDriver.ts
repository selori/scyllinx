import { Client, types } from "cassandra-driver"
import { DatabaseDriver } from "./DatabaseDriver"
import { ScyllaDBGrammar } from "./grammars/ScyllaDBGrammar"
import type { ConnectionConfig, PreparedStatement, QueryResult } from "@/types/index"

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
export class ScyllaDBDriver extends DatabaseDriver {
  /** ScyllaDB client instance */
  private client: any

  /** Query grammar for CQL compilation */
  private grammar: ScyllaDBGrammar

  /** Cache for prepared statements */
  private preparedStatements: Map<string, any> = new Map()

  /**
   * Creates a new ScyllaDBDriver instance.
   *
   * @param config - Database configuration object
   */
  constructor(config: ConnectionConfig) {
    super(config)
    this.grammar = new ScyllaDBGrammar()
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
  async connect(): Promise<void> {
    const clientOptions = {
      contactPoints: [this.config.host || "localhost"],
      localDataCenter: this.config.localDataCenter || "datacenter1",
      keyspace: this.config.keyspace,
      credentials:
        this.config.username && this.config.password
          ? {
              username: this.config.username,
              password: this.config.password,
            }
          : undefined,
      ...this.config,
    }

    this.client = new Client(clientOptions)
    await this.client.connect()
    this.connection = this.client
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
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.shutdown()
      this.connection = null
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
  async query(cql: string, params?: any[]): Promise<QueryResult> {
    try {
      const result = await this.client.execute(cql, params || [], { prepare: true })

      return {
        rows: result.rows?.map((row: any) => this.mapRow(row)),
        rowCount: result.rowLength || 0,
        // fields: result.columns?.map((col) => ({
        //   name: col.name,
        //   type: col.type.code.toString(),
        //   nullable: true,
        // })),
      }
    } catch (error: any) {
      throw new Error(`ScyllaDB query failed: ${error.message}`)
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
  async prepare(cql: string): Promise<PreparedStatement> {
    if (this.preparedStatements.has(cql)) {
      const prepared = this.preparedStatements.get(cql)
      return new ScyllaDBPreparedStatement(this.client, prepared)
    }

    const prepared = await this.client.execute(cql, { prepare: true })
    this.preparedStatements.set(cql, prepared)

    return new ScyllaDBPreparedStatement(this.client, prepared)
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
  async batch(queries: Array<{ query: string; params?: any[] }>): Promise<QueryResult> {
    const batch = queries.map((q) => ({ query: q.query, params: q.params || [] }))

    const result = await this.client.batch(batch, {
      prepare: true,
      consistency: types.consistencies.localQuorum,
    })

    return {
      rows: [],
      rowCount: 0,
    }
  }

  /**
   * Begins a database transaction.
   * Note: ScyllaDB uses lightweight transactions (LWT) instead of traditional ACID transactions.
   *
   * @returns Promise that resolves when transaction begins
   */
  async beginTransaction(): Promise<void> {
    // ScyllaDB uses lightweight transactions (LWT) instead
    this.inTransaction = true
  }

  /**
   * Commits the current transaction.
   *
   * @returns Promise that resolves when transaction is committed
   */
  async commit(): Promise<void> {
    this.inTransaction = false
  }

  /**
   * Rolls back the current transaction.
   *
   * @returns Promise that resolves when transaction is rolled back
   */
  async rollback(): Promise<void> {
    this.inTransaction = false
  }

  /**
   * Gets the ID of the last inserted record.
   * Note: ScyllaDB doesn't have auto-increment, so this typically returns empty.
   *
   * @returns Promise resolving to empty string (ScyllaDB doesn't support auto-increment)
   */
  async getLastInsertId(): Promise<string | number> {
    // ScyllaDB doesn't have auto-increment, return empty
    return ""
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
  escape(value: any): string {
    if (value === null || value === undefined) {
      return "NULL"
    }
    if (typeof value === "string") {
      return `'${value.replace(/'/g, "''")}'`
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false"
    }
    return String(value)
  }

  /**
   * Gets the query grammar instance for this driver.
   *
   * @returns The ScyllaDBGrammar instance
   */
  getGrammar(): ScyllaDBGrammar {
    return this.grammar
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
  supportsFeature(feature: string): boolean {
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
    ]
    return supportedFeatures.includes(feature)
  }

  /**
   * Maps a ScyllaDB row to a plain JavaScript object.
   * Handles ScyllaDB-specific data types and converts them to JavaScript equivalents.
   *
   * @private
   * @param row - The raw row from ScyllaDB
   * @returns Mapped plain object
   */
  private mapRow(row: any): any {
    const result: any = {}
    for (const [key, value] of Object.entries(row)) {
      result[key] = this.mapValue(value)
    }
    return result
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
  private mapValue(value: any): any {
    if (value === null || value === undefined) {
      return null
    }

    // Handle ScyllaDB-specific types
    if (value instanceof types.Uuid) {
      return value.toString()
    }
    if (value instanceof types.TimeUuid) {
      return value.toString()
    }
    if (value instanceof types.BigDecimal) {
      return value.toNumber()
    }
    if (value instanceof types.Long) {
      return value.toNumber()
    }
    if (value instanceof Date) {
      return value.toISOString()
    }

    return value
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
class ScyllaDBPreparedStatement implements PreparedStatement {
  /**
   * Creates a new ScyllaDBPreparedStatement instance.
   *
   * @param client - The ScyllaDB client instance
   * @param prepared - The native prepared statement
   */
  constructor(
    private client: Client,
    private prepared: any,
  ) {}

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
  async execute(bindings?: any[]): Promise<QueryResult> {
    const result = await this.client.execute(this.prepared, bindings || [], {
      consistency: types.consistencies.localQuorum,
    })

    return {
      rows: result.rows || [],
      rowCount: result.rowLength || 0,
    }
  }

  /**
   * Closes the prepared statement.
   * Note: ScyllaDB prepared statements are cached, so this is a no-op.
   *
   * @returns Promise that resolves immediately
   */
  async close(): Promise<void> {
    // Prepared statements are cached, no need to close
  }
}
