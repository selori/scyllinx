# Relationships

Relationships define how models are connected to each other in ScyllinX. The ORM supports all common relationship types including one-to-one, one-to-many, many-to-many, and polymorphic relationships, all with full TypeScript support.

## Relationship Types Overview

ScyllinX supports the following relationship types:

- **HasOne** - One-to-one relationship
- **HasMany** - One-to-many relationship  
- **BelongsTo** - Inverse of one-to-one or one-to-many
- **BelongsToMany** - Many-to-many relationship
- **MorphOne** - Polymorphic one-to-one
- **MorphMany** - Polymorphic one-to-many
- **MorphTo** - Polymorphic belongs-to

## One-to-One Relationships (HasOne)

A one-to-one relationship links one record to exactly one other record.

### Defining HasOne Relationships

```typescript
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  profile?: Profile
}

interface ProfileAttributes {
  id: string;
  user_id: string;
  bio: string;
  avatar_url: string;
  user?: User
}

class User extends Model<UserAttributes> {
  protected static table = 'users';
  
  // Define one-to-one relationship
  profileRelation(): HasOne<User, Profile> {
    return this.hasOne(Profile, 'user_id', 'id');
  }
}

class Profile extends Model<ProfileAttributes> {
  protected static table = 'profiles';
  
  // Define inverse relationship
  userRelation(): BelongsTo<Profile, User> {
    return this.belongsTo(User, 'user_id', 'id');
  }
}
```

### Using HasOne Relationships

```typescript
// Get user with profile
const user = await User.query()
  .with('profile')
  .first();

console.log(user.profile?.bio);

// Access relationship directly
const user = await User.find('user-id');
const profile = await user.profileRelation().first();

// Create related record
const user = await User.find('user-id');
const profile = await user.profileRelation().create({
  bio: 'Software developer',
  avatar_url: 'https://example.com/avatar.jpg'
});
```

## One-to-Many Relationships (HasMany)

A one-to-many relationship links one record to multiple related records.

### Defining HasMany Relationships

```typescript
interface PostAttributes {
  id: string;
  title: string;
  content: string;
  user_id: string;
  user?: User
  comments?: Comment[]
}

interface CommentAttributes {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  user?: User
  post?: Post
}

class User extends Model<UserAttributes> {
  // User has many posts
  postsRelation(): HasMany<User, Post> {
    return this.hasMany(Post, 'user_id', 'id');
  }
  
  // User has many comments
  commentsRelation(): HasMany<User, Comment> {
    return this.hasMany(Comment, 'user_id', 'id');
  }
}

class Post extends Model<PostAttributes> {
  // Post belongs to user
  userRelation(): BelongsTo<Post, User> {
    return this.belongsTo(User, 'user_id', 'id');
  }
  
  // Post has many comments
  commentsRelation(): HasMany<Post, Comment> {
    return this.hasMany(Comment, 'post_id', 'id');
  }
}

class Comment extends Model<CommentAttributes> {
  // Comment belongs to user
  userRelation(): BelongsTo<Comment, User> {
    return this.belongsTo(User, 'user_id', 'id');
  }
  
  // Comment belongs to post
  postRelation(): BelongsTo<Comment, Post> {
    return this.belongsTo(Post, 'post_id', 'id');
  }
}
```

### Using HasMany Relationships

```typescript
// Get user with all posts
const user = await User.query()
  .with('posts')
  .first();

console.log(`User has ${user.posts?.length} posts`);

// Get posts with constraints
const user = await User.find('user-id');
const publishedPosts = await user.postsRelation()
  .where('published', true)
  .orderBy('created_at', 'desc')
  .get();

// Create related records
const newPost = await user.postsRelation().create({
  title: 'New Post',
  content: 'Post content here...'
});

// Create multiple related records
const posts = await user.postsRelation().createMany([
  { title: 'Post 1', content: 'Content 1' },
  { title: 'Post 2', content: 'Content 2' }
]);

// Count related records
const postCount = await user.postsRelation().count();

// Check if related records exist
const hasPosts = await user.postsRelation().exists();
```

## Belongs To Relationships

BelongsTo defines the inverse side of HasOne and HasMany relationships.

### Advanced BelongsTo Usage

```typescript
class Post extends Model<PostAttributes> {
  userRelation(): BelongsTo<Post, User> {
    return this.belongsTo(User, 'user_id', 'id');
  }
  
  categoryRelation(): BelongsTo<Post, Category> {
    return this.belongsTo(Category, 'category_id', 'id');
  }
}

// Usage examples
const post = await Post.query()
  .with('user', 'category')
  .first();

console.log(`Post by ${post.user?.name} in ${post.category?.name}`);

// Access parent directly
const post = await Post.find('post-id');
const author = await post.userRelation().first();

// Update parent relationship
await post.userRelation().associate(newUser);

// Remove parent relationship
await post.userRelation().dissociate();
```

