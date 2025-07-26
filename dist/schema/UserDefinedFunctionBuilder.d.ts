import { PrimitiveScyllaType } from "./UserDefinedTypeBuilder";
type Language = "java" | "javascript";
/**
 * Builder for creating and dropping user-defined functions in ScyllaDB/Cassandra.
 * Chain methods to configure the function signature, return type, language, and options.
 *
 * @example
 * // Define a Java-based add_numbers function
 * const createSQL = new UserDefinedFunctionBuilder("add_numbers")
 *   .replace()
 *   .param("a", "int")
 *   .param("b", "int")
 *   .returns("int")
 *   .usingLanguage("java")
 *   .returnsNullOnNullInput()
 *   .securityDefiner()
 *   .as("return a + b;")
 *   .toSQL()
 * // Executes:
 * // CREATE OR REPLACE FUNCTION add_numbers(a int, b int)
 * // RETURNS int
 * // LANGUAGE java
 * // RETURNS NULL ON NULL INPUT
 * // SECURITY DEFINER
 * // AS $$return a + b;$$;
 *
 * // To drop the function:
 * const dropSQL = new UserDefinedFunctionBuilder("add_numbers")
 *   .param("a", "int")
 *   .param("b", "int")
 *   .dropSQL()
 * // Executes: DROP FUNCTION IF EXISTS add_numbers(int, int);
 */
export declare class UserDefinedFunctionBuilder {
    private functionName;
    private parameters;
    private returnType;
    private language;
    private body;
    private _calledOnNullInput;
    private _ifNotExists;
    private _orReplace;
    private _security;
    /**
     * @param functionName - Name of the UDF to create or drop.
     */
    constructor(functionName: string);
    /**
     * Add IF NOT EXISTS clause to CREATE.
     */
    ifNotExists(): this;
    /**
     * Add OR REPLACE clause to CREATE.
     */
    replace(): this;
    /**
     * Define multiple parameters at once.
     * @param params - Array of [name, type] tuples.
     */
    withParams(params: [string, PrimitiveScyllaType][]): this;
    /**
     * Add a single parameter.
     * @param name - Parameter name.
     * @param type - Parameter type.
     */
    param(name: string, type: PrimitiveScyllaType): this;
    /**
     * Set the return type.
     * @param type - PrimitiveScyllaType to return.
     */
    returns(type: PrimitiveScyllaType): this;
    /**
     * Specify the language (java or javascript).
     */
    usingLanguage(lang: Language): this;
    /**
     * Define the function body.
     * @param body - Code block without delimiters.
     */
    as(body: string): this;
    /**
     * Functions are called even if input is null.
     */
    calledOnNullInput(): this;
    /**
     * Functions return null when input is null.
     */
    returnsNullOnNullInput(): this;
    /**
     * Set SECURITY DEFINER.
     */
    securityDefiner(): this;
    /**
     * Set SECURITY INVOKER.
     */
    securityInvoker(): this;
    /**
     * Build and return the CREATE FUNCTION CQL statement.
     * @throws Error if no parameters defined.
     */
    toSQL(): string;
    /**
     * Build and return the DROP FUNCTION CQL statement.
     * @param ifExists - Include IF EXISTS clause.
     */
    dropSQL(ifExists?: boolean): string;
}
export {};
//# sourceMappingURL=UserDefinedFunctionBuilder.d.ts.map