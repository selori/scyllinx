# Introduction

ScyllinX is a modern TypeScript ORM designed specifically for ScyllaDB while maintaining compatibility with traditional SQL databases. It provides a Laravel-inspired Active Record implementation with full TypeScript support, making database interactions both powerful and type-safe.

## What is ScyllinX?

ScyllinX (pronounced "Scylla-nX") is an Object-Relational Mapping (ORM) library that bridges the gap between your TypeScript application and your database. It provides:

- **Active Record Pattern**: Models that represent database tables with built-in query methods
- **Query Builder**: A fluent interface for building complex database queries
- **Relationships**: Support for all types of relationships between models
- **Migrations**: Version control for your database schema
- **Type Safety**: Full TypeScript support with compile-time type checking

## Why Choose ScyllinX?

### 🚀 Built for Performance

ScyllinX is designed from the ground up to work with ScyllaDB's high-performance architecture:

```typescript
// Optimized for ScyllaDB's partition-based architecture
const users = await User.query()
  .whereToken(['user_id'], '>', [1000])
  .allowFiltering()
  .get();

// Lightweight transactions
await User.query()
  .where('email', 'john@example.com')
  .ifNotExists()
  .insert({ name: 'John', email: 'john@example.com' });
```

### 🔧 TypeScript First

Every aspect of ScyllinX is built with TypeScript in mind:

```typescript
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  age?: number;
  created_at?: Date;
}

class User extends Model<UserAttributes> {
  // TypeScript knows about all your attributes
  getName(): string {
    return this.name; // ✅ Type-safe
  }
  
  getInvalidField(): string {
    return this.invalid; // ❌ TypeScript error
  }
}
```

### 🎯 Familiar Syntax

If you've used Laravel's Eloquent ORM, ScyllinX will feel immediately familiar:

```typescript
// Laravel Eloquent (PHP)
$users = User::where('active', true)
    ->with('posts')
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();

// ScyllinX (TypeScript)
const users = await User.query()
  .where('active', true)
  .with('posts')
  .orderBy('created_at', 'desc')
  .limit(10)
  .get();
```

### 🔄 Comprehensive Relationships

ScyllinX supports all types of relationships with full type safety:

```typescript
class User extends Model<UserAttributes> {
  // One-to-many
  postsRelation(): HasMany<User, Post> {
    return this.hasMany(Post, 'user_id', 'id');
  }
  
  // One-to-one
  profileRelation(): HasOne<User, Profile> {
    return this.hasOne(Profile, 'user_id', 'id');
  }
  
  // Many-to-many
  rolesRelation(): BelongsToMany<User, Role> {
    return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
  }
  
  // Polymorphic
  commentsRelation(): MorphMany<User, Comment> {
    return this.morphMany(Comment, 'commentable');
  }
}
```

## Architecture Overview

ScyllinX follows a modular architecture with clear separation of concerns:

```
┌─────────────────┐
│     Models      │ ← Active Record pattern with relationships
├─────────────────┤
│  Query Builder  │ ← Fluent query interface
├─────────────────┤
│   Relationships │ ← HasOne, HasMany, BelongsTo, etc.
├─────────────────┤
│   Migrations    │ ← Schema versioning and management
├─────────────────┤
│ Schema Builder  │ ← Database schema definition
├─────────────────┤
│   Connections   │ ← Database connection management
├─────────────────┤
│    Drivers      │ ← ScyllaDB, PostgreSQL, MySQL support
└─────────────────┘
```

## Core Concepts

### Models

Models represent database tables and provide methods for querying and manipulating data:

```typescript
class Post extends Model<PostAttributes> {
  protected static table = 'posts';
  protected static fillable = ['title', 'content', 'user_id'];
  
  // Relationships
  userRelation(): BelongsTo<Post, User> {
    return this.belongsTo(User, 'user_id', 'id');
  }
  
  commentsRelation(): HasMany<Post, Comment> {
    return this.hasMany(Comment, 'post_id', 'id');
  }
}
```

### Query Builder

The query builder provides a fluent interface for constructing database queries:

```typescript
const posts = await Post.query()
  .where('published', true)
  .where('created_at', '>', new Date('2024-01-01'))
  .orderBy('created_at', 'desc')
  .with('user', 'comments')
  .limit(20)
  .get();
```

### Relationships

Relationships define how models are connected to each other:

```typescript
// Load related data
const user = await User.find(1);
const posts = await user.postsRelaiton().get();

// Eager loading
const users = await User.query()
  .with('posts.comments')
  .get();
```

### Migrations

Migrations provide version control for your database schema:

```typescript
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

## What's Next?

Ready to get started? Here's what you should read next:

1. **[Installation](/guide/installation)** - Set up ScyllinX in your project
2. **[Quick Start](/guide/quick-start)** - Your first ScyllinX application
3. **[Configuration](/guide/configuration)** - Configure database connections
4. **[Models](/guide/models)** - Learn about the Active Record pattern
5. **[Query Builder](/guide/query-builder)** - Master the query builder

## Community and Support

- **GitHub**: [https://github.com/selori/scyllinx](https://github.com/selori/scyllinx)
- **Discord**: [Join our Discord server](https://discord.gg/scyllinx)
- **Twitter**: [@scyllinx](https://twitter.com/scyllinx)
- **Documentation**: You're reading it! 📖

## Contributing

ScyllinX is open source and we welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, we'd love to have your help.

See our [Contributing Guide](https://github.com/selori/scyllinx/blob/main/CONTRIBUTING.md) to get started.
