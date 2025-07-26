# Query Builder

The ScyllinX Query Builder provides a fluent, expressive interface for building database queries. It supports both SQL and ScyllaDB/Cassandra-specific features, allowing you to construct complex queries with ease while maintaining type safety.

## Basic Usage

### Getting Started

The Query Builder can be accessed through models or created directly:

```typescript
import { QueryBuilder, User } from 'scyllinx';

// Through a model (recommended)
const query = User.query();

// Direct instantiation
const query = new QueryBuilder('users');
```

### Basic Queries

```typescript
// Select all users
const users = await User.query().get();

// Select specific columns
const users = await User.query()
  .select('id', 'name', 'email')
  .get();

// Get first result
const user = await User.query()
  .where('email', 'john@example.com')
  .first();

// Count records
const count = await User.query()
  .where('active', true)
  .count();

// Check if records exist
const exists = await User.query()
  .where('role', 'admin')
  .exists();
```

## WHERE Clauses

### Basic WHERE Conditions

```typescript
// Simple equality
const users = await User.query()
  .where('active', true)
  .get();

// With operator
const users = await User.query()
  .where('age', '>', 18)
  .where('created_at', '<=', new Date())
  .get();

// Multiple conditions (AND)
const users = await User.query()
  .where('active', true)
  .where('role', 'user')
  .where('age', '>=', 21)
  .get();
```

### OR Conditions

```typescript
// OR WHERE
const users = await User.query()
  .where('role', 'admin')
  .orWhere('role', 'moderator')
  .get();

// Complex OR conditions
// Sub-queries NOT implemented
const users = await User.query()
  .where('active', true)
  .where(query => {
    query.where('role', 'admin')
         .orWhere('permissions', 'like', '%manage%');
  })
  .get();
```

### WHERE IN / NOT IN

```typescript
// WHERE IN
const users = await User.query()
  .whereIn('role', ['admin', 'moderator', 'editor'])
  .get();

// WHERE NOT IN
const users = await User.query()
  .whereNotIn('status', ['banned', 'suspended'])
  .get();

// With subquery
const activeUserIds = User.query()
  .where('active', true)
  .select('id');

const posts = await Post.query()
  .whereIn('user_id', activeUserIds)
  .get();
```

### WHERE BETWEEN

```typescript
// Date range
const users = await User.query()
  .whereBetween('created_at', [
    new Date('2024-01-01'),
    new Date('2024-12-31')
  ])
  .get();

// Numeric range
const users = await User.query()
  .whereBetween('age', [18, 65])
  .get();
```

### NULL Checks

```typescript
// WHERE NULL
const users = await User.query()
  .whereNull('deleted_at')
  .get();

// WHERE NOT NULL
const users = await User.query()
  .whereNotNull('email_verified_at')
  .get();
```

### Advanced WHERE Conditions

```typescript
// JSON column queries (if supported)
const users = await User.query()
  .where('settings->theme', 'dark')
  .get();

// Raw WHERE conditions NOT IMPLEMENTED
const users = await User.query()
  .whereRaw('LOWER(email) = ?', ['john@example.com'])
  .get();

// Conditional WHERE
const query = User.query();

if (filters.role) {
  query.where('role', filters.role);
}

if (filters.active !== undefined) {
  query.where('active', filters.active);
}

const users = await query.get();
```

## Ordering and Limiting

### ORDER BY

```typescript
// Single column ordering
const users = await User.query()
  .orderBy('created_at', 'desc')
  .get();

// Multiple column ordering
const users = await User.query()
  .orderBy('role', 'asc')
  .orderBy('name', 'asc')
  .get();

// Random ordering (if supported)
// orderByRaw NOT implemented
const users = await User.query()
  .orderByRaw('RANDOM()')
  .limit(5)
  .get();
```

### LIMIT and OFFSET

```typescript
// Limit results
const users = await User.query()
  .limit(10)
  .get();

// Pagination
const users = await User.query()
  .offset(20)
  .limit(10)
  .get();

// Alternative pagination methods
const users = await User.query()
  .skip(20)
  .take(10)
  .get();
```

## Grouping and Aggregation

### GROUP BY

```typescript
// Basic grouping
const usersByRole = await User.query()
  .select('role')
  .addSelect('COUNT(*) as count')
  .groupBy('role')
  .get();

// Multiple columns
const stats = await Post.query()
  .select('user_id', 'status')
  .addSelect('COUNT(*) as count')
  .groupBy('user_id', 'status')
  .get();
```

### HAVING

