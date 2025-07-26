# Installation

This guide will walk you through installing ScyllinX and setting up your first database connection.

## Prerequisites

Before installing ScyllinX, make sure you have:

- **Node.js** 16.0.0 or higher
- **TypeScript** 4.5 or higher (if using TypeScript)
- **ScyllaDB** or a supported SQL database

## Installing ScyllinX

### Using npm

```bash
npm install scyllinx
```

### Using yarn

```bash
yarn add scyllinx
```

### Using pnpm

```bash
pnpm add scyllinx
```

## Database Drivers

ScyllinX requires additional database drivers depending on which database you're using:

### ScyllaDB / Cassandra

```bash
npm install cassandra-driver
```

### PostgreSQL

```bash
npm install pg
npm install @types/pg  # If using TypeScript
```

### MySQL

```bash
npm install mysql2
```

### SQLite

```bash
npm install sqlite3
```

## TypeScript Configuration

If you're using TypeScript, add these compiler options to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Project Structure

Here's a recommended project structure for a ScyllinX application:

```
my-app/
├── src/
│   ├── models/
│   │   ├── User.ts
│   │   ├── Post.ts
│   │   └── index.ts
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_users_table.ts
│   │   └── 2024_01_01_000002_create_posts_table.ts
│   ├── seeders/
│   │   ├── UserSeeder.ts
│   │   └── DatabaseSeeder.ts
│   ├── factories/
│   │   ├── UserFactory.ts
│   │   └── PostFactory.ts
│   ├── config/
│   │   └── database.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Basic Setup

### 1. Database Configuration

Create a database configuration file:

```typescript
// src/config/database.ts
import { ConnectionConfig } from 'scyllinx';

export const databaseConfig: ConnectionConfig = {
  default: 'scylladb',
  
  connections: {
    scylladb: {
      driver: 'scylladb',
      contactPoints: ['127.0.0.1'],
      localDataCenter: 'datacenter1',
      keyspace: 'my_app',
      credentials: {
        username: 'cassandra',
        password: 'cassandra'
      }
    },
    
    postgres: {
      driver: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'my_app',
      username: 'postgres',
      password: 'password'
    }
  }
};
```

### 2. Initialize Connection

```typescript
// src/index.ts
import { ConnectionManager } from 'scyllinx';
import { databaseConfig } from './config/database';

async function main() {
  // Initialize the connection manager
  const connectionManager = ConnectionManager.getInstance();
  await connectionManager.initialize(databaseConfig);
  
  // Your application code here
  console.log('Database connected successfully!');
}

main().catch(console.error);
```

### 3. Create Your First Model

```typescript
// src/models/User.ts
import { Model } from 'scyllinx';

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
}

export class User extends Model<UserAttributes> {
  protected static table = 'users';
  protected static primaryKey = 'id';
  protected static fillable = ['name', 'email'];
  protected static timestamps = true;
}
```

### 4. Create a Migration

```typescript
// src/migrations/2024_01_01_000001_create_users_table.ts
import { Migration, Schema } from 'scyllinx';

export class CreateUsersTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('name');
      table.string('email').unique();
      table.timestamps();
    });
  }
  
  async down(schema: Schema): Promise<void> {
    await schema.dropTable('users');
  }
}
```

### 5. Run Migration

```typescript
// src/migrate.ts
import { ConnectionManager, MigrationManager } from 'scyllinx';
import { databaseConfig } from './config/database';
import { CreateUsersTable } from './migrations/2024_01_01_000001_create_users_table';

async function runMigrations() {
  const connectionManager = ConnectionManager.getInstance();
  await connectionManager.initialize(databaseConfig);
  
  const migrationManager = new MigrationManager(connectionManager);
  
  const migrations = [
    new CreateUsersTable()
  ];
  
  await migrationManager.migrate(migrations);
  console.log('Migrations completed!');
}

runMigrations().catch(console.error);
```

## Environment Variables

For production applications, use environment variables for sensitive configuration:

```typescript
// src/config/database.ts
export const databaseConfig = {
  default: process.env.DB_CONNECTION || 'scylladb',
  
  connections: {
    scylladb: {
      driver: 'scylladb',
      contactPoints: process.env.SCYLLA_CONTACT_POINTS?.split(',') || ['127.0.0.1'],
      localDataCenter: process.env.SCYLLA_DATACENTER || 'datacenter1',
      keyspace: process.env.SCYLLA_KEYSPACE || 'my_app',
      credentials: {
        username: process.env.SCYLLA_USERNAME || 'cassandra',
        password: process.env.SCYLLA_PASSWORD || 'cassandra'
      }
    }
  }
};
```

Create a `.env` file:

```bash
# .env
DB_CONNECTION=scylladb
SCYLLA_CONTACT_POINTS=127.0.0.1,127.0.0.2,127.0.0.3
SCYLLA_DATACENTER=datacenter1
SCYLLA_KEYSPACE=my_app
SCYLLA_USERNAME=cassandra
SCYLLA_PASSWORD=cassandra
```

## Docker Setup

For development, you can use Docker to run ScyllaDB:

```yaml
# docker-compose.yml
version: '3.8'

services:
  scylladb:
    image: scylladb/scylla:latest
    container_name: scylladb
    ports:
      - "9042:9042"
    environment:
      - SCYLLA_CLUSTER_NAME=test-cluster
      - SCYLLA_DC=datacenter1
      - SCYLLA_RACK=rack1
    volumes:
      - scylla-data:/var/lib/scylla

volumes:
  scylla-data:
```

Start the container:

```bash
docker-compose up -d
```

## Verification

Test your installation with this simple script:

```typescript
// test-connection.ts
import { ConnectionManager, Model } from 'scyllinx';
import { databaseConfig } from './src/config/database';

interface TestAttributes {
  id: string;
  message: string;
}

class TestModel extends Model<TestAttributes> {
  protected static table = 'test_table';
}

async function testConnection() {
  try {
    const connectionManager = ConnectionManager.getInstance();
    await connectionManager.initialize(databaseConfig);
    
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await TestModel.query().raw('SELECT now() as current_time');
    console.log('✅ Query execution successful!', result);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
```

## Common Issues

### Connection Timeout

If you're getting connection timeouts:

```typescript
// Increase connection timeout
connections: {
  scylladb: {
    // ... other config
    socketOptions: {
      connectTimeout: 30000,
      readTimeout: 30000
    }
  }
}
```

### SSL/TLS Issues

For secure connections:

```typescript
connections: {
  scylladb: {
    // ... other config
    sslOptions: {
      rejectUnauthorized: false, // For self-signed certificates
      // cert: fs.readFileSync('path/to/cert.pem'),
      // key: fs.readFileSync('path/to/key.pem'),
      // ca: fs.readFileSync('path/to/ca.pem')
    }
  }
}
```

### TypeScript Errors

Make sure you have the correct TypeScript configuration and that all dependencies are properly installed:

```bash
npm install --save-dev typescript @types/node
```

## Next Steps

Now that you have ScyllinX installed and configured:

1. **[Quick Start](/guide/quick-start)** - Build your first application
2. **[Models](/guide/models)** - Learn about the Active Record pattern
3. **[Query Builder](/guide/query-builder)** - Master database queries
4. **[Migrations](/guide/migrations)** - Manage your database schema

## Getting Help

If you run into issues during installation:

- Check the [GitHub Issues](https://github.com/selori/scyllinx/issues)
- Join our [Discord community](https://discord.gg/scyllinx)
<!-- - Read the [Troubleshooting Guide](/guide/troubleshooting) -->
