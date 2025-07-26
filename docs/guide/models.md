# Models

Models are the heart of ScyllinX, representing database tables and providing an Active Record interface for interacting with your data. Each model corresponds to a database table and includes methods for querying, creating, updating, and deleting records.

## Defining Models

### Basic Model Definition

```typescript
import { Model } from 'scyllinx';

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
}

class User extends Model<UserAttributes> {
  protected static table = 'users';
  protected static primaryKey = 'id';
  protected static fillable = ['name', 'email'];
  protected static timestamps = true;
}
```

### Model Configuration

Models support various configuration options:

```typescript
class User extends Model<UserAttributes> {
  // Table name (defaults to pluralized class name)
  protected static table = 'users';
  
  // Primary key column (defaults to 'id')
  protected static primaryKey = 'id';
  
  // Database connection name (defaults to 'default')
  protected static connection = 'users_db';
  
  // ScyllaDB keyspace (optional)
  protected static keyspace = 'blog_app';
  
  // Mass assignable attributes
  protected static fillable = ['name', 'email', 'bio'];
  
  // Mass assignment protection (overrides fillable)
  protected static guarded = ['id', 'created_at'];
  
  // Hidden attributes (excluded from serialization)
  protected static hidden = ['password', 'remember_token'];
  
  // Visible attributes (only these are included in serialization)
  protected static visible = ['id', 'name', 'email'];
  
  // Attribute casting
  protected static casts = {
    age: 'integer',
    is_active: 'boolean',
    metadata: 'json',
    created_at: 'date'
  };
  
  // Date attributes
  protected static dates = ['created_at', 'updated_at', 'deleted_at'];
  
  // Enable/disable timestamps
  protected static timestamps = true;
  
  // Enable soft deletes
  protected static softDeletes = true;
}
```

## ScyllaDB-Specific Configuration

For ScyllaDB tables, you can specify partition and clustering keys:

```typescript
class UserEvent extends Model<UserEventAttributes> {
  protected static table = 'user_events';
  protected static connection = 'scylladb';
  
  // Partition keys (required for ScyllaDB)
  protected static partitionKeys = ['user_id'];
  
  // Clustering keys (optional, determines sort order)
  protected static clusteringKeys = ['event_time', 'event_id'];
}
```

## Creating Models

### Single Record Creation

```typescript
// Create a new user
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com'
});

console.log(user.id); // Auto-generated UUID
console.log(user.created_at); // Auto-set timestamp
```

### Batch Creation

```typescript
// Create multiple users at once
const users = await User.createMany([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' }
]);

console.log(`Created ${users.length} users`);
```

### Using Model Constructor

```typescript
// Create model instance without saving
const user = new User({
  name: 'Jane Doe',
  email: 'jane@example.com'
});

// Save to database
await user.save();

// Or use fill() method
const user2 = new User();
user2.fill({
  name: 'Mike Smith',
  email: 'mike@example.com'
});
await user2.save();
```

## Retrieving Models

### Finding by Primary Key

```typescript
// Find by ID
const user = await User.find('user-id-123');
if (user) {
  console.log(user.name);
}

// Find or throw exception
const user = await User.findOrFail('user-id-123');
```

### Basic Queries

```typescript
// Get all users
const allUsers = await User.all();

// Get first user
const firstUser = await User.first();

// Using query builder
const activeUsers = await User.query()
  .where('active', true)
  .orderBy('created_at', 'desc')
  .limit(10)
  .get();
```

### Advanced Queries

```typescript
// Multiple conditions
const users = await User.query()
  .where('active', true)
  .where('created_at', '>', new Date('2024-01-01'))
  .whereIn('role', ['admin', 'moderator'])
  .get();

// OR conditions
const users = await User.query()
  .where('role', 'admin')
  .orWhere('permissions', 'like', '%manage%')
  .get();
```
<!-- // Complex conditions
const users = await User.query()
  .where(query => {
    query.where('role', 'admin')
         .orWhere('role', 'moderator');
  })
  .where('active', true)
  .get(); -->

## Updating Models

### Single Model Updates

```typescript
const user = await User.find('user-id-123');
if (user) {
  // Update individual attributes
  user.name = 'Updated Name';
  user.email = 'updated@example.com';
  await user.save();
  
  // Or use update method
  await user.update({
    name: 'Another Update',
    bio: 'Updated bio'
  });
}
```

### Bulk Updates