## Many-to-Many Relationships (BelongsToMany)

Many-to-many relationships connect records through a pivot table.

### Defining BelongsToMany Relationships

```typescript
interface RoleAttributes {
  id: string;
  name: string;
  description: string;
  users?: User[]
}

interface TagAttributes {
  id: string;
  name: string;
  slug: string;
  posts?: Post[]
}

// Pivot table interfaces
interface UserRoleAttributes {
  user_id: string;
  role_id: string;
  assigned_at: Date;
}

interface PostTagAttributes {
  post_id: string;
  tag_id: string;
  created_at: Date;
}

class User extends Model<UserAttributes> {
  // Many-to-many with roles
  rolesRelation(): BelongsToMany<User, Role> {
    return this.belongsToMany(
      Role,           // Related model
      'user_roles',   // Pivot table
      'user_id',      // Foreign key in pivot
      'role_id',      // Related key in pivot
      'id',           // Local key
      'id'            // Related key
    );
  }
}

class Role extends Model<RoleAttributes> {
  usersRelation(): BelongsToMany<Role, User> {
    return this.belongsToMany(User, 'user_roles', 'role_id', 'user_id');
  }
}

class Post extends Model<PostAttributes> {
  tagsRelation(): BelongsToMany<Post, Tag> {
    return this.belongsToMany(Tag, 'post_tags', 'post_id', 'tag_id');
  }
}

class Tag extends Model<TagAttributes> {
  postsRelation(): BelongsToMany<Tag, Post> {
    return this.belongsToMany(Post, 'post_tags', 'tag_id', 'post_id');
  }
}
```

### Using BelongsToMany Relationships

```typescript
// Get user with roles
const user = await User.query()
  .with('roles')
  .first();

console.log(`User has roles: ${user.roles?.map(r => r.name).join(', ')}`);

// Access relationship directly
const user = await User.find('user-id');
const roles = await user.rolesRelation().get();

// Attach relationships (add to pivot table)
await user.rolesRelation().attach(['role-1', 'role-2']);

// Attach with pivot data
await user.rolesRelation().attach({
  'role-1': { assigned_at: new Date() },
  'role-2': { assigned_at: new Date() }
});

// Detach relationships (remove from pivot table)
await user.rolesRelation().detach(['role-1']);

// Detach all
await user.rolesRelation().detach();

// Sync relationships (replace all)
await user.rolesRelation().sync(['role-1', 'role-3']);

// Toggle relationships
await user.rolesRelation().toggle(['role-1', 'role-2']);

// Update pivot data
await user.rolesRelation().updateExistingPivot('role-1', {
  assigned_at: new Date()
});
```

### Working with Pivot Data

```typescript
class User extends Model<UserAttributes> {
  roles() {
    return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id')
      .withPivot('assigned_at', 'assigned_by') // Include pivot columns
      .withTimestamps(); // Include created_at, updated_at in pivot
  }
}

// Access pivot data
const user = await User.query()
  .with('roles')
  .first();

user.roles?.forEach(role => {
  console.log(`Role: ${role.name}`);
  console.log(`Assigned at: ${role.pivot.assigned_at}`);
  console.log(`Assigned by: ${role.pivot.assigned_by}`);
});

// Query with pivot constraints
const adminUsers = await User.query()
  .with('roles', (query) => {
    query.wherePivot('assigned_at', '>', new Date('2024-01-01'));
  })
  .get();
```

<!-- ## Polymorphic Relationships

Polymorphic relationships allow a model to belong to more than one other model on a single association.

### One-to-One Polymorphic (MorphOne)

```typescript
interface ImageAttributes {
  id: string;
  url: string;
  imageable_type: string; // Model class name
  imageable_id: string;   // Model ID
}

class User extends Model<UserAttributes> {
  // User morphs one image
  image(): MorphOne<User, Image> {
    return this.morphOne(Image, 'imageable');
  }
}

class Post extends Model<PostAttributes> {
  // Post morphs one image
  image(): MorphOne<Post, Image> {
    return this.morphOne(Image, 'imageable');
  }
}

class Image extends Model<ImageAttributes> {
  // Image belongs to imageable (User or Post)
  imageable(): MorphTo<Image, User | Post> {
    return this.morphTo('imageable');
  }
}
```

### One-to-Many Polymorphic (MorphMany)

