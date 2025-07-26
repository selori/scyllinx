# Schema Builder

The Schema Builder in ScyllinX provides a fluent interface for creating and modifying database schemas. It supports both SQL databases and ScyllaDB with their specific features, allowing you to define tables, columns, indexes, and constraints programmatically.

## Introduction

The Schema Builder is the foundation for creating and managing database structures in ScyllinX. It provides:

- **Database Agnostic**: Works with SQL databases and ScyllaDB
- **Fluent Interface**: Chainable methods for readable schema definitions
- **Type Safety**: Full TypeScript support with proper type checking
- **Migration Support**: Integrates seamlessly with the migration system
- **Advanced Features**: Support for indexes, constraints, and database-specific features

## Basic Usage

### Creating Tables

```typescript
import { Schema } from 'scyllinx';

// Get schema instance
const schema = connectionManager.getSchema();

// Create a basic table
await schema.createTable('users', (table) => {
  table.uuid('id').primary();
  table.string('name');
  table.string('email').unique();
  table.timestamps();
});
```

### Table Builder Methods

The table builder provides methods for defining columns, constraints, and indexes:

```typescript
await schema.createTable('posts', (table) => {
  // Primary key
  table.uuid('id').primary();
  
  // String columns
  table.string('title', 255);           // VARCHAR(255)
  table.text('content');                // TEXT
  table.char('status', 1);              // CHAR(1)
  
  // Numeric columns
  table.integer('view_count');          // INTEGER
  table.bigInteger('large_number');     // BIGINT
  table.decimal('price', 10, 2);        // DECIMAL(10,2)
  table.float('rating');                // FLOAT
  table.double('precise_value');        // DOUBLE
  
  // Boolean
  table.boolean('published');           // BOOLEAN
  
  // Date and time
  table.date('publish_date');           // DATE
  table.time('publish_time');           // TIME
  table.timestamp('created_at');        // TIMESTAMP
  table.datetime('updated_at');         // DATETIME
  
  // JSON and binary
  table.json('metadata');               // JSON
  table.binary('file_data');            // BINARY/BLOB
  
  // UUID
  table.uuid('user_id');                // UUID
  
  // Foreign keys
  table.foreign('user_id').references('id').on('users');
  
  // Indexes
  table.index('user_id');
  table.index(['published', 'created_at']);
});
```

## Column Types

### String Types

```typescript
await schema.createTable('string_examples', (table) => {
  // Variable length string with optional length
  table.string('name');                 // VARCHAR(255) - default length
  table.string('title', 100);           // VARCHAR(100) - custom length
  
  // Fixed length string
  table.char('code', 10);               // CHAR(10)
  
  // Text types
  table.text('description');            // TEXT
  table.mediumText('content');          // MEDIUMTEXT (MySQL)
  table.longText('large_content');      // LONGTEXT (MySQL)
  
  // Enum (database-specific)
  table.enum('status', ['active', 'inactive', 'pending']);
});
```

### Numeric Types

```typescript
await schema.createTable('numeric_examples', (table) => {
  // Integer types
  table.integer('count');               // INTEGER/INT
  table.bigInteger('big_count');        // BIGINT
  table.smallInteger('small_count');    // SMALLINT
  table.tinyInteger('tiny_count');      // TINYINT (MySQL)
  
  // Auto-increment
  table.increments('id');               // AUTO_INCREMENT PRIMARY KEY
  table.bigIncrements('big_id');        // BIGINT AUTO_INCREMENT PRIMARY KEY
  
  // Decimal types
  table.decimal('price', 10, 2);        // DECIMAL(10,2)
  table.float('rating', 8, 2);          // FLOAT(8,2)
  table.double('precise', 15, 8);       // DOUBLE(15,8)
  
  // Unsigned (MySQL)
  table.integer('positive').unsigned(); // UNSIGNED INT
});
```

### Date and Time Types