```typescript
// Update multiple records
const updatedCount = await User.query()
  .where('active', false)
  .update({
    active: true,
    updated_at: new Date()
  });

console.log(`Updated ${updatedCount} users`);
```

### Update or Create

```typescript
// Update existing or create new
const user = await User.updateOrCreate(
  { email: 'john@example.com' }, // Search criteria
  { name: 'John Doe', active: true } // Data to update/create
);
```

## Deleting Models

### Single Model Deletion

```typescript
const user = await User.find('user-id-123');
if (user) {
  await user.delete();
  console.log('User deleted');
}
```

### Bulk Deletion

```typescript
// Delete multiple records
const deletedCount = await User.query()
  .where('active', false)
  .where('last_login', '<', new Date('2023-01-01'))
  .delete();

console.log(`Deleted ${deletedCount} inactive users`);
```

<!-- ### Soft Deletes

Enable soft deletes to mark records as deleted without actually removing them:

```typescript
class User extends Model<UserAttributes> {
  protected static softDeletes = true;
  protected static dates = ['created_at', 'updated_at', 'deleted_at'];
}

// Soft delete a user
await user.delete(); // Sets deleted_at timestamp

// Query only non-deleted records (automatic)
const activeUsers = await User.all(); // Excludes soft-deleted

// Include soft-deleted records
const allUsers = await User.withTrashed().get();

// Only soft-deleted records
const deletedUsers = await User.onlyTrashed().get();

// Restore soft-deleted record
await user.restore();

// Permanently delete
await user.forceDelete();
``` -->

## Attribute Casting

ScyllinX automatically casts attributes to the specified types:

```typescript
class User extends Model<UserAttributes> {
  protected static casts = {
    age: 'integer',
    is_active: 'boolean',
    settings: 'json',
    created_at: 'date',
    score: 'float'
  };
}

const user = await User.find('user-id-123');
console.log(typeof user.age); // number
console.log(typeof user.is_active); // boolean
console.log(typeof user.settings); // object
console.log(user.created_at instanceof Date); // true
```

### Available Cast Types

- `integer` / `int` - Cast to number (integer)
- `float` / `double` - Cast to number (float)
- `boolean` / `bool` - Cast to boolean
- `string` - Cast to string
- `json` / `object` / `array` - Parse JSON string to object/array
- `date` / `datetime` - Cast to Date object

## Mutators and Accessors

### Accessors (Getters)

Transform attribute values when retrieving them:

```typescript
class User extends Model<UserAttributes> {
  // Accessor for full name
  getFullNameAttribute(): string {
    return `${this.first_name} ${this.last_name}`;
  }
  
  // Accessor for formatted date
  getFormattedCreatedAtAttribute(): string {
    return this.created_at?.toLocaleDateString() || '';
  }
}

const user = await User.find('user-id-123');
console.log(user.full_name); // Calls getFullNameAttribute()
console.log(user.formatted_created_at); // Calls getFormattedCreatedAtAttribute()
```

### Mutators (Setters)

Transform attribute values when setting them:

```typescript
class User extends Model<UserAttributes> {
  // Mutator for email (always lowercase)
  setEmailAttribute(value: string): string {
    return value.toLowerCase();
  }
  
  // Mutator for password (hash it)
  setPasswordAttribute(value: string): void {
    const hashedPassword = this.hashPassword(value);
    return hashedPassword
  }
  
  private hashPassword(password: string): string {
    // Your password hashing logic here
    return 'hashed_' + password; // Simplified for example
  }
}

const user = new User();
user.email = 'JOHN@EXAMPLE.COM'; // Automatically converted to lowercase
user.password = 'plaintext'; // Automatically hashed
user.save()
```

## Serialization

### Converting to Objects

```typescript
const user = await User.find('user-id-123');

// Convert to plain object
const userObject = user.toObject();
console.log(userObject); // { id: '...', name: '...', email: '...' }

// Convert to JSON string
const userJson = user.toJSON();
console.log(userJson); // '{"id":"...","name":"...","email":"..."}'
```

### Controlling Serialization

Use `hidden` and `visible` attributes to control what gets serialized:

```typescript
class User extends Model<UserAttributes> {
  // Hide sensitive attributes
  protected static hidden = ['password', 'remember_token'];
  
  // Or specify only visible attributes
  protected static visible = ['id', 'name', 'email', 'created_at'];
}

const user = await User.find('user-id-123');
const userObject = user.toObject(); // password and remember_token excluded
```

### Custom Serialization

