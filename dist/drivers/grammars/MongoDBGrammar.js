"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBGrammar = void 0;
const QueryGrammar_1 = require("./QueryGrammar");
/**
 * MongoDB query grammar (converts SQL-like operations to MongoDB operations)
 * Outputs string directives like "collection:operation:payload" to be interpreted by the driver.
 *
 * @extends QueryGrammar
 */
class MongoDBGrammar extends QueryGrammar_1.QueryGrammar {
    /**
     * Converts a SQL-like SELECT into a MongoDB find directive.
     *
     * @param query - Query components including from, wheres, orders, etc.
     * @returns {string} - Directive string "collection:find:{filter,options}".
     */
    compileSelect(query) {
        const coll = query.from;
        const filter = this.compileWheres(query.wheres);
        const options = this.compileOptions(query);
        return `${coll}:find:${JSON.stringify({ filter, options })}`;
    }
    /**
     * Converts INSERT into insertOne or insertMany directive.
     *
     * @param query - Query components including table and values.
     * @returns {string} - Directive string for insert operation.
     */
    compileInsert(query) {
        const coll = query.table;
        const doc = query.values;
        if (Array.isArray(doc)) {
            return `${coll}:insertMany:${JSON.stringify(doc)}`;
        }
        return `${coll}:insertOne:${JSON.stringify(doc)}`;
    }
    /**
     * Converts UPDATE into updateMany directive with $set.
     *
     * @param query - Query components including table, wheres, and values.
     * @returns {string} - Directive string for update operation.
     */
    compileUpdate(query) {
        const coll = query.table;
        const filter = this.compileWheres(query.wheres);
        const update = { $set: query.values };
        return `${coll}:updateMany:${JSON.stringify({ filter, update })}`;
    }
    /**
     * Converts DELETE into deleteMany directive.
     *
     * @param query - Query components including table and wheres.
     * @returns {string} - Directive string for delete operation.
     */
    compileDelete(query) {
        const coll = query.table;
        const filter = this.compileWheres(query.wheres);
        return `${coll}:deleteMany:${JSON.stringify({ filter })}`;
    }
    /**
     * Builds MongoDB filter object from SQL-like where clauses.
     *
     * @param wheres - Array of where clause objects.
     * @returns {string} - MongoDB filter object.
     */
    compileWheres(wheres) {
        if (!wheres || !wheres.length)
            return {};
        const filter = {};
        for (const w of wheres) {
            switch (w.type) {
                case 'basic':
                    this.addBasicWhere(filter, w);
                    break;
                case 'in':
                    filter[w.column] = { $in: w.values };
                    break;
                case 'notIn':
                    filter[w.column] = { $nin: w.values };
                    break;
                case 'between':
                    filter[w.column] = { $gte: w.values[0], $lte: w.values[1] };
                    break;
                case 'null':
                    filter[w.column] = null;
                    break;
                case 'notNull':
                    filter[w.column] = { $ne: null };
                    break;
                default:
                    break;
            }
        }
        return filter;
    }
    /**
     * Adds basic comparison operators to MongoDB filter.
     *
     * @param filter - The filter object to mutate.
     * @param w - Where clause object.
     */
    addBasicWhere(filter, w) {
        const op = w.operator.toLowerCase();
        switch (op) {
            case '=':
                filter[w.column] = w.value;
                break;
            case '!=':
            case '<>':
                filter[w.column] = { $ne: w.value };
                break;
            case '>':
                filter[w.column] = { $gt: w.value };
                break;
            case '>=':
                filter[w.column] = { $gte: w.value };
                break;
            case '<':
                filter[w.column] = { $lt: w.value };
                break;
            case '<=':
                filter[w.column] = { $lte: w.value };
                break;
            case 'like':
                filter[w.column] = { $regex: w.value.replace(/%/g, '.*'), $options: 'i' };
                break;
            default:
                break;
        }
    }
    /**
     * Builds MongoDB cursor options (projection, sort, skip, limit).
     *
     * @param query - Query components including columns, orders, limit, offset.
     * @returns {string} - MongoDB find options object.
     */
    compileOptions(query) {
        const opts = {};
        if (query.columns && !query.columns.includes('*')) {
            opts.projection = {};
            for (const c of query.columns) {
                opts.projection[c] = 1;
            }
        }
        if (query.orders) {
            opts.sort = {};
            for (const o of query.orders) {
                opts.sort[o.column] = o.direction === 'desc' ? -1 : 1;
            }
        }
        if (query.limit)
            opts.limit = query.limit;
        if (query.offset)
            opts.skip = query.offset;
        return opts;
    }
    /**
     * Wraps a collection name.
     * MongoDB collections require no special wrapping.
     *
     * @param table - Collection name.
     * @returns {string} - The unmodified collection name.
     */
    wrapTable(table) {
        return table;
    }
    /**
     * Wraps a field/column name.
     * MongoDB fields require no special wrapping.
     *
     * @param column - Field name.
     * @returns {string} - The unmodified field name.
     */
    wrapColumn(column) {
        return column;
    }
    /**
     * Formats a parameter for directive payload.
     * JSON-stringifies the value.
     *
     * @param value - Any JavaScript value.
     * @returns {string} - JSON string of the value.
     */
    parameter(value) {
        return JSON.stringify(value);
    }
    /**
     * Compiles a create-collection operation for MongoDB.
     * Note: MongoDB creates collections implicitly on insert,
     * but explicit creation can include options like validator.
     *
     * @param definition - TableDefinition with collection name and options.
     * @returns {string} - Directive string for creating a collection.
     */
    compileCreateTable(definition) {
        const coll = definition.name;
        return `${coll}:createCollection:${JSON.stringify(definition.tableOptions || {})}`;
    }
    /**
     * Compiles an alter-collection operation for MongoDB.
     * Supports limited alterations like updating validation rules.
     *
     * @param definition - TableDefinition with new validation rules.
     * @returns {string} - Directive string for modifying collection.
     */
    compileAlterTable(definition) {
        const coll = definition.name;
        return `${coll}:collMod:${JSON.stringify(definition.tableOptions || {})}`;
    }
    /**
     * Compiles a check for collection existence.
     *
     * @param table - Collection name to check.
     * @returns {string} - Directive string for listing collections.
     */
    compileTableExists(table) {
        return `${table}:listCollections:{}`;
    }
    /**
     * Compiles a check for field existence in a collection.
     * Note: MongoDB requires sampling or schema overview.
     *
     * @param table - Collection name.
     * @param column - Field name to check.
     * @returns {string} - Directive string for field existence check.
     */
    compileColumnExists(table, column) {
        return `${table}:existsField:${JSON.stringify({ field: column })}`;
    }
    /**
     * Compiles a rename-collection operation.
     *
     * @param from - Current collection name.
     * @param to - New collection name.
     * @throws Error directive, driver should handle renameCollection.
     */
    async rename(from, to) {
        throw new Error(`Driver must execute: ${from}:renameCollection:${to}`);
    }
}
exports.MongoDBGrammar = MongoDBGrammar;
//# sourceMappingURL=MongoDBGrammar.js.map