import { DatabaseDriver } from "./DatabaseDriver";
import { MongoDBGrammar } from "./grammars/MongoDBGrammar";
import { ConnectionConfig, PreparedStatement, QueryResult } from "@/types";
/**
 * MongoDB driver implementation.
 * Handles connection, queries, and MongoDB-specific operations.
 *
 * @extends DatabaseDriver
 */
export declare class MongoDBDriver extends DatabaseDriver {
    private mongoModule;
    private client;
    private db;
    private grammar;
    /**
     * Creates a new MongoDBDriver.
     *
     * @param config - Connection configuration options.
     */
    constructor(config: ConnectionConfig);
    /**
     * Establishes a connection to MongoDB.
     * Builds the URI, configures the client, and selects the database.
     *
     * @returns Promise<void>
     */
    connect(): Promise<void>;
    /**
     * Closes the MongoDB connection and clears the reference.
     *
     * @returns Promise<void>
     */
    disconnect(): Promise<void>;
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
    query(operation: string, operationPayload?: any, raw?: boolean): Promise<QueryResult>;
    /**
     * Prepares a MongoDB operation for later execution.
     * MongoDB does not support parameterized statements natively,
     * so this wraps the operation directive in a PreparedStatement.
     *
     * @param operation - The operation directive string.
     * @returns Promise<PreparedStatement>
     */
    prepare(operation: string): Promise<PreparedStatement>;
    /**
     * Begins a transaction context.
     * MongoDB transactions require a replica set or sharded cluster.
     *
     * @returns Promise<void>
     */
    beginTransaction(): Promise<void>;
    /**
     * Commits the current transaction context.
     *
     * @returns Promise<void>
     */
    commit(): Promise<void>;
    /**
     * Rolls back the current transaction context.
     *
     * @returns Promise<void>
     */
    rollback(): Promise<void>;
    /**
     * Retrieves the last inserted document ID.
     * For MongoDB, this is included in the result of insert operations.
     *
     * @returns Promise<string | number>
     */
    getLastInsertId(): Promise<string | number>;
    /**
     * Escapes a value for inclusion in logging or introspection.
     * MongoDB uses JSON, so this serializes the value.
     *
     * @param value - Any JavaScript value.
     * @returns A JSON-stringified representation.
     */
    escape(value: any): string;
    /**
     * Returns the grammar instance for query compilation.
     *
     * @returns MongoDBGrammar
     */
    getGrammar(): MongoDBGrammar;
    /**
     * Determines if the driver supports a given feature.
     *
     * @param feature - The feature name to check.
     * @returns boolean
     */
    supportsFeature(feature: string): boolean;
    /**
     * Builds the MongoDB connection URI.
     *
     * @returns The MongoDB connection string.
     */
    private buildConnectionUri;
    /**
     * Returns the MongoDB collection instance by name.
     *
     * @param name - Collection name.
     * @returns Collection
     */
    getCollection(name: string): InstanceType<typeof this.mongoModule.Collection>;
    /**
     * Creates an index on a collection.
     *
     * @param collection - Collection name.
     * @param keys - Index specification object.
     * @param options - Optional index options.
     * @returns Promise<void>
     */
    createIndex(collection: string, keys: any, options?: any): Promise<void>;
    /**
     * Drops an index from a collection.
     *
     * @param collection - Collection name.
     * @param indexName - Name of the index to drop.
     * @returns Promise<void>
     */
    dropIndex(collection: string, indexName: string): Promise<void>;
}
//# sourceMappingURL=MongoDBDriver.d.ts.map