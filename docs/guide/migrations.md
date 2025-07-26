# Migrations

Migrations provide version control for your database schema, allowing you to modify your database structure in a structured and reversible way. ScyllinX migrations support both SQL databases and ScyllaDB with their specific features.

## Introduction to Migrations

Migrations are like version control for your database. They allow you to:

- **Track Changes**: Keep a history of all database schema changes
- **Collaborate**: Share schema changes with your team
- **Deploy**: Apply changes consistently across environments
- **Rollback**: Undo changes if something goes wrong
- **Automate**: Run schema changes as part of your deployment process

## Creating Migrations

### Migration File Structure

Migration files follow a specific naming convention:

```
YYYY_MM_DD_HHMMSS_migration_description.ts
```

Example: `2024_01_15_143022_create_users_table.ts`

### Basic Migration Class

```typescript
import { Migration, Schema } from 'scyllinx';

export class CreateUsersTable extends Migration {
  /**
   * Run the migration
   */
  async up(schema: Schema): Promise<void> {
    await schema.createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.timestamps();
    });
  }

  /**
   * Reverse the migration
   */
  async down(schema: Schema): Promise<void> {
    await schema.dropTable('users');
  }
}
```

### Generating Migrations

You can create migration files manually or use a generator:

```typescript
// src/cli/generate-migration.ts
import fs from 'fs';
import path from 'path';

export function generateMigration(name: string): string {
  const timestamp = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '_')
    .split('.')[0];
  
  const className = name.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  const filename = `${timestamp}_${name}.ts`;
  
  const template = `import { Migration, Schema } from 'scyllinx';

export class ${className} extends Migration {
  async up(schema: Schema): Promise<void> {
    // Add your migration logic here
  }

  async down(schema: Schema): Promise<void> {
    // Add your rollback logic here
  }
}
`;

  const migrationPath = path.join(process.cwd(), 'src/migrations', filename);
  fs.writeFileSync(migrationPath, template);
  
  console.log(`Migration created: ${filename}`);
  return filename;
}

// Usage
generateMigration('create_posts_table');
```

## Table Operations

### Creating Tables

```typescript
export class CreatePostsTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable('posts', (table) => {
      // Primary key
      table.uuid('id').primary();
      
      // Basic columns
      table.string('title');
      table.text('content');
      table.string('slug').unique();
      
      // Foreign keys
      table.uuid('user_id');
      table.uuid('category_id').nullable();
      
      // Boolean columns
      table.boolean('published').default(false);
      
      // Numeric columns
      table.integer('view_count').default(0);
      table.decimal('rating', 3, 2).nullable();
      
      // Date columns
      table.timestamp('published_at').nullable();
      table.timestamps(); // created_at, updated_at
      
      // Indexes
      table.index('user_id');
      table.index('slug');
      table.index(['published', 'created_at']);
      
      // Foreign key constraints (SQL databases)
      table.foreign('user_id').references('id').on('users');
      table.foreign('category_id').references('id').on('categories');
    });
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable('posts');
  }
}
```

### ScyllaDB-Specific Table Creation

```typescript
export class CreateUserEventsTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable('user_events', (table) => {
      // Partition keys (required for ScyllaDB)
      table.uuid('user_id');
      
      // Clustering keys (optional, determines sort order)
      table.timestamp('event_time');
      table.uuid('event_id');
      
      // Regular columns
      table.string('event_type');
      table.json('event_data');
      table.string('ip_address').nullable();
      
      // Define partition and clustering keys
      table.partitionKey(['user_id']);
      table.clusteringKey(['event_time', 'event_id']);
      
      // Table options specific to ScyllaDB
      table.withOptions({
        clusteringOrder: [['event_time', 'DESC'], ['event_id', 'ASC']],
        compaction: {
          class: 'SizeTieredCompactionStrategy',
          max_threshold: 32,
          min_threshold: 4
        },
        compression: {
          sstable_compression: 'LZ4Compressor'
        },
        gcGraceSeconds: 864000, // 10 days
        defaultTimeToLive: 2592000 // 30 days
      });
    });
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable('user_events');
  }
}
```

