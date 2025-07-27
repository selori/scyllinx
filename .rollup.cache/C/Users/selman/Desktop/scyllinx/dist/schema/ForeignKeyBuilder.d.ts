import type { ForeignKeyDefinition } from "@/types";
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
export declare class ForeignKeyBuilder {
    private column;
    private foreignKeys;
    /**
     * @param column - Local column name for the foreign key.
     * @param foreignKeys - Array to collect ForeignKeyDefinition entries.
     */
    constructor(column: string, foreignKeys: ForeignKeyDefinition[]);
    /**
     * Specify the referenced column in the related table.
     * @param column - Column name in the foreign table.
     * @returns The builder instance for chaining.
     */
    references(column: string): this;
    /**
     * Specify the referenced table for the foreign key.
     * @param table - Table name to reference.
     * @returns The builder instance for chaining.
     */
    on(table: string): this;
    /**
     * Define the ON DELETE action for the foreign key.
     * @param action - One of 'cascade', 'set null', or 'restrict'.
     * @returns The builder instance for chaining.
     */
    onDelete(action: "cascade" | "set null" | "restrict"): this;
    /**
     * Define the ON UPDATE action for the foreign key.
     * @param action - One of 'cascade', 'set null', or 'restrict'.
     * @returns The builder instance for chaining.
     */
    onUpdate(action: "cascade" | "set null" | "restrict"): this;
}
//# sourceMappingURL=ForeignKeyBuilder.d.ts.map