```typescript
await schema.createTable('datetime_examples', (table) => {
  // Date types
  table.date('birth_date');             // DATE
  table.time('start_time');             // TIME
  table.datetime('event_datetime');     // DATETIME
  table.timestamp('created_at');        // TIMESTAMP
  
  // Timestamps with timezone
  table.timestampTz('created_at_tz');   // TIMESTAMP WITH TIME ZONE
  
  // Auto-managed timestamps
  table.timestamps();                   // created_at, updated_at
  table.timestamps(true, true);         // with timezone
  
  // Soft delete timestamp
  table.softDeletes();                  // deleted_at
  table.softDeletesTz();                // deleted_at with timezone
});
```

### JSON and Binary Types

```typescript
await schema.createTable('json_binary_examples', (table) => {
  // JSON types
  table.json('settings');               // JSON
  table.jsonb('preferences');           // JSONB (PostgreSQL)
  
  // Binary types
  table.binary('file_data');            // BINARY/BLOB
  table.longBlob('large_file');         // LONGBLOB (MySQL)
  
  // UUID
  table.uuid('id');                     // UUID
  table.uuid('user_id').index();        // UUID with index
});
```

## ScyllaDB-Specific Types

### Basic ScyllaDB Types

```typescript
await schema.createTable('scylla_basic', (table) => {
  // UUID types
  table.uuid('id');                     // UUID
  table.timeuuid('time_id');           // TIMEUUID
  
  // Network types
  table.inet('ip_address');            // INET
  
  // Counter type
  table.counter('view_count');         // COUNTER
  
  // Blob
  table.blob('binary_data');           // BLOB
  
  // Variable integer
  table.varint('big_integer');         // VARINT
});
```

### Collection Types

```typescript
await schema.createTable('scylla_collections', (table) => {
  table.uuid('id').primary();
  
  // List (ordered collection, allows duplicates)
  table.list('tags', 'text');          // LIST<TEXT>
  table.list('scores', 'int');         // LIST<INT>
  
  // Set (unordered collection, no duplicates)
  table.set('categories', 'text');     // SET<TEXT>
  table.set('user_ids', 'uuid');       // SET<UUID>
  
  // Map (key-value pairs)
  table.map('attributes', 'text', 'text');     // MAP<TEXT, TEXT>
  table.map('counters', 'text', 'counter');    // MAP<TEXT, COUNTER>
  
  // Frozen collections (immutable, can be used in WHERE clauses)
  table.frozenList('frozen_tags', 'text');
  table.frozenSet('frozen_categories', 'text');
  table.frozenMap('frozen_attrs', 'text', 'text');
});
```

### User-Defined Types

```typescript
// First, create a user-defined type
await schema.createType('address', (type) => {
  type.text('street');
  type.text('city');
  type.text('state');
  type.text('zip_code');
  type.text('country');
});

// Use the UDT in a table
await schema.createTable('users_with_address', (table) => {
  table.uuid('id').primary();
  table.text('name');
  
  // Use the user-defined type
  table.userType('address', 'address');
  
  // Frozen UDT (immutable)
  table.frozenUserType('billing_address', 'address');
  
  // Collection of UDTs
  table.list('previous_addresses', 'frozen<address>');
});
```

### Tuple Types

```typescript
await schema.createTable('scylla_tuples', (table) => {
  table.uuid('id').primary();
  
  // Tuple type (ordered, fixed-size collection)
  table.tuple('coordinates', ['double', 'double']);  // TUPLE<DOUBLE, DOUBLE>
  table.tuple('name_age', ['text', 'int']);          // TUPLE<TEXT, INT>
  
  // Frozen tuple
  table.frozenTuple('frozen_coords', ['double', 'double']);
});
```

## Column Modifiers

### Constraints and Properties

```typescript
await schema.createTable('modified_columns', (table) => {
  // Primary key
  table.uuid('id').primary();
  
  // Nullable/Not nullable
  table.string('required_field').notNull();
  table.string('optional_field').nullable();
  
  // Default values
  table.boolean('is_active').default(true);
  table.integer('count').default(0);
  table.string('status').default('pending');
  table.timestamp('created_at').defaultTo(schema.now());
  
  // Unique constraints
  table.string('email').unique();
  table.string('username').unique('unique_username_idx');
  
  // Auto-increment (SQL databases)
  table.increments('auto_id');
  
  // Unsigned (MySQL)
  table.integer('positive_number').unsigned();
  
  // Comments
  table.string('documented_field').comment('This field stores user preferences');
});
```

