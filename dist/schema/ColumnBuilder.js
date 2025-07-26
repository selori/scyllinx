"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnBuilder = void 0;
/**
 * Fluent builder for column definitions in migrations.
 * Provides chainable methods to configure column attributes.
 *
 * @example
 * const column: ColumnDefinition = { name: 'age', type: 'int' }
 * new ColumnBuilder(column)
 *   .nullable()
 *   .default(18)
 *   .unique()
 * // column now: { name: 'age', type: 'int', nullable: true, default: 18, unique: true }
 */
class ColumnBuilder {
    /**
     * Create a new ColumnBuilder instance.
     * @param column - The underlying ColumnDefinition to configure.
     */
    constructor(column) {
        this.column = column;
    }
    /**
     * Mark the column as nullable.
     * @returns The builder instance for chaining.
     */
    nullable() {
        this.column.nullable = true;
        return this;
    }
    /**
     * Mark the column as not nullable.
     * @returns The builder instance for chaining.
     */
    notNullable() {
        this.column.nullable = false;
        return this;
    }
    /**
     * Set a default value for the column.
     * @param value - The default value to use.
     * @returns The builder instance for chaining.
     */
    default(value) {
        this.column.default = value;
        return this;
    }
    /**
     * Add a UNIQUE constraint to the column.
     * @returns The builder instance for chaining.
     */
    unique() {
        this.column.unique = true;
        return this;
    }
    /**
     * Mark the column as PRIMARY KEY.
     * @returns The builder instance for chaining.
     */
    primary() {
        this.column.primary = true;
        return this;
    }
    /**
     * Enable auto-increment for the column (if supported by the dialect).
     * @returns The builder instance for chaining.
     */
    autoIncrement() {
        this.column.autoIncrement = true;
        return this;
    }
}
exports.ColumnBuilder = ColumnBuilder;
//# sourceMappingURL=ColumnBuilder.js.map