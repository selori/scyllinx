import { TableDefinition } from "@/types";
import { QueryGrammar } from "./QueryGrammar";
/**
 * MongoDB query grammar (converts SQL-like operations to MongoDB operations)
 * Outputs string directives like "collection:operation:payload" to be interpreted by the driver.
 *
 * @extends QueryGrammar
 */
export declare class MongoDBGrammar extends QueryGrammar {
    /**
     * Converts a SQL-like SELECT into a MongoDB find directive.
     *
     * @param query - Query components including from, wheres, orders, etc.
     * @returns {string} - Directive string "collection:find:{filter,options}".
     */
    compileSelect(query: any): string;
    /**
     * Converts INSERT into insertOne or insertMany directive.
     *
     * @param query - Query components including table and values.
     * @returns {string} - Directive string for insert operation.
     */
    compileInsert(query: any): string;
    /**
     * Converts UPDATE into updateMany directive with $set.
     *
     * @param query - Query components including table, wheres, and values.
     * @returns {string} - Directive string for update operation.
     */
    compileUpdate(query: any): string;
    /**
     * Converts DELETE into deleteMany directive.
     *
     * @param query - Query components including table and wheres.
     * @returns {string} - Directive string for delete operation.
     */
    compileDelete(query: any): string;
    /**
     * Builds MongoDB filter object from SQL-like where clauses.
     *
     * @param wheres - Array of where clause objects.
     * @returns {string} - MongoDB filter object.
     */
    private compileWheres;
    /**
     * Adds basic comparison operators to MongoDB filter.
     *
     * @param filter - The filter object to mutate.
     * @param w - Where clause object.
     */
    private addBasicWhere;
    /**
     * Builds MongoDB cursor options (projection, sort, skip, limit).
     *
     * @param query - Query components including columns, orders, limit, offset.
     * @returns {string} - MongoDB find options object.
     */
    private compileOptions;
    /**
     * Wraps a collection name.
     * MongoDB collections require no special wrapping.
     *
     * @param table - Collection name.
     * @returns {string} - The unmodified collection name.
     */
    wrapTable(table: string): string;
    /**
     * Wraps a field/column name.
     * MongoDB fields require no special wrapping.
     *
     * @param column - Field name.
     * @returns {string} - The unmodified field name.
     */
    wrapColumn(column: string): string;
    /**
     * Formats a parameter for directive payload.
     * JSON-stringifies the value.
     *
     * @param value - Any JavaScript value.
     * @returns {string} - JSON string of the value.
     */
    parameter(value: any): string;
    /**
     * Compiles a create-collection operation for MongoDB.
     * Note: MongoDB creates collections implicitly on insert,
     * but explicit creation can include options like validator.
     *
     * @param definition - TableDefinition with collection name and options.
     * @returns {string} - Directive string for creating a collection.
     */
    compileCreateTable(definition: TableDefinition): string;
    /**
     * Compiles an alter-collection operation for MongoDB.
     * Supports limited alterations like updating validation rules.
     *
     * @param definition - TableDefinition with new validation rules.
     * @returns {string} - Directive string for modifying collection.
     */
    compileAlterTable(definition: TableDefinition): string;
    /**
     * Compiles a check for collection existence.
     *
     * @param table - Collection name to check.
     * @returns {string} - Directive string for listing collections.
     */
    compileTableExists(table: string): string;
    /**
     * Compiles a check for field existence in a collection.
     * Note: MongoDB requires sampling or schema overview.
     *
     * @param table - Collection name.
     * @param column - Field name to check.
     * @returns {string} - Directive string for field existence check.
     */
    compileColumnExists(table: string, column: string): string;
    /**
     * Compiles a rename-collection operation.
     *
     * @param from - Current collection name.
     * @param to - New collection name.
     * @throws Error directive, driver should handle renameCollection.
     */
    rename(from: string, to: string): Promise<void>;
}
//# sourceMappingURL=MongoDBGrammar.d.ts.map