### ScyllaDB-Specific Modifiers

```typescript
await schema.createTable('scylla_modifiers', (table) => {
  // Partition keys (required for ScyllaDB)
  table.uuid('user_id');
  table.text('category');
  
  // Clustering keys (optional, determines sort order)
  table.timestamp('created_at');
  table.uuid('id');
  
  // Regular columns
  table.text('content');
  table.counter('view_count');
  
  // Define partition and clustering keys
  table.partitionKey(['user_id', 'category']);
  table.clusteringKey(['created_at', 'id']);
  
  // Static columns (shared across partition)
  table.text('user_name').static();
  table.text('user_email').static();
});
```

## Indexes

### Basic Indexes

```typescript
await schema.createTable('indexed_table', (table) => {
  table.uuid('id').primary();
  table.string('email');
  table.string('username');
  table.timestamp('created_at');
  table.boolean('active');
  
  // Simple index
  table.index('email');
  
  // Named index
  table.index('username', 'idx_username');
  
  // Composite index
  table.index(['active', 'created_at'], 'idx_active_created');
  
  // Unique index
  table.unique('email', 'unique_email');
  table.unique(['username', 'active'], 'unique_username_active');
});

// Add indexes after table creation
await schema.alterTable('users', (table) => {
  table.index('last_login');
  table.index(['status', 'created_at'], 'idx_status_created');
});
```

### Advanced Index Types

```typescript
// PostgreSQL specific indexes
await schema.createTable('postgres_indexes', (table) => {
  table.uuid('id').primary();
  table.string('title');
  table.text('content');
  table.json('metadata');
  table.boolean('published');
  
  // Partial index
  table.index('title', 'idx_published_titles')
    .where('published = true');
  
  // Expression index
  table.index('lower(title)', 'idx_lower_title');
  
  // GIN index for JSON
  table.index('metadata', 'idx_metadata_gin')
    .using('gin');
  
  // Full-text search index
  table.index('to_tsvector(\'english\', title || \' \' || content)', 'idx_fulltext')
    .using('gin');
});

// MySQL specific indexes
await schema.createTable('mysql_indexes', (table) => {
  table.increments('id');
  table.string('title');
  table.text('content');
  
  // Full-text index
  table.fulltext(['title', 'content'], 'ft_title_content');
  
  // Spatial index (for geometry columns)
  table.geometry('location');
  table.spatialIndex('location', 'spatial_location');
});
```

### ScyllaDB Secondary Indexes

```typescript
// Create table first
await schema.createTable('scylla_indexed', (table) => {
  table.uuid('user_id');
  table.timestamp('created_at');
  table.uuid('id');
  table.text('status');
  table.text('category');
  table.list('tags', 'text');
  
  table.partitionKey(['user_id']);
  table.clusteringKey(['created_at', 'id']);
});

// Add secondary indexes
await schema.createIndex('scylla_indexed', 'status', 'idx_status');
await schema.createIndex('scylla_indexed', 'category', 'idx_category');

// Index on collection
await schema.createIndex('scylla_indexed', 'tags', 'idx_tags');

// SASI index for advanced text search
await schema.raw(`
  CREATE CUSTOM INDEX IF NOT EXISTS idx_status_sasi 
  ON scylla_indexed (status) 
  USING 'org.apache.cassandra.index.sasi.SASIIndex'
  WITH OPTIONS = {
    'mode': 'CONTAINS',
    'analyzer_class': 'org.apache.cassandra.index.sasi.analyzer.StandardAnalyzer',
    'case_sensitive': 'false'
  }
`);
```

## Constraints

### Foreign Key Constraints

