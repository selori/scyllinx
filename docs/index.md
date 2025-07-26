---
layout: home

hero:
  name: ScyllinX
  text: Modern TypeScript ORM
  tagline: For ScyllaDB and SQL databases with Laravel-inspired syntax
  image:
    src: /logo.png
    alt: ScyllinX
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: Quick Start
      link: /guide/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/selori/scyllinx

features:
  - icon: ⚡
    title: High Performance
    details: Built for ScyllaDB's high-performance architecture with optimized queries and connection pooling.
  
  - icon: 🔧
    title: TypeScript First
    details: Full TypeScript support with type-safe queries, models, and relationships.
  
  - icon: 🎯
    title: Laravel-Inspired
    details: Familiar syntax and patterns inspired by Laravel's Eloquent ORM.
  
  - icon: 🔄
    title: Relationships
    details: Support for all relationship types including polymorphic and many-to-many.
  
  - icon: 📊
    title: Query Builder
    details: Powerful and flexible query builder with ScyllaDB-specific features.
  
  - icon: 🗄️
    title: Migrations
    details: Database schema versioning with forward and backward migrations.
---

## Quick Example

```typescript
// Define a model
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  created_at?: Date;
  // Relationship attributes
  posts?: Post[]
}

class User extends Model<UserAttributes> {
  protected static table = 'users';
  protected static fillable = ['name', 'email'];
  
  // Define relationships
  postsRelation(): HasMany<User, Post> {
    return this.hasMany(Post, 'user_id', 'id');
  }
}

// Use the model
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com'
});

const posts = await user.postsRelation().where('published', true).get();
```

## Why ScyllinX?

ScyllinX combines the best of both worlds: the familiar, elegant syntax of Laravel's Eloquent ORM with the power and performance of ScyllaDB. Whether you're building high-scale applications or need the flexibility of both SQL and NoSQL databases, ScyllinX provides the tools you need.

### Key Benefits

- **Type Safety**: Full TypeScript support ensures your queries are type-safe at compile time
- **Performance**: Optimized for ScyllaDB's architecture with features like token-based queries and lightweight transactions
- **Familiar Syntax**: If you know Laravel's Eloquent, you already know ScyllinX
- **Flexible**: Works with both ScyllaDB and traditional SQL databases
- **Modern**: Built with modern JavaScript/TypeScript features and best practices

## Getting Started

```bash
npm install scyllinx
```

[Get started →](/guide/introduction)
