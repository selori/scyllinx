import { MongoClient, type Db, type Collection } from "mongodb"
import { DatabaseDriver } from "./DatabaseDriver"
import { MongoDBGrammar } from "./grammars/MongoDBGrammar"
import { ConnectionConfig, PreparedStatement, QueryResult } from "@/types"

/**
 * MongoDB driver implementation.
 * Handles connection, queries, and MongoDB-specific operations.
 *
 * @extends DatabaseDriver
 */
export class MongoDBDriver extends DatabaseDriver {
  private client!: MongoClient
  private db!: Db
  private grammar: MongoDBGrammar

  /**
   * Creates a new MongoDBDriver.
   *
   * @param config - Connection configuration options.
   */
  constructor(config: ConnectionConfig) {
    super(config)
    this.grammar = new MongoDBGrammar()
  }

  /**
   * Establishes a connection to MongoDB.
   * Builds the URI, configures the client, and selects the database.
   *
   * @returns Promise<void>
   */
  async connect(): Promise<void> {
    const uri = this.buildConnectionUri()
    this.client = new MongoClient(uri, {
      maxPoolSize: this.config.maxPoolSize || 10,
      serverSelectionTimeoutMS: this.config.serverSelectionTimeoutMS || 5000,
      socketTimeoutMS: this.config.socketTimeoutMS || 45000,
      // ...this.config,
    })
    await this.client.connect()
    this.db = this.client.db(this.config.database)
    this.connection = this.db
  }

  /**
   * Closes the MongoDB connection and clears the reference.
   *
   * @returns Promise<void>
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.connection = null
    }
  }

  /**
   * Parses a directive string in the format "collection:method:payload",
   * optionally bypassing JSON parsing when `raw` is true.
   *
   * @param operation - The directive string, typically in "collection:method:payload" format.
   * @param operationPayload - Optional pre-parsed payload used only when `raw` is true.
   * @param raw - Optional flag to bypass JSON parsing and use `operationPayload` directly.
   * @returns Promise resolving to query results with mapped rows
   * @throws {Error} When query execution fails
   * @throws {Error} If the payload is not valid JSON and `raw` is false.
   *
   * @example
   * // Normal directive with JSON payload:
   * driver.query("users:find:{\"active\":true}")
   *
   * // Raw directive with pre-parsed payload:
   * driver.query("users:insertOne", { name: "Ali" }, true)
   */
  async query(operation: string, operationPayload?: any, raw?: boolean): Promise<QueryResult> {
    try {
      const firstColon = operation.indexOf(":");
      const secondColon = operation.indexOf(":", firstColon + 1);

      const collectionName = operation.substring(0, firstColon);
      const method = operation.substring(firstColon + 1, secondColon);
      const rawPayload = operation.substring(secondColon + 1);

      const collection = this.db.collection(collectionName);
      let payload: any;
      if (raw === true) {
        payload = operationPayload;
      } else {
        try {
          payload = rawPayload ? JSON.parse(rawPayload) : {};
        } catch (err) {
          throw new Error(`Invalid JSON payload in directive: ${rawPayload}`);
        }
      }
      let result: any
      console.log("operation", operation);
      // console.log("collection", collectionName);
      // console.log("method", method);
      // console.log("rawPayload", rawPayload);
      // console.log("parsed payload", payload);
      console.log("📁 Collection:", collectionName);
      console.log("⚙️ Method:", method);
      console.log("📦 Payload:", JSON.stringify(payload, null, 2));

      switch (method) {
        case "find":
          result = await collection.find(payload.filter || {}, payload.options || {}).toArray()
          return { rows: result, rowCount: result.length }

        case "findOne":
          result = await collection.findOne(payload.filter || {}, payload.options || {})
          return { rows: result ? [result] : [], rowCount: result ? 1 : 0 }

        case "insertOne":
          result = await collection.insertOne(payload)
          return { rows: [], rowCount: 1, insertId: result.insertedId, affectedRows: 1 }

        case "insertMany":
          result = await collection.insertMany(payload)
          return { rows: [], rowCount: result.insertedCount, affectedRows: result.insertedCount }

        case "updateOne":
          result = await collection.updateOne(payload.filter, payload.update, payload.options || {})
          return { rows: [], rowCount: result.modifiedCount, affectedRows: result.modifiedCount }

        case "updateMany":
          result = await collection.updateMany(payload.filter, payload.update, payload.options || {})
          return { rows: [], rowCount: result.modifiedCount, affectedRows: result.modifiedCount }

        case "deleteOne":
          result = await collection.deleteOne(payload.filter)
          return { rows: [], rowCount: result.deletedCount, affectedRows: result.deletedCount }

        case "deleteMany":
          result = await collection.deleteMany(payload.filter)
          return { rows: [], rowCount: result.deletedCount, affectedRows: result.deletedCount }

        case "countDocuments":
          result = await collection.countDocuments(payload.filter || {})
          return { rows: [{ count: result }], rowCount: 1 }

        case "aggregate":
          result = await collection.aggregate(payload.pipeline, payload.options || {}).toArray()
          return { rows: result, rowCount: result.length }

        case "createCollection":
          result = await this.db.createCollection(collectionName, payload)
          return { rows: [], rowCount: 1 }

        case "collMod":
          result = await this.db.command({collMod: collectionName, ...payload})
          return { rows: [], rowCount: 1 }

        default:
          throw new Error(`Unsupported MongoDB operation: ${method}`)
      }
    } catch (error: any) {
      throw new Error(`MongoDB query failed: ${error.message}`)
    }
  }

