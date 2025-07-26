# Quick Start

This guide will walk you through creating your first ScyllinX application. We'll build a simple blog system with users, posts, and comments to demonstrate the core features.

## Prerequisites

Make sure you have completed the [Installation](/guide/installation) guide and have:

- ScyllinX installed in your project
- A database connection configured
- TypeScript set up (recommended)

## Project Overview

We'll create a blog system with these models:
- **User** - Blog authors
- **Post** - Blog posts
- **Comment** - Comments on posts

## Step 1: Define Model Interfaces

First, let's define TypeScript interfaces for our models:

```typescript
// src/types/models.ts

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  bio?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PostAttributes {
  id: string;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  user_id: string;
  published_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CommentAttributes {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}
```

## Step 2: Create Models

Now let's create our models with relationships:

### User Model

```typescript
// src/models/User.ts
import { Model, HasMany } from 'scyllinx';
import { UserAttributes } from '@/types/index/models';
import { Post } from './Post';
import { Comment } from './Comment';

export class User extends Model<UserAttributes> {
  protected static table = 'users';
  protected static primaryKey = 'id';
  protected static fillable = ['name', 'email', 'password', 'bio'];
  protected static hidden = ['password'];
  protected static timestamps = true;

  // Relationships
  postsRelation(): HasMany<User, Post> {
    return this.hasMany(Post, 'user_id', 'id');
  }

  commentsRelation(): HasMany<User, Comment> {
    return this.hasMany(Comment, 'user_id', 'id');
  }

  // Custom methods
  getDisplayName(): string {
    return this.name || 'Anonymous';
  }

  async getPublishedPosts() {
    return await this.postsRelation()
      .where('published', true)
      .orderBy('published_at', 'desc')
      .get();
  }
}
```

### Post Model

```typescript
// src/models/Post.ts
import { Model, HasMany, BelongsTo } from 'scyllinx';
import { PostAttributes } from '@/types/index/models';
import { User } from './User';
import { Comment } from './Comment';

export class Post extends Model<PostAttributes> {
  protected static table = 'posts';
  protected static primaryKey = 'id';
  protected static fillable = ['title', 'content', 'slug', 'published', 'user_id'];
  protected static timestamps = true;

  // Relationships
  userRelation(): BelongsTo<Post, User> {
    return this.belongsTo(User, 'user_id', 'id');
  }

  commentsRelation(): HasMany<Post, Comment> {
    return this.hasMany(Comment, 'post_id', 'id');
  }

  // Scopes
  static published() {
    return this.query().where('published', true);
  }

  static bySlug(slug: string) {
    return this.query().where('slug', slug);
  }

  // Custom methods
  async getCommentCount(): Promise<number> {
    return await this.comments().count();
  }

  getExcerpt(length = 150): string {
    if (this.content.length <= length) {
      return this.content;
    }
    return this.content.substring(0, length) + '...';
  }

  // Mutators
  setTitleAttribute(value: string): string {
    return value.toUpperCase()
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
```

### Comment Model

```typescript
// src/models/Comment.ts
import { Model, BelongsTo } from 'scyllinx';
import { CommentAttributes } from '@/types/index/models';
import { User } from './User';
import { Post } from './Post';

export class Comment extends Model<CommentAttributes> {
  protected static table = 'comments';
  protected static primaryKey = 'id';
  protected static fillable = ['content', 'post_id', 'user_id'];
  protected static timestamps = true;

  // Relationships
  user(): BelongsTo<Comment, User> {
    return this.belongsTo(User, 'user_id', 'id');
  }

  post(): BelongsTo<Comment, Post> {
    return this.belongsTo(Post, 'post_id', 'id');
  }

  // Custom methods
  getFormattedDate(): string {
    return this.created_at?.toLocaleDateString() || '';
  }
}
```

## Step 3: Create Migrations

Let's create migrations to set up our database schema:

### Users Table Migration

```typescript
// src/migrations/2024_01_01_000001_create_users_table.ts
import { Migration, Schema } from 'scyllinx';

export class CreateUsersTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.text('bio').nullable();
      table.timestamps();
    });

    // Create index on email for faster lookups
    await schema.createIndex('users', 'email', 'idx_users_email');
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable('users');
  }
}
```

### Posts Table Migration

