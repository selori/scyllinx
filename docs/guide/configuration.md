# Configuration

ScyllinX provides flexible configuration options to connect to various databases including ScyllaDB, PostgreSQL, MySQL, and SQLite. This guide covers all configuration aspects from basic setup to advanced options.

## Database Configuration

### Configuration Structure

ScyllinX uses a centralized configuration object that defines connections, default settings, and database-specific options:

```typescript
// src/config/database.ts
import { DatabaseConfig } from 'scyllinx';

export const databaseConfig: DatabaseConfig = {
  // Default connection name
  default: 'scylladb',
  
  // Connection definitions
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

## ScyllaDB Configuration

### Basic ScyllaDB Setup

```typescript
const scyllaConfig = {
  driver: 'scylladb',
  contactPoints: ['127.0.0.1', '127.0.0.2', '127.0.0.3'],
  localDataCenter: 'datacenter1',
  keyspace: 'my_keyspace',
  credentials: {
    username: 'cassandra',
    password: 'cassandra'
  }
};
```

### Advanced ScyllaDB Options

```typescript
const advancedScyllaConfig = {
  driver: 'scylladb',
  contactPoints: ['node1.scylla.com', 'node2.scylla.com'],
  localDataCenter: 'us-east-1',
  keyspace: 'production_app',
  
  // Authentication
  credentials: {
    username: process.env.SCYLLA_USERNAME,
    password: process.env.SCYLLA_PASSWORD
  },
  
  // Connection pooling
  pooling: {
    coreConnectionsPerHost: {
      [distance.local]: 2,
      [distance.remote]: 1
    },
    maxConnectionsPerHost: {
      [distance.local]: 8,
      [distance.remote]: 2
    }
  },
  
  // Socket options
  socketOptions: {
    connectTimeout: 30000,
    readTimeout: 30000,
    keepAlive: true,
    keepAliveDelay: 0,
    tcpNoDelay: true
  },
  
  // SSL/TLS configuration
  sslOptions: {
    rejectUnauthorized: true,
    cert: fs.readFileSync('/path/to/client-cert.pem'),
    key: fs.readFileSync('/path/to/client-key.pem'),
    ca: [fs.readFileSync('/path/to/ca-cert.pem')]
  },
  
  // Query options
  queryOptions: {
    consistency: consistency.localQuorum,
    serialConsistency: consistency.localSerial,
    fetchSize: 5000,
    autoPage: true,
    prepare: true
  },
  
  // Retry policy
  policies: {
    retry: new RetryPolicy(),
    loadBalancing: new DCAwareRoundRobinPolicy('datacenter1'),
    reconnection: new ExponentialReconnectionPolicy(1000, 10 * 60 * 1000)
  },
  
  // Metrics
  metrics: {
    enabled: true,
    buckets: [1, 5, 15, 50, 100, 200, 500, 1000, 2000]
  }
};
```

### ScyllaDB Cloud Configuration

```typescript
const scyllaCloudConfig = {
  driver: 'scylladb',
  cloud: {
    secureConnectBundle: '/path/to/secure-connect-bundle.zip'
  },
  credentials: {
    username: 'scylla',
    password: 'your-password'
  },
  keyspace: 'your_keyspace'
};
```

## SQL Database Configuration

### PostgreSQL

```typescript
const postgresConfig = {
  driver: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'my_app',
  username: 'postgres',
  password: 'password',
  
  // Connection pool settings
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  },
  
  // SSL configuration
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync('/path/to/ca-certificate.crt').toString(),
    key: fs.readFileSync('/path/to/client-key.key').toString(),
    cert: fs.readFileSync('/path/to/client-certificate.crt').toString()
  },
  
  // Additional options
  options: {
    timezone: 'UTC',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
};
```

### MySQL

```typescript
const mysqlConfig = {
  driver: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'my_app',
  username: 'root',
  password: 'password',
  
  // MySQL specific options
  options: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timezone: '+00:00',
    typeCast: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: false,
    debug: false,
    trace: true,
    multipleStatements: false,
    flags: '',
    ssl: {
      ca: fs.readFileSync('/path/to/ca.pem'),
      cert: fs.readFileSync('/path/to/client-cert.pem'),
      key: fs.readFileSync('/path/to/client-key.pem')
    }
  }
};
```

### SQLite

```typescript
const sqliteConfig = {
  driver: 'sqlite',
  filename: './database.sqlite',
  
  // SQLite options
  options: {
    verbose: console.log,
    fileMustExist: false,
    timeout: 5000,
    readonly: false
  }
};
```

## Environment-Based Configuration

### Using Environment Variables

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
    },
    
    postgres: {
      driver: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_DATABASE || 'my_app',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    }
  }
};
```

