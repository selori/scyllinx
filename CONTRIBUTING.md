# Contributing to ScyllinX

Thank you for considering contributing to ScyllinX! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 18+ 
- TypeScript 4.9+
- Your database instance for testing
- Git

### Setup Instructions

1. **Fork and Clone**
   ```bash
   git clone https://github.com/selori/scyllinx.git
   cd scyllinx
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Test Database**
   ```bash
   # Start ScyllaDB with Docker
   docker run --name scylla-test -p 9042:9042 -d scylladb/scylla
   
   # Or use existing instance
   export SCYLLA_HOST=localhost
   export SCYLLA_PORT=9042
   export SCYLLA_KEYSPACE=test_scyllinx
   ```
   

4. **Run Tests**
   ```bash
   # Unit tests
   npm test
   
   # Integration tests (requires ScyllaDB)
   npm run test:integration
   
   # All tests
   npm run test:all
   ```

5. **Build Project**
   ```bash
   npm run build
   ```

## Project Structure

```
scyllinx/
├── src/                    # Source code
│   ├── connection/         # Database connection management
│   ├── drivers/           # Database drivers
│   ├── model/             # Model and Active Record implementation
│   ├── query/             # Query builder
│   ├── relationships/     # Relationship implementations
│   ├── schema/            # Schema builder
│   ├── migration/         # Migration system
│   ├── seeder/            # Seeding system
│   └── types/             # TypeScript type definitions
├── __tests__/             # Test files
├── examples/              # Example implementations
├── docs/                  # Documentation
└── scripts/               # Build and utility scripts
```

## Coding Standards

### TypeScript Guidelines

1. **Use strict TypeScript configuration**
   - Enable `strict: true`
   - Use explicit return types for public methods
   - Prefer interfaces over type aliases for object shapes

2. **Naming Conventions**
   - Classes: PascalCase (`UserModel`, `QueryBuilder`)
   - Methods/Variables: camelCase (`findUser`, `queryBuilder`)
   - Constants: UPPER_SNAKE_CASE (`DEFAULT_LIMIT`)
   - Files: kebab-case (`query-builder.ts`)

3. **Code Organization**
   - One class per file
   - Group related functionality
   - Use barrel exports (`index.ts`)

### Code Style

```ts
// Good
class User extends Model<UserAttributes> {
  protected static table = 'users';
  protected static fillable = ['name', 'email'];

  public async save(): Promise<boolean> {
    // Implementation
    return true;
  }

  private validateEmail(email: string): boolean {
    // Implementation
    return true;
  }
}

// Avoid
class user extends Model<any> {
  static table = 'users'
  
  save() {
    // Implementation
  }
}
```

### Documentation

1. **JSDoc Comments**
   ```ts
   /**
    * Find a model by its primary key
    * @param id - The primary key value
    * @returns Promise resolving to model instance or null
    */
   public static async find<T extends Model>(id: any): Promise<T | null> {
     // Implementation
   }
   ```

2. **README Updates**
   - Update documentation for new features
   - Include code examples
   - Update API reference

## Testing Guidelines

### Test Structure

```ts
describe('Feature Name', () => {
  let mockDependency: any;

  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Test implementation
    });

    it('should handle edge case', () => {
      // Edge case test
    });
  });
});
```

### Test Categories

1. **Unit Tests** (`*.test.ts`)
   - Test individual functions/methods
   - Mock external dependencies
   - Fast execution

2. **Integration Tests** (`*.integration.test.ts`)
   - Test component interactions
   - Use real database connections
   - Slower execution

3. **End-to-End Tests** (`*.e2e.test.ts`)
   - Test complete workflows
   - Use real database and full setup

### Writing Good Tests

```ts
// Good
describe('User Model', () => {
  it('should create user with valid attributes', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    const user = await User.create(userData);
    
    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.exists).toBe(true);
  });

  it('should throw error for invalid email', async () => {
    const userData = { name: 'John Doe', email: 'invalid-email' };
    
    await expect(User.create(userData)).rejects.toThrow('Invalid email format');
  });
});