```typescript
await schema.createTable('posts', (table) => {
  table.uuid('id').primary();
  table.string('title');
  table.uuid('user_id');
  table.uuid('category_id').nullable();
  
  // Basic foreign key
  table.foreign('user_id').references('id').on('users');
  
  // Named foreign key with cascade options
  table.foreign('category_id', 'fk_posts_category')
    .references('id')
    .on('categories')
    .onDelete('SET NULL')
    .onUpdate('CASCADE');
});

// Add foreign keys to existing table
await schema.alterTable('comments', (table) => {
  table.foreign('post_id')
    .references('id')
    .on('posts')
    .onDelete('CASCADE');
});
```

### Check Constraints

```typescript
await schema.createTable('products', (table) => {
  table.uuid('id').primary();
  table.string('name');
  table.decimal('price', 10, 2);
  table.integer('quantity');
  table.string('status');
  
  // Check constraints
  table.check('price > 0', 'check_positive_price');
  table.check('quantity >= 0', 'check_non_negative_quantity');
  table.check('status IN (\'active\', \'inactive\', \'discontinued\')', 'check_valid_status');
});
```

### Unique Constraints

```typescript
await schema.createTable('users', (table) => {
  table.uuid('id').primary();
  table.string('email');
  table.string('username');
  table.string('phone').nullable();
  
  // Single column unique
  table.unique('email');
  table.unique('username', 'unique_username');
  
  // Multi-column unique
  table.unique(['email', 'phone'], 'unique_email_phone');
});
```

## Table Options

### SQL Database Options

```typescript
await schema.createTable('mysql_options', (table) => {
  table.increments('id');
  table.string('name');
  table.timestamps();
}, {
  // MySQL specific options
  engine: 'InnoDB',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: 'User data table'
});

await schema.createTable('postgres_options', (table) => {
  table.uuid('id').primary();
  table.string('name');
  table.timestamps();
}, {
  // PostgreSQL specific options
  tablespace: 'fast_ssd',
  withOids: false,
  inherits: 'base_table'
});
```

### ScyllaDB Table Options

```typescript
await schema.createTable('scylla_options', (table) => {
  table.uuid('user_id');
  table.timestamp('created_at');
  table.uuid('id');
  table.text('content');
  
  table.partitionKey(['user_id']);
  table.clusteringKey(['created_at', 'id']);
  
  // ScyllaDB specific table options
  table.withOptions({
    // Clustering order
    clusteringOrder: [
      ['created_at', 'DESC'],
      ['id', 'ASC']
    ],
    
    // Compaction strategy
    compaction: {
      class: 'SizeTieredCompactionStrategy',
      max_threshold: 32,
      min_threshold: 4
    },
    
    // Compression
    compression: {
      sstable_compression: 'LZ4Compressor',
      chunk_length_kb: 64
    },
    
    // Garbage collection grace seconds
    gcGraceSeconds: 864000, // 10 days
    
    // Default TTL
    defaultTimeToLive: 2592000, // 30 days
    
    // Bloom filter false positive chance
    bloomFilterFpChance: 0.01,
    
    // Caching
    caching: {
      keys: 'ALL',
      rows_per_partition: 'NONE'
    },
    
    // Comment
    comment: 'User events table with time-based partitioning'
  });
});
```

## Altering Tables

### Adding Columns

```typescript
await schema.alterTable('users', (table) => {
  // Add single column
  table.string('phone').nullable();
  
  // Add multiple columns
  table.date('birth_date').nullable();
  table.boolean('is_verified').default(false);
  table.json('preferences').nullable();
  
  // Add column with index
  table.string('status').default('active').index();
  
  // Add foreign key column
  table.uuid('manager_id').nullable();
  table.foreign('manager_id').references('id').on('users');
});
```

### Modifying Columns

```typescript
await schema.alterTable('posts', (table) => {
  // Change column type
  table.text('content').alter(); // Change from string to text
  
  // Change nullable
  table.string('title').notNull().alter();
  
  // Change default value
  table.boolean('published').default(true).alter();
  
  // Rename column
  table.renameColumn('old_name', 'new_name');
});
```

### Dropping Columns and Constraints

