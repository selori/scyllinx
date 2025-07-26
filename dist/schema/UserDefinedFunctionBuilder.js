"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDefinedFunctionBuilder = void 0;
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
class UserDefinedFunctionBuilder {
    /**
     * @param functionName - Name of the UDF to create or drop.
     */
    constructor(functionName) {
        this.parameters = [];
        this.returnType = "text";
        this.language = "java";
        this.body = "";
        this._calledOnNullInput = true;
        this._ifNotExists = false;
        this._orReplace = false;
        this._security = null;
        this.functionName = functionName;
    }
    /**
     * Add IF NOT EXISTS clause to CREATE.
     */
    ifNotExists() {
        this._ifNotExists = true;
        return this;
    }
    /**
     * Add OR REPLACE clause to CREATE.
     */
    replace() {
        this._orReplace = true;
        return this;
    }
    /**
     * Define multiple parameters at once.
     * @param params - Array of [name, type] tuples.
     */
    withParams(params) {
        this.parameters = params;
        return this;
    }
    /**
     * Add a single parameter.
     * @param name - Parameter name.
     * @param type - Parameter type.
     */
    param(name, type) {
        this.parameters.push([name, type]);
        return this;
    }
    /**
     * Set the return type.
     * @param type - PrimitiveScyllaType to return.
     */
    returns(type) {
        this.returnType = type;
        return this;
    }
    /**
     * Specify the language (java or javascript).
     */
    usingLanguage(lang) {
        this.language = lang;
        return this;
    }
    /**
     * Define the function body.
     * @param body - Code block without delimiters.
     */
    as(body) {
        this.body = body;
        return this;
    }
    /**
     * Functions are called even if input is null.
     */
    calledOnNullInput() {
        this._calledOnNullInput = true;
        return this;
    }
    /**
     * Functions return null when input is null.
     */
    returnsNullOnNullInput() {
        this._calledOnNullInput = false;
        return this;
    }
    /**
     * Set SECURITY DEFINER.
     */
    securityDefiner() {
        this._security = "DEFINER";
        return this;
    }
    /**
     * Set SECURITY INVOKER.
     */
    securityInvoker() {
        this._security = "INVOKER";
        return this;
    }
    /**
     * Build and return the CREATE FUNCTION CQL statement.
     * @throws Error if no parameters defined.
     */
    toSQL() {
        if (this.parameters.length === 0) {
            throw new Error("User-defined function must have at least one parameter");
        }
        const prefix = this._orReplace
            ? "CREATE OR REPLACE FUNCTION"
            : this._ifNotExists
                ? "CREATE FUNCTION IF NOT EXISTS"
                : "CREATE FUNCTION";
        const params = this.parameters.map(([n, t]) => `${n} ${t}`).join(", ");
        const nullBehavior = this._calledOnNullInput
            ? "CALLED ON NULL INPUT"
            : "RETURNS NULL ON NULL INPUT";
        const securityClause = this._security ? `SECURITY ${this._security}` : "";
        return `
${prefix} ${this.functionName}(${params})
RETURNS ${this.returnType}
LANGUAGE ${this.language}
${nullBehavior}
${securityClause}
AS $$${this.body}$$;
    `.trim();
    }
    /**
     * Build and return the DROP FUNCTION CQL statement.
     * @param ifExists - Include IF EXISTS clause.
     */
    dropSQL(ifExists = true) {
        const types = this.parameters.map(([, t]) => t).join(", ");
        const clause = ifExists ? "IF EXISTS " : "";
        return `DROP FUNCTION ${clause}${this.functionName}(${types});`;
    }
}
exports.UserDefinedFunctionBuilder = UserDefinedFunctionBuilder;
//# sourceMappingURL=UserDefinedFunctionBuilder.js.map