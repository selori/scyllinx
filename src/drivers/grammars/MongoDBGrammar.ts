import { TableDefinition } from "@/types"
import { QueryGrammar } from "./QueryGrammar"

/**
 * MongoDB query grammar (converts SQL-like operations to MongoDB operations)
 * Outputs string directives like "collection:operation:payload" to be interpreted by the driver.
 *
 * @extends QueryGrammar
 */
export class MongoDBGrammar extends QueryGrammar {
  compileSelect(query: any): string {
    const hasGroups = Array.isArray(query.groups) && query.groups.length > 0;
    const hasHavings = Array.isArray(query.havings) && query.havings.length > 0;

    if (hasGroups || hasHavings) {
      return this.compileAggregateSelect(query);
    } else {
      return this.compileFindSelect(query);
    }
  }

  /**
   * Converts a SQL-like SELECT into a MongoDB find directive.
   *
   * @param query - Query components including from, wheres, orders, etc.
   * @returns {string} - Directive string "collection:find:{filter,options}".
   */
  compileFindSelect(query: any): string {
    const coll = query.from
    const filter = this.compileWheres(query.wheres)
    const options = this.compileOptions(query)
    return `${coll}:find:${JSON.stringify({ filter, options })}`
  }

  /**
   * Compiles a SQL-like aggregate SELECT into MongoDB aggregation pipeline.
   *
   * Supports WHERE, GROUP BY, aggregation functions (count, sum, avg, min, max),
   * projections, order, limit, offset, and HAVING-like post-filters.
   *
   * @param query - Query components including columns, wheres, groupBy, aggregates, etc.
   * @returns {string} - Directive string in the form "collection:aggregate:[pipeline]"
   */
  compileAggregateSelect(query: any): string {
    const coll = query.from
    const pipeline: any[] = []

    // Step 1: WHERE clause → $match
    if (query.wheres?.length) {
      pipeline.push({ $match: this.compileWheres(query.wheres) })
    }

    // Step 2: GROUP BY
    const groupBy = query.groups || []
    const groupId: Record<string, string> = {}
    for (const field of groupBy) {
      groupId[field] = `$${field}`
    }

    const aggregations = this.compileAggregateExpressions(query.columns || [])
    const groupStage = {
      $group: {
        _id: groupBy.length ? groupId : null,
        ...aggregations,
      }
    }

    if (groupBy.length || Object.keys(aggregations).length) {
      pipeline.push(groupStage)
    }

    // Step 3: HAVING → second $match after $group
    if (query.havings?.length) {
      pipeline.push({ $match: this.compileWheres(query.havings) }) // reuse
    }

    // Step 4: PROJECT (rebuild fields from _id + aggregations)
    if (query.columns && query.columns.length && !query.columns.includes('*')) {
      const project: Record<string, any> = {}
      for (const col of query.columns) {
        if (col.includes('(')) continue // skip aggregate
        if (groupBy.includes(col)) {
          project[col] = `$_id.${col}`
        }
      }

      for (const alias of Object.keys(aggregations)) {
        project[alias] = `$${alias}`
      }

      pipeline.push({ $project: project })
    }

    // Step 5: ORDER, LIMIT, OFFSET
    const options = this.compileOptions(query)
    if (options.sort) {
      pipeline.push({ $sort: options.sort })
    }
    if (options.skip) {
      pipeline.push({ $skip: options.skip })
    }
    if (options.limit) {
      pipeline.push({ $limit: options.limit })
    }

    return `${coll}:aggregate:${JSON.stringify(pipeline)}`
  }

  /**
   * Parses SQL-like aggregate expressions and compiles into MongoDB accumulators.
   *
   * @param columns - Array of column expressions like ['count(id)', 'sum(amount)']
   * @returns Object mapping output field names to MongoDB accumulator expressions
   */
  private compileAggregateExpressions(columns: string[]): Record<string, any> {
    const result: Record<string, any> = {}

    for (const col of columns) {
      const match = col.match(/^(\w+)\(([^)]+)\)(?:\s+as\s+(\w+))?$/i)
      if (!match) continue

      const [, fn, fieldRaw, aliasRaw] = match
      const field = fieldRaw.trim() === '*' ? 1 : `$${fieldRaw.trim()}`
      const alias = aliasRaw || `${fn}_${fieldRaw.replace(/\*/g, 'all')}`

      switch (fn.toLowerCase()) {
        case 'count':
          result[alias] = { $sum: 1 }
          break
        case 'sum':
          result[alias] = { $sum: field }
          break
        case 'avg':
          result[alias] = { $avg: field }
          break
        case 'min':
          result[alias] = { $min: field }
          break
        case 'max':
          result[alias] = { $max: field }
          break
        default:
          break
      }
    }

