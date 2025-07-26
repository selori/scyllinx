"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBDriver = void 0;
const mongodb_1 = require("mongodb");
const DatabaseDriver_1 = require("./DatabaseDriver");
const MongoDBGrammar_1 = require("./grammars/MongoDBGrammar");
/**
 * MongoDB driver implementation.
 * Handles connection, queries, and MongoDB-specific operations.
 *
 * @extends DatabaseDriver
 */
class MongoDBDriver extends DatabaseDriver_1.DatabaseDriver {
    /**
     * Creates a new MongoDBDriver.
     *
     * @param config - Connection configuration options.
     */
    constructor(config) {
        super(config);
        this.grammar = new MongoDBGrammar_1.MongoDBGrammar();
    }
    /**
     * Establishes a connection to MongoDB.
     * Builds the URI, configures the client, and selects the database.
     *
     * @returns Promise<void>
     */
    async connect() {
        const uri = this.buildConnectionUri();
        this.client = new mongodb_1.MongoClient(uri, {
            maxPoolSize: this.config.maxPoolSize || 10,
            serverSelectionTimeoutMS: this.config.serverSelectionTimeoutMS || 5000,
            socketTimeoutMS: this.config.socketTimeoutMS || 45000,
            ...this.config,
        });
        await this.client.connect();
        this.db = this.client.db(this.config.database);
        this.connection = this.db;
    }
    /**
     * Closes the MongoDB connection and clears the reference.
     *
     * @returns Promise<void>
     */
    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.connection = null;
        }
    }
    /**
     * Executes a MongoDB operation encoded as a string directive.
     * Parses collection, method, and parameters, then dispatches the call.
     *
     * @param operation - Directive in the format "collection:method".
     * @param params - Parameters object or payload for the operation.
     * @returns Promise<QueryResult>
     * @throws Error if the operation is not supported or fails.
     */
    async query(operation, params) {
        try {
            const [collectionName, method] = operation.split(":", 2);
            const payload = params || {};
            const collection = this.db.collection(collectionName);
            let result;
            switch (method) {
                case "find":
                    result = await collection.find(payload.filter || {}, payload.options || {}).toArray();
                    return { rows: result, rowCount: result.length };
                case "findOne":
                    result = await collection.findOne(payload.filter || {}, payload.options || {});
                    return { rows: result ? [result] : [], rowCount: result ? 1 : 0 };
                case "insertOne":
                    result = await collection.insertOne(payload);
                    return { rows: [], rowCount: 1, insertId: result.insertedId, affectedRows: 1 };
                case "insertMany":
                    result = await collection.insertMany(payload);
                    return { rows: [], rowCount: result.insertedCount, affectedRows: result.insertedCount };
                case "updateOne":
                    result = await collection.updateOne(payload.filter, payload.update, payload.options || {});
                    return { rows: [], rowCount: result.modifiedCount, affectedRows: result.modifiedCount };
                case "updateMany":
                    result = await collection.updateMany(payload.filter, payload.update, payload.options || {});
                    return { rows: [], rowCount: result.modifiedCount, affectedRows: result.modifiedCount };
                case "deleteOne":
                    result = await collection.deleteOne(payload.filter);
                    return { rows: [], rowCount: result.deletedCount, affectedRows: result.deletedCount };
                case "deleteMany":
                    result = await collection.deleteMany(payload.filter);
                    return { rows: [], rowCount: result.deletedCount, affectedRows: result.deletedCount };
                case "countDocuments":
                    result = await collection.countDocuments(payload.filter || {});
                    return { rows: [{ count: result }], rowCount: 1 };
                case "aggregate":
                    result = await collection.aggregate(payload.pipeline, payload.options || {}).toArray();
                    return { rows: result, rowCount: result.length };
                default:
                    throw new Error(`Unsupported MongoDB operation: ${method}`);
            }
        }
        catch (error) {
            throw new Error(`MongoDB query failed: ${error.message}`);
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
    async prepare(operation) {
        return new MongoDBPreparedStatement(this, operation);
    }
    /**
     * Begins a transaction context.
     * MongoDB transactions require a replica set or sharded cluster.
     *
     * @returns Promise<void>
     */
    async beginTransaction() {
        this.inTransaction = true;
    }
    /**
     * Commits the current transaction context.
     *
     * @returns Promise<void>
     */
    async commit() {
        this.inTransaction = false;
    }
    /**
     * Rolls back the current transaction context.
     *
     * @returns Promise<void>
     */
    async rollback() {
        this.inTransaction = false;
    }
    /**
     * Retrieves the last inserted document ID.
     * For MongoDB, this is included in the result of insert operations.
     *
     * @returns Promise<string | number>
     */
    async getLastInsertId() {
        return "";
    }
    /**
     * Escapes a value for inclusion in logging or introspection.
     * MongoDB uses JSON, so this serializes the value.
     *
     * @param value - Any JavaScript value.
     * @returns A JSON-stringified representation.
     */
    escape(value) {
        return JSON.stringify(value);
    }
    /**
     * Returns the grammar instance for query compilation.
     *
     * @returns MongoDBGrammar
     */
    getGrammar() {
        return this.grammar;
    }
    /**
     * Determines if the driver supports a given feature.
     *
     * @param feature - The feature name to check.
     * @returns boolean
     */
    supportsFeature(feature) {
        const supported = [
            "transactions",
            "indexes",
            "aggregation",
            "full_text_search",
            "geospatial",
            "json",
            "arrays",
            "embedded_documents",
        ];
        return supported.includes(feature);
    }
    /**
     * Builds the MongoDB connection URI.
     *
     * @returns The MongoDB connection string.
     */
    buildConnectionUri() {
        const { host = "localhost", port = 27017, username, password, database } = this.config;
        let uri = "mongodb://";
        if (username && password) {
            uri += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
        }
        uri += `${host}:${port}`;
        if (database) {
            uri += `/${database}`;
        }
        return uri;
    }
    /**
     * Returns the MongoDB collection instance by name.
     *
     * @param name - Collection name.
     * @returns Collection
     */
    getCollection(name) {
        return this.db.collection(name);
    }
    /**
     * Creates an index on a collection.
     *
     * @param collection - Collection name.
     * @param keys - Index specification object.
     * @param options - Optional index options.
     * @returns Promise<void>
     */
    async createIndex(collection, keys, options) {
        await this.db.collection(collection).createIndex(keys, options);
    }
    /**
     * Drops an index from a collection.
     *
     * @param collection - Collection name.
     * @param indexName - Name of the index to drop.
     * @returns Promise<void>
     */
    async dropIndex(collection, indexName) {
        await this.db.collection(collection).dropIndex(indexName);
    }
}
exports.MongoDBDriver = MongoDBDriver;
/**
 * MongoDBPreparedStatement wraps a MongoDBDriver operation for deferred execution.
 */
class MongoDBPreparedStatement {
    /**
     * @param driver - The MongoDBDriver instance.
     * @param operation - The operation directive string.
     */
    constructor(driver, operation) {
        this.driver = driver;
        this.operation = operation;
    }
    /**
     * Executes the prepared operation with given parameters.
     *
     * @param params - Parameters for the operation payload.
     * @returns Promise<QueryResult>
     */
    async execute(params) {
        return this.driver.query(this.operation, params);
    }
    /**
     * Closes the prepared statement.
     * MongoDB does not require explicit cleanup.
     *
     * @returns Promise<void>
     */
    async close() {
        // No cleanup necessary
    }
}
//# sourceMappingURL=MongoDBDriver.js.map