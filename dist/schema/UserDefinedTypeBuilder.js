"use strict";
/**
 * User-Defined Type Builder - For creating custom types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDefinedTypeBuilder = void 0;
/**
 * Builder for creating and altering user-defined types in ScyllaDB/Cassandra.
 * Chain methods to define fields and generate CQL statements.
 *
 * @example
 * // Create a new UDT
 * const createSQL = new UserDefinedTypeBuilder("address")
 *   .ifNotExists()
 *   .field("street", "text")
 *   .field("city", "text")
 *   .field("zip", "int")
 *   .toSQL()
 * // Executes:
 * // CREATE TYPE IF NOT EXISTS address (
 * //   street text,
 * //   city text,
 * //   zip int
 * // )
 *
 * // Add a field to existing UDT
 * const alterAdd = new UserDefinedTypeBuilder("address")
 *   .addField("country", "text")
 * // Executes: ALTER TYPE address ADD country text
 *
 * // Rename a field in existing UDT
 * const alterRename = new UserDefinedTypeBuilder("address")
 *   .renameField("zip", "postal_code")
 * // Executes: ALTER TYPE address RENAME zip TO postal_code
 */
class UserDefinedTypeBuilder {
    /**
     * @param typeName - Name of the UDT to create or alter.
     */
    constructor(typeName) {
        this._fields = [];
        this._ifNotExists = false;
        this.typeName = typeName;
    }
    /**
     * Define a single field in the UDT.
     * @param name - Field name.
     * @param type - ScyllaDB data type.
     */
    field(name, type) {
        this._fields.push({ name, type });
        return this;
    }
    /**
     * Define multiple fields via an object map.
     * @param fields - Record of field names to types.
     */
    fields(fields) {
        for (const [name, type] of Object.entries(fields)) {
            this.field(name, type);
        }
        return this;
    }
    /**
     * Include IF NOT EXISTS in the CREATE statement.
     */
    ifNotExists() {
        this._ifNotExists = true;
        return this;
    }
    /**
     * Build and return the CREATE TYPE CQL statement.
     * @throws Error if no fields are defined.
     */
    toSQL() {
        if (this._fields.length === 0) {
            throw new Error("User-defined type must have at least one field");
        }
        const existsClause = this._ifNotExists ? "IF NOT EXISTS " : "";
        const defs = this._fields.map(f => `  ${f.name} ${f.type}`);
        return `CREATE TYPE ${existsClause}${this.typeName} (
${defs.join(",\n")}
)`;
    }
    /**
     * Generate an ALTER TYPE statement to add a new field.
     * @param name - Field name to add.
     * @param type - Data type for the new field.
     */
    addField(name, type) {
        return `ALTER TYPE ${this.typeName} ADD ${name} ${type}`;
    }
    /**
     * Generate an ALTER TYPE statement to rename an existing field.
     * @param oldName - Current field name.
     * @param newName - New field name.
     */
    renameField(oldName, newName) {
        return `ALTER TYPE ${this.typeName} RENAME ${oldName} TO ${newName}`;
    }
}
exports.UserDefinedTypeBuilder = UserDefinedTypeBuilder;
//# sourceMappingURL=UserDefinedTypeBuilder.js.map