```typescript
// src/migrations/2024_01_01_000002_create_posts_table.ts
import { Migration, Schema } from 'scyllinx';

export class CreatePostsTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable('posts', (table) => {
      table.uuid('id').primary();
      table.string('title');
      table.text('content');
      table.string('slug').unique();
      table.boolean('published').default(false);
      table.uuid('user_id');
      table.timestamp('published_at').nullable();
      table.timestamps();

      // Foreign key constraint (if supported by your database)
      table.foreign('user_id').references('id').on('users');
    });

    // Indexes for better query performance
    await schema.createIndex('posts', 'slug', 'idx_posts_slug');
    await schema.createIndex('posts', 'user_id', 'idx_posts_user_id');
    await schema.createIndex('posts', 'published', 'idx_posts_published');
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable('posts');
  }
}
```

### Comments Table Migration

```typescript
// src/migrations/2024_01_01_000003_create_comments_table.ts
import { Migration, Schema } from 'scyllinx';

export class CreateCommentsTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable('comments', (table) => {
      table.uuid('id').primary();
      table.text('content');
      table.uuid('post_id');
      table.uuid('user_id');
      table.timestamps();

      // Foreign key constraints
      table.foreign('post_id').references('id').on('posts');
      table.foreign('user_id').references('id').on('users');
    });

    // Indexes
    await schema.createIndex('comments', 'post_id', 'idx_comments_post_id');
    await schema.createIndex('comments', 'user_id', 'idx_comments_user_id');
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable('comments');
  }
}
```

## Step 4: Run Migrations

Create a migration runner script:

```typescript
// src/migrate.ts
import { ConnectionManager, MigrationManager } from 'scyllinx';
import { databaseConfig } from './config/database';
import { CreateUsersTable } from './migrations/2024_01_01_000001_create_users_table';
import { CreatePostsTable } from './migrations/2024_01_01_000002_create_posts_table';
import { CreateCommentsTable } from './migrations/2024_01_01_000003_create_comments_table';

async function runMigrations() {
  try {
    // Initialize connection
    const connectionManager = ConnectionManager.getInstance();
    await connectionManager.initialize(databaseConfig);

    // Create migration manager
    const migrationManager = new MigrationManager(connectionManager);

    // Define migrations in order
    const migrations = [
      new CreateUsersTable(),
      new CreatePostsTable(),
      new CreateCommentsTable()
    ];

    // Run migrations
    console.log('Running migrations...');
    await migrationManager.migrate(migrations);
    console.log('✅ Migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}
```

Run the migrations:

```bash
npx ts-node src/migrate.ts
```

## Step 5: Create Seeders

Let's create some sample data:

### User Factory

```typescript
// src/factories/UserFactory.ts
import { faker } from "@faker-js/faker"
import { defineFactory } from "../../../src"
import { User, UserAttributes } from "../models/User"

export const UserFactory = defineFactory<User, UserAttributes>("User", {
  id: () => faker.string.uuid(),
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
  is_admin: () => false, // %10 şans admin olma
})
.state("admin", () => ({
  is_admin: true,
}))

```

### Database Seeder

```typescript
// src/seeders/DatabaseSeeder.ts
import { Seeder } from 'scyllinx';
import { UserFactory } from '../factories/UserFactory';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';

export class DatabaseSeeder extends Seeder {
  async run(): Promise<void> {
    console.log('Seeding database...');

    // Create users
    const users = await this.factory(() => UserFactory)
      .times(10)
      .create();
    console.log(`Created ${users.length} users`);

    // Create admin user
    const admin = await this.factory(() => UserFactory)
      .as("admin")
      .create({
        name: "Admin User",
        email: "admin@example.com",
      });
    console.log('Created admin user');

    // Create posts
    const posts = [];
    for (const user of users.slice(0, 5)) {
      const userPosts = await Post.createMany([
        {
          title: 'Getting Started with ScyllinX',
          content: 'ScyllinX is a powerful TypeScript ORM...',
          slug: 'quick-start-with-scyllinx',
          published: true,
          user_id: user.id,
          published_at: new Date()
        },
        {
          title: 'Advanced Query Building',
          content: 'Learn how to build complex queries...',
          slug: 'advanced-query-building',
          published: true,
          user_id: user.id,
          published_at: new Date()
        },
        {
          title: 'Draft Post',
          content: 'This is a draft post...',
          slug: 'draft-post',
          published: false,
          user_id: user.id
        }
      ]);
      posts.push(...userPosts);
    }
    console.log(`Created ${posts.length} posts`);

    // Create comments
    let commentCount = 0;
    for (const post of posts.filter(p => p.published)) {
      const numComments = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < numComments; i++) {
        await Comment.create({
          content: `This is comment ${i + 1} on ${post.title}`,
          post_id: post.id,
          user_id: users[Math.floor(Math.random() * users.length)].id
        });
        commentCount++;
      }
    }
    console.log(`Created ${commentCount} comments`);

    console.log('✅ Database seeding completed!');
  }
}
```