### Modifying Tables

```typescript
export class AddColumnsToUsersTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.alterTable('users', (table) => {
      // Add new columns
      table.string('phone').nullable();
      table.date('birth_date').nullable();
      table.boolean('is_verified').default(false);
      table.json('preferences').nullable();
      
      // Add indexes
      table.index('phone');
      table.index('is_verified');
    });
  }

  async down(schema: Schema): Promise<void> {
    await schema.alterTable('users', (table) => {
      // Remove columns (order matters for rollback)
      table.dropIndex('is_verified');
      table.dropIndex('phone');
      
      table.dropColumn('preferences');
      table.dropColumn('is_verified');
      table.dropColumn('birth_date');
      table.dropColumn('phone');
    });
  }
}
```

### Renaming and Dropping

```typescript
export class RenameAndCleanupTables extends Migration {
  async up(schema: Schema): Promise<void> {
    // Rename table
    await schema.renameTable('old_posts', 'posts');
    
    // Rename column
    await schema.alterTable('users', (table) => {
      table.renameColumn('username', 'name');
    });
    
    // Drop unused table
    await schema.dropTableIfExists('temp_data');
  }

  async down(schema: Schema): Promise<void> {
    // Recreate dropped table (if needed)
    await schema.createTable('temp_data', (table) => {
      table.uuid('id').primary();
      table.json('data');
    });
    
    // Rename column back
    await schema.alterTable('users', (table) => {
      table.renameColumn('name', 'username');
    });
    
    // Rename table back
    await schema.renameTable('posts', 'old_posts');
  }
}
```

## Column Types

### Basic Column Types

```typescript
await schema.createTable('examples', (table) => {
  // String types
  table.string('name', 255);           // VARCHAR(255)
  table.text('description');           // TEXT
  table.char('code', 10);             // CHAR(10)
  
  // Numeric types
  table.integer('count');              // INTEGER
  table.bigInteger('big_count');       // BIGINT
  table.decimal('price', 10, 2);       // DECIMAL(10,2)
  table.float('rating');               // FLOAT
  table.double('precise_value');       // DOUBLE
  
  // Boolean
  table.boolean('is_active');          // BOOLEAN
  
  // Date and time
  table.date('birth_date');            // DATE
  table.time('start_time');            // TIME
  table.timestamp('created_at');       // TIMESTAMP
  table.datetime('updated_at');        // DATETIME
  
  // JSON and binary
  table.json('metadata');              // JSON
  table.binary('file_data');           // BINARY
  
  // UUID
  table.uuid('id');                    // UUID
  
  // Enum (database-specific)
  table.enum('status', ['active', 'inactive', 'pending']);
});
```

### ScyllaDB-Specific Column Types

```typescript
await schema.createTable('scylla_examples', (table) => {
  // ScyllaDB native types
  table.uuid('id');                    // UUID
  table.timeuuid('time_id');          // TIMEUUID
  table.inet('ip_address');           // INET
  table.counter('view_count');        // COUNTER
  
  // Collection types
  table.list('tags', 'text');         // LIST<TEXT>
  table.set('categories', 'text');    // SET<TEXT>
  table.map('attributes', 'text', 'text'); // MAP<TEXT, TEXT>
  
  // Frozen collections
  table.frozenList('frozen_tags', 'text');
  table.frozenSet('frozen_categories', 'text');
  table.frozenMap('frozen_attrs', 'text', 'text');
  
  // User-defined types (if defined)
  table.userType('address', 'address_type');
  table.frozenUserType('frozen_address', 'address_type');
});
```