### Environment Files

Create different environment files for different stages:

```bash
# .env.development
DB_CONNECTION=scylladb
SCYLLA_CONTACT_POINTS=127.0.0.1
SCYLLA_DATACENTER=datacenter1
SCYLLA_KEYSPACE=my_app_dev
SCYLLA_USERNAME=cassandra
SCYLLA_PASSWORD=cassandra

# .env.production
DB_CONNECTION=scylladb
SCYLLA_CONTACT_POINTS=node1.prod.com,node2.prod.com,node3.prod.com
SCYLLA_DATACENTER=us-east-1
SCYLLA_KEYSPACE=my_app_prod
SCYLLA_USERNAME=prod_user
SCYLLA_PASSWORD=secure_password

# .env.test
DB_CONNECTION=sqlite
DB_FILENAME=:memory:
```

### Loading Environment Configuration

```typescript
// src/config/index.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific config
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

// Fallback to default .env
dotenv.config();

export { databaseConfig } from './database';
```

## Multiple Database Connections

### Defining Multiple Connections

```typescript
export const databaseConfig = {
  default: 'primary',
  
  connections: {
    // Primary ScyllaDB connection
    primary: {
      driver: 'scylladb',
      contactPoints: ['scylla1.com', 'scylla2.com'],
      localDataCenter: 'datacenter1',
      keyspace: 'main_app'
    },
    
    // Analytics ScyllaDB connection
    analytics: {
      driver: 'scylladb',
      contactPoints: ['analytics1.com', 'analytics2.com'],
      localDataCenter: 'datacenter2',
      keyspace: 'analytics'
    },
    
    // PostgreSQL for relational data
    postgres: {
      driver: 'postgres',
      host: 'postgres.com',
      database: 'relational_data'
    },
    
    // Redis for caching
    redis: {
      driver: 'redis',
      host: 'redis.com',
      port: 6379
    }
  }
};
```

### Using Different Connections in Models

```typescript
// Primary database model
class User extends Model<UserAttributes> {
  protected static connection = 'primary';
  protected static table = 'users';
}

// Analytics database model
class UserEvent extends Model<UserEventAttributes> {
  protected static connection = 'analytics';
  protected static table = 'user_events';
}

// PostgreSQL model
class Report extends Model<ReportAttributes> {
  protected static connection = 'postgres';
  protected static table = 'reports';
}
```

## Connection Management

### Manual Connection Management

```typescript
import { ConnectionManager } from 'scyllinx';

const connectionManager = ConnectionManager.getInstance();

// Initialize all connections
await connectionManager.initialize(databaseConfig);

// Get specific connection
const scyllaConnection = connectionManager.getConnection('scylladb');
const postgresConnection = connectionManager.getConnection('postgres');

// Test connections
const isScyllaHealthy = await connectionManager.testConnection('scylladb');
const isPostgresHealthy = await connectionManager.testConnection('postgres');

// Close connections
await scyllaConnection.disconnect();
await connectionManager.disconnectAll();
```

### Connection Health Monitoring

```typescript
class DatabaseHealthMonitor {
  private connectionManager: ConnectionManager;
  
  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
  }
  
  async checkAllConnections(): Promise<Record<string, boolean>> {
    const connections = this.connectionManager.getConnectionNames();
    const results: Record<string, boolean> = {};
    
    for (const connectionName of connections) {
      try {
        results[connectionName] = await this.connectionManager.testConnection(connectionName);
      } catch (error) {
        console.error(`Connection ${connectionName} failed:`, error);
        results[connectionName] = false;
      }
    }
    
    return results;
  }
}
```

<!-- ## Migration Configuration

### Migration Settings

```typescript
export const databaseConfig = {
  // ... other config
  
  migrations: {
    // Directory containing migration files
    directory: './src/migrations',
    
    // Migration table name
    tableName: 'migrations',
    
    // Migration file extension
    extension: 'ts',
    
    // Disable transactions for ScyllaDB
    disableTransactions: true,
    
    // Schema name (for PostgreSQL)
    schemaName: 'public',
    
    // Load extensions
    loadExtensions: ['.ts', '.js']
  }
};
``` -->

