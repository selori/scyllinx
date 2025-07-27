import { ForeignKeyBuilder } from "./ForeignKeyBuilder";
import { ColumnBuilder } from "./ColumnBuilder";
import { TableOptionsBuilder } from "./TableOptionsBuilder";
/**
 * Fluent builder for defining tables in migrations.
 * Supports columns, indexes, foreign keys, and ScyllaDB-specific options.
 *
 * @example
 * const tableDef = new TableBuilder("users")
 *   .id()
 *   .string("name")
 *     .nullable()
 *   .string("email")
 *     .unique()
 *   .foreign("role_id")
 *     .references("id")
 *     .on("roles")
 *     .onDelete("cascade")
 *   .partitionKey("id")
 *   .clusteringKey("created_at")
 *   .withOptions(opts => {
 *     opts.compaction({ class: 'SizeTieredCompactionStrategy' })
 *   })
 *   .build()
 */
export class TableBuilder {
    tableName;
    columns = [];
    indexes = [];
    foreignKeys = [];
    partitionKeys = [];
    clusteringKeys = [];
    _clusteringOrder = {};
    tableOptions = {};
    tableExists = false;
    /**
     * @param tableName - Name of the table to build.
     */
    constructor(tableName) {
        this.tableName = tableName;
    }
    /**
     * Mark whether the table already exists (skip creation logic).
     */
    setTableExists(exists) {
        this.tableExists = exists;
    }
    /**
     * Add an auto-incrementing integer primary key column.
     * @param name - Column name, defaults to "id".
     */
    id(name = "id") {
        this.columns.push({ name, type: "integer", primary: true, autoIncrement: true, nullable: false });
        return this;
    }
    /**
     * Add a VARCHAR column.
     * @param name - Column name.
     * @param length - Maximum length, defaults to 255.
     */
    string(name, length = 255) {
        const col = { name, type: "string", length };
        this.columns.push(col);
        return new ColumnBuilder(col);
    }
    text(name) {
        const column = {
            name,
            type: "text",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    integer(name) {
        const column = {
            name,
            type: "integer",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    bigInteger(name) {
        const column = {
            name,
            type: "bigInteger",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    float(name) {
        const column = {
            name,
            type: "float",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    double(name) {
        const column = {
            name,
            type: "double",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    decimal(name, precision = 8, scale = 2) {
        const column = {
            name,
            type: `decimal(${precision},${scale})`,
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    boolean(name) {
        const column = {
            name,
            type: "boolean",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    date(name) {
        const column = {
            name,
            type: "date",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    dateTime(name) {
        const column = {
            name,
            type: "dateTime",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    timestamp(name) {
        const column = {
            name,
            type: "timestamp",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    timestamps() {
        this.timestamp("created_at").nullable();
        this.timestamp("updated_at").nullable();
        return this;
    }
    json(name) {
        const column = {
            name,
            type: "json",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add a UUID column
     */
    uuid(name) {
        const column = {
            name,
            type: "uuid",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add an enum column
     */
    enum(name, values) {
        const column = {
            name,
            type: "enum",
            allowed: values,
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    // ScyllaDB specific column types
    /**
     * Add a set column (ScyllaDB)
     */
    set(name, type) {
        const column = {
            name,
            type: "set",
            elementType: type,
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add a list column (ScyllaDB)
     */
    list(name, type) {
        const column = {
            name,
            type: "list",
            elementType: type,
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add a map column (ScyllaDB)
     */
    map(name, keyType, valueType) {
        const column = {
            name,
            type: "map",
            keyType: keyType,
            valueType: valueType,
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add a counter column (ScyllaDB)
     */
    counter(name) {
        const column = {
            name,
            type: "counter",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Add a timeuuid column (ScyllaDB)
     */
    timeUuid(name) {
        const column = {
            name,
            type: "timeuuid",
        };
        this.columns.push(column);
        return new ColumnBuilder(column);
    }
    /**
     * Begin defining a foreign key on a column.
     * @param column - Local column name to reference.
     */
    foreign(column) {
        return new ForeignKeyBuilder(column, this.foreignKeys);
    }
    /**
     * Create a standard index.
     * @param columns - Single column or array of columns to index.
     * @param name - Optional custom index name.
     */
    index(columns, name) {
        const cols = Array.isArray(columns) ? columns : [columns];
        this.indexes.push({ name: name || `idx_${this.tableName}_${cols.join("_")}`, columns: cols });
        return this;
    }
    /**
     * Create a unique index.
     */
    unique(columns, name) {
        const cols = Array.isArray(columns) ? columns : [columns];
        this.indexes.push({ name: name || `unq_${this.tableName}_${cols.join("_")}`, columns: cols, unique: true });
        return this;
    }
    /**
     * Define partition key columns (Cassandra/ScyllaDB).
     */
    partitionKey(...columns) {
        this.partitionKeys = columns;
        return this;
    }
    /**
     * Define clustering key columns.
     */
    clusteringKey(...columns) {
        this.clusteringKeys = columns;
        return this;
    }
    /**
     * Specify clustering order for a column.
     */
    clusteringOrder(column, direction) {
        this._clusteringOrder[column] = direction;
        return this;
    }
    /**
     * Configure table-level options via callback.
     */
    withOptions(callback) {
        const optsBuilder = new TableOptionsBuilder();
        callback(optsBuilder);
        this.tableOptions = optsBuilder.build();
        return this;
    }
    /**
     * Compile and return the final table definition.
     */
    build() {
        return {
            name: this.tableName,
            columns: this.columns,
            indexes: this.indexes,
            foreignKeys: this.foreignKeys,
            partitionKeys: this.partitionKeys,
            clusteringKeys: this.clusteringKeys,
            clusteringOrder: this._clusteringOrder,
            tableOptions: this.tableOptions,
        };
    }
}
//# sourceMappingURL=TableBuilder.js.map