### Column Modifiers

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
  table.timestamp('created_at').defaultTo(schema.now());
  
  // Unique constraints
  table.string('email').unique();
  table.string('username').unique('unique_username');
  
  // Indexes
  table.string('searchable').index();
  table.string('indexed_field').index('custom_index_name');
  
  // Comments
  table.string('documented_field').comment('This field stores important data');
  
  // Auto-increment (SQL databases only)
  table.increments('auto_id'); // AUTO_INCREMENT PRIMARY KEY
  
  // Unsigned (MySQL)
  table.integer('positive_number').unsigned();
  
  // Character set and collation (MySQL)
  table.string('utf8_field').charset('utf8mb4').collate('utf8mb4_unicode_ci');
});
```

## Indexes and Constraints

### Creating Indexes

```typescript
export class AddIndexesToPostsTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.alterTable('posts', (table) => {
      // Simple index
      table.index('user_id');
      
      // Named index
      table.index('slug', 'idx_posts_slug');
      
      // Composite index
      table.index(['published', 'created_at'], 'idx_posts_published_date');
      
      // Unique index
      table.unique('slug', 'unique_posts_slug');
      
      // Partial index (PostgreSQL)
      table.index('title', 'idx_published_posts_title')
        .where('published = true');
      
      // Full-text index (MySQL)
      table.fulltext(['title', 'content'], 'ft_posts_content');
    });
  }

  async down(schema: Schema): Promise<void> {
    await schema.alterTable('posts', (table) => {
      table.dropIndex('ft_posts_content');
      table.dropIndex('idx_published_posts_title');
      table.dropIndex('unique_posts_slug');
      table.dropIndex('idx_posts_published_date');
      table.dropIndex('idx_posts_slug');
      table.dropIndex('user_id'); // Drops default index name
    });
  }
}
```

### ScyllaDB Secondary Indexes

```typescript
export class AddScyllaIndexes extends Migration {
  async up(schema: Schema): Promise<void> {
    // Secondary index on regular column
    await schema.createIndex('user_events', 'event_type', 'idx_events_type');
    
    // Secondary index on collection
    await schema.createIndex('posts', 'tags', 'idx_posts_tags');
    
    // Custom index with options
    await schema.raw(`
      CREATE INDEX IF NOT EXISTS idx_events_data 
      ON user_events (event_data) 
      USING 'org.apache.cassandra.index.sasi.SASIIndex'
    `);
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropIndex('user_events', 'idx_events_data');
    await schema.dropIndex('posts', 'idx_posts_tags');
    await schema.dropIndex('user_events', 'idx_events_type');
  }
}
```

### Foreign Key Constraints

```typescript
export class AddForeignKeyConstraints extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.alterTable('posts', (table) => {
      // Basic foreign key
      table.foreign('user_id').references('id').on('users');
      
      // Named foreign key with options
      table.foreign('category_id', 'fk_posts_category')
        .references('id')
        .on('categories')
        .onDelete('SET NULL')
        .onUpdate('CASCADE');
      
      // Composite foreign key
      table.foreign(['user_id', 'team_id'], 'fk_posts_user_team')
        .references(['user_id', 'team_id'])
        .on('team_members');
    });
  }

  async down(schema: Schema): Promise<void> {
    await schema.alterTable('posts', (table) => {
      table.dropForeign(['user_id', 'team_id'], 'fk_posts_user_team');
      table.dropForeign('category_id', 'fk_posts_category');
      table.dropForeign('user_id'); // Drops default constraint name
    });
  }
}
```

## Data Migrations

### Seeding Data During Migration

```typescript
export class SeedInitialData extends Migration {
  async up(schema: Schema): Promise<void> {
    // Create admin user
    await schema.table('users').insert({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Administrator',
      email: 'admin@example.com',
      password: await this.hashPassword('admin123'),
      is_admin: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Create default categories
    const categories = [
      { id: '1', name: 'Technology', slug: 'technology' },
      { id: '2', name: 'Science', slug: 'science' },
      { id: '3', name: 'Business', slug: 'business' }
    ];
    
    await schema.table('categories').insert(categories);
    
    // Create default settings
    const settings = [
      { key: 'site_name', value: 'My Blog' },
      { key: 'site_description', value: 'A blog about technology' },
      { key: 'posts_per_page', value: '10' }
    ];
    
    await schema.table('settings').insert(settings);
  }

  async down(schema: Schema): Promise<void> {
    // Remove seeded data
    await schema.table('settings').where('key', 'in', [
      'site_name', 'site_description', 'posts_per_page'
    ]).delete();
    
    await schema.table('categories').where('id', 'in', ['1', '2', '3']).delete();
    
    await schema.table('users')
      .where('id', '00000000-0000-0000-0000-000000000001')
      .delete();
  }
  
  private async hashPassword(password: string): Promise<string> {
    // Implement password hashing
    return password; // Simplified for example
  }
}
```

### Data Transformation Migrations

```typescript
export class TransformUserData extends Migration {
  async up(schema: Schema): Promise<void> {
    // Get all users
    const users = await schema.table('users').select('*');
    
    for (const user of users) {
      // Transform full_name to first_name and last_name
      const nameParts = user.full_name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Update user record
      await schema.table('users')
        .where('id', user.id)
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date()
        });
    }
    
    // Remove old column
    await schema.alterTable('users', (table) => {
      table.dropColumn('full_name');
    });
  }

