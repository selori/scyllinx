import { ScyllaDBGrammar } from '../src';
import type { 
  WhereClause, 
  QueryComponent, 
  ColumnDefinition
} from '../src';

describe('ScyllaDBGrammar', () => {
  let grammar: ScyllaDBGrammar;

  beforeEach(() => {
    grammar = new ScyllaDBGrammar();
  });

  describe('compileSelect', () => {
    it('should compile basic SELECT query', () => {
      const query: QueryComponent = {
        from: 'users'
      };
      const result = grammar.compileSelect(query);
      expect(result).toBe('SELECT * FROM users');
    });

    it('should compile SELECT with specific columns', () => {
      const query: QueryComponent = {
        from: 'users',
        columns: ['id', 'name', 'email']
      };
      const result = grammar.compileSelect(query);
      expect(result).toBe('SELECT id, name, email FROM users');
    });

    it('should compile SELECT with WHERE clause', () => {
      const query: QueryComponent = {
        from: 'users',
        wheres: [
          { type: 'basic', column: 'id', operator: '=', values: [1] } as WhereClause
        ]
      };
      const result = grammar.compileSelect(query);
      expect(result).toBe('SELECT * FROM users WHERE id = ?');
    });

    it('should compile SELECT with multiple WHERE clauses', () => {
      const query: QueryComponent = {
        from: 'users',
        wheres: [
          { type: 'basic', column: 'active', operator: '=', values: [true] } as WhereClause,
          { type: 'basic', column: 'age', operator: '>', values: [18] } as WhereClause
        ]
      };
      const result = grammar.compileSelect(query);
      expect(result).toBe('SELECT * FROM users WHERE active = ? AND age > ?');
    });

    it('should compile SELECT with ORDER BY clause', () => {
      const query: QueryComponent = {
        from: 'users',
        orders: [
          { column: 'name', direction: 'asc' },
          { column: 'created_at', direction: 'desc' }
        ]
      };
      const result = grammar.compileSelect(query);
      expect(result).toBe('SELECT * FROM users ORDER BY name ASC, created_at DESC');
    });

    it('should compile SELECT with LIMIT clause', () => {
      const query: QueryComponent = {
        from: 'users',
        limit: 10
      };
      const result = grammar.compileSelect(query);
      expect(result).toBe('SELECT * FROM users LIMIT 10');
    });

    it('should compile SELECT with ALLOW FILTERING', () => {
      const query: QueryComponent = {
        from: 'users',
        allowFiltering: true
      };
      const result = grammar.compileSelect(query);
      expect(result).toBe('SELECT * FROM users ALLOW FILTERING');
    });

    it('should compile complex SELECT query', () => {
      const query: QueryComponent = {
        from: 'users',
        columns: ['id', 'name'],
        wheres: [
          { type: 'basic', column: 'active', operator: '=', values: [true] } as WhereClause,
          { type: 'in', column: 'department_id', values: [1, 2, 3] } as WhereClause
        ],
        orders: [
          { column: 'name', direction: 'asc' }
        ],
        limit: 100,
        allowFiltering: true
      };
      const result = grammar.compileSelect(query);
      expect(result).toBe(
        'SELECT id, name FROM users WHERE active = ? AND department_id IN (?, ?, ?) ' +
        'ORDER BY name ASC LIMIT 100 ALLOW FILTERING'
      );
    });
  });

  describe('compileInsert', () => {
    it('should compile basic INSERT query', () => {
      const query = {
        table: 'users',
        values: {
          id: 1,
          name: 'John',
          email: 'john@example.com'
        }
      };
      const result = grammar.compileInsert(query);
      expect(result).toBe(
        'INSERT INTO users (id, name, email) VALUES (?, ?, ?)'
      );
    });

    it('should compile INSERT with TTL', () => {
      const query = {
        table: 'users',
        values: {
          id: 1,
          name: 'John'
        },
        ttl: 3600
      };
      const result = grammar.compileInsert(query);
      expect(result).toBe(
        'INSERT INTO users (id, name) VALUES (?, ?) USING TTL 3600'
      );
    });

    it('should compile INSERT with IF NOT EXISTS', () => {
      const query = {
        table: 'users',
        values: {
          id: 1,
          name: 'John'
        },
        ifNotExists: true
      };
      const result = grammar.compileInsert(query);
      expect(result).toBe(
        'INSERT INTO users (id, name) VALUES (?, ?) IF NOT EXISTS'
      );
    });

    it('should compile INSERT with TTL and IF NOT EXISTS', () => {
      const query = {
        table: 'users',
        values: {
          id: 1,
          name: 'John'
        },
        ttl: 3600,
        ifNotExists: true
      };
      const result = grammar.compileInsert(query);
      expect(result).toBe(
        'INSERT INTO users (id, name) VALUES (?, ?) USING TTL 3600 IF NOT EXISTS'
      );
    });
  });

  describe('compileUpdate', () => {
    it('should compile basic UPDATE query', () => {
      const query = {
        table: 'users',
        values: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        wheres: [
          { type: 'basic', column: 'id', operator: '=', values: [1] } as WhereClause
        ]
      };
      const result = grammar.compileUpdate(query);
      expect(result).toBe(
        'UPDATE users SET name = ?, email = ? WHERE id = ?'
      );
    });

    it('should compile UPDATE with TTL', () => {
      const query = {
        table: 'users',
        values: {
          name: 'John Doe'
        },
        wheres: [
          { type: 'basic', column: 'id', operator: '=', values: [1] } as WhereClause
        ],
        ttl: 3600
      };
      const result = grammar.compileUpdate(query);
      expect(result).toBe(
        'UPDATE users USING TTL 3600 SET name = ? WHERE id = ?'
      );
    });

    it('should compile UPDATE with IF conditions', () => {
      const query = {
        table: 'users',
        values: {
          name: 'John Doe'
        },
        ifConditions: [
          { type: 'basic', column: 'version', operator: '=', values: [5] } as WhereClause
        ]
      };
      const result = grammar.compileUpdate(query);
      expect(result).toBe(
        'UPDATE users SET name = ? IF version = ?'
      );
    });

    it('should compile UPDATE with WHERE and IF conditions', () => {
      const query = {
        table: 'users',
        values: {
          name: 'John Doe'
        },
        wheres: [
          { type: 'basic', column: 'id', operator: '=', values: [1] } as WhereClause
        ],
        ifConditions: [
          { type: 'basic', column: 'version', operator: '=', values: [5] } as WhereClause
        ]
      };
      const result = grammar.compileUpdate(query);
      expect(result).toBe(
        'UPDATE users SET name = ? WHERE id = ? IF version = ?'
      );
    });
  });

  describe('compileDelete', () => {
    it('should compile basic DELETE query', () => {
      const query = {
        table: 'users',
        wheres: [
          { type: 'basic', column: 'id', operator: '=', values: [1] } as WhereClause
        ]
      };
      const result = grammar.compileDelete(query);
      expect(result).toBe(
        'DELETE FROM users WHERE id = ?'
      );
    });

    it('should compile DELETE with specific columns', () => {
      const query = {
        table: 'users',
        columns: ['email', 'phone'],
        wheres: [
          { type: 'basic', column: 'id', operator: '=', values: [1] } as WhereClause
        ]
      };
      const result = grammar.compileDelete(query);
      expect(result).toBe(
        'DELETE email, phone FROM users WHERE id = ?'
      );
    });

    it('should compile DELETE with IF conditions', () => {
      const query = {
        table: 'users',
        ifConditions: [
          { type: 'basic', column: 'version', operator: '=', values: [5] } as WhereClause
        ]
      };
      const result = grammar.compileDelete(query);
      expect(result).toBe(
        'DELETE FROM users IF version = ?'
      );
    });

    it('should compile DELETE with WHERE and IF conditions', () => {
      const query = {
        table: 'users',
        wheres: [
          { type: 'basic', column: 'id', operator: '=', values: [1] } as WhereClause
        ],
        ifConditions: [
          { type: 'basic', column: 'version', operator: '=', values: [5] } as WhereClause
        ]
      };
      const result = grammar.compileDelete(query);
      expect(result).toBe(
        'DELETE FROM users WHERE id = ? IF version = ?'
      );
    });
  });

  describe('compileWheres', () => {
    it('should compile basic WHERE clause', () => {
      const wheres: WhereClause[] = [
        { type: 'basic', column: 'id', operator: '=', values: [1] }
      ];
      const result = grammar['compileWheres'](wheres);
      expect(result).toBe('id = ?');
    });

    it('should compile IN WHERE clause', () => {
      const wheres: WhereClause[] = [
        { type: 'in', column: 'id', values: [1, 2, 3] }
      ];
      const result = grammar['compileWheres'](wheres);
      expect(result).toBe('id IN (?, ?, ?)');
    });

    it('should compile BETWEEN WHERE clause', () => {
      const wheres: WhereClause[] = [
        { type: 'between', column: 'age', values: [18, 30] }
      ];
      const result = grammar['compileWheres'](wheres);
      expect(result).toBe('age >= ? AND age <= ?');
    });

    it('should compile IS NULL WHERE clause', () => {
      const wheres: WhereClause[] = [
        { type: 'null', column: 'deleted_at' }
      ];
      const result = grammar['compileWheres'](wheres);
      expect(result).toBe('deleted_at IS NULL');
    });

    it('should compile IS NOT NULL WHERE clause', () => {
      const wheres: WhereClause[] = [
        { type: 'notNull', column: 'email' }
      ];
      const result = grammar['compileWheres'](wheres);
      expect(result).toBe('email IS NOT NULL');
    });

    it('should compile TOKEN WHERE clause', () => {
      const wheres: WhereClause[] = [
        { 
          type: 'token', 
          columns: ['partition_key1', 'partition_key2'], 
          operator: '>', 
          values: [100, 200] 
        }
      ];
      const result = grammar['compileWheres'](wheres);
      expect(result).toBe('TOKEN(partition_key1, partition_key2) > TOKEN(?, ?)');
    });

    it('should compile raw WHERE clause', () => {
      const wheres: WhereClause[] = [
        { type: 'raw', raw: 'dateOf(created_at) = dateOf(?)' }
      ];
      const result = grammar['compileWheres'](wheres);
      expect(result).toBe('dateOf(created_at) = dateOf(?)');
    });

    it('should compile multiple WHERE clauses', () => {
      const wheres: WhereClause[] = [
        { type: 'basic', column: 'active', operator: '=', values: [true] },
        { type: 'in', column: 'department_id', values: [1, 2, 3] },
        { type: 'notNull', column: 'email' }
      ];
      const result = grammar['compileWheres'](wheres);
      expect(result).toBe(
        'active = ? AND department_id IN (?, ?, ?) AND email IS NOT NULL'
      );
    });
  });

  describe('wrapTable', () => {
    it('should wrap simple table name in quotes', () => {
      const result = grammar.wrapTable('users');
      expect(result).toBe('users');
    });

    it('should not wrap already qualified table names', () => {
      const result = grammar.wrapTable('keyspace.users');
      expect(result).toBe('keyspace.users');
    });
  });

  describe('wrapColumn', () => {
    it('should wrap simple column name in quotes', () => {
      const result = grammar.wrapColumn('email');
      expect(result).toBe('email');
    });

    it('should handle string input (backwards compatibility)', () => {
      const result = grammar.wrapColumn('email');
      expect(result).toBe('email');
    });

    it('should return raw expression if provided', () => {
      const result = grammar.wrapColumn('COUNT(*)');
      expect(result).toBe('COUNT(*)');
    });
  });

describe('compileCreateTable', () => {
  it('should compile simple CREATE TABLE query', () => {
    const columns: ColumnDefinition[] = [
      { name: 'id', type: 'uuid' },
      { name: 'name', type: 'text' },
      { name: 'email', type: 'text' }
    ];
    const partitionKeys = ['id'];
    const result = grammar.compileCreateTable({
      name: 'users',
      columns,
      partitionKeys,
      clusteringKeys: []
    });
    expect(result).toBe(
      'CREATE TABLE users (id uuid, name text, email text, PRIMARY KEY (id))'
    );
  });

  it('should compile CREATE TABLE with composite partition key', () => {
    const columns: ColumnDefinition[] = [
      { name: 'user_id', type: 'uuid' },
      { name: 'bucket', type: 'int' },
      { name: 'name', type: 'text' }
    ];
    const partitionKeys = ['user_id', 'bucket'];
    const result = grammar.compileCreateTable({
      name: 'users',
      columns,
      partitionKeys,
      clusteringKeys: []
    });
    expect(result).toBe(
      'CREATE TABLE users (user_id uuid, bucket int, name text, PRIMARY KEY (user_id, bucket))'
    );
  });

  it('should compile CREATE TABLE with clustering keys', () => {
    const columns: ColumnDefinition[] = [
      { name: 'user_id', type: 'uuid' },
      { name: 'created_at', type: 'timestamp' },
      { name: 'name', type: 'text' }
    ];
    const partitionKeys = ['user_id'];
    const clusteringKeys = ['created_at'];
    const result = grammar.compileCreateTable({
      name: 'users',
      columns,
      partitionKeys,
      clusteringKeys
    });
    expect(result).toBe(
      'CREATE TABLE users (user_id uuid, created_at timestamp, name text, ' +
      'PRIMARY KEY ((user_id), created_at))'
    );
  });

  it('should compile CREATE TABLE with multiple clustering keys', () => {
    const columns: ColumnDefinition[] = [
      { name: 'user_id', type: 'uuid' },
      { name: 'created_at', type: 'timestamp' },
      { name: 'event_type', type: 'text' },
      { name: 'data', type: 'text' }
    ];
    const partitionKeys = ['user_id'];
    const clusteringKeys = ['created_at', 'event_type'];
    const result = grammar.compileCreateTable({
      name: 'events',
      columns,
      partitionKeys,
      clusteringKeys
    });
    expect(result).toBe(
      'CREATE TABLE events (user_id uuid, created_at timestamp, event_type text, data text, ' +
      'PRIMARY KEY ((user_id), created_at, event_type))'
    );
  });
});


  // describe('compileMaterializedView', () => {
  //   it('should compile simple MATERIALIZED VIEW query', () => {
  //       const result = grammar.compileMaterializedView(
  //       'user_emails',
  //       'users',
  //       ['id', 'email'],
  //       'email IS NOT NULL',
  //       '(id)'
  //       );
  //       expect(result).toBe(
  //       'CREATE MATERIALIZED VIEW user_emails AS \n' +
  //       '            SELECT id, email \n' +
  //       '            FROM users \n' +
  //       '            WHERE email IS NOT NULL \n' +
  //       '            PRIMARY KEY (id)'
  //       );
  //   });

  //   it('should compile MATERIALIZED VIEW with composite primary key', () => {
  //       const result = grammar.compileMaterializedView(
  //       'user_by_email',
  //       'users',
  //       ['id', 'email', 'name'],
  //       'email IS NOT NULL',
  //       '((email), id)'
  //       );
  //       expect(result).toBe(
  //       'CREATE MATERIALIZED VIEW user_by_email AS \n' +
  //       '            SELECT id, email, name \n' +
  //       '            FROM users \n' +
  //       '            WHERE email IS NOT NULL \n' +
  //       '            PRIMARY KEY ((email), id)'
  //       );
  //   });
  // });
});