```typescript
// HAVING clause
const activeUsers = await User.query()
  .select('role')
  .addSelect('COUNT(*) as count')
  .groupBy('role')
  .having('count', '>', 5)
  .get();

// Complex HAVING
const stats = await Post.query()
  .select('user_id')
  .addSelect('COUNT(*) as post_count')
  .addSelect('AVG(view_count) as avg_views')
  .groupBy('user_id')
  .having('post_count', '>=', 10)
  .having('avg_views', '>', 1000)
  .get();
```

### Aggregate Functions

```typescript
// Count
const userCount = await User.query()
  .where('active', true)
  .count();

// Count with column
const emailCount = await User.query()
  .count('email');

// Other aggregates
// aggregate method NOT implemented
const stats = await Post.query()
  .where('published', true)
  .aggregate([
    'COUNT(*) as total_posts',
    'AVG(view_count) as avg_views',
    'MAX(view_count) as max_views',
    'MIN(created_at) as first_post',
    'SUM(view_count) as total_views'
  ]);
```

## Joins

### Basic Joins

```typescript
// INNER JOIN
const usersWithPosts = await User.query()
  .join('posts', 'users.id', '=', 'posts.user_id')
  .select('users.*', 'posts.title')
  .get();

// LEFT JOIN
const usersWithOptionalPosts = await User.query()
  .leftJoin('posts', 'users.id', '=', 'posts.user_id')
  .select('users.*', 'posts.title')
  .get();

// RIGHT JOIN
const postsWithUsers = await Post.query()
  .rightJoin('users', 'posts.user_id', '=', 'users.id')
  .select('posts.*', 'users.name')
  .get();
```

### Advanced Joins

```typescript
// Join with additional conditions
// sub joins NOT implemented
const users = await User.query()
  .join('posts', (join) => {
    join.on('users.id', '=', 'posts.user_id')
        .where('posts.published', true);
  })
  .get();

// Multiple joins
const data = await User.query()
  .join('posts', 'users.id', '=', 'posts.user_id')
  .join('comments', 'posts.id', '=', 'comments.post_id')
  .select('users.name', 'posts.title', 'comments.content')
  .get();

// Self join
const userHierarchy = await User.query()
  .join('users as managers', 'users.manager_id', '=', 'managers.id')
  .select('users.name as employee', 'managers.name as manager')
  .get();
```
<!-- 
## Subqueries

### WHERE Subqueries

```typescript
// EXISTS subquery
const usersWithPosts = await User.query()
  .whereExists((query) => {
    query.select('*')
         .from('posts')
         .whereColumn('posts.user_id', 'users.id');
  })
  .get();

// NOT EXISTS
const usersWithoutPosts = await User.query()
  .whereNotExists((query) => {
    query.select('*')
         .from('posts')
         .whereColumn('posts.user_id', 'users.id');
  })
  .get();

// IN subquery
const activeUsers = await User.query()
  .whereIn('id', (query) => {
    query.select('user_id')
         .from('posts')
         .where('published', true)
         .groupBy('user_id')
         .having('COUNT(*)', '>', 5);
  })
  .get();
```

### SELECT Subqueries

```typescript
// Subquery in SELECT
const usersWithPostCount = await User.query()
  .select('*')
  .addSelect((query) => {
    query.select('COUNT(*)')
         .from('posts')
         .whereColumn('posts.user_id', 'users.id')
         .as('post_count');
  })
  .get();

// Multiple subqueries
const userStats = await User.query()
  .select('id', 'name')
  .addSelect((query) => {
    query.select('COUNT(*)')
         .from('posts')
         .whereColumn('posts.user_id', 'users.id')
         .as('post_count');
  })
  .addSelect((query) => {
    query.select('COUNT(*)')
         .from('comments')
         .whereColumn('comments.user_id', 'users.id')
         .as('comment_count');
  })
  .get();
```

## Raw Queries

### Raw Expressions

```typescript
// Raw SELECT
const users = await User.query()
  .select('*')
  .addSelect('UPPER(name) as upper_name')
  .addSelect('EXTRACT(YEAR FROM created_at) as year')
  .get();

// Raw WHERE
const users = await User.query()
  .whereRaw('LOWER(email) = LOWER(?)', ['JOHN@EXAMPLE.COM'])
  .get();

// Raw ORDER BY
const users = await User.query()
  .orderByRaw('CASE WHEN role = ? THEN 0 ELSE 1 END', ['admin'])
  .orderBy('name')
  .get();
```

### Complete Raw Queries

```typescript
// Execute raw query
const result = await User.query()
  .raw('SELECT COUNT(*) as total FROM users WHERE active = ?', [true]);

// Raw query with model hydration
const users = await User.query()
  .fromRaw('(SELECT * FROM users WHERE active = ?) as active_users', [true])
  .get();
``` -->

## ScyllaDB-Specific Features

### Token-Based Queries