```typescript
class User extends Model<UserAttributes> {
  // Override toObject for custom serialization
  toObject(): Partial<UserAttributes> {
    const attributes = super.toObject();
    
    // Add computed properties
    return {
      ...attributes,
      full_name: this.getFullName(),
      avatar_url: this.getAvatarUrl()
    };
  }
  
  private getFullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
  
  private getAvatarUrl(): string {
    return `https://avatars.example.com/${this.id}`;
  }
}
```

<!-- ## Model Events

ScyllinX supports model lifecycle events:

```typescript
class User extends Model<UserAttributes> {
  // Override event methods
  protected async fireModelEvent(event: string): Promise<boolean> {
    console.log(`User model event: ${event}`);
    
    if (event === 'creating') {
      // Set default values before creating
      if (!this.getAttribute('role')) {
        this.setAttribute('role', 'user');
      }
    }
    
    if (event === 'updating') {
      // Update timestamp
      this.setAttribute('updated_at', new Date());
    }
    
    return true; // Return false to cancel the operation
  }
}
```

### Available Events

- `creating` - Before creating a new record
- `created` - After creating a new record
- `updating` - Before updating a record
- `updated` - After updating a record
- `saving` - Before saving (create or update)
- `saved` - After saving (create or update)
- `deleting` - Before deleting a record
- `deleted` - After deleting a record -->

## Scopes

<!-- Define reusable query constraints:
  // Global scope (applied to all queries)
  protected static globalScopes = {
    active: (query: QueryBuilder<User, UserAttributes>) => {
      return query.where('active', true);
    }
  }; -->
```typescript
class User extends Model<UserAttributes> {

  // Local scopes (called explicitly)
  static admins() {
    return this.query().where('role', 'admin');
  }
  
  static createdAfter(date: Date) {
    return this.query().where('created_at', '>', date);
  }
  
  static withEmail(email: string) {
    return this.query().where('email', email);
  }
}

// Using scopes
const admins = await User.admins().get();
const recentUsers = await User.createdAfter(new Date('2024-01-01')).get();
const specificUser = await User.withEmail('john@example.com').first();

// Chaining scopes (NOT IMPLEMENTED)
const recentAdmins = await User.admins()
  .createdAfter(new Date('2024-01-01'))
  .get();
```

## Custom Methods

Add custom methods to your models:

```typescript
class User extends Model<UserAttributes> {
  // Instance methods
  getDisplayName(): string {
    return this.name || 'Anonymous User';
  }
  
  async getPostCount(): Promise<number> {
    return await this.postsRelation().count();
  }
  
  async isAdmin(): Promise<boolean> {
    const adminRole = await this.rolesRelation()
      .where('name', 'admin')
      .first();
    return !!adminRole;
  }
  
  // Static methods
  static async findByEmail(email: string): Promise<User | null> {
    return await this.query()
      .where('email', email)
      .first();
  }
  
  static async getActiveCount(): Promise<number> {
    return await this.query()
      .where('active', true)
      .count();
  }
}

// Using custom methods
const user = await User.findByEmail('john@example.com');
if (user) {
  console.log(user.getDisplayName());
  console.log(`Posts: ${await user.getPostCount()}`);
  console.log(`Is admin: ${await user.isAdmin()}`);
}

const activeUserCount = await User.getActiveCount();
console.log(`Active users: ${activeUserCount}`);
```

## Working with Timestamps

### Automatic Timestamps

When `timestamps = true`, ScyllinX automatically manages `created_at` and `updated_at`:

```typescript
class Post extends Model<PostAttributes> {
  protected static timestamps = true;
}

// Creating sets both timestamps
const post = await Post.create({
  title: 'My Post',
  content: 'Post content'
});
console.log(post.created_at); // Current timestamp
console.log(post.updated_at); // Current timestamp

// Updating only changes updated_at
await post.update({ title: 'Updated Title' });
console.log(post.updated_at); // New timestamp
```

### Custom Timestamp Columns

```typescript
class Post extends Model<PostAttributes> {
  protected static timestamps = true;
  protected static createdAtColumn = 'created_on';
  protected static updatedAtColumn = 'modified_on';
}
```

### Disabling Timestamps for Operations

```typescript
// Save without updating timestamps
await user.saveWithoutTimestamps();

// Update without timestamps
await User.query()
  .where('id', userId)
  .withoutTimestamps()
  .update({ last_seen: new Date() });
