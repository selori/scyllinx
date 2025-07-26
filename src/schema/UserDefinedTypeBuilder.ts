/**
 * User-Defined Type Builder - For creating custom types
 */

// ScyllaDB Data Types
export type PrimitiveScyllaType =
  | "ascii"
  | "bigint"
  | "blob"
  | "boolean"
  | "counter"
  | "date"
  | "decimal"
  | "double"
  | "duration"
  | "float"
  | "inet"
  | "int"
  | "smallint"
  | "text"
  | "time"
  | "timestamp"
  | "timeuuid"
  | "tinyint"
  | "uuid"
  | "varchar"
  | "varint"

interface ListType {
  kind: "list"
  elementType: ScyllaDataType
}

interface SetType {
  kind: "set"
  elementType: ScyllaDataType
}

interface MapType {
  kind: "map"
  keyType: ScyllaDataType
  valueType: ScyllaDataType
}

interface FrozenType {
  kind: "frozen"
  typeName: string
}

interface TupleType {
  kind: "tuple"
  types: string[]
}

type ScyllaDataType =
  | PrimitiveScyllaType
  | ListType
  | SetType
  | MapType
  | FrozenType
  | TupleType

interface TypeField {
  name: string
  type: ScyllaDataType
}

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
export class UserDefinedTypeBuilder {
  private typeName: string
  private _fields: { name: string; type: PrimitiveScyllaType }[] = []
  private _ifNotExists = false

  /**
   * @param typeName - Name of the UDT to create or alter.
   */
  constructor(typeName: string) {
    this.typeName = typeName
  }

  /**
   * Define a single field in the UDT.
   * @param name - Field name.
   * @param type - ScyllaDB data type.
   */
  public field(name: string, type: PrimitiveScyllaType): this {
    this._fields.push({ name, type })
    return this
  }

  /**
   * Define multiple fields via an object map.
   * @param fields - Record of field names to types.
   */
  public fields(fields: Record<string, PrimitiveScyllaType>): this {
    for (const [name, type] of Object.entries(fields)) {
      this.field(name, type)
    }
    return this
  }

  /**
   * Include IF NOT EXISTS in the CREATE statement.
   */
  public ifNotExists(): this {
    this._ifNotExists = true
    return this
  }

  /**
   * Build and return the CREATE TYPE CQL statement.
   * @throws Error if no fields are defined.
   */
  public toSQL(): string {
    if (this._fields.length === 0) {
      throw new Error("User-defined type must have at least one field")
    }
    const existsClause = this._ifNotExists ? "IF NOT EXISTS " : ""
    const defs = this._fields.map(f => `  ${f.name} ${f.type}`)
    return `CREATE TYPE ${existsClause}${this.typeName} (
${defs.join(",\n")}
)`
  }

  /**
   * Generate an ALTER TYPE statement to add a new field.
   * @param name - Field name to add.
   * @param type - Data type for the new field.
   */
  public addField(name: string, type: PrimitiveScyllaType): string {
    return `ALTER TYPE ${this.typeName} ADD ${name} ${type}`
  }

  /**
   * Generate an ALTER TYPE statement to rename an existing field.
   * @param oldName - Current field name.
   * @param newName - New field name.
   */
  public renameField(oldName: string, newName: string): string {
    return `ALTER TYPE ${this.typeName} RENAME ${oldName} TO ${newName}`
  }
}