    return result
  }

  /**
   * Converts INSERT into insertOne or insertMany directive.
   *
   * @param query - Query components including table and values.
   * @returns {string} - Directive string for insert operation.
   */
  compileInsert(query: any): string {
    const coll = query.table
    const doc = query.values
    if (Array.isArray(doc)) {
      return `${coll}:insertMany:${JSON.stringify(doc)}`
    }
    return `${coll}:insertOne:${JSON.stringify(doc)}`
  }

  /**
   * Converts UPDATE into updateMany directive with $set.
   *
   * @param query - Query components including table, wheres, and values.
   * @returns {string} - Directive string for update operation.
   */
  compileUpdate(query: any): string {
    const coll = query.table
    const filter = this.compileWheres(query.wheres)
    const update = { $set: query.values }
    return `${coll}:updateMany:${JSON.stringify({ filter, update })}`
  }

  /**
   * Converts DELETE into deleteMany directive.
   *
   * @param query - Query components including table and wheres.
   * @returns {string} - Directive string for delete operation.
   */
  compileDelete(query: any): string {
    const coll = query.table
    const filter = this.compileWheres(query.wheres)
    return `${coll}:deleteMany:${JSON.stringify({ filter })}`
  }

  /**
   * Builds MongoDB filter object from SQL-like where clauses.
   *
   * @param wheres - Array of where clause objects.
   * @returns {string} - MongoDB filter object.
   */
  private compileWheres(wheres: any[]): any {
    if (!wheres || !wheres.length) return {}
    const filter: Record<string, any> = {}
    for (const w of wheres) {
      switch (w.type) {
        case 'basic':
          this.addBasicWhere(filter, w)
          break
        case 'in':
          filter[w.column] = { $in: w.values }
          break
        case 'notIn':
          filter[w.column] = { $nin: w.values }
          break
        case 'between':
          filter[w.column] = { $gte: w.values[0], $lte: w.values[1] }
          break
        case 'null':
          filter[w.column] = null
          break
        case 'notNull':
          filter[w.column] = { $ne: null }
          break
        default:
          break
      }
    }
    return filter
  }

  /**
   * Adds basic comparison operators to MongoDB filter.
   *
   * @param filter - The filter object to mutate.
   * @param w - Where clause object.
   */
  private addBasicWhere(filter: Record<string, any>, w: any): void {
    const op = w.operator.toLowerCase()
    switch (op) {
      case '=':
        filter[w.column] = w.value
        break
      case '!=':
      case '<>':
        filter[w.column] = { $ne: w.value }
        break
      case '>':
        filter[w.column] = { $gt: w.value }
        break
      case '>=':
        filter[w.column] = { $gte: w.value }
        break
      case '<':
        filter[w.column] = { $lt: w.value }
        break
      case '<=':
        filter[w.column] = { $lte: w.value }
        break
      case 'like':
        filter[w.column] = { $regex: w.value.replace(/%/g, '.*'), $options: 'i' }
        break
      default:
        break
    }
  }

  /**
   * Builds MongoDB cursor options (projection, sort, skip, limit).
   *
   * @param query - Query components including columns, orders, limit, offset.
   * @returns {string} - MongoDB find options object.
   */
  private compileOptions(query: any): any {
    const opts: Record<string, any> = {}
    if (query.columns && !query.columns.includes('*')) {
      opts.projection = {}
      for (const c of query.columns) {
        opts.projection[c] = 1
      }
    }
    if (query.orders) {
      opts.sort = {}
      for (const o of query.orders) {
        opts.sort[o.column] = o.direction === 'desc' ? -1 : 1
      }
    }
    if (query.limit) opts.limit = query.limit
    if (query.offset) opts.skip = query.offset
    return opts
  }

  /**
   * Wraps a collection name.
   * MongoDB collections require no special wrapping.
   *
   * @param table - Collection name.
   * @returns {string} - The unmodified collection name.
   */
  wrapTable(table: string): string {
    return table
  }

  /**
   * Wraps a field/column name.
   * MongoDB fields require no special wrapping.
   *
   * @param column - Field name.
   * @returns {string} - The unmodified field name.
   */
  wrapColumn(column: string): string {
    return column
  }

  /**
   * Formats a parameter for directive payload.
   * JSON-stringifies the value.
   *
   * @param value - Any JavaScript value.
   * @returns {string} - JSON string of the value.
   */
  parameter(value: any): string {
    return JSON.stringify(value)
  }

  private mapType(type: string, elementType?: string): string | string[] {
  switch (type) {
    case "int":
    case "integer":
      return "int";
    case "float":
    case "double":
    case "decimal":
      return "double";
    case "string":
      return "string";
    case "bool":
    case "boolean":
      return "bool";
    case "date":
    case "datetime":
      return "date";
    case "array":
      return "array";
    case "object":
      return "object";
    case "json":
      return "object";
    case "uuid":
      return "binData";
    default:
      return "string"; // fallback
  }
}

  /**
   * Compiles a create-collection operation for MongoDB.
   * Note: MongoDB creates collections implicitly on insert,
   * but explicit creation can include options like validator.
   *
   * @param definition - TableDefinition with collection name and options.
   * @returns {string} - Directive string for creating a collection.
   */
  compileCreateTable(definition: TableDefinition): string {
    const coll = definition.name;

    const validator: any = {
      $jsonSchema: {
        bsonType: "object",
        required: definition.columns
          .filter(col => col.required)
          .map(col => col.name),
        properties: {},
      }
    };

    for (const col of definition.columns) {
      const prop: any = {
        bsonType: this.mapType(col.type, col.elementType),
      };

      if (col.maxLength) prop.maxLength = col.maxLength;
      if (col.minLength) prop.minLength = col.minLength;
      if (col.minimum) prop.minimum = col.minimum;
      if (col.maximum) prop.maximum = col.maximum;
      if (col.allowed) prop.enum = col.allowed;
      if (col.nullable === false) prop.nullable = false;
      if (col.default) prop.default = col.default
      if (col.pattern) prop.default = col.pattern
      if (col.format) prop.default = col.format
      if (col.comment) prop.description = col.comment


      validator.$jsonSchema.properties[col.name] = prop;
    }

    const options = {
      validator,
      validationLevel: "strict",
      validationAction: "error",
      ...definition.tableOptions
    };

    return `${coll}:createCollection:${JSON.stringify(options)}`;
  }

  /**
   * Compiles an alter-collection operation for MongoDB.
   * Supports limited alterations like updating validation rules.
   *
   * @param definition - TableDefinition with new validation rules.
   * @returns {string} - Directive string for modifying collection.
   */
  compileAlterTable(definition: TableDefinition): string {
    const coll = definition.name;

    const validator: any = {
      $jsonSchema: {
        bsonType: "object",
        required: definition.columns
          .filter(col => col.required)
          .map(col => col.name),
        properties: {},
      }
    };

    for (const col of definition.columns) {
      const prop: any = {
        bsonType: this.mapType(col.type, col.elementType),
      };

      if (col.maxLength) prop.maxLength = col.maxLength;
      if (col.minLength) prop.minLength = col.minLength;
      if (col.minimum) prop.minimum = col.minimum;
      if (col.maximum) prop.maximum = col.maximum;
      if (col.allowed) prop.enum = col.allowed;
      if (col.nullable === false) prop.nullable = false;
      if (col.default) prop.default = col.default
      if (col.pattern) prop.default = col.pattern
      if (col.format) prop.default = col.format
      if (col.comment) prop.description = col.comment

      validator.$jsonSchema.properties[col.name] = prop;
    }

    const options = {
      validator,
      validationLevel: "strict",
      validationAction: "error",
      ...definition.tableOptions
    };

    return `${coll}:collMod:${JSON.stringify(options)}`;
  }

  /**
   * Compiles a check for collection existence.
   *
   * @param table - Collection name to check.
   * @returns {string} - Directive string for listing collections.
   */
  compileTableExists(table: string): string {
    return `${table}:listCollections:{}`
  }

  /**
   * Compiles a check for field existence in a collection.
   * Note: MongoDB requires sampling or schema overview.
   *
   * @param table - Collection name.
   * @param column - Field name to check.
   * @returns {string} - Directive string for field existence check.
   */
  compileColumnExists(table: string, column: string): string {
    return `${table}:existsField:${JSON.stringify({ field: column })}`
  }

  /**
   * Compiles a rename-collection operation.
   *
   * @param from - Current collection name.
   * @param to - New collection name.
   * @throws Error directive, driver should handle renameCollection.
   */
  async rename(from: string, to: string): Promise<void> {
    throw new Error(`Driver must execute: ${from}:renameCollection:${to}`)
  }
}