```

## Mass Assignment

### Fillable Attributes

Only attributes in the `fillable` array can be mass assigned:

```typescript
class User extends Model<UserAttributes> {
  protected static fillable = ['name', 'email', 'bio'];
}

// This works - all attributes are fillable
const user = await User.create({
  name: 'John',
  email: 'john@example.com',
  bio: 'Developer'
});

// This ignores 'id' and 'created_at' (not fillable)
const user2 = await User.create({
  id: 'custom-id', // Ignored
  name: 'Jane',
  email: 'jane@example.com',
  created_at: new Date() // Ignored
});
```

### Guarded Attributes

Use `guarded` to specify attributes that cannot be mass assigned:

```typescript
class User extends Model<UserAttributes> {
  protected static guarded = ['id', 'created_at', 'updated_at'];
}

// All attributes except guarded ones can be mass assigned
const user = await User.create({
  name: 'John',
  email: 'john@example.com',
  role: 'admin', // This works
  id: 'custom-id' // This is ignored (guarded)
});
```

### Force Fill

Bypass mass assignment protection:

```typescript
const user = new User();
user.forceFill({
  id: 'custom-id',
  name: 'John',
  email: 'john@example.com',
  created_at: new Date()
});
await user.save();
```

## Model State

### Checking Model State

```typescript
const user = new User({ name: 'John' });

console.log(user.exists); // false (not saved to database)
console.log(user.isDirty()); // true (has unsaved changes)
console.log(user.getDirty()); // { name: 'John' }

await user.save();

console.log(user.exists); // true (now exists in database)
console.log(user.isDirty()); // false (no unsaved changes)
console.log(user.wasRecentlyCreated); // true

user.name = 'Jane';
console.log(user.isDirty()); // true
console.log(user.isDirty(['name'])); // true
console.log(user.isDirty(['email'])); // false
console.log(user.getDirty()); // { name: 'Jane' }
```

### Original Values

```typescript
const user = await User.find('user-id-123');
console.log(user.name); // 'John'

user.name = 'Jane';
console.log(user.name); // 'Jane'
console.log(user.getOriginal('name')); // 'John'
console.log(user.getOriginal()); // Original attributes object
```

## Advanced Model Features

### Model Refresh

Reload model data from the database:

```typescript
const user = await User.find('user-id-123');
console.log(user.name); // 'John'

// Another process updates the user's name to 'Jane'

await user.refresh();
console.log(user.name); // 'Jane' (refreshed from database)
```

### Model Replication

```typescript
const user = await User.find('user-id-123');

// Create a copy with new attributes
const newUser = user.replicate({
  email: 'new-email@example.com'
});

await newUser.save(); // Saves as a new record
```

### Touch Method

Update timestamps without changing other attributes:

```typescript
const user = await User.find('user-id-123');
await user.touch(); // Updates updated_at timestamp

// Touch related models
await user.touch(['posts', 'comments']);
```

## Best Practices

### 1. Use Type-Safe Interfaces

Always define TypeScript interfaces for your model attributes:

```typescript
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  age?: number;
  created_at?: Date;
  updated_at?: Date;
}

class User extends Model<UserAttributes> {
  // Model implementation
}
```

### 2. Organize Model Files

Keep models organized in a dedicated directory:

```
src/
├── models/
│   ├── User.ts
│   ├── Post.ts
│   ├── Comment.ts
│   └── index.ts
```

### 3. Use Factories for Testing

Create model factories for consistent test data:

```typescript
// src/factories/UserFactory.ts
export const UserFactory = defineFactory<User, UserAttributes>("User", {
  id: () => faker.string.uuid(),
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
})
```

### 4. Implement Proper Error Handling

<!-- ```typescript
class UserService {
  async createUser(userData: Partial<UserAttributes>) {
    try {
      const user = await User.create(userData);
      return { success: true, user };
    } catch (error) {
      if (error.code === 'DUPLICATE_KEY') {
        return { success: false, error: 'Email already exists' };
      }
      throw error;
    }
  }
}
``` -->

### 5. Use Scopes for Common Queries

```typescript
class User extends Model<UserAttributes> {
  static active() {
    return this.query().where('active', true);
  }
  
  static byRole(role: string) {
    return this.query().where('role', role);
  }
}

// Usage
// NOT IMPLEMENTED => chained scopes
const activeAdmins = await User.active().byRole('admin').get();
```

This comprehensive guide covers all aspects of working with models in ScyllinX. Models provide a powerful and intuitive way to interact with your database while maintaining type safety and following best practices.
