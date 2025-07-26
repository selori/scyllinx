import { Model } from "../src/model/Model"
import { QueryBuilder } from "../src/query/QueryBuilder"
import { ConnectionManager } from "../src/connection/ConnectionManager"
import jest from "jest"

// Mock the connection manager
jest.mock("../src/connection/ConnectionManager")
jest.mock("../src/drivers/ScyllaDBDriver")

interface UserAttributes {
  id: string
  name: string
  email: string
  created_at?: Date
  updated_at?: Date
}

class User extends Model<UserAttributes> {
  protected static table = "users"
  protected static primaryKey = "id"
  protected static fillable = ["name", "email"]
  protected static timestamps = true
}

interface User extends UserAttributes {}

describe("Model", () => {
  let mockConnection: any
  let mockDriver: any
  let mockGrammar: any

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
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Model Creation", () => {
    it("should create a new model instance", () => {
      const user = new User({ name: "John Doe", email: "john@example.com" })

      expect(user.name).toBe("John Doe")
      expect(user.email).toBe("john@example.com")
      expect(user.exists).toBe(false)
    })

    it("should respect fillable attributes", () => {
      const user = new User({
        name: "John Doe",
        email: "john@example.com",
        id: "should-not-be-filled" as any,
      })

      expect(user.name).toBe("John Doe")
      expect(user.email).toBe("john@example.com")
      expect(user.id).toBeUndefined()
    })

    it("should force fill when specified", () => {
      const user = new User(
        {
          name: "John Doe",
          email: "john@example.com",
          id: "forced-id",
        },
        true,
      )

      expect(user.name).toBe("John Doe")
      expect(user.email).toBe("john@example.com")
      expect(user.id).toBe("forced-id")
    })
  })

  describe("Model Persistence", () => {
    it("should save a new model", async () => {
      const user = new User({ name: "John Doe", email: "john@example.com" })

      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 1 })

      const result = await user.save()

      expect(result).toBe(true)
      expect(user.exists).toBe(true)
      expect(user.wasRecentlyCreated).toBe(true)
      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should update an existing model", async () => {
      const user = new User({ id: "1", name: "John Doe", email: "john@example.com" }, true)
      user.setExists(true)
      user.setOriginal({ id: "1", name: "John Doe", email: "john@example.com" })

      user.name = "Jane Doe"

      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 1 })

      const result = await user.save()

      expect(result).toBe(true)
      expect(user.wasRecentlyCreated).toBe(false)
      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should not update if no changes", async () => {
      const user = new User({ id: "1", name: "John Doe", email: "john@example.com" }, true)
      user.setExists(true)
      user.setOriginal({ id: "1", name: "John Doe", email: "john@example.com" })

      const result = await user.save()

      expect(result).toBe(true)
      expect(mockDriver.query).not.toHaveBeenCalled()
    })
  })

  describe("Model Querying", () => {
    it("should create a query builder", () => {
      const query = User.query()

      expect(query).toBeInstanceOf(QueryBuilder)
    })

    it("should find a model by ID", async () => {
      const userData = { id: "1", name: "John Doe", email: "john@example.com" }
      mockDriver.query.mockResolvedValueOnce({ rows: [userData], rowCount: 1 })

      const user = await User.find("1")

      expect(user).toBeInstanceOf(User)
      expect(user?.id).toBe("1")
      expect(user?.name).toBe("John Doe")
    })

    it("should return null if model not found", async () => {
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const user = await User.find("nonexistent")

      expect(user).toBeNull()
    })

    it("should throw error for findOrFail when not found", async () => {
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      await expect(User.findOrFail("nonexistent")).rejects.toThrow("Model not found with id: nonexistent")
    })

    it("should create a new model", async () => {
      const userData = { id: "1", name: "John Doe", email: "john@example.com" }
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 1 })

      const user = await User.create({ name: "John Doe", email: "john@example.com" })

      expect(user).toBeInstanceOf(User)
      expect(user.name).toBe("John Doe")
      expect(user.email).toBe("john@example.com")
    })
  })

  describe("Model Attributes", () => {
    it("should track dirty attributes", () => {
      const user = new User({ name: "John Doe", email: "john@example.com" }, true)
      user.setOriginal({ name: "John Doe", email: "john@example.com" })

      expect(user.isDirty()).toBe(false)

      user.name = "Jane Doe"

      expect(user.isDirty()).toBe(true)
      expect(user.isDirty(["name"])).toBe(true)
      expect(user.isDirty(["email"])).toBe(false)

      const dirty = user.getDirty()
      expect(dirty).toEqual({ name: "Jane Doe" })
    })

    it("should convert to object", () => {
      const user = new User({ name: "John Doe", email: "john@example.com" })

      const obj = user.toObject()

      expect(obj).toEqual({ name: "John Doe", email: "john@example.com" })
    })

    it("should convert to JSON", () => {
      const user = new User({ name: "John Doe", email: "john@example.com" })

      const json = user.toJSON()

      expect(json).toBe('{"name":"John Doe","email":"john@example.com"}')
    })
  })

  describe("Model Deletion", () => {
    it("should delete an existing model", async () => {
      const user = new User({ id: "1", name: "John Doe", email: "john@example.com" }, true)
      user.setExists(true)

      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 1 })

      const result = await user.delete()

      expect(result).toBe(true)
      expect(user.exists).toBe(false)
      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should not delete a non-existing model", async () => {
      const user = new User({ name: "John Doe", email: "john@example.com" })

      const result = await user.delete()

      expect(result).toBe(false)
      expect(mockDriver.query).not.toHaveBeenCalled()
    })
  })

  describe("Model Refresh", () => {
    it("should refresh model from database", async () => {
      const user = new User({ id: "1", name: "John Doe", email: "john@example.com" }, true)
      user.setExists(true)

      const freshData = { id: "1", name: "Jane Doe", email: "jane@example.com" }
      mockDriver.query.mockResolvedValueOnce({ rows: [freshData], rowCount: 1 })

      await user.refresh()

      expect(user.name).toBe("Jane Doe")
      expect(user.email).toBe("jane@example.com")
    })
  })

  describe("Model Timestamps", () => {
    it("should set timestamps on save", async () => {
      const user = new User({ name: "John Doe", email: "john@example.com" })

      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 1 })

      await user.save()

      expect(user.created_at).toBeInstanceOf(Date)
      expect(user.updated_at).toBeInstanceOf(Date)
    })
  })

  describe("Model Scopes", () => {
    it("should apply static scopes", () => {
      // This would test custom scopes if they were implemented
      const query = User.query()
      expect(query).toBeInstanceOf(QueryBuilder)
    })
  })

  describe("Model Mutators and Accessors", () => {
    class UserWithMutators extends Model<UserAttributes> {
      protected static table = "users"
      protected static fillable = ["name", "email"]

      public getNameAttribute(value: string): string {
        return value.toUpperCase()
      }

      public setEmailAttribute(value: string): string {
        return value.toLowerCase()
      }
    }

    it("should apply accessor", () => {
      const user = new UserWithMutators({ name: "john doe", email: "JOHN@EXAMPLE.COM" }, true)

      expect(user.getAttribute("name")).toBe("JOHN DOE")
    })

    it("should apply mutator", () => {
      const user = new UserWithMutators()
      user.setAttribute("email", "JOHN@EXAMPLE.COM")

      expect(user.getAttribute("email")).toBe("john@example.com")
    })
  })
})