```typescript
await schema.alterTable('users', (table) => {
  // Drop columns
  table.dropColumn('old_field');
  table.dropColumns(['field1', 'field2']);
  
  // Drop indexes
  table.dropIndex('email');
  table.dropIndex('idx_custom_name');
  
  // Drop foreign keys
  table.dropForeign('user_id');
  table.dropForeign('fk_custom_name');
  
  // Drop unique constraints
  table.dropUnique('email');
  table.dropUnique('unique_custom_name');
});
```

## Views

### Creating Views

```typescript
// Simple view
await schema.createView('active_users', `
  SELECT id, name, email, created_at 
  FROM users 
  WHERE active = true
`);

// View with joins
await schema.createView('user_post_counts', `
  SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(p.id) as post_count
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  GROUP BY u.id, u.name, u.email
`);

// Materialized view (PostgreSQL)
await schema.createMaterializedView('popular_posts', `
  SELECT 
    p.id,
    p.title,
    p.view_count,
    u.name as author_name
  FROM posts p
  JOIN users u ON p.user_id = u.id
  WHERE p.view_count > 1000
  ORDER BY p.view_count DESC
`);
```

### ScyllaDB Materialized Views

```typescript
// Create base table
await schema.createTable('user_events', (table) => {
  table.uuid('user_id');
  table.timestamp('event_time');
  table.uuid('event_id');
  table.text('event_type');
  table.text('data');
  
  table.partitionKey(['user_id']);
  table.clusteringKey(['event_time', 'event_id']);
});

// Create materialized view for querying by event_type
await schema.createMaterializedView('events_by_type', 'user_events', (view) => {
  view.select('*');
  view.partitionKey(['event_type']);
  view.clusteringKey(['event_time', 'user_id', 'event_id']);
  view.where('user_id IS NOT NULL')
      .where('event_time IS NOT NULL')
      .where('event_id IS NOT NULL')
      .where('event_type IS NOT NULL');
});
```

## Raw Queries

### Executing Raw SQL

```typescript
// Execute raw DDL
await schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

// Create custom index
await schema.raw(`
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower 
  ON users (LOWER(email))
`);

// Create trigger (PostgreSQL)
await schema.raw(`
  CREATE OR REPLACE FUNCTION update_modified_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ language 'plpgsql'
`);

await schema.raw(`
  CREATE TRIGGER update_users_modtime 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_modified_column()
`);
```

### ScyllaDB Raw CQL

```typescript
// Create keyspace
await schema.raw(`
  CREATE KEYSPACE IF NOT EXISTS my_app 
  WITH REPLICATION = {
    'class': 'SimpleStrategy',
    'replication_factor': 3
  }
`);

// Create custom index with SASI
await schema.raw(`
  CREATE CUSTOM INDEX IF NOT EXISTS idx_content_sasi 
  ON posts (content) 
  USING 'org.apache.cassandra.index.sasi.SASIIndex'
  WITH OPTIONS = {
    'mode': 'CONTAINS',
    'analyzer_class': 'org.apache.cassandra.index.sasi.analyzer.StandardAnalyzer',
    'case_sensitive': 'false'
  }
`);

// Create user-defined function
await schema.raw(`
  CREATE OR REPLACE FUNCTION state_group_and_count(state map<text, int>)
  CALLED ON NULL INPUT
  RETURNS map<text, int>
  LANGUAGE java AS '
    if (state.isEmpty()) {
      state.put("count", 1);
    } else {
      Integer count = (Integer) state.get("count");
      state.put("count", count + 1);
    }
    return state;
  '
`);
```

## Schema Introspection

### Checking Schema Information

```typescript
// Check if table exists
const hasUsersTable = await schema.hasTable('users');

// Check if column exists
const hasEmailColumn = await schema.hasColumn('users', 'email');

// Get table information
const tableInfo = await schema.getTableInfo('users');
console.log(tableInfo.columns);
console.log(tableInfo.indexes);
console.log(tableInfo.foreignKeys);

// Get column information
const columnInfo = await schema.getColumnInfo('users', 'email');
console.log(columnInfo.type);
console.log(columnInfo.nullable);
console.log(columnInfo.defaultValue);

// List all tables
const tables = await schema.getAllTables();

// List all indexes for a table
const indexes = await schema.getTableIndexes('users');
```