```typescript
// Token-based pagination for ScyllaDB
const users = await User.query()
  .whereToken(['user_id'], '>', [1000])
  .limit(100)
  .get();

// Token range queries
const users = await User.query()
  .whereToken(['partition_key'], '>=', [startToken])
  .whereToken(['partition_key'], '<', [endToken])
  .get();
```

### ALLOW FILTERING

```typescript
// Use ALLOW FILTERING for non-indexed columns
const users = await User.query()
  .where('non_indexed_column', 'value')
  .allowFiltering()
  .get();

// Note: Use sparingly as it can impact performance
```

### TTL (Time To Live)

```typescript
// Set TTL for INSERT operations
await User.query()
  .ttl(3600) // 1 hour
  .insert({
    id: 'temp-user',
    name: 'Temporary User',
    email: 'temp@example.com'
  });

// TTL for UPDATE operations
await User.query()
  .where('id', 'user-id')
  .ttl(7200) // 2 hours
  .update({
    last_activity: new Date()
  });
```

### Lightweight Transactions

```typescript
// IF NOT EXISTS
await User.query()
  .ifNotExists()
  .insert({
    id: 'unique-user',
    name: 'John Doe',
    email: 'john@example.com'
  });

// IF conditions
await User.query()
  .where('id', 'user-id')
  .if('version', '=', 1)
  .update({
    name: 'Updated Name',
    version: 2
  });

// Multiple IF conditions
await User.query()
  .where('id', 'user-id')
  .if('status', '=', 'active')
  .if('version', '=', currentVersion)
  .update({
    status: 'inactive',
    version: currentVersion + 1
  });
```

## Data Modification

### INSERT Operations

```typescript
// Single insert
await User.query()
  .insert({
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com'
  });

// Batch insert
await User.query()
  .insert([
    { id: 'user-1', name: 'John', email: 'john@example.com' },
    { id: 'user-2', name: 'Jane', email: 'jane@example.com' },
    { id: 'user-3', name: 'Bob', email: 'bob@example.com' }
  ]);

// Insert and get ID (for auto-increment)
const userId = await User.query()
  .insertGetId({
    name: 'New User',
    email: 'new@example.com'
  });
```

### UPDATE Operations

```typescript
// Basic update
const updatedCount = await User.query()
  .where('id', 'user-id')
  .update({
    name: 'Updated Name',
    updated_at: new Date()
  });

// Conditional update
const updatedCount = await User.query()
  .where('active', false)
  .where('last_login', '<', new Date('2023-01-01'))
  .update({
    status: 'inactive'
  });

// Update with increment/decrement
await User.query()
  .where('id', 'user-id')
  .increment('login_count', 1);

await User.query()
  .where('id', 'user-id')
  .decrement('credits', 10);
```

### UPSERT Operations

```typescript
// Update or insert
const success = await User.query()
  .updateOrInsert(
    { email: 'john@example.com' }, // Search criteria
    { name: 'John Doe', active: true } // Data to update/insert
  );
```

### DELETE Operations

```typescript
// Basic delete
const deletedCount = await User.query()
  .where('id', 'user-id')
  .delete();

// Conditional delete
const deletedCount = await User.query()
  .where('active', false)
  .where('created_at', '<', new Date('2023-01-01'))
  .delete();

// Truncate table (delete all records)
await User.query().truncate();
```

## Query Optimization

### Eager Loading

```typescript
// Load relationships
const users = await User.query()
  .with('posts', 'profile')
  .get();

// Nested relationships
const users = await User.query()
  .with('posts.comments', 'posts.tags')
  .get();

// Conditional eager loading
// subqueries NOT implemented
const users = await User.query()
  .with('posts', (query) => {
    query.where('published', true)
         .orderBy('created_at', 'desc');
  })
  .get();
```
<!-- 
### Query Caching

```typescript
// Cache query results
const users = await User.query()
  .where('active', true)
  .cache(300) // Cache for 5 minutes
  .get();

// Cache with custom key
const users = await User.query()
  .where('role', 'admin')
  .cache(600, 'admin-users')
  .get();
``` -->

<!-- ### Index Hints

```typescript
// Force index usage (database-specific)
const users = await User.query()
  .useIndex('idx_email')
  .where('email', 'john@example.com')
  .get();

// Ignore index
const users = await User.query()
  .ignoreIndex('idx_name')
  .where('name', 'like', 'John%')
  .get();
``` -->

## Query Debugging

### SQL Generation

```typescript
const query = User.query()
  .where('active', true)
  .orderBy('created_at', 'desc')
  .limit(10);

// Get SQL without executing
console.log(query.toSql());
// Output: SELECT * FROM users WHERE active = ? ORDER BY created_at DESC LIMIT ?

// Get SQL with parameters interpolated
console.log(query.toRawSql());
// Output: SELECT * FROM users WHERE active = true ORDER BY created_at DESC LIMIT 10
```
<!-- 
### Query Logging

