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
   * Set a human-readable description for the field.
   * This is useful for documentation or schema introspection tools.
   *
   * @param text - A brief description of the field's purpose.
   * @returns The builder instance for chaining.
   *
   * @example
   * column.string('email').description('The user\'s email address.')
   */
  comment(text: string): this {
    this.column.comment = text
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

  /**
   * Set a regular expression pattern constraint for a string field. (MongoDB Schema)
   * Ensures that the value matches the given regex.
   * 
   * Applies only to string-based fields (e.g., text, varchar).
   *
   * @param regex - A string or RegExp representing the pattern to match.
   * @returns The builder instance for chaining.
   *
   * @example
   * column.string('email').pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
   * 
   * @example
   * column.string('slug').pattern("^[a-z0-9-]+$")
   */
  pattern(regex: string | RegExp): this {
    this.column.pattern = typeof regex === 'string' ? regex : regex.source
    return this
  }


  /**
   * Set a predefined format for the field. (MongoDB Schema)
   * Formats are used for semantic validation (e.g., email, uri, date-time).
   * 
   * Common formats: `"email"`, `"uri"`, `"uuid"`, `"date"`, `"date-time"`, `"ipv4"`, `"ipv6"`, etc.
   * 
   * Format constraints are typically used in JSON Schema or validation libraries.
   *
   * @param format - A string representing the expected format.
   * @returns The builder instance for chaining.
   *
   * @example
   * column.string('email').format('email')
   * 
   * @example
   * column.string('website').format('uri')
   */
  format(format: string): this {
    this.column.format = format
    return this
  }

}
