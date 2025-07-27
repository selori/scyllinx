import type { TableDefinition } from "@/types";
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
export declare class TableBuilder {
    private tableName;
    private columns;
    private indexes;
    private foreignKeys;
    private partitionKeys;
    private clusteringKeys;
    private _clusteringOrder;
    private tableOptions;
    private tableExists;
    /**
     * @param tableName - Name of the table to build.
     */
    constructor(tableName: string);
    /**
     * Mark whether the table already exists (skip creation logic).
     */
    setTableExists(exists: boolean): void;
    /**
     * Add an auto-incrementing integer primary key column.
     * @param name - Column name, defaults to "id".
     */
    id(name?: string): this;
    /**
     * Add a VARCHAR column.
     * @param name - Column name.
     * @param length - Maximum length, defaults to 255.
     */
    string(name: string, length?: number): ColumnBuilder;
    text(name: string): ColumnBuilder;
    integer(name: string): ColumnBuilder;
    bigInteger(name: string): ColumnBuilder;
    float(name: string): ColumnBuilder;
    double(name: string): ColumnBuilder;
    decimal(name: string, precision?: number, scale?: number): ColumnBuilder;
    boolean(name: string): ColumnBuilder;
    date(name: string): ColumnBuilder;
    dateTime(name: string): ColumnBuilder;
    timestamp(name: string): ColumnBuilder;
    timestamps(): this;
    json(name: string): ColumnBuilder;
    /**
     * Add a UUID column
     */
    uuid(name: string): ColumnBuilder;
    /**
     * Add an enum column
     */
    enum(name: string, values: string[]): ColumnBuilder;
    /**
     * Add a set column (ScyllaDB)
     */
    set(name: string, type: string): ColumnBuilder;
    /**
     * Add a list column (ScyllaDB)
     */
    list(name: string, type: string): ColumnBuilder;
    /**
     * Add a map column (ScyllaDB)
     */
    map(name: string, keyType: string, valueType: string): ColumnBuilder;
    /**
     * Add a counter column (ScyllaDB)
     */
    counter(name: string): ColumnBuilder;
    /**
     * Add a timeuuid column (ScyllaDB)
     */
    timeUuid(name: string): ColumnBuilder;
    /**
     * Begin defining a foreign key on a column.
     * @param column - Local column name to reference.
     */
    foreign(column: string): ForeignKeyBuilder;
    /**
     * Create a standard index.
     * @param columns - Single column or array of columns to index.
     * @param name - Optional custom index name.
     */
    index(columns: string | string[], name?: string): this;
    /**
     * Create a unique index.
     */
    unique(columns: string | string[], name?: string): this;
    /**
     * Define partition key columns (Cassandra/ScyllaDB).
     */
    partitionKey(...columns: string[]): this;
    /**
     * Define clustering key columns.
     */
    clusteringKey(...columns: string[]): this;
    /**
     * Specify clustering order for a column.
     */
    clusteringOrder(column: string, direction: "ASC" | "DESC"): this;
    /**
     * Configure table-level options via callback.
     */
    withOptions(callback: (builder: TableOptionsBuilder) => void): this;
    /**
     * Compile and return the final table definition.
     */
    build(): TableDefinition;
}
//# sourceMappingURL=TableBuilder.d.ts.map