// Avoid
it('should work', async () => {
  const user = new User();
  expect(user).toBeTruthy();
});
```

## Contribution Process

### 1. Issue First

- Check existing issues before creating new ones
- Use issue templates when available
- Provide detailed reproduction steps for bugs
- Include use cases for feature requests

### 2. Branch Naming

```bash
# Features
git checkout -b feature/add-soft-deletes
git checkout -b feature/improve-query-performance

# Bug fixes
git checkout -b fix/relationship-loading-bug
git checkout -b fix/migration-rollback-issue

# Documentation
git checkout -b docs/update-readme
git checkout -b docs/add-examples
```

### 3. Commit Messages

Follow conventional commits format:

```bash
# Features
git commit -m "feat: add soft delete functionality to models"
git commit -m "feat(query): implement batch insert operations"

# Bug fixes
git commit -m "fix: resolve relationship eager loading issue"
git commit -m "fix(migration): handle rollback errors properly"

# Documentation
git commit -m "docs: update README with new examples"
git commit -m "docs(api): add JSDoc comments to QueryBuilder"

# Tests
git commit -m "test: add comprehensive model factory tests"
git commit -m "test(integration): add ScyllaDB connection tests"
```

### 4. Pull Request Process

1. **Before Submitting**
   - Run all tests: `npm run test:all`
   - Run linting: `npm run lint`
   - Update documentation if needed
   - Add/update tests for new functionality

2. **PR Description Template**
   markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] Tests added/updated
   

3. **Review Process**
   - Address reviewer feedback promptly
   - Keep discussions focused and constructive
   - Update PR based on feedback

## Feature Development Guidelines

### Adding New Features

1. **Design First**
   - Create issue with detailed design
   - Discuss API design with maintainers
   - Consider backward compatibility

2. **Implementation**
   - Follow existing patterns
   - Add comprehensive tests
   - Update documentation

3. **Examples**
   ```ts
   // When adding new query methods
   class QueryBuilder {
     // Add method with proper typing
     public whereJsonContains<K extends keyof TAttrs>(
       column: K, 
       value: any
     ): this {
       // Implementation
       return this;
     }
   }

   // Add tests
   describe('JSON Query Methods', () => {
     it('should add JSON contains clause', () => {
       const query = builder.whereJsonContains('metadata', { key: 'value' });
       // Test implementation
     });
   });

   // Update documentation
   // Add to README and API docs
   ```

### ScyllaDB Specific Features

When adding ScyllaDB-specific functionality:

1. **Research ScyllaDB Documentation**
   - Understand the feature thoroughly
   - Check version compatibility
   - Consider performance implications

2. **Implementation Pattern**
   ```ts
   // Add to QueryBuilder
   public newScyllaFeature(params: any): this {
     if (!this.driver.supportsFeature('new_feature')) {
       throw new Error('Feature not supported by current driver');
     }
     // Implementation
     return this;
   }

   // Add to Grammar
   public compileNewFeature(query: QueryComponent): string {
     // CQL generation
   }

   // Add to Driver
   public supportsFeature(feature: string): boolean {
     return ['new_feature', ...otherFeatures].includes(feature);
   }
   ```

## Performance Considerations

### Query Optimization

1. **Efficient Queries**
   - Minimize ALLOW FILTERING usage
   - Use appropriate partition keys
   - Implement proper pagination

2. **Connection Management**
   - Reuse connections
   - Implement connection pooling
   - Handle connection errors gracefully

3. **Memory Usage**
   - Avoid loading large result sets
   - Implement streaming for large operations
   - Clean up resources properly

### Benchmarking

```ts
// Add performance tests for new features
describe('Performance Tests', () => {
  it('should handle large result sets efficiently', async () => {
    const startTime = Date.now();
    const results = await User.query().limit(10000).get();
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    expect(results).toHaveLength(10000);
  });
});
```

## Release Process

### Version Management

- Follow semantic versioning (SemVer)
- Update CHANGELOG.md
- Tag releases properly

### Breaking Changes

1. **Deprecation Period**
   - Mark old APIs as deprecated
   - Provide migration guide
   - Maintain backward compatibility when possible

2. **Documentation**
   - Update migration guide
   - Provide examples for new APIs
   - Document breaking changes clearly

## Getting Help

- **Discord**: Join our community Discord server
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: maintainers@scyllinx.dev

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to ScyllinX! 🚀