<!-- ### Per-Connection Migration Settings

```typescript
export const databaseConfig = {
  connections: {
    scylladb: {
      driver: 'scylladb',
      // ... connection config
      migrations: {
        directory: './src/migrations/scylladb',
        tableName: 'schema_migrations',
        disableTransactions: true
      }
    },
    
    postgres: {
      driver: 'postgres',
      // ... connection config
      migrations: {
        directory: './src/migrations/postgres',
        tableName: 'migrations',
        schemaName: 'public'
      }
    }
  }
};
``` -->
<!-- 
## Logging Configuration

### Query Logging

```typescript
export const databaseConfig = {
  // ... other config
  
  logging: {
    // Enable query logging
    enabled: true,
    
    // Log level
    level: 'debug', // 'error', 'warn', 'info', 'debug'
    
    // Custom logger function
    logger: (message: string, level: string) => {
      console.log(`[${level.toUpperCase()}] ${message}`);
    },
    
    // Log slow queries
    slowQueryThreshold: 1000, // milliseconds
    
    // Log query parameters
    logParameters: true,
    
    // Log query results
    logResults: false
  }
};
```

### Custom Logger Integration

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export const databaseConfig = {
  // ... other config
  
  logging: {
    enabled: true,
    logger: (message: string, level: string) => {
      logger.log(level, message);
    }
  }
};
``` -->

## Performance Configuration

### Connection Pooling

```typescript
export const databaseConfig = {
  connections: {
    postgres: {
      driver: 'postgres',
      // ... connection details
      
      pool: {
        // Minimum connections in pool
        min: 2,
        
        // Maximum connections in pool
        max: 10,
        
        // Acquire timeout
        acquireTimeoutMillis: 30000,
        
        // Create timeout
        createTimeoutMillis: 30000,
        
        // Destroy timeout
        destroyTimeoutMillis: 5000,
        
        // Idle timeout
        idleTimeoutMillis: 30000,
        
        // Reap interval
        reapIntervalMillis: 1000,
        
        // Create retry interval
        createRetryIntervalMillis: 200,
        
        // Validation query
        validationQuery: 'SELECT 1'
      }
    }
  }
};
```

### Query Optimization

```typescript
export const databaseConfig = {
  // ... other config
  
  queryOptions: {
    // Default fetch size for ScyllaDB
    fetchSize: 5000,
    
    // Enable auto-paging
    autoPage: true,
    
    // Prepare statements by default
    prepare: true,
    
    // Default consistency level
    consistency: 'localQuorum',
    
    // Query timeout
    timeout: 30000
  }
};
```

## Security Configuration

### SSL/TLS Configuration

```typescript
import fs from 'fs';

export const databaseConfig = {
  connections: {
    secure_scylla: {
      driver: 'scylladb',
      contactPoints: ['secure-node1.com', 'secure-node2.com'],
      
      sslOptions: {
        // Reject unauthorized certificates
        rejectUnauthorized: true,
        
        // Client certificate
        cert: fs.readFileSync('/path/to/client-cert.pem'),
        
        // Client private key
        key: fs.readFileSync('/path/to/client-key.pem'),
        
        // Certificate Authority
        ca: [fs.readFileSync('/path/to/ca-cert.pem')],
        
        // Server name for SNI
        servername: 'scylla.example.com',
        
        // Cipher suites
        ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
        
        // Protocol version
        secureProtocol: 'TLSv1_2_method'
      }
    }
  }
};
```

### Authentication Configuration

```typescript
export const databaseConfig = {
  connections: {
    scylladb: {
      driver: 'scylladb',
      
      // Username/password authentication
      credentials: {
        username: process.env.SCYLLA_USERNAME,
        password: process.env.SCYLLA_PASSWORD
      },
      
      // Or use authentication provider
      authProvider: new PlainTextAuthProvider(
        process.env.SCYLLA_USERNAME!,
        process.env.SCYLLA_PASSWORD!
      )
    }
  }
};
```

## Testing Configuration

### Test Database Configuration

```typescript
// src/config/database.test.ts
export const testDatabaseConfig = {
  default: 'test',
  
  connections: {
    test: {
      driver: 'sqlite',
      filename: ':memory:', // In-memory database for tests
      
      options: {
        verbose: false // Disable logging in tests
      }
    },
    
    test_scylla: {
      driver: 'scylladb',
      contactPoints: ['127.0.0.1'],
      keyspace: 'test_keyspace',
      
      // Use different keyspace for tests
      testKeyspace: true
    }
  },
};
```

### Environment-Specific Test Config

```typescript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testEnvironment: 'node'
};

