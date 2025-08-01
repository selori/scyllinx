import type { ForeignKeyDefinition } from "@/types"

/**
 * Fluent builder for constructing foreign key constraints in migrations.
 * Chain methods to define column references and actions.
 *
 * @example
 * const foreignKeys: ForeignKeyDefinition[] = [];
 * new ForeignKeyBuilder("user_id", foreignKeys)
 *   .references("id")
 *   .on("users")
 *   .onDelete("cascade")
 *   .onUpdate("restrict");
 * // foreignKeys now contains:
 * // [{ column: "user_id", references: { table: "users", column: "id" }, onDelete: "cascade", onUpdate: "restrict" }]
 */
export class ForeignKeyBuilder {
  /**
   * @param column - Local column name for the foreign key.
   * @param foreignKeys - Array to collect ForeignKeyDefinition entries.
   */
  constructor(
    private column: string,
    private foreignKeys: ForeignKeyDefinition[]
  ) { }

  /**
   * Specify the referenced column in the related table.
   * @param column - Column name in the foreign table.
   * @returns The builder instance for chaining.
   */
  references(column: string): this {
    const existing = this.foreignKeys.find((fk) => fk.column === this.column)
    if (existing) {
      existing.references.column = column
    } else {
      this.foreignKeys.push({
        column: this.column,
        references: { table: "", column },
      })
    }
    return this
  }

  /**
   * Specify the referenced table for the foreign key.
   * @param table - Table name to reference.
   * @returns The builder instance for chaining.
   */
  on(table: string): this {
    const existing = this.foreignKeys.find((fk) => fk.column === this.column)
    if (existing) {
      existing.references.table = table
    }
    return this
  }

  /**
   * Define the ON DELETE action for the foreign key.
   * @param action - One of 'cascade', 'set null', or 'restrict'.
   * @returns The builder instance for chaining.
   */
  onDelete(action: "cascade" | "set null" | "restrict"): this {
    const existing = this.foreignKeys.find((fk) => fk.column === this.column)
    if (existing) {
      existing.onDelete = action
    }
    return this
  }

  /**
   * Define the ON UPDATE action for the foreign key.
   * @param action - One of 'cascade', 'set null', or 'restrict'.
   * @returns The builder instance for chaining.
   */
  onUpdate(action: "cascade" | "set null" | "restrict"): this {
    const existing = this.foreignKeys.find((fk) => fk.column === this.column)
    if (existing) {
      existing.onUpdate = action
    }
    return this
  }
}
