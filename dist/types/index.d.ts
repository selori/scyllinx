export interface DatabaseConfig {
    default: string;
    connections: Record<string, ConnectionConfig>;
    pool?: PoolConfig;
    migrations?: MigrationsConfig;
}
export interface PoolConfig {
    min: number;
    max: number;
}
export interface MigrationsConfig {
    directory: string;
    tableName: string;
}
export interface ConnectionConfig {
    driver: "scylladb" | "postgresql" | "mysql" | "sqlite";
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    keyspace?: string;
    localDataCenter?: string;
    [key: string]: any;
}
export interface QueryResult {
    rows: any[];
    rowCount: number;
    fields?: FieldInfo[];
    insertId?: string | number;
    affectedRows?: number;
}
export interface FieldInfo {
    name: string;
    type: string;
    nullable: boolean;
    defaultValue?: any;
}
export interface PreparedStatement {
    execute(bindings?: any[]): Promise<QueryResult>;
    close(): Promise<void>;
}
export type ColumnValue = {
    name?: string;
    raw?: string;
} | string;
export interface WhereClause {
    type: "basic" | "in" | "notIn" | "between" | "null" | "notNull" | "token" | "raw";
    column?: string;
    columns?: string[];
    operator?: string;
    value?: any;
    values?: any[];
    raw?: string;
    boolean?: string;
}
export interface QueryComponent {
    columns?: string[];
    from?: string;
    wheres?: WhereClause[];
    orders?: OrderClause[];
    limit?: number;
    allowFiltering?: boolean;
}
export interface OrderClause {
    column: string;
    direction: "asc" | "desc";
}
export interface JoinClause {
    type: "inner" | "left" | "right" | "full";
    table: string;
    first: string;
    operator: string;
    second: string;
}
export interface RelationshipConfig {
    type: "hasOne" | "hasMany" | "belongsTo" | "belongsToMany";
    model: string;
    foreignKey?: string;
    localKey?: string;
    pivotTable?: string;
}
export interface ColumnDefinition {
    name: string;
    type: string;
    nullable?: boolean;
    default?: any;
    primary?: boolean;
    unique?: boolean;
    autoIncrement?: boolean;
    length?: number;
    allowed?: string[];
    elementType?: string;
    keyType?: string;
    valueType?: string;
    scale?: any;
    precision?: any;
    unsigned?: any;
}
export interface TableDefinition {
    name: string;
    columns: ColumnDefinition[];
    indexes?: IndexDefinition[];
    foreignKeys?: ForeignKeyDefinition[];
    partitionKeys: string[];
    clusteringKeys: string[];
    clusteringOrder: Record<string, "ASC" | "DESC">;
    tableOptions?: TableOptions;
    inherits?: any;
}
export interface IndexDefinition {
    name: string;
    columns: string[];
    unique?: boolean;
}
export interface ForeignKeyDefinition {
    column: string;
    references: {
        table: string;
        column: string;
    };
    onDelete?: "cascade" | "set null" | "restrict";
    onUpdate?: "cascade" | "set null" | "restrict";
}
export interface TableOptions {
    compaction?: Record<string, any>;
    compression?: Record<string, any>;
    gc_grace_seconds?: number;
    caching?: {
        keys: 'ALL' | 'NONE';
        rows_per_partition: 'ALL' | 'NONE' | string;
    };
    default_time_to_live?: number;
    speculative_retry?: string;
    read_repair_chance?: number;
    dclocal_read_repair_chance?: number;
    bloom_filter_fp_chance?: number;
    comment?: string;
    crc_check_chance?: number;
    additional_write_policy?: string;
    [key: string]: any;
}
//# sourceMappingURL=index.d.ts.map