  async down(schema: Schema): Promise<void> {
    // Add back full_name column
    await schema.alterTable('users', (table) => {
      table.string('full_name').nullable();
    });
    
    // Restore full_name from first_name and last_name
    const users = await schema.table('users').select('*');
    
    for (const user of users) {
      const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(' ');
      
      await schema.table('users')
        .where('id', user.id)
        .update({
          full_name: fullName,
          updated_at: new Date()
        });
    }
    
    // Remove new columns
    await schema.alterTable('users', (table) => {
      table.dropColumn('last_name');
      table.dropColumn('first_name');
    });
  }
}
```

## Running Migrations

### Migration Manager

```typescript
// src/migration/MigrationRunner.ts
import { ConnectionManager, MigrationManager } from 'scyllinx';
import { databaseConfig } from '../config/database';

// Import all migrations
import { CreateUsersTable } from '../migrations/2024_01_01_000001_create_users_table';
import { CreatePostsTable } from '../migrations/2024_01_01_000002_create_posts_table';
import { AddIndexesToPostsTable } from '../migrations/2024_01_02_000001_add_indexes_to_posts_table';

export class MigrationRunner {
  private connectionManager: ConnectionManager;
  private migrationManager: MigrationManager;
  
  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
    this.migrationManager = new MigrationManager(this.connectionManager);
  }
  
  async initialize(): Promise<void> {
    await this.connectionManager.initialize(databaseConfig);
  }
  
  async runMigrations(): Promise<void> {
    const migrations = [
      new CreateUsersTable(),
      new CreatePostsTable(),
      new AddIndexesToPostsTable()
    ];
    
    console.log('Running migrations...');
    
    for (const migration of migrations) {
      try {
        await this.migrationManager.migrate(migration);
        console.log(`✅ ${migration.constructor.name} completed`);
      } catch (error) {
        console.error(`❌ ${migration.constructor.name} failed:`, error);
        throw error;
      }
    }
    
    console.log('All migrations completed successfully!');
  }
  
  async rollbackMigrations(steps = 1): Promise<void> {
    console.log(`Rolling back ${steps} migration(s)...`);
    
    try {
      await this.migrationManager.rollback(steps);
      console.log('Rollback completed successfully!');
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }
  
  async getMigrationStatus(): Promise<void> {
    const status = await this.migrationManager.getStatus();
    
    console.log('\nMigration Status:');
    console.log('================');
    
    status.forEach(migration => {
      const status = migration.executed ? '✅ Executed' : '⏳ Pending';
      const date = migration.executed_at ? 
        ` (${migration.executed_at.toISOString()})` : '';
      
      console.log(`${status} ${migration.name}${date}`);
    });
  }
  
  async resetDatabase(): Promise<void> {
    console.log('Resetting database...');
    
    try {
      await this.migrationManager.reset();
      console.log('Database reset completed!');
    } catch (error) {
      console.error('Database reset failed:', error);
      throw error;
    }
  }
}
```

### CLI Commands

```typescript
// src/cli/migrate.ts
import { MigrationRunner } from '../migration/MigrationRunner';