// src/test/setup.ts
import { ConnectionManager } from 'scyllinx';
import { testDatabaseConfig } from '../config/database.test';

beforeAll(async () => {
  const connectionManager = ConnectionManager.getInstance();
  await connectionManager.initialize(testDatabaseConfig);
});

afterAll(async () => {
  const connectionManager = ConnectionManager.getInstance();
  await connectionManager.closeAllConnections();
});
```

<!-- ## Configuration Validation

### Schema Validation

```typescript
import Joi from 'joi';

const configSchema = Joi.object({
  default: Joi.string().required(),
  
  connections: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      driver: Joi.string().valid('scylladb', 'postgres', 'mysql', 'sqlite').required(),
      
      // ScyllaDB specific
      contactPoints: Joi.when('driver', {
        is: 'scylladb',
        then: Joi.array().items(Joi.string()).min(1).required(),
        otherwise: Joi.forbidden()
      }),
      
      // SQL database specific
      host: Joi.when('driver', {
        is: Joi.string().valid('postgres', 'mysql'),
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
      }),
      
      port: Joi.when('driver', {
        is: Joi.string().valid('postgres', 'mysql'),
        then: Joi.number().port(),
        otherwise: Joi.forbidden()
      })
    })
  ).required()
});

export function validateConfig(config: any) {
  const { error, value } = configSchema.validate(config);
  
  if (error) {
    throw new Error(`Configuration validation failed: ${error.message}`);
  }
  
  return value;
}
``` -->
<!-- 
### Runtime Configuration Validation

```typescript
export class ConfigValidator {
  static async validateConnections(config: ConnectionConfig): Promise<void> {
    const connectionManager = ConnectionManager.getInstance();
    
    for (const [name, connectionConfig] of Object.entries(config.connections)) {
      try {
        await connectionManager.testConnection(name);
        console.log(`✅ Connection '${name}' is valid`);
      } catch (error) {
        console.error(`❌ Connection '${name}' failed:`, error.message);
        throw new Error(`Invalid connection configuration for '${name}'`);
      }
    }
  }
  
  static validateRequiredEnvVars(): void {
    const requiredVars = [
      'DB_CONNECTION',
      'SCYLLA_CONTACT_POINTS',
      'SCYLLA_USERNAME',
      'SCYLLA_PASSWORD'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}
``` -->

## Best Practices

### 1. Use Environment Variables

Always use environment variables for sensitive information:

```typescript
// ✅ Good
credentials: {
  username: process.env.SCYLLA_USERNAME,
  password: process.env.SCYLLA_PASSWORD
}

// ❌ Bad
credentials: {
  username: 'cassandra',
  password: 'password123'
}
```

### 2. Separate Configurations by Environment

```typescript
// src/config/environments/development.ts
export const developmentConfig = {
  // Development-specific settings
};

// src/config/environments/production.ts
export const productionConfig = {
  // Production-specific settings
};

// src/config/index.ts
const env = process.env.NODE_ENV || 'development';
export const config = require(`./environments/${env}`).default;
```

### 3. Use Connection Pooling

Always configure appropriate connection pooling:

```typescript
pool: {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 30000
}
```

### 4. Enable SSL in Production

```typescript
const isProduction = process.env.NODE_ENV === 'production';

sslOptions: isProduction ? {
  rejectUnauthorized: true,
  ca: fs.readFileSync('/path/to/ca-cert.pem')
} : undefined
```

### 5. Configure Appropriate Timeouts

```typescript
socketOptions: {
  connectTimeout: 30000,
  readTimeout: 30000
},
queryOptions: {
  timeout: 30000
}
```

This comprehensive configuration guide covers all aspects of setting up ScyllinX for different environments and use cases. Proper configuration is crucial for optimal performance, security, and reliability of your database operations.
