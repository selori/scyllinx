/**
 * Builder for creating and dropping user-defined aggregates in ScyllaDB/Cassandra.
 * Chain methods to configure the aggregate signature, state/final functions, and options.
 *
 * @example
 * // Define an aggregate that sums integers
 * const createSQL = new UserDefinedAggregateBuilder("sum_ints")
 *   .orReplace()
 *   .withParameters(["int"])
 *   .stateFunction("state_sum")
 *   .stateTypeIs("int")
 *   .finalFunction("final_sum")
 *   .initialCondition("0")
 *   .toSQL()
 * // Executes:
 * // CREATE OR REPLACE AGGREGATE sum_ints(int)
 * // SFUNC state_sum
 * // STYPE int
 * // FINALFUNC final_sum
 * // INITCOND 0
 *
 * // To drop the aggregate:
 * const dropSQL = new UserDefinedAggregateBuilder("sum_ints")
 *   .withParameters(["int"])
 *   .dropSQL()
 * // Executes: DROP AGGREGATE IF EXISTS sum_ints(int)
 */
export class UserDefinedAggregateBuilder {
    aggregateName;
    parameters = [];
    stateFunctionName = "";
    stateType = "int";
    finalFunctionName;
    initCondition;
    _orReplace = false;
    /**
     * @param aggregateName - Name of the aggregate to create or drop.
     */
    constructor(aggregateName) {
        this.aggregateName = aggregateName;
    }
    /**
     * Add OR REPLACE to the CREATE statement.
     */
    orReplace() {
        this._orReplace = true;
        return this;
    }
    /**
     * Define the parameter types for the aggregate.
     * @param types - List of Scylla primitive types.
     */
    withParameters(types) {
        this.parameters = types;
        return this;
    }
    /**
     * Set the state transition function name (SFUNC).
     * @param name - Name of the function.
     */
    stateFunction(name) {
        this.stateFunctionName = name;
        return this;
    }
    /**
     * Set the state data type (STYPE).
     * @param type - Primitive ScyllaDB type.
     */
    stateTypeIs(type) {
        this.stateType = type;
        return this;
    }
    /**
     * (Optional) Set the final function name (FINALFUNC).
     * @param name - Name of the final function.
     */
    finalFunction(name) {
        this.finalFunctionName = name;
        return this;
    }
    /**
     * (Optional) Set the initial condition (INITCOND).
     * @param condition - Initial value expression.
     */
    initialCondition(condition) {
        this.initCondition = condition;
        return this;
    }
    /**
     * Build and return the CREATE AGGREGATE CQL statement.
     * @throws Error if required fields are missing.
     */
    toSQL() {
        if (!this.aggregateName || this.parameters.length === 0 || !this.stateFunctionName) {
            throw new Error("Aggregate name, parameters, and state function must be provided");
        }
        const replace = this._orReplace ? "OR REPLACE " : "";
        const paramStr = this.parameters.join(", ");
        let sql = `CREATE ${replace}AGGREGATE ${this.aggregateName}(${paramStr})\n`;
        sql += `SFUNC ${this.stateFunctionName}\n`;
        sql += `STYPE ${this.stateType}`;
        if (this.finalFunctionName) {
            sql += `\nFINALFUNC ${this.finalFunctionName}`;
        }
        if (this.initCondition !== undefined) {
            sql += `\nINITCOND ${this.initCondition}`;
        }
        return sql;
    }
    /**
     * Build and return the DROP AGGREGATE CQL statement (IF EXISTS).
     */
    dropSQL() {
        const paramStr = this.parameters.join(", ");
        return `DROP AGGREGATE IF EXISTS ${this.aggregateName}(${paramStr})`;
    }
}
//# sourceMappingURL=UserDefinedAggregateBuilder.js.map