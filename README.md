<div align="center">
  <img src="docs/public/logo.png" width="100%" height="250" style="object-fit:contain;" alt="ScyllinX Logo" />

  <h1>ScyllinX</h1>
  <p>A TypeScript ORM for ScyllaDB and SQL databases inspired by Laravel Eloquent</p>

  <p>
    <a href="https://www.npmjs.com/package/scyllinx">
      <img src="https://img.shields.io/npm/v/scyllinx.svg?style=flat-square" alt="NPM Version">
    </a>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" />
    <img src="https://img.shields.io/badge/language-TypeScript-blue?style=flat-square" alt="TypeScript" />
    <img src="https://img.shields.io/badge/runtime-Node.js-green?style=flat-square" alt="Node.js" />
  </p>

  [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🤝 Contributing](#-contributing)
</div>

---

## ✨ Overview

**ScyllinX** is a modern Object-Relational Mapper (ORM) written in TypeScript, designed to provide a simple, expressive, and fluent API for working with databases. Inspired by [Laravel Eloquent](https://laravel.com/docs/eloquent), it brings familiar Active Record patterns to Node.js while offering compatibility with both **ScyllaDB** (Cassandra-compatible) and traditional SQL databases.



## 🔥 Key Features

- ✅ **Active Record Syntax** – Define models and interact with them directly
- ⚡ **ScyllaDB-first** design with SQL compatibility (SQLite, PostgreSQL, MySQL)
- 🔗 **Rich relationship system** – `hasOne`, `hasMany`, `belongsTo`, `belongsToMany`, and more
- 🔍 **Type-safe Query Builder** with full IntelliSense support
- 🧠 **Model lifecycle hooks**, casting, and validation
- 📄 **Automatic API Documentation** using JSDoc + VitePress
- 💡 **Composable schema definitions** and decorators for cleaner models
- 🧪 **Built-in testing support** with Jest



## 📦 Installation

```bash
pnpm add scyllinx
# or
npm install scyllinx
# or
yarn add scyllinx
````


## 🧪 Supported Databases
<!-- ✅ Full -->

| Database              | Status   | Driver              |
| ------------------    | ------   | -----------------  |
| **ScyllaDB/Cassandra**| 🧪 Beta  | cassandra-driver   |
| **SQLite**            | 🧪 Beta  | better-sqlite3     |
| **PostgreSQL**        | 🧪 Beta  | pg                 |
| **MySQL**             | 🧪 Beta  | mysql2             |
| **MongoDB**           | 🧪 Beta  | mongodb            |
| **Redis**             | 🧪 Beta  | key-value adapter  |


## 🚀 Quick Start

### 1. Configure Database Connection

```ts
import { ConnectionManager } from 'scyllinx';
import { databaseConfig } from './config/database';

const connectionManager = ConnectionManager.getInstance();
await connectionManager.initialize(databaseConfig);

connectionManager.getConnection().connect();
```

### 2. Define Models

```ts
import { Model, HasMany } from 'scyllinx';
import { Post } from './models/Post'

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
  // Relationships attributes
  posts?: Post[]
}

class User extends Model<UserAttributes> {
  protected static table = 'users';
  protected static primaryKey = 'id';
  protected static fillable = ['name', 'email'];
  protected static timestamps = true;

  // Define relationships
  postsRelation(): HasMany<User, Post> {
    return this.hasMany(Post, 'user_id');
  }
}

// Declaration Merging IMPORTANT
interface User extends UserAttributes {}

export { User, UserAttributes }
```

### 3. Create and Query Models

```ts
// Create a new user
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com'
});

// Find a user
const foundUser = await User.find('user-id');

// Query with conditions
const activeUsers = await User.query()
  .where('active', true)
  .orderBy('created_at', 'desc')
  .limit(10)
  .get();

// Update a user
await user.update({ name: 'Jane Doe' });

// Delete a user
await user.delete();
```

---

## 📄 Documentation

> 📘 Full documentation is available at:
**[https://selori.github.io/scyllinx](https://selori.github.io/scyllinx)**

<!-- To run the docs locally:

```bash
pnpm docs:dev
```

To build static documentation for GitHub Pages:

```bash
pnpm docs:build
```

To generate the API docs from source code (JSDoc):

```bash
pnpm docs:api
``` -->

<!-- ---

## 🛠 Scripts & CLI

| Task                | Command              |
| ------------------- | -------------------- |
| Development Build   | `pnpm build:dev`     |
| Production Build    | `pnpm build:prod`    |
| Run Tests           | `pnpm test`          |
| Watch Mode          | `pnpm test:watch`    |
| Coverage Report     | `pnpm test:coverage` |
| Release Patch       | `pnpm release`       |
| API Docs Generation | `pnpm docs:api`      |

--- -->

## 👨‍💻 Contributing

We welcome contributions of all kinds!

### 🧷 Guidelines:

1. Fork and clone the repository
2. Use `pnpm` to install dependencies
3. Use conventional commits (e.g., `feat:`, `fix:`)
4. Run `pnpm lint && pnpm test` before submitting a PR
5. Update documentation if applicable

> Please see our [Contributing Guide](CONTRIBUTING.md) for details.

<!-- ---

## 🧰 Roadmap

* [x] ScyllaDB grammar and driver support
* [x] Active Record base model with decorators
* [x] SQL drivers (PostgreSQL, SQLite, MySQL)
* [x] Relationship API (`hasMany`, `belongsToMany`, etc.)
* [ ] Schema migration tool (WIP)
* [ ] CLI tooling (`scyllinx make:model`, etc.)
* [ ] Plugin system for custom grammars

--- -->

## 📜 License

**MIT** © ScyllinX Team – 2025
See [LICENSE](./LICENSE) for full license text.

> Developed with ❤️ for modern TypeScript applications