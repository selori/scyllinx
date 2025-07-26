/**
 * Fluent builder for creating ScyllaDB/Cassandra materialized views.
 * Chain methods to configure view definition and generate the CREATE statement.
 *
 * @example
 * const mv = new MaterializedViewBuilder("user_by_email", "users")
 *   .ifNotExists()
 *   .select("id", "email", "name")
 *   .where("email IS NOT NULL")
 *   .partitionKey("email")
 *   .clusteringKey("id")
 *   .clusteringOrder("id", "DESC")
 * const sql = mv.toSQL()
 * console.log(sql)
 */
export declare class MaterializedViewBuilder {
    private viewName;
    private baseTable;
    private selectColumns;
    private whereConditions;
    private partitionKeys;
    private clusteringKeys;
    private _clusteringOrder;
    private _ifNotExists;
    /**
     * @param viewName - Name of the materialized view to create.
     * @param baseTable - Base table from which to select data.
     */
    constructor(viewName: string, baseTable: string);
    /**
     * Specify columns to include in the view.
     * @param columns - Column names to select.
     */
    select(...columns: string[]): this;
    /**
     * Add a WHERE clause condition.
     * @param condition - Raw CQL condition string.
     */
    where(condition: string): this;
    /**
     * Define partition key columns (must include at least one).
     * @param columns - Column names for the partition key.
     */
    partitionKey(...columns: string[]): this;
    /**
     * Define clustering key columns.
     * @param columns - Column names for clustering.
     */
    clusteringKey(...columns: string[]): this;
    /**
     * Specify clustering order for a column.
     * @param column - Column name to order by.
     * @param direction - 'ASC' or 'DESC'.
     */
    clusteringOrder(column: string, direction: "ASC" | "DESC"): this;
    /**
     * Add IF NOT EXISTS clause to avoid errors if view already exists.
     */
    ifNotExists(): this;
    /**
     * Compile and return the CREATE MATERIALIZED VIEW CQL statement.
     * @throws Error if no partition keys are defined.
     */
    toSQL(): string;
}
//# sourceMappingURL=MaterializedViewBuilder.d.ts.map