import { PrimitiveScyllaType } from "./UserDefinedTypeBuilder"

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
  private aggregateName: string
  private parameters: PrimitiveScyllaType[] = []
  private stateFunctionName = ""
  private stateType: PrimitiveScyllaType = "int"
  private finalFunctionName?: string
  private initCondition?: string
  private _orReplace = false

  /**
   * @param aggregateName - Name of the aggregate to create or drop.
   */
  constructor(aggregateName: string) {
    this.aggregateName = aggregateName
  }

  /**
   * Add OR REPLACE to the CREATE statement.
   */
  public orReplace(): this {
    this._orReplace = true
    return this
  }

  /**
   * Define the parameter types for the aggregate.
   * @param types - List of Scylla primitive types.
   */
  public withParameters(types: PrimitiveScyllaType[]): this {
    this.parameters = types
    return this
  }

  /**
   * Set the state transition function name (SFUNC).
   * @param name - Name of the function.
   */
  public stateFunction(name: string): this {
    this.stateFunctionName = name
    return this
  }

  /**
   * Set the state data type (STYPE).
   * @param type - Primitive ScyllaDB type.
   */
  public stateTypeIs(type: PrimitiveScyllaType): this {
    this.stateType = type
    return this
  }

  /**
   * (Optional) Set the final function name (FINALFUNC).
   * @param name - Name of the final function.
   */
  public finalFunction(name: string): this {
    this.finalFunctionName = name
    return this
  }

  /**
   * (Optional) Set the initial condition (INITCOND).
   * @param condition - Initial value expression.
   */
  public initialCondition(condition: string): this {
    this.initCondition = condition
    return this
  }

  /**
   * Build and return the CREATE AGGREGATE CQL statement.
   * @throws Error if required fields are missing.
   */
  public toSQL(): string {
    if (!this.aggregateName || this.parameters.length === 0 || !this.stateFunctionName) {
      throw new Error("Aggregate name, parameters, and state function must be provided")
    }

    const replace = this._orReplace ? "OR REPLACE " : ""
    const paramStr = this.parameters.join(", ")
    let sql = `CREATE ${replace}AGGREGATE ${this.aggregateName}(${paramStr})\n`
    sql += `SFUNC ${this.stateFunctionName}\n`
    sql += `STYPE ${this.stateType}`

    if (this.finalFunctionName) {
      sql += `\nFINALFUNC ${this.finalFunctionName}`
    }

    if (this.initCondition !== undefined) {
      sql += `\nINITCOND ${this.initCondition}`
    }

    return sql
  }

  /**
   * Build and return the DROP AGGREGATE CQL statement (IF EXISTS).
   */
  public dropSQL(): string {
    const paramStr = this.parameters.join(", ")
    return `DROP AGGREGATE IF EXISTS ${this.aggregateName}(${paramStr})`
  }
}
