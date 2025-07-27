import type { ColumnDefinition } from "@/types"

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
export class ColumnBuilder {
  /**
   * Create a new ColumnBuilder instance.
   * @param column - The underlying ColumnDefinition to configure.
   */
  constructor(private column: ColumnDefinition) { }

  /**
   * Mark the column as nullable.
   * @returns The builder instance for chaining.
   */
  nullable(): this {
    this.column.nullable = true
    return this
  }

  /**
   * Mark the column as not nullable.
   * @returns The builder instance for chaining.
   */
  notNullable(): this {
    this.column.nullable = false
    return this
  }

  /**
   * Mark the column as required.
   * @returns The builder instance for chaining.
   */
  required(): this {
    this.column.required = true
    return this
  }

  /**
   * Set a default value for the column.
   * @param value - The default value to use.
   * @returns The builder instance for chaining.
   */
  default(value: any): this {
    this.column.default = value
    return this
  }

  /**
   * Add a UNIQUE constraint to the column.
   * @returns The builder instance for chaining.
   */
  unique(): this {
    this.column.unique = true
    return this
  }

  /**
   * Mark the column as PRIMARY KEY.
   * @returns The builder instance for chaining.
   */
  primary(): this {
    this.column.primary = true
    return this
  }

  /**
   * Enable auto-increment for the column (if supported by the dialect).
   * @returns The builder instance for chaining.
   */
  autoIncrement(): this {
    this.column.autoIncrement = true
    return this
  }

  /**
   * Set the minimum length constraint for a string field. (MongoDB Schema)
   * Applies to string-based fields (e.g., text, varchar).
   * 
   * @param length - Minimum number of characters allowed.
   * @returns The builder instance for chaining.
   *
   * @example
   * table.string('username').minLength(3)
   */
  minLength(length: number): this {
    this.column.minLength = length
    return this
  }

  /**
   * Set the maximum length constraint for a string field. (MongoDB Schema)
   * Applies to string-based fields (e.g., text, varchar).
   *
   * @param length - Maximum number of characters allowed.
   * @returns The builder instance for chaining.
   *
   * @example
   * table.string('username').maxLength(30)
   */
  maxLength(length: number): this {
    this.column.maxLength = length
    return this
  }

  /**
   * Set the minimum numeric value constraint for the field. (MongoDB Schema)
   * Applies to integer or float fields.
   *
   * @param value - Minimum allowed value.
   * @returns The builder instance for chaining.
   *
   * @example
   * table.integer('age').min(18)
   */
  min(value: number): this {
    this.column.minimum = value
    return this
  }

  /**
   * Set the maximum numeric value constraint for the field. (MongoDB Schema)
   * Applies to integer or float fields.
   *
   * @param value - Maximum allowed value.
   * @returns The builder instance for chaining.
   *
   * @example
   * table.integer('age').max(100)
   */
  max(value: number): this {
    this.column.maximum = value
    return this
  }

}