```typescript
interface CommentAttributes {
  id: string;
  content: string;
  commentable_type: string;
  commentable_id: string;
  user_id: string;
}

class Post extends Model<PostAttributes> {
  // Post has many comments (polymorphic)
  comments(): MorphMany<Post, Comment> {
    return this.morphMany(Comment, 'commentable');
  }
}

class Video extends Model<VideoAttributes> {
  // Video has many comments (polymorphic)
  comments(): MorphMany<Video, Comment> {
    return this.morphMany(Comment, 'commentable');
  }
}

class Comment extends Model<CommentAttributes> {
  // Comment belongs to commentable (Post or Video)
  commentable(): MorphTo<Comment, Post | Video> {
    return this.morphTo('commentable');
  }
  
  // Comment belongs to user
  user(): BelongsTo<Comment, User> {
    return this.belongsTo(User, 'user_id', 'id');
  }
}
```

### Using Polymorphic Relationships

```typescript
// Create polymorphic relationships
const post = await Post.find('post-id');
const comment = await post.comments().create({
  content: 'Great post!',
  user_id: 'user-id'
});

const video = await Video.find('video-id');
const videoComment = await video.comments().create({
  content: 'Nice video!',
  user_id: 'user-id'
});

// Query polymorphic relationships
const post = await Post.query()
  .with('comments.user')
  .first();

// Access polymorphic parent
const comment = await Comment.query()
  .with('commentable', 'user')
  .first();

console.log(`Comment on ${comment.commentable_type}: ${comment.commentable?.title}`);
```

### Many-to-Many Polymorphic

```typescript
interface TaggableAttributes {
  tag_id: string;
  taggable_type: string;
  taggable_id: string;
}

class Tag extends Model<TagAttributes> {
  // Tag can be attached to posts, videos, etc.
  posts() {
    return this.morphedByMany(Post, 'taggable', 'taggables');
  }
  
  videos() {
    return this.morphedByMany(Video, 'taggable', 'taggables');
  }
}

class Post extends Model<PostAttributes> {
  // Post can have many tags (polymorphic many-to-many)
  tags() {
    return this.morphToMany(Tag, 'taggable', 'taggables');
  }
}

class Video extends Model<VideoAttributes> {
  tags() {
    return this.morphToMany(Tag, 'taggable', 'taggables');
  }
}

// Usage
const post = await Post.find('post-id');
await post.tags().attach(['tag-1', 'tag-2']);

const tag = await Tag.find('tag-id');
const taggedPosts = await tag.posts().get();
const taggedVideos = await tag.videos().get();
``` -->

## Eager Loading

Eager loading allows you to load relationships along with the main query to avoid N+1 query problems.

### Basic Eager Loading

```typescript
// Load single relationship
const users = await User.query()
  .with('posts')
  .get();

// Load multiple relationships
const users = await User.query()
  .with('posts', 'profile', 'roles')
  .get();

// Nested relationships
const users = await User.query()
  .with('posts.comments', 'posts.tags')
  .get();

// Deep nesting
const users = await User.query()
  .with('posts.comments.user.profile')
  .get();
```

### Conditional Eager Loading

```typescript
// Load relationship with constraints NOT IMPLEMENTED
const users = await User.query()
  .with('posts', (query) => {
    query.where('published', true)
         .orderBy('created_at', 'desc')
         .limit(5);
  })
  .get();

// Multiple constraints NOT IMPLEMENTED
const users = await User.query()
  .with('posts', (query) => {
    query.where('published', true)
         .where('created_at', '>', new Date('2024-01-01'));
  })
  .with('comments', (query) => {
    query.orderBy('created_at', 'desc')
         .limit(10);
  })
  .get();
```

### Lazy Eager Loading

Load relationships after the model has been retrieved:

```typescript
// Load relationships on existing models
const users = await User.all();

// Load single relationship
await users[0].load('posts');

// Load multiple relationships
await users[0].load('posts', 'profile');

// Load with constraints
await users[0].load('posts', (query) => {
  query.where('published', true);
});

// Load on collection
const users = await User.limit(10).get();
await User.loadMissing(users, 'posts.comments');
```

<!-- ## Relationship Constraints

### Querying Relationship Existence

```typescript
// Users who have posts
const usersWithPosts = await User.query()
  .has('posts')
  .get();

// Users who have at least 5 posts
const prolificUsers = await User.query()
  .has('posts', '>=', 5)
  .get();

// Users who don't have posts
const usersWithoutPosts = await User.query()
  .doesntHave('posts')
  .get();

// Complex relationship queries
const activeUsers = await User.query()
  .whereHas('posts', (query) => {
    query.where('published', true)
         .where('created_at', '>', new Date('2024-01-01'));
  })
  .get();

// Users who don't have published posts
const inactiveUsers = await User.query()
  .whereDoesntHave('posts', (query) => {
    query.where('published', true);
  })
  .get();
```

