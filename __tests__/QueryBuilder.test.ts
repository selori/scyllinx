import { QueryBuilder } from "../src/query/QueryBuilder"
import { ConnectionManager } from "../src/connection/ConnectionManager"
import { Model } from "../src/model/Model"
import jest from "jest" // Declare the jest variable

// Mock the connection manager
jest.mock("../src/connection/ConnectionManager")

interface UserAttributes {
  id: string
  name: string
  email: string
  age?: number
  active?: boolean
}

class User extends Model<UserAttributes> {
  protected static table = "users"
  protected static primaryKey = "id"
}

interface User extends UserAttributes {}

describe("QueryBuilder", () => {
  let mockConnection: any
  let mockDriver: any
  let mockGrammar: any
  let queryBuilder: QueryBuilder<User, UserAttributes>

  beforeEach(() => {
    mockGrammar = {
      compileSelect: jest.fn().mockReturnValue("SELECT * FROM users"),
      compileInsert: jest.fn().mockReturnValue("INSERT INTO users (name, email) VALUES (?, ?)"),
      compileUpdate: jest.fn().mockReturnValue("UPDATE users SET name = ? WHERE id = ?"),
      compileDelete: jest.fn().mockReturnValue("DELETE FROM users WHERE id = ?"),
      wrapTable: jest.fn((table) => table),
      wrapColumn: jest.fn((column) => column),
    }

    mockDriver = {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      getGrammar: jest.fn().mockReturnValue(mockGrammar),
    }

    mockConnection = {
      getDriver: jest.fn().mockReturnValue(mockDriver),
    }

    const mockConnectionManager = {
      getConnection: jest.fn().mockReturnValue(mockConnection),
    }
    ;(ConnectionManager.getInstance as jest.Mock).mockReturnValue(mockConnectionManager)

    queryBuilder = new QueryBuilder<User, UserAttributes>("users")
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Select Queries", () => {
    it("should build basic select query", () => {
      const sql = queryBuilder.toSql()
      expect(mockGrammar.compileSelect).toHaveBeenCalled()
    })

    it("should select specific columns", () => {
      queryBuilder.select("id", "name", "email")
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.columns).toEqual(["id", "name", "email"])
    })

    it("should add columns to existing select", () => {
      queryBuilder.select("id", "name").addSelect("email", "age")
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.columns).toEqual(["id", "name", "email", "age"])
    })
  })

  describe("Where Clauses", () => {
    it("should add basic where clause", () => {
      queryBuilder.where("id", "=", "1")
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.wheres).toHaveLength(1)
      expect(callArgs.wheres[0]).toMatchObject({
        type: "basic",
        column: "id",
        operator: "=",
        value: "1",
        boolean: "and",
      })
    })

    it("should add where clause with default operator", () => {
      queryBuilder.where("id", "1")
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.wheres[0]).toMatchObject({
        type: "basic",
        column: "id",
        operator: "=",
        value: "1",
      })
    })

    it("should add where clause with object", () => {
      queryBuilder.where({ id: "1", active: true })
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.wheres).toHaveLength(2)
    })

    it("should add or where clause", () => {
      queryBuilder.where("id", "1").orWhere("id", "2")
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.wheres).toHaveLength(2)
      expect(callArgs.wheres[1].boolean).toBe("or")
    })

    it("should add where in clause", () => {
      queryBuilder.whereIn("id", ["1", "2", "3"])
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.wheres[0]).toMatchObject({
        type: "in",
        column: "id",
        values: ["1", "2", "3"],
      })
    })

    it("should add where not in clause", () => {
      queryBuilder.whereNotIn("id", ["1", "2", "3"])
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.wheres[0]).toMatchObject({
        type: "notIn",
        column: "id",
        values: ["1", "2", "3"],
      })
    })

    it("should add where between clause", () => {
      queryBuilder.whereBetween("age", [18, 65])
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.wheres[0]).toMatchObject({
        type: "between",
        column: "age",
        values: [18, 65],
      })
    })

    it("should add where null clause", () => {
      queryBuilder.whereNull("deleted_at")
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.wheres[0]).toMatchObject({
        type: "null",
        column: "deleted_at",
      })
    })

    it("should add where not null clause", () => {
      queryBuilder.whereNotNull("email")
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.wheres[0]).toMatchObject({
        type: "notNull",
        column: "email",
      })
    })
  })

  describe("Order By", () => {
    it("should add order by clause", () => {
      queryBuilder.orderBy("name", "asc")
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.orders).toHaveLength(1)
      expect(callArgs.orders[0]).toMatchObject({
        column: "name",
        direction: "asc",
      })
    })

    it("should default to ascending order", () => {
      queryBuilder.orderBy("name")
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.orders[0].direction).toBe("asc")
    })
  })

  describe("Limit and Offset", () => {
    it("should add limit", () => {
      queryBuilder.limit(10)
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.limit).toBe(10)
    })

    it("should add offset", () => {
      queryBuilder.offset(20)
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.offset).toBe(20)
    })

    it("should use take as alias for limit", () => {
      queryBuilder.take(5)
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.limit).toBe(5)
    })

    it("should use skip as alias for offset", () => {
      queryBuilder.skip(15)
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.offset).toBe(15)
    })
  })

  describe("ScyllaDB Specific Features", () => {
    it("should add allow filtering", () => {
      queryBuilder.allowFiltering()
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.allowFiltering).toBe(true)
    })

    it("should add TTL for operations", () => {
      queryBuilder.ttl(3600)
      expect(queryBuilder["_ttl"]).toBe(3600)
    })

    it("should add if not exists", () => {
      queryBuilder.ifNotExists()
      expect(queryBuilder["_ifNotExists"]).toBe(true)
    })

    it("should add token where clause", () => {
      queryBuilder.whereToken(["partition_key"], ">", ["value"])
      queryBuilder.toSql()

      const callArgs = mockGrammar.compileSelect.mock.calls[0][0]
      expect(callArgs.wheres[0]).toMatchObject({
        type: "token",
        columns: ["partition_key"],
        operator: ">",
        values: ["value"],
      })
    })
  })

  describe("Query Execution", () => {
    it("should execute get query", async () => {
      const mockRows = [
        { id: "1", name: "John", email: "john@example.com" },
        { id: "2", name: "Jane", email: "jane@example.com" },
      ]
      mockDriver.query.mockResolvedValueOnce({ rows: mockRows, rowCount: 2 })

      const results = await queryBuilder.get()

      expect(mockDriver.query).toHaveBeenCalled()
      expect(results).toHaveLength(2)
    })

    it("should execute first query", async () => {
      const mockRows = [{ id: "1", name: "John", email: "john@example.com" }]
      mockDriver.query.mockResolvedValueOnce({ rows: mockRows, rowCount: 1 })

      const result = await queryBuilder.first()

      expect(result).toBeTruthy()
    })

    it("should return null for first when no results", async () => {
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const result = await queryBuilder.first()

      expect(result).toBeNull()
    })

    it("should execute count query", async () => {
      mockDriver.query.mockResolvedValueOnce({ rows: [{ aggregate: 5 }], rowCount: 1 })

      const count = await queryBuilder.count()

      expect(count).toBe(5)
    })

    it("should execute exists query", async () => {
      mockDriver.query.mockResolvedValueOnce({ rows: [{ aggregate: 1 }], rowCount: 1 })

      const exists = await queryBuilder.exists()

      expect(exists).toBe(true)
    })
  })

  describe("Insert Operations", () => {
    it("should execute insert query", async () => {
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 1 })

      const result = await queryBuilder.insert({ name: "John", email: "john@example.com" })

      expect(result).toBe(true)
      expect(mockGrammar.compileInsert).toHaveBeenCalled()
    })

    it("should execute batch insert", async () => {
      const records = [
        { name: "John", email: "john@example.com" },
        { name: "Jane", email: "jane@example.com" },
      ]

      mockDriver.batch = jest.fn().mockResolvedValueOnce({ rows: [], rowCount: 2 })

      const result = await queryBuilder.insert(records)

      expect(result).toBe(true)
    })
  })

  describe("Update Operations", () => {
    it("should execute update query", async () => {
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 1, affectedRows: 1 })

      const result = await queryBuilder.where("id", "1").update({ name: "Updated Name" })

      expect(result).toBe(1)
      expect(mockGrammar.compileUpdate).toHaveBeenCalled()
    })

    it("should execute update or insert", async () => {
      // First call for exists check
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
      // Second call for insert
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 1 })

      const result = await queryBuilder.updateOrInsert({ email: "john@example.com" }, { name: "John Doe" })

      expect(result).toBe(true)
    })
  })

  describe("Delete Operations", () => {
    it("should execute delete query", async () => {
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 1, affectedRows: 1 })

      const result = await queryBuilder.where("id", "1").delete()

      expect(result).toBe(1)
      expect(mockGrammar.compileDelete).toHaveBeenCalled()
    })

    it("should execute truncate query", async () => {
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      await queryBuilder.truncate()

      expect(mockDriver.query).toHaveBeenCalledWith("TRUNCATE users")
    })
  })

  describe("Query Cloning", () => {
    it("should clone query builder", () => {
      const original = queryBuilder.where("id", "1").orderBy("name")
      const cloned = original.clone()

      expect(cloned).not.toBe(original)
      expect(cloned["_wheres"]).toEqual(original["_wheres"])
      expect(cloned["_orders"]).toEqual(original["_orders"])
    })
  })

  describe("Raw SQL Generation", () => {
    it("should generate raw SQL with parameters", () => {
      queryBuilder.where("id", "1").where("name", "John")

      const rawSql = queryBuilder.toRawSql()

      expect(typeof rawSql).toBe("string")
    })
  })

  describe("Eager Loading", () => {
    it("should set eager loading relationships", () => {
      queryBuilder.with("posts", "comments")

      expect(queryBuilder["eager"]).toEqual(["posts", "comments"])
    })
  })
})