async function main() {
  const runner = new MigrationRunner();
  await runner.initialize();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'up':
    case 'migrate':
      await runner.runMigrations();
      break;
      
    case 'down':
    case 'rollback':
      const steps = parseInt(process.argv[3]) || 1;
      await runner.rollbackMigrations(steps);
      break;
      
    case 'status':
      await runner.getMigrationStatus();
      break;
      
    case 'reset':
      await runner.resetDatabase();
      break;
      
    case 'fresh':
      await runner.resetDatabase();
      await runner.runMigrations();
      break;
      
    default:
      console.log('Available commands:');
      console.log('  migrate, up     - Run pending migrations');
      console.log('  rollback, down  - Rollback migrations');
      console.log('  status          - Show migration status');
      console.log('  reset           - Reset database');
      console.log('  fresh           - Reset and re-run migrations');
  }
  
  process.exit(0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "migrate": "ts-node src/cli/migrate.ts migrate",
    "migrate:rollback": "ts-node src/cli/migrate.ts rollback",
    "migrate:status": "ts-node src/cli/migrate.ts status",
    "migrate:reset": "ts-node src/cli/migrate.ts reset",
    "migrate:fresh": "ts-node src/cli/migrate.ts fresh",
    "db:seed": "ts-node src/cli/seed.ts"
  }
}
```

## Advanced Migration Patterns

### Conditional Migrations

```typescript
export class ConditionalMigration extends Migration {
  async up(schema: Schema): Promise<void> {
    // Check if column exists before adding
    const hasColumn = await schema.hasColumn('users', 'phone');
    
    if (!hasColumn) {
      await schema.alterTable('users', (table) => {
        table.string('phone').nullable();
      });
    }
    
    // Check if table exists
    const hasTable = await schema.hasTable('user_preferences');
    
    if (!hasTable) {
      await schema.createTable('user_preferences', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id');
        table.string('key');
        table.text('value');
        table.timestamps();
        
        table.unique(['user_id', 'key']);
        table.foreign('user_id').references('id').on('users');
      });
    }
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTableIfExists('user_preferences');
    
    const hasColumn = await schema.hasColumn('users', 'phone');
    if (hasColumn) {
      await schema.alterTable('users', (table) => {
        table.dropColumn('phone');
      });
    }
  }
}
```

### Environment-Specific Migrations

```typescript
export class EnvironmentSpecificMigration extends Migration {
  async up(schema: Schema): Promise<void> {
    const environment = process.env.NODE_ENV || 'development';
    
    if (environment === 'production') {
      // Production-specific changes
      await schema.alterTable('users', (table) => {
        table.index('email'); // Add index for production performance
      });
    } else if (environment === 'development') {
      // Development-specific changes
      await this.seedDevelopmentData(schema);
    }
    
    // Common changes for all environments
    await schema.alterTable('users', (table) => {
      table.timestamp('last_login').nullable();
    });
  }

  async down(schema: Schema): Promise<void> {
    await schema.alterTable('users', (table) => {
      table.dropColumn('last_login');
    });
    
    const environment = process.env.NODE_ENV || 'development';
    
    if (environment === 'production') {
      await schema.alterTable('users', (table) => {
        table.dropIndex('email');
      });
    }
  }
  
