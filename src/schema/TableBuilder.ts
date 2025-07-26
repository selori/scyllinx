import type {
  ColumnDefinition,
  IndexDefinition,
  ForeignKeyDefinition,
  TableDefinition,
} from "@/types"
import { ForeignKeyBuilder } from "./ForeignKeyBuilder"
import { ColumnBuilder } from "./ColumnBuilder"
import { TableOptionsBuilder } from "./TableOptionsBuilder"

/**
 * Fluent builder for defining tables in migrations.
 * Supports columns, indexes, foreign keys, and ScyllaDB-specific options.
 *
 * @example
 * const tableDef = new TableBuilder("users")
 *   .id()
 *   .string("name")
 *     .nullable()
 *   .string("email")
 *     .unique()
 *   .foreign("role_id")
 *     .references("id")
 *     .on("roles")
 *     .onDelete("cascade")
 *   .partitionKey("id")
 *   .clusteringKey("created_at")
 *   .withOptions(opts => {
 *     opts.compaction({ class: 'SizeTieredCompactionStrategy' })
 *   })
 *   .build()
 */
export class TableBuilder {
  private columns: ColumnDefinition[] = []
  private indexes: IndexDefinition[] = []
  private foreignKeys: ForeignKeyDefinition[] = []
  private partitionKeys: string[] = []
  private clusteringKeys: string[] = []
  private _clusteringOrder: Record<string, "ASC" | "DESC"> = {}
  private tableOptions: Record<string, any> = {}
  private tableExists = false

  /**
   * @param tableName - Name of the table to build.
   */
  constructor(private tableName: string) {}

  /**
   * Mark whether the table already exists (skip creation logic).
   */
  public setTableExists(exists: boolean): void {
    this.tableExists = exists
  }

  /**
   * Add an auto-incrementing integer primary key column.
   * @param name - Column name, defaults to "id".
   */
  public id(name = "id"): this {
    this.columns.push({ name, type: "integer", primary: true, autoIncrement: true, nullable: false })
    return this
  }

  /**
   * Add a VARCHAR column.
   * @param name - Column name.
   * @param length - Maximum length, defaults to 255.
   */
  public string(name: string, length = 255): ColumnBuilder {
    const col: ColumnDefinition = { name, type: "string", length }
    this.columns.push(col)
    return new ColumnBuilder(col)
  }

  text(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "text",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  integer(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "integer",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  bigInteger(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "bigInteger",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  float(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "float",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  double(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "double",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  decimal(name: string, precision = 8, scale = 2): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: `decimal(${precision},${scale})`,
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  boolean(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "boolean",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  date(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "date",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  dateTime(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "dateTime",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  timestamp(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "timestamp",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  timestamps(): this {
    this.timestamp("created_at").nullable();
    this.timestamp("updated_at").nullable();
    return this;
  }

  json(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "json",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  /**
   * Add a UUID column
   */
  public uuid(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "uuid",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  /**
   * Add an enum column
   */
  public enum(name: string, values: string[]): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "enum",
      allowed: values,
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  // ScyllaDB specific column types
  /**
   * Add a set column (ScyllaDB)
   */
  public set(name: string, type: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "set",
      elementType: type,
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  /**
   * Add a list column (ScyllaDB)
   */
  public list(name: string, type: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "list",
      elementType: type,
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  /**
   * Add a map column (ScyllaDB)
   */
  public map(name: string, keyType: string, valueType: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "map",
      keyType: keyType,
      valueType: valueType,
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  /**
   * Add a counter column (ScyllaDB)
   */
  public counter(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "counter",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }

  /**
   * Add a timeuuid column (ScyllaDB)
   */
  public timeUuid(name: string): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type: "timeuuid",
    };
    this.columns.push(column);
    return new ColumnBuilder(column);
  }


  /**
   * Begin defining a foreign key on a column.
   * @param column - Local column name to reference.
   */
  public foreign(column: string): ForeignKeyBuilder {
    return new ForeignKeyBuilder(column, this.foreignKeys)
  }

  /**
   * Create a standard index.
   * @param columns - Single column or array of columns to index.
   * @param name - Optional custom index name.
   */
  public index(columns: string | string[], name?: string): this {
    const cols = Array.isArray(columns) ? columns : [columns]
    this.indexes.push({ name: name || `idx_${this.tableName}_${cols.join("_")}`, columns: cols })
    return this
  }

  /**
   * Create a unique index.
   */
  public unique(columns: string | string[], name?: string): this {
    const cols = Array.isArray(columns) ? columns : [columns]
    this.indexes.push({ name: name || `unq_${this.tableName}_${cols.join("_")}`, columns: cols, unique: true })
    return this
  }

  /**
   * Define partition key columns (Cassandra/ScyllaDB).
   */
  public partitionKey(...columns: string[]): this {
    this.partitionKeys = columns
    return this
  }

  /**
   * Define clustering key columns.
   */
  public clusteringKey(...columns: string[]): this {
    this.clusteringKeys = columns
    return this
  }

  /**
   * Specify clustering order for a column.
   */
  public clusteringOrder(column: string, direction: "ASC" | "DESC"): this {
    this._clusteringOrder[column] = direction
    return this
  }

  /**
   * Configure table-level options via callback.
   */
  public withOptions(callback: (builder: TableOptionsBuilder) => void): this {
    const optsBuilder = new TableOptionsBuilder()
    callback(optsBuilder)
    this.tableOptions = optsBuilder.build()
    return this
  }

  /**
   * Compile and return the final table definition.
   */
  public build(): TableDefinition {
    return {
      name: this.tableName,
      columns: this.columns,
      indexes: this.indexes,
      foreignKeys: this.foreignKeys,
      partitionKeys: this.partitionKeys,
      clusteringKeys: this.clusteringKeys,
      clusteringOrder: this._clusteringOrder,
      tableOptions: this.tableOptions,
    }
  }
}