### Database-Specific Introspection

```typescript
// PostgreSQL specific
const pgSchema = schema as PostgreSQLSchema;

// Get table size
const tableSize = await pgSchema.getTableSize('users');

// Get index usage statistics
const indexStats = await pgSchema.getIndexStats('users');

// ScyllaDB specific
const scyllaSchema = schema as ScyllaDBSchema;

// Get keyspace information
const keyspaceInfo = await scyllaSchema.getKeyspaceInfo();

// Get table schema
const tableSchema = await scyllaSchema.getTableSchema('users');
console.log(tableSchema.partitionKeys);
console.log(tableSchema.clusteringKeys);
```

## Advanced Schema Patterns

### Polymorphic Tables

```typescript
// Create polymorphic relationship table
await schema.createTable('comments', (table) => {
  table.uuid('id').primary();
  table.text('content');
  table.uuid('user_id');
  
  // Polymorphic columns
  table.string('commentable_type'); // 'Post', 'Video', etc.
  table.uuid('commentable_id');     // ID of the related record
  
  table.timestamps();
  
  // Indexes for polymorphic queries
  table.index(['commentable_type', 'commentable_id']);
  table.index('user_id');
  
  table.foreign('user_id').references('id').on('users');
});
```

### Audit Tables

```typescript
// Create audit table for tracking changes
await schema.createTable('user_audits', (table) => {
  table.uuid('id').primary();
  table.uuid('user_id');
  table.string('action'); // 'CREATE', 'UPDATE', 'DELETE'
  table.json('old_values').nullable();
  table.json('new_values').nullable();
  table.uuid('changed_by').nullable();
  table.timestamp('changed_at').defaultTo(schema.now());
  
  table.index(['user_id', 'changed_at']);
  table.index('action');
  
  table.foreign('user_id').references('id').on('users');
  table.foreign('changed_by').references('id').on('users');
});
```

### Time-Series Tables (ScyllaDB)

```typescript
// Time-series table optimized for ScyllaDB
await schema.createTable('metrics', (table) => {
  // Partition by metric name and time bucket
  table.text('metric_name');
  table.date('date_bucket'); // Daily buckets
  
  // Clustering by timestamp for time-series queries
  table.timestamp('timestamp');
  table.uuid('id');
  
  // Metric data
  table.double('value');
  table.map('tags', 'text', 'text');
  
  table.partitionKey(['metric_name', 'date_bucket']);
  table.clusteringKey(['timestamp', 'id']);
  
  table.withOptions({
    clusteringOrder: [['timestamp', 'DESC']],
    defaultTimeToLive: 2592000, // 30 days
    compaction: {
      class: 'TimeWindowCompactionStrategy',
      compaction_window_unit: 'DAYS',
      compaction_window_size: 1
    }
  });
});
```

## Testing Schema Changes

### Schema Testing

```typescript
// __tests__/schema/users.test.ts
describe('Users Table Schema', () => {
  let schema: Schema;
  
  beforeAll(async () => {
    schema = connectionManager.getSchema();
  });
  
  beforeEach(async () => {
    // Clean up before each test
    await schema.dropTableIfExists('users');
  });
  
  test('should create users table with correct structure', async () => {
    await schema.createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('name');
      table.string('email').unique();
      table.timestamps();
    });
    
    // Verify table exists
    expect(await schema.hasTable('users')).toBe(true);
    
    // Verify columns
    expect(await schema.hasColumn('users', 'id')).toBe(true);
    expect(await schema.hasColumn('users', 'name')).toBe(true);
    expect(await schema.hasColumn('users', 'email')).toBe(true);
    expect(await schema.hasColumn('users', 'created_at')).toBe(true);
    expect(await schema.hasColumn('users', 'updated_at')).toBe(true);
    
    // Verify indexes
    const indexes = await schema.getTableIndexes('users');
    expect(indexes.some(idx => idx.columns.includes('email'))).toBe(true);
  });
  
  test('should handle column modifications', async () => {
    // Create initial table
    await schema.createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('name');
    });
    
    // Add column
    await schema.alterTable('users', (table) => {
      table.string('email').nullable();
    });
    
    expect(await schema.hasColumn('users', 'email')).toBe(true);
    
    // Modify column
    await schema.alterTable('users', (table) => {
      table.string('email').notNull().alter();
    });
    
    const columnInfo = await schema.getColumnInfo('users', 'email');
    expect(columnInfo.nullable).toBe(false);
  });
});
```

