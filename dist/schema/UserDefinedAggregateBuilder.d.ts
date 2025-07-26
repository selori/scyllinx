import { PrimitiveScyllaType } from "./UserDefinedTypeBuilder";
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
export declare class UserDefinedAggregateBuilder {
    private aggregateName;
    private parameters;
    private stateFunctionName;
    private stateType;
    private finalFunctionName?;
    private initCondition?;
    private _orReplace;
    /**
     * @param aggregateName - Name of the aggregate to create or drop.
     */
    constructor(aggregateName: string);
    /**
     * Add OR REPLACE to the CREATE statement.
     */
    orReplace(): this;
    /**
     * Define the parameter types for the aggregate.
     * @param types - List of Scylla primitive types.
     */
    withParameters(types: PrimitiveScyllaType[]): this;
    /**
     * Set the state transition function name (SFUNC).
     * @param name - Name of the function.
     */
    stateFunction(name: string): this;
    /**
     * Set the state data type (STYPE).
     * @param type - Primitive ScyllaDB type.
     */
    stateTypeIs(type: PrimitiveScyllaType): this;
    /**
     * (Optional) Set the final function name (FINALFUNC).
     * @param name - Name of the final function.
     */
    finalFunction(name: string): this;
    /**
     * (Optional) Set the initial condition (INITCOND).
     * @param condition - Initial value expression.
     */
    initialCondition(condition: string): this;
    /**
     * Build and return the CREATE AGGREGATE CQL statement.
     * @throws Error if required fields are missing.
     */
    toSQL(): string;
    /**
     * Build and return the DROP AGGREGATE CQL statement (IF EXISTS).
     */
    dropSQL(): string;
}
//# sourceMappingURL=UserDefinedAggregateBuilder.d.ts.map