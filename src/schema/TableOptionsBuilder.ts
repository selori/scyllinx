import { TableOptions } from "@/types"

/**
 * Fluent builder for table-level options (Cassandra/ScyllaDB).
 * Chain methods to configure compaction, compression, caching, and more.
 *
 * @example
 * const options = new TableOptionsBuilder()
 *   .compaction("SizeTieredCompactionStrategy", { min_threshold: 4 })
 *   .compression({ class: "LZ4Compressor" })
 *   .gcGraceSeconds(86400)
 *   .caching("ALL", "NONE")
 *   .defaultTTL(3600)
 *   .speculativeRetry("NONE")
 *   .comment("User data by email materialized view")
 *   .addCustomOption("read_repair_chance", 0.2)
 *   .build()
 */
export class TableOptionsBuilder {
  private options: TableOptions = {}

  /**
   * Set compaction strategy and options.
   * @param strategy - Fully qualified compaction class name.
   * @param options - Additional compaction parameters.
   */
  compaction(strategy: string, options: Record<string, any> = {}): this {
    this.options.compaction = { class: strategy, ...options }
    return this
  }

  /**
   * @param {Object} options - Compression map.
   * @example
   * {
   *   class: 'LZ4Compressor'
   * }
   */
  compression(options: Record<string, any>): this {
    this.options.compression = options
    return this
  }

  /**
   * Set GC grace seconds.
   * @param seconds - Number of seconds before tombstones are dropped.
   */
  gcGraceSeconds(seconds: number): this {
    this.options.gc_grace_seconds = seconds
    return this
  }

  /**
   * Configure caching options.
   * @param keys - 'ALL' or 'NONE'.
   * @param rows - 'ALL', 'NONE', or a fractional string (e.g., '0.01').
   */
  caching(keys: 'ALL' | 'NONE', rows: 'ALL' | 'NONE' | string): this {
    this.options.caching = { keys, rows_per_partition: rows }
    return this
  }

  /**
   * Set default TTL for the table.
   * @param seconds - Time-to-live in seconds.
   */
  defaultTTL(seconds: number): this {
    this.options.default_time_to_live = seconds
    return this
  }

  /**
   * Set speculative retry policy.
   * @param value - Retry policy (e.g., 'NONE', 'ALWAYS', 'NUM_N', 'CUSTOM').
   */
  speculativeRetry(value: string): this {
    this.options.speculative_retry = value
    return this
  }

  /**
   * Add a comment to the table.
   * @param text - Comment text.
   */
  comment(text: string): this {
    this.options.comment = text
    return this
  }

  /**
   * Add a custom option not covered by built-ins.
   * @param key - Option key.
   * @param value - Option value.
   */
  addCustomOption(key: string, value: any): this {
    this.options[key] = value
    return this
  }

  /**
   * Build and return the configured TableOptions object.
   */
  build(): TableOptions {
    return this.options
  }
}