### Counting Related Models

```typescript
// Get users with post counts
const usersWithCounts = await User.query()
  .withCount('posts')
  .get();

usersWithCounts.forEach(user => {
  console.log(`${user.name} has ${user.posts_count} posts`);
});

// Multiple counts
const users = await User.query()
  .withCount('posts', 'comments', 'roles')
  .get();

// Conditional counts
const users = await User.query()
  .withCount('posts', (query) => {
    query.where('published', true);
  }, 'published_posts_count')
  .get();
``` -->

## Advanced Relationship Techniques

### Custom Relationship Methods

```typescript
class User extends Model<UserAttributes> {
  // Standard relationship
  postsRelation() {
    return this.hasMany(Post, 'user_id', 'id');
  }
  
  // Custom relationship with constraints
  publishedPostsRelation() {
    return this.hasMany(Post, 'user_id', 'id')
      .where('published', true)
      .orderBy('published_at', 'desc');
  }
  
  // Recent posts
  recentPostsRelation(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    return this.hasMany(Post, 'user_id', 'id')
      .where('created_at', '>', since)
      .orderBy('created_at', 'desc');
  }
  
  // Popular posts
  popularPostsRelation(minViews = 1000) {
    return this.hasMany(Post, 'user_id', 'id')
      .where('view_count', '>=', minViews)
      .orderBy('view_count', 'desc');
  }
}

// Usage
const user = await User.find('user-id');
const publishedPosts = await user.publishedPostsRelation().get();
const recentPosts = await user.recentPostsRelation(14).get(); // Last 14 days
const popularPosts = await user.popularPostsRelation(5000).limit(10).get();
```

<!-- ### Relationship Caching

```typescript
class User extends Model<UserAttributes> {
  private _postsCache?: Post[];
  
  async getCachedPosts(): Promise<Post[]> {
    if (!this._postsCache) {
      this._postsCache = await this.posts().get();
    }
    return this._postsCache;
  }
  
  clearPostsCache(): void {
    this._postsCache = undefined;
  }
}
``` -->

### Dynamic Relationships

```typescript
class User extends Model<UserAttributes> {
  // Dynamic relationship based on user type
  getContentRelationship() {
    switch (this.user_type) {
      case 'blogger':
        return this.hasMany(BlogPost, 'user_id', 'id');
      case 'photographer':
        return this.hasMany(Photo, 'user_id', 'id');
      case 'videographer':
        return this.hasMany(Video, 'user_id', 'id');
      default:
        return this.hasMany(Post, 'user_id', 'id');
    }
  }
  
  async getContent() {
    return await this.getContentRelationship().get();
  }
}
```

## ScyllaDB-Specific Relationship Considerations

### Partition Key Relationships

```typescript
// For ScyllaDB, consider partition keys in relationships
class UserEvent extends Model<UserEventAttributes> {
  protected static partitionKeys = ['user_id'];
  protected static clusteringKeys = ['event_time'];
  
  userRelation(): BelongsTo<UserEvent, User> {
    // Efficient lookup using partition key
    return this.belongsTo(User, 'user_id', 'id');
  }
}

class User extends Model<UserAttributes> {
  eventsRelation(): HasMany<Useri UserEvent> {
    // This will be efficient as user_id is the partition key
    return this.hasMany(UserEvent, 'user_id', 'id');
  }
  
  // Get events for a specific time range
  eventsInRange(startTime: Date, endTime: Date) {
    return this.hasMany(UserEvent, 'user_id', 'id')
      .where('event_time', '>=', startTime)
      .where('event_time', '<=', endTime);
  }
}
```

<!-- ### Denormalized Relationships

```typescript
// For ScyllaDB, sometimes denormalization is preferred
class Post extends Model<PostAttributes> {
  // Store user data directly in post for efficiency
  protected static fillable = [
    'title', 'content', 'user_id', 
    'user_name', 'user_email' // Denormalized user data
  ];
  
  // Still maintain relationship for updates
  user() {
    return this.belongsTo(User, 'user_id', 'id');
  }
  
  // Method to sync denormalized data
  async syncUserData() {
    const user = await this.user().first();
    if (user) {
      await this.update({
        user_name: user.name,
        user_email: user.email
      });
    }
  }
}
``` -->

## Testing Relationships

### Unit Testing Relationships