```typescript
// Enable query logging
User.query().enableQueryLog();

const users = await User.query()
  .where('active', true)
  .get();

// Get executed queries
const queries = User.query().getQueryLog();
console.log(queries);
```

### Explain Queries

```typescript
// Get query execution plan
const plan = await User.query()
  .where('email', 'john@example.com')
  .explain();

console.log(plan);
``` -->

## Advanced Query Patterns

### Dynamic Query Building

```typescript
class UserQueryBuilder {
  private query: QueryBuilder<User, UserAttributes>;

  constructor() {
    this.query = User.query();
  }

  filterByRole(role?: string): this {
    if (role) {
      this.query.where('role', role);
    }
    return this;
  }

  filterByStatus(active?: boolean): this {
    if (active !== undefined) {
      this.query.where('active', active);
    }
    return this;
  }

  filterByDateRange(startDate?: Date, endDate?: Date): this {
    if (startDate) {
      this.query.where('created_at', '>=', startDate);
    }
    if (endDate) {
      this.query.where('created_at', '<=', endDate);
    }
    return this;
  }

  search(term?: string): this {
    if (term) {
      this.query.where((query) => {
        query.where('name', 'like', `%${term}%`)
             .orWhere('email', 'like', `%${term}%`);
      });
    }
    return this;
  }

  paginate(page: number, perPage: number): this {
    this.query.offset((page - 1) * perPage).limit(perPage);
    return this;
  }

  async get(): Promise<User[]> {
    return await this.query.get();
  }

  async count(): Promise<number> {
    return await this.query.count();
  }
}

// Usage
const queryBuilder = new UserQueryBuilder();
const users = await queryBuilder
  .filterByRole('admin')
  .filterByStatus(true)
  .search('john')
  .paginate(1, 10)
  .get();
```

### Repository Pattern

```typescript
class UserRepository {
  async findActiveUsers(limit = 10): Promise<User[]> {
    return await User.query()
      .where('active', true)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();
  }

  async findByEmailDomain(domain: string): Promise<User[]> {
    return await User.query()
      .where('email', 'like', `%@${domain}`)
      .get();
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  }> {
    const [total, active, inactive, roleStats] = await Promise.all([
      User.query().count(),
      User.query().where('active', true).count(),
      User.query().where('active', false).count(),
      User.query()
        .select('role')
        .addSelect('COUNT(*) as count')
        .groupBy('role')
        .get()
    ]);

    const byRole = roleStats.reduce((acc, stat) => {
      acc[stat.role] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    return { total, active, inactive, byRole };
  }
}
```

## Best Practices

### 1. Use Type-Safe Queries

```typescript
// Good: Type-safe column references
const users = await User.query()
  .select('id', 'name', 'email') // TypeScript knows these columns exist
  .where('active', true)
  .get();

// Avoid: Raw strings without type checking
const users = await User.query()
  .selectRaw('id, name, email') // No type checking
  .get();
```

### 2. Optimize for Your Database

```typescript
// For ScyllaDB: Use partition keys in WHERE clauses
const userEvents = await UserEvent.query()
  .where('user_id', userId) // Partition key first
  .where('event_time', '>', startTime)
  .get();

// For SQL: Use indexes effectively
const users = await User.query()
  .where('email', email) // Assuming email is indexed
  .first();
```

### 3. Handle Large Result Sets

```typescript
// Use pagination for large datasets
async function getAllUsers(callback: (users: User[]) => void) {
  let page = 1;
  const perPage = 1000;
  
  while (true) {
    const users = await User.query()
      .offset((page - 1) * perPage)
      .limit(perPage)
      .get();
    
    if (users.length === 0) break;
    
    await callback(users);
    page++;
  }
}

// Or use cursor-based pagination for ScyllaDB
async function getUsersWithCursor(lastToken?: string) {
  const query = User.query().limit(100);
  
  if (lastToken) {
    query.whereToken(['user_id'], '>', [lastToken]);
  }
  
  return await query.get();
}
```

### 4. Use Transactions When Needed

```typescript
// Wrap related operations in transactions
await User.transaction(async (trx) => {
  const user = await User.query(trx)
    .where('id', userId)
    .first();
  
  if (!user) throw new Error('User not found');
  
  await user.update({ credits: user.credits - amount });
  
  await Transaction.query(trx)
    .insert({
      user_id: userId,
      amount: -amount,
      type: 'debit'
    });
});
```

The Query Builder is a powerful tool that provides the flexibility to construct complex queries while maintaining type safety and database compatibility. Use it wisely to build efficient and maintainable database interactions.