## Best Practices

### 1. Use Appropriate Data Types

```typescript
// ✅ Good: Use appropriate types
await schema.createTable('products', (table) => {
  table.uuid('id').primary();           // UUID for distributed systems
  table.string('name', 255);            // Reasonable length limit
  table.decimal('price', 10, 2);        // Precise decimal for money
  table.integer('quantity');            // Integer for counts
  table.boolean('active');              // Boolean for flags
  table.timestamp('created_at');        // Timestamp for dates
});

// ❌ Bad: Inappropriate types
await schema.createTable('products', (table) => {
  table.string('id');                   // String for ID (inefficient)
  table.text('name');                   // Text for short strings (wasteful)
  table.float('price');                 // Float for money (imprecise)
  table.string('quantity');             // String for numbers (wrong type)
  table.string('active');               // String for boolean (confusing)
});
```

### 2. Design for Your Database

```typescript
// ✅ Good: ScyllaDB optimized
await schema.createTable('user_events', (table) => {
  table.uuid('user_id');               // Partition key
  table.timestamp('event_time');       // Clustering key
  table.uuid('event_id');              // Clustering key
  table.text('event_type');
  
  table.partitionKey(['user_id']);
  table.clusteringKey(['event_time', 'event_id']);
});

// ✅ Good: SQL optimized
await schema.createTable('orders', (table) => {
  table.increments('id');              // Auto-increment PK
  table.integer('user_id').index();    // Foreign key with index
  table.decimal('total', 10, 2);
  table.timestamps();
  
  table.foreign('user_id').references('id').on('users');
});
```

### 3. Use Indexes Wisely

```typescript
// ✅ Good: Strategic indexing
await schema.createTable('posts', (table) => {
  table.uuid('id').primary();
  table.string('title');
  table.text('content');
  table.uuid('user_id');
  table.boolean('published');
  table.timestamp('created_at');
  
  // Index frequently queried columns
  table.index('user_id');              // For author queries
  table.index(['published', 'created_at']); // For published posts by date
  table.index('title');                // For title searches
});

// ❌ Bad: Over-indexing
await schema.createTable('posts', (table) => {
  table.uuid('id').primary();
  table.string('title').index();       // Every column indexed
  table.text('content').index();       // Text indexing (expensive)
  table.uuid('user_id').index();
  table.boolean('published').index();
  table.timestamp('created_at').index();
  table.timestamp('updated_at').index();
});
```

### 4. Plan for Growth

```typescript
// ✅ Good: Scalable design
await schema.createTable('user_activities', (table) => {
  // Partition by user and time bucket for even distribution
  table.uuid('user_id');
  table.date('activity_date');
  table.timestamp('activity_time');
  table.uuid('activity_id');
  
  table.partitionKey(['user_id', 'activity_date']);
  table.clusteringKey(['activity_time', 'activity_id']);
  
  // TTL for automatic cleanup
  table.withOptions({
    defaultTimeToLive: 7776000 // 90 days
  });
});
```

### 5. Document Your Schema

```typescript
// ✅ Good: Well-documented schema
await schema.createTable('users', (table) => {
  table.uuid('id').primary()
    .comment('Unique identifier for the user');
    
  table.string('email').unique()
    .comment('User email address, used for login');
    
  table.string('name')
    .comment('User display name');
    
  table.boolean('email_verified').default(false)
    .comment('Whether the user has verified their email address');
    
  table.timestamp('last_login').nullable()
    .comment('Timestamp of the user\'s last login');
    
  table.timestamps();
});
```

The Schema Builder is a powerful tool for managing your database structure in ScyllinX. By understanding its capabilities and following best practices, you can create efficient, scalable database schemas that work well with both SQL databases and ScyllaDB.