```typescript
// __tests__/relationships.test.ts
describe('User Relationships', () => {
  let user: User;
  
  beforeEach(async () => {
    user = await User.create({
      name: 'John Doe',
      email: 'john@example.com'
    });
  });
  
  test('user can have posts', async () => {
    const post = await user.postsRelation().create({
      title: 'Test Post',
      content: 'Test content'
    });
    
    expect(post.user_id).toBe(user.id);
    
    const posts = await user.postsRelation().get();
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Test Post');
  });
  
  test('user can have many roles', async () => {
    const adminRole = await Role.create({ name: 'admin' });
    const userRole = await Role.create({ name: 'user' });
    
    await user.rolesRelation().attach([adminRole.id, userRole.id]);
    
    const roles = await user.rolesRelation().get();
    expect(roles).toHaveLength(2);
    expect(roles.map(r => r.name)).toContain('admin');
    expect(roles.map(r => r.name)).toContain('user');
  });
  
  test('eager loading works correctly', async () => {
    await user.postsRelation().create({ title: 'Post 1', content: 'Content 1' });
    await user.postsRelation().create({ title: 'Post 2', content: 'Content 2' });
    
    const userWithPosts = await User.query()
      .with('posts')
      .where('id', user.id)
      .first();
    
    expect(userWithPosts?.posts).toHaveLength(2);
  });
});
```

### Integration Testing

```typescript
describe('Relationship Integration', () => {
  test('complex relationship queries', async () => {
    // Create test data
    const user = await User.create({ name: 'Author', email: 'author@example.com' });
    const category = await Category.create({ name: 'Tech' });
    
    const post = await Post.create({
      title: 'Tech Post',
      content: 'Content',
      user_id: user.id,
      category_id: category.id,
      published: true
    });
    
    await post.commentsRelation().create({
      content: 'Great post!',
      user_id: user.id
    });
    
    // Test complex query
    const result = await Post.query()
      .with('user', 'category', 'comments.user')
      .where('published', true)
      .first();
    
    expect(result?.user?.name).toBe('Author');
    expect(result?.category?.name).toBe('Tech');
    expect(result?.comments?.[0]?.content).toBe('Great post!');
  });
});
```

## Best Practices

### 1. Use Appropriate Relationship Types

```typescript
// ✅ Good: Use HasOne for one-to-one relationships
class User extends Model<UserAttributes> {
  profileRelation(): HasOne<User, Profile> {
    return this.hasOne(Profile, 'user_id', 'id');
  }
}

// ❌ Bad: Using HasMany for one-to-one
class User extends Model<UserAttributes> {
  profileRelation(): HasOne<User, Profile> {
    return this.hasMany(Profile, 'user_id', 'id'); // Wrong!
  }
}
```

### 2. Always Define Inverse Relationships

```typescript
// ✅ Good: Define both sides
class User extends Model<UserAttributes> {
  postsRelation(): HasMany<User, Post> {
    return this.hasMany(Post, 'user_id', 'id');
  }
}

class Post extends Model<PostAttributes> {
  userRelation(): BelongsTo<Post, User> {
    return this.belongsTo(User, 'user_id', 'id');
  }
}
```

### 3. Use Eager Loading to Avoid N+1 Queries

```typescript
// ✅ Good: Eager load relationships
const users = await User.query()
  .with('posts')
  .get();

// ❌ Bad: N+1 query problem
const users = await User.all();
for (const user of users) {
  const posts = await user.postsRelation().get(); // N+1 queries!
}
```

<!-- ### 4. Use Relationship Constraints

```typescript
// ✅ Good: Use constraints for better performance
const activeUsers = await User.query()
  .whereHas('posts', (query) => {
    query.where('published', true);
  })
  .get();

// ❌ Less efficient: Load all then filter
const users = await User.query().with('posts').get();
const activeUsers = users.filter(user => 
  user.posts?.some(post => post.published)
);
``` -->

### 4. Consider Database-Specific Optimizations

```typescript
// For ScyllaDB: Use partition keys efficiently
class UserEvent extends Model<UserEventAttributes> {
  protected static partitionKeys = ['user_id'];
  
  userRelation(): BelongsTo<UserEvent, User> {
    return this.belongsTo(User, 'user_id', 'id');
  }
}

// For SQL: Use proper indexes
class Post extends Model<PostAttributes> {
  // Ensure user_id is indexed for efficient joins
  userRelation(): BelongsTo<Post, User> {
    return this.belongsTo(User, 'user_id', 'id');
  }
}
```

Relationships are a powerful feature of ScyllinX that allow you to model complex data structures while maintaining clean, readable code. By understanding and properly implementing relationships, you can build robust applications that efficiently handle related data across your database.