## Step 6: Basic Usage Examples

Now let's see how to use our models:

### Creating Records

```typescript
// src/examples/create-records.ts
import { User, Post, Comment } from '../models';

async function createRecords() {
  // Create a user
  const user = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'A passionate developer'
  });

  console.log('Created user:', user);
  // console.log('Created user:', user.toObject());

  // Create a post
  const post = await Post.create({
    title: 'My First Post',
    content: 'This is the content of my first post...',
    slug: 'my-first-post',
    published: true,
    user_id: user.id,
    published_at: new Date()
  });

  console.log('Created post:', post);
  // console.log('Created post:', post.toObject());

  // Create a comment
  const comment = await Comment.create({
    content: 'Great post!',
    post_id: post.id,
    user_id: user.id
  });

  console.log('Created comment:', comment);
  // console.log('Created comment:', comment.toObject());
}
```

### Querying Records

```typescript
// src/examples/query-records.ts
import { User, Post, Comment } from '../models';

async function queryRecords() {
  // Find a user by ID
  const user = await User.find('user-id-here');
  if (user) {
    console.log('Found user:', user.name);
  }

  // Find user by email
  const userByEmail = await User.query()
    .where('email', 'john@example.com')
    .first();

  // Get all published posts with their authors
  const publishedPosts = await Post.query()
    .where('published', true)
    .with('user')
    .orderBy('published_at', 'desc')
    .get();

  console.log('Published posts:', publishedPosts.length);

  // Get posts with comment counts
  const postsWithComments = await Post.query()
    .with('comments')
    .get();

  postsWithComments.forEach(post => {
    console.log(`${post.title}: ${post.comments?.length || 0} comments`);
  });

  // Complex query with multiple conditions
  const recentPosts = await Post.query()
    .where('published', true)
    .where('created_at', '>', new Date('2024-01-01'))
    .whereIn('user_id', ['user1', 'user2', 'user3'])
    .with('user', 'comments.user')
    .orderBy('created_at', 'desc')
    .limit(10)
    .get();

  console.log('Recent posts:', recentPosts.length);
}
```

### Working with Relationships

```typescript
// src/examples/relationships.ts
import { User, Post, Comment } from '../models';

async function workWithRelationships() {
  const user = await User.find('user-id-here');
  if (!user) return;

  // Get user's posts
  const userPosts = await user.postsRelation().getResults();
  console.log(`User has ${userPosts.length} posts`);

  // Get only published posts
  const publishedPosts = await user.postsRelation()
    .where('published', true)
    .get();

  // Create a new post for the user
  const newPost = await user.postsRelation().create({
    title: 'New Post Title',
    content: 'Post content here...',
    slug: 'new-post-title',
    published: true,
    published_at: new Date()
  });

  // Get post with its author and comments
  const postWithRelations = await Post.query()
    .where('id', newPost.id)
    .with('user', 'comments.user')
    .first();

  if (postWithRelations) {
    console.log('Post author:', postWithRelations.user?.name);
    console.log('Comments:', postWithRelations.comments?.length);
  }

  // Add a comment to the post
  const comment = await newPost.commentsRelation().create({
    content: 'This is a great post!',
    user_id: user.id
  });

  console.log('Added comment:', comment.content);
}
```

### Updating and Deleting

```typescript
// src/examples/update-delete.ts
import { User, Post, Comment } from '../models';

async function updateAndDelete() {
  // Update a user
  const user = await User.find('user-id-here');
  if (user) {
    await user.update({
      bio: 'Updated bio content'
    });
    console.log('User updated');
  }

  // Update multiple posts
  const updatedCount = await Post.query()
    .where('published', false)
    .update({
      published: true,
      published_at: new Date()
    });
  console.log(`Published ${updatedCount} posts`);

  // Delete a comment
  const comment = await Comment.find('comment-id-here');
  if (comment) {
    await comment.delete();
    console.log('Comment deleted');
  }

  // Delete multiple records
  const deletedCount = await Comment.query()
    .where('created_at', '<', new Date('2023-01-01'))
    .delete();
  console.log(`Deleted ${deletedCount} old comments`);
}
```

## Step 7: Put It All Together

Create a main application file:

```typescript
// src/app.ts
import { ConnectionManager } from 'scyllinx';
import { databaseConfig } from './config/database';
import { User, Post, Comment } from './models';

class BlogApp {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
  }

  async initialize() {
    await this.connectionManager.initialize(databaseConfig);
    console.log('✅ Database connected');
  }

  async createUser(userData: { name: string; email: string; password: string }) {
    return await User.create(userData);
  }

  async createPost(userId: string, postData: { title: string; content: string }) {
    const user = await User.find(userId);
    if (!user) throw new Error('User not found');

    return await user.postsRelation().create({
      ...postData,
      slug: this.generateSlug(postData.title),
      published: true,
      published_at: new Date()
    });
  }

  async getPublishedPosts(limit = 10) {
    return await Post.query()
      .where('published', true)
      .with('user', 'comments')
      .orderBy('published_at', 'desc')
      .limit(limit)
      .get();
  }

  async getPostBySlug(slug: string) {
    return await Post.query()
      .where('slug', slug)
      .where('published', true)
      .with('user', 'comments.user')
      .first();
  }

  async addComment(postId: string, userId: string, content: string) {
    const post = await Post.find(postId);
    if (!post) throw new Error('Post not found');

    return await post.commentsRelation().create({
      content,
      user_id: userId
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// Usage example
async function main() {
  const app = new BlogApp();
  await app.initialize();

  try {
    // Create a user
    const user = await app.createUser({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123'
    });

    // Create a post
    const post = await app.createPost(user.id, {
      title: 'Welcome to My Blog',
      content: 'This is my first blog post using ScyllinX!'
    });

    // Add a comment
    await app.addComment(post.id, user.id, 'Great first post!');

    // Get published posts
    const posts = await app.getPublishedPosts(5);
    console.log(`Found ${posts.length} published posts`);

    // Get specific post
    const specificPost = await app.getPostBySlug('welcome-to-my-blog');
    if (specificPost) {
      console.log(`Post: ${specificPost.title}`);
      console.log(`Author: ${specificPost.user?.name}`);
      console.log(`Comments: ${specificPost.comments?.length}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { BlogApp };
```

## Next Steps

Congratulations! You've built a complete blog system with ScyllinX. Here's what you can explore next:

### Advanced Features
- **[Query Builder](/guide/query-builder)** - Learn advanced querying techniques
- **[Relationships](/guide/relationships)** - Master all relationship types
- **[ScyllaDB Features](/guide/scylladb-features)** - Leverage ScyllaDB-specific features

### Best Practices
- **[Performance](/guide/performance)** - Optimize your queries and models
- **[Testing](/guide/testing)** - Write tests for your models and queries
- **[Deployment](/guide/deployment)** - Deploy your ScyllinX application

### Real-world Examples
- **[API Development](/examples/api-development)** - Build REST APIs with ScyllinX
- **[Microservices](/examples/microservices)** - Use ScyllinX in microservice architectures
- **[Data Analytics](/examples/analytics)** - Leverage ScyllaDB for analytics workloads

## Common Patterns

### Repository Pattern

```typescript
// src/repositories/PostRepository.ts
import { Post } from '../models/Post';

export class PostRepository {
  async findPublishedBySlug(slug: string) {
    return await Post.query()
      .where('slug', slug)
      .where('published', true)
      .with('user', 'comments.user')
      .first();
  }

  async findByAuthor(userId: string, published = true) {
    const query = Post.query().where('user_id', userId);
    
    if (published) {
      query.where('published', true);
    }
    
    return await query
      .orderBy('created_at', 'desc')
      .get();
  }

  async getPopularPosts(limit = 10) {
    // This would require a comment count column or subquery
    return await Post.query()
      .where('published', true)
      .with('comments')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();
  }
}
```

### Service Layer

```typescript
// src/services/BlogService.ts
import { PostRepository } from '../repositories/PostRepository';
import { User } from '../models/User';

export class BlogService {
  constructor(private postRepository: PostRepository) {}

  async createPost(userId: string, data: { title: string; content: string }) {
    const user = await User.find(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await user.postsRelation().create({
      ...data,
      slug: this.generateSlug(data.title),
      published: true,
      published_at: new Date()
    });
  }

  async getPostWithStats(slug: string) {
    const post = await this.postRepository.findPublishedBySlug(slug);
    if (!post) return null;

    const commentCount = await post.commentsRelation().count();
    
    return {
      ...post.toObject(),
      stats: {
        commentCount
      }
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
```

This getting started guide covers the fundamentals of building applications with ScyllinX. You now have a solid foundation to build upon!