  /**
   * Prepares a MongoDB operation for later execution.
   * MongoDB does not support parameterized statements natively,
   * so this wraps the operation directive in a PreparedStatement.
   *
   * @param operation - The operation directive string.
   * @returns Promise<PreparedStatement>
   */
  async prepare(operation: string): Promise<PreparedStatement> {
    return new MongoDBPreparedStatement(this, operation)
  }

  /**
   * Begins a transaction context.
   * MongoDB transactions require a replica set or sharded cluster.
   *
   * @returns Promise<void>
   */
  async beginTransaction(): Promise<void> {
    this.inTransaction = true
  }

  /**
   * Commits the current transaction context.
   *
   * @returns Promise<void>
   */
  async commit(): Promise<void> {
    this.inTransaction = false
  }

  /**
   * Rolls back the current transaction context.
   *
   * @returns Promise<void>
   */
  async rollback(): Promise<void> {
    this.inTransaction = false
  }

  /**
   * Retrieves the last inserted document ID.
   * For MongoDB, this is included in the result of insert operations.
   *
   * @returns Promise<string | number>
   */
  async getLastInsertId(): Promise<string | number> {
    return ""
  }

  /**
   * Escapes a value for inclusion in logging or introspection.
   * MongoDB uses JSON, so this serializes the value.
   *
   * @param value - Any JavaScript value.
   * @returns A JSON-stringified representation.
   */
  escape(value: any): string {
    return JSON.stringify(value)
  }

  /**
   * Returns the grammar instance for query compilation.
   *
   * @returns MongoDBGrammar
   */
  getGrammar(): MongoDBGrammar {
    return this.grammar
  }

  /**
   * Determines if the driver supports a given feature.
   *
   * @param feature - The feature name to check.
   * @returns boolean
   */
  supportsFeature(feature: string): boolean {
    const supported = [
      "transactions",
      "indexes",
      "aggregation",
      "full_text_search",
      "geospatial",
      "json",
      "arrays",
      "embedded_documents",
    ]
    return supported.includes(feature)
  }

  /**
   * Builds the MongoDB connection URI.
   *
   * @returns The MongoDB connection string.
   */
  private buildConnectionUri(): string {
    const { host = "localhost", port = 27017, username, password, database } = this.config

    let uri = "mongodb://"

    if (username && password) {
      uri += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
    }

    uri += `${host}:${port}`

    if (database) {
      uri += `/${database}`
    }

    return uri
  }

  /**
   * Returns the MongoDB collection instance by name.
   *
   * @param name - Collection name.
   * @returns Collection
   */
  public getCollection(name: string): Collection {
    return this.db.collection(name)
  }

  /**
   * Creates an index on a collection.
   *
   * @param collection - Collection name.
   * @param keys - Index specification object.
   * @param options - Optional index options.
   * @returns Promise<void>
   */
  public async createIndex(collection: string, keys: any, options?: any): Promise<void> {
    await this.db.collection(collection).createIndex(keys, options)
  }

  /**
   * Drops an index from a collection.
   *
   * @param collection - Collection name.
   * @param indexName - Name of the index to drop.
   * @returns Promise<void>
   */
  public async dropIndex(collection: string, indexName: string): Promise<void> {
    await this.db.collection(collection).dropIndex(indexName)
  }
}

/**
 * MongoDBPreparedStatement wraps a MongoDBDriver operation for deferred execution.
 */
class MongoDBPreparedStatement implements PreparedStatement {
  /**
   * @param driver - The MongoDBDriver instance.
   * @param operation - The operation directive string.
   */
  constructor(
    private driver: MongoDBDriver,
    private operation: string,
  ) {}

  /**
   * Executes the prepared operation with given parameters.
   *
   * @param params - Parameters for the operation payload.
   * @returns Promise<QueryResult>
   */
  async execute(params?: any): Promise<QueryResult> {
    return this.driver.query(this.operation, params)
  }

  /**
   * Closes the prepared statement.
   * MongoDB does not require explicit cleanup.
   *
   * @returns Promise<void>
   */
  async close(): Promise<void> {
    // No cleanup necessary
  }
}