  private async seedDevelopmentData(schema: Schema): Promise<void> {
    // Add development test data
    await schema.table('users').insert([
      {
        id: 'dev-user-1',
        name: 'Dev User 1',
        email: 'dev1@example.com',
        password: 'password'
      },
      {
        id: 'dev-user-2',
        name: 'Dev User 2',
        email: 'dev2@example.com',
        password: 'password'
      }
    ]);
  }
}
```

### Batch Processing Migrations

```typescript
export class BatchProcessingMigration extends Migration {
  async up(schema: Schema): Promise<void> {
    // Add new column
    await schema.alterTable('posts', (table) => {
      table.string('slug').nullable();
    });
    
    // Process records in batches to avoid memory issues
    await this.processInBatches(schema, 'posts', 1000, async (batch) => {
      for (const post of batch) {
        const slug = this.generateSlug(post.title);
        
        await schema.table('posts')
          .where('id', post.id)
          .update({ slug });
      }
    });
    
    // Make column non-nullable after processing
    await schema.alterTable('posts', (table) => {
      table.string('slug').notNull().alter();
      table.unique('slug');
    });
  }

  async down(schema: Schema): Promise<void> {
    await schema.alterTable('posts', (table) => {
      table.dropUnique('slug');
      table.dropColumn('slug');
    });
  }
  
  private async processInBatches<T>(
    schema: Schema,
    table: string,
    batchSize: number,
    processor: (batch: T[]) => Promise<void>
  ): Promise<void> {
    let offset = 0;
    let batch: T[];
    
    do {
      batch = await schema.table(table)
        .select('*')
        .limit(batchSize)
        .offset(offset);
      
      if (batch.length > 0) {
        await processor(batch);
        offset += batchSize;
        
        // Log progress
        console.log(`Processed ${offset} records...`);
      }
    } while (batch.length === batchSize);
  }
  
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
```

## Testing Migrations

### Migration Testing

```typescript
// __tests__/migrations/CreateUsersTable.test.ts
import { ConnectionManager, MigrationManager } from 'scyllinx';
import { testDatabaseConfig } from '../../src/config/database.test';
import { CreateUsersTable } from '../../src/migrations/2024_01_01_000001_create_users_table';

describe('CreateUsersTable Migration', () => {
  let connectionManager: ConnectionManager;
  let migrationManager: MigrationManager;
  let migration: CreateUsersTable;
  
  beforeAll(async () => {
    connectionManager = ConnectionManager.getInstance();
    await connectionManager.initialize(testDatabaseConfig);
    migrationManager = new MigrationManager(connectionManager);
    migration = new CreateUsersTable();
  });
  
  afterAll(async () => {
    await connectionManager.closeAllConnections();
  });
  
  beforeEach(async () => {
    // Clean up before each test
    await migrationManager.reset();
  });
  
  test('should create users table', async () => {
    await migrationManager.migrate(migration);
    
    const schema = connectionManager.getSchema();
    const hasTable = await schema.hasTable('users');
    
    expect(hasTable).toBe(true);
  });
  
  test('should create required columns', async () => {
    await migrationManager.migrate(migration);
    
    const schema = connectionManager.getSchema();
    
    expect(await schema.hasColumn('users', 'id')).toBe(true);
    expect(await schema.hasColumn('users', 'name')).toBe(true);
    expect(await schema.hasColumn('users', 'email')).toBe(true);
    expect(await schema.hasColumn('users', 'password')).toBe(true);
    expect(await schema.hasColumn('users', 'created_at')).toBe(true);
    expect(await schema.hasColumn('users', 'updated_at')).toBe(true);
  });
  
  test('should rollback successfully', async () => {
    await migrationManager.migrate(migration);
    await migrationManager.rollback(1);
    
    const schema = connectionManager.getSchema();
    const hasTable = await schema.hasTable('users');
    
    expect(hasTable).toBe(false);
  });
  
  test('should handle duplicate migration attempts', async () => {
    await migrationManager.migrate(migration);
    
    // Second migration should not throw error
    await expect(migrationManager.migrate(migration)).resolves.not.toThrow();
  });
});
```

### Integration Testing

```typescript
// __tests__/migrations/integration.test.ts
describe('Migration Integration', () => {
  test('should run all migrations in sequence', async () => {
    const migrations = [
      new CreateUsersTable(),
      new CreatePostsTable(),
      new AddIndexesToPostsTable()
    ];
    
    for (const migration of migrations) {
      await migrationManager.migrate(migration);
    }
    
    // Verify final state
    const schema = connectionManager.getSchema();
    
    expect(await schema.hasTable('users')).toBe(true);
    expect(await schema.hasTable('posts')).toBe(true);
    expect(await schema.hasIndex('posts', 'user_id')).toBe(true);
  });
  
  test('should rollback migrations in reverse order', async () => {
    // Run migrations
    const migrations = [
      new CreateUsersTable(),
      new CreatePostsTable()
    ];
    
    for (const migration of migrations) {
      await migrationManager.migrate(migration);
    }
    
    // Rollback all
    await migrationManager.rollback(2);
    
    const schema = connectionManager.getSchema();
    expect(await schema.hasTable('posts')).toBe(false);
    expect(await schema.hasTable('users')).toBe(false);
  });
});
```

## Best Practices

### 1. Always Write Reversible Migrations

```typescript
// ✅ Good: Reversible migration
export class AddEmailIndexToUsers extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.alterTable('users', (table) => {
      table.index('email', 'idx_users_email');
    });
  }

  async down(schema: Schema): Promise<void> {
    await schema.alterTable('users', (table) => {
      table.dropIndex('idx_users_email');
    });
  }
}

