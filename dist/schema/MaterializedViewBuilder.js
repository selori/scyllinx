"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterializedViewBuilder = void 0;
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
class MaterializedViewBuilder {
    /**
     * @param viewName - Name of the materialized view to create.
     * @param baseTable - Base table from which to select data.
     */
    constructor(viewName, baseTable) {
        this.selectColumns = ["*"];
        this.whereConditions = [];
        this.partitionKeys = [];
        this.clusteringKeys = [];
        this._clusteringOrder = {};
        this._ifNotExists = false;
        this.viewName = viewName;
        this.baseTable = baseTable;
    }
    /**
     * Specify columns to include in the view.
     * @param columns - Column names to select.
     */
    select(...columns) {
        this.selectColumns = columns;
        return this;
    }
    /**
     * Add a WHERE clause condition.
     * @param condition - Raw CQL condition string.
     */
    where(condition) {
        this.whereConditions.push(condition);
        return this;
    }
    /**
     * Define partition key columns (must include at least one).
     * @param columns - Column names for the partition key.
     */
    partitionKey(...columns) {
        this.partitionKeys = columns;
        return this;
    }
    /**
     * Define clustering key columns.
     * @param columns - Column names for clustering.
     */
    clusteringKey(...columns) {
        this.clusteringKeys = columns;
        return this;
    }
    /**
     * Specify clustering order for a column.
     * @param column - Column name to order by.
     * @param direction - 'ASC' or 'DESC'.
     */
    clusteringOrder(column, direction) {
        this._clusteringOrder[column] = direction;
        return this;
    }
    /**
     * Add IF NOT EXISTS clause to avoid errors if view already exists.
     */
    ifNotExists() {
        this._ifNotExists = true;
        return this;
    }
    /**
     * Compile and return the CREATE MATERIALIZED VIEW CQL statement.
     * @throws Error if no partition keys are defined.
     */
    toSQL() {
        if (this.partitionKeys.length === 0) {
            throw new Error("Materialized view must have at least one partition key");
        }
        let sql = `CREATE MATERIALIZED VIEW ${this._ifNotExists ? "IF NOT EXISTS " : ""}${this.viewName} AS\n`;
        sql += `SELECT ${this.selectColumns.join(", ")}\n`;
        sql += `FROM ${this.baseTable}\n`;
        if (this.whereConditions.length > 0) {
            sql += `WHERE ${this.whereConditions.join(" AND ")}\n`;
        }
        else {
            sql += `WHERE ${this.partitionKeys[0]} IS NOT NULL\n`;
        }
        sql += "PRIMARY KEY (";
        if (this.partitionKeys.length === 1 && this.clusteringKeys.length === 0) {
            sql += this.partitionKeys[0];
        }
        else {
            sql += `(${this.partitionKeys.join(", ")})`;
            if (this.clusteringKeys.length > 0) {
                sql += `, ${this.clusteringKeys.join(", ")}`;
            }
        }
        sql += ")";
        if (this.clusteringKeys.length > 0 && Object.keys(this._clusteringOrder).length > 0) {
            const orderClauses = this.clusteringKeys.map((key) => {
                const dir = this._clusteringOrder[key] || "ASC";
                return `${key} ${dir}`;
            });
            sql += `\nWITH CLUSTERING ORDER BY (${orderClauses.join(", ")})`;
        }
        return sql;
    }
}
exports.MaterializedViewBuilder = MaterializedViewBuilder;
//# sourceMappingURL=MaterializedViewBuilder.js.map