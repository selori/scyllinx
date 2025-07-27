/**
 * User-Defined Type Builder - For creating custom types
 */
export type PrimitiveScyllaType = "ascii" | "bigint" | "blob" | "boolean" | "counter" | "date" | "decimal" | "double" | "duration" | "float" | "inet" | "int" | "smallint" | "text" | "time" | "timestamp" | "timeuuid" | "tinyint" | "uuid" | "varchar" | "varint";
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
export declare class UserDefinedTypeBuilder {
    private typeName;
    private _fields;
    private _ifNotExists;
    /**
     * @param typeName - Name of the UDT to create or alter.
     */
    constructor(typeName: string);
    /**
     * Define a single field in the UDT.
     * @param name - Field name.
     * @param type - ScyllaDB data type.
     */
    field(name: string, type: PrimitiveScyllaType): this;
    /**
     * Define multiple fields via an object map.
     * @param fields - Record of field names to types.
     */
    fields(fields: Record<string, PrimitiveScyllaType>): this;
    /**
     * Include IF NOT EXISTS in the CREATE statement.
     */
    ifNotExists(): this;
    /**
     * Build and return the CREATE TYPE CQL statement.
     * @throws Error if no fields are defined.
     */
    toSQL(): string;
    /**
     * Generate an ALTER TYPE statement to add a new field.
     * @param name - Field name to add.
     * @param type - Data type for the new field.
     */
    addField(name: string, type: PrimitiveScyllaType): string;
    /**
     * Generate an ALTER TYPE statement to rename an existing field.
     * @param oldName - Current field name.
     * @param newName - New field name.
     */
    renameField(oldName: string, newName: string): string;
}
//# sourceMappingURL=UserDefinedTypeBuilder.d.ts.map