// ❌ Bad: Non-reversible migration
export class BadMigration extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.raw('DROP TABLE old_data'); // Can't be reversed!
  }

  async down(schema: Schema): Promise<void> {
    // Can't recreate dropped data
  }
}
```

### 2. Use Transactions When Possible

```typescript
export class TransactionalMigration extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.transaction(async (trx) => {
      await trx.alterTable('users', (table) => {
        table.string('new_column');
      });
      
      await trx.table('users').update({
        new_column: 'default_value'
      });
      
      await trx.alterTable('users', (table) => {
        table.string('new_column').notNull().alter();
      });
    });
  }
}
```

### 3. Handle Large Data Sets Carefully

```typescript
// ✅ Good: Process in batches
export class LargeDataMigration extends Migration {
  async up(schema: Schema): Promise<void> {
    const batchSize = 1000;
    let offset = 0;
    let batch;
    
    do {
      batch = await schema.table('large_table')
        .select('*')
        .limit(batchSize)
        .offset(offset);
      
      // Process batch
      for (const record of batch) {
        await this.processRecord(schema, record);
      }
      
      offset += batchSize;
    } while (batch.length === batchSize);
  }
}
```

### 4. Test Migrations Thoroughly

```typescript
// Always test both up and down migrations
test('migration should be reversible', async () => {
  // Run migration
  await migrationManager.migrate(migration);
  
  // Verify changes
  expect(await schema.hasTable('new_table')).toBe(true);
  
  // Rollback
  await migrationManager.rollback(1);
  
  // Verify rollback
  expect(await schema.hasTable('new_table')).toBe(false);
});
```

### 5. Use Descriptive Names

```typescript
// ✅ Good: Descriptive names
2024_01_15_143022_create_users_table.ts
2024_01_15_143045_add_email_index_to_users_table.ts
2024_01_15_143102_create_posts_table_with_foreign_keys.ts

// ❌ Bad: Vague names
2024_01_15_143022_migration1.ts
2024_01_15_143045_update_users.ts
2024_01_15_143102_new_table.ts
```

Migrations are a crucial part of database management in ScyllinX. They provide a structured way to evolve your database schema while maintaining consistency across different environments and enabling collaboration with your team. By following best practices and thoroughly testing your migrations, you can ensure smooth database deployments and easy rollbacks when needed.
