import { Schema } from "../src/schema/Schema"
import type { DatabaseDriver } from "../src/drivers/DatabaseDriver"
import jest from "jest"

// Mock the database driver
const mockDriver = {
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  getGrammar: jest.fn().mockReturnValue({
    compileCreateTable: jest.fn().mockReturnValue("CREATE TABLE test (id uuid PRIMARY KEY)"),
    compileAlterTable: jest.fn().mockReturnValue("ALTER TABLE test ADD COLUMN name text"),
    wrapTable: jest.fn((table) => table),
    hasTable: jest.fn().mockResolvedValue(false),
    hasColumn: jest.fn().mockResolvedValue(false),
    rename: jest.fn().mockResolvedValue(undefined),
  }),
  constructor: { name: "ScyllaDBDriver" },
} as unknown as DatabaseDriver

describe("Schema Builder", () => {
  let schema: Schema

  beforeEach(() => {
    schema = new Schema(mockDriver)
    jest.clearAllMocks()
  })

  describe("Table Operations", () => {
    it("should create a table", async () => {
      await schema.createTable("users", (table) => {
        table.uuid("id").primary()
        table.string("name")
        table.string("email")
        table.timestamps()
      })

      expect(mockDriver.getGrammar().compileCreateTable).toHaveBeenCalled()
      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should alter a table", async () => {
      await schema.alterTable("users", (table) => {
        table.string("phone")
      })

      expect(mockDriver.getGrammar().compileAlterTable).toHaveBeenCalled()
      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should drop a table", async () => {
      await schema.dropTable("users")

      expect(mockDriver.query).toHaveBeenCalledWith("DROP TABLE users")
    })

    it("should drop table if exists", async () => {
      await schema.dropTableIfExists("users")

      expect(mockDriver.query).toHaveBeenCalledWith("DROP TABLE IF EXISTS users")
    })

    it("should check if table exists", async () => {
      const exists = await schema.hasTable("users")

      expect(mockDriver.getGrammar().hasTable).toHaveBeenCalledWith("users")
      expect(exists).toBe(false)
    })

    it("should check if column exists", async () => {
      const exists = await schema.hasColumn("users", "email")

      expect(mockDriver.getGrammar().hasColumn).toHaveBeenCalledWith("users", "email")
      expect(exists).toBe(false)
    })

    it("should rename a table", async () => {
      await schema.renameTable("users", "customers")

      expect(mockDriver.getGrammar().rename).toHaveBeenCalledWith("users", "customers")
    })
  })

  describe("ScyllaDB Specific Operations", () => {
    it("should create a keyspace", async () => {
      await schema.createKeyspace("test_keyspace", {
        replication: {
          class: "SimpleStrategy",
          replication_factor: 3,
        },
        durableWrites: true,
      })

      expect(mockDriver.query).toHaveBeenCalledWith(
        expect.stringContaining("CREATE KEYSPACE IF NOT EXISTS test_keyspace"),
      )
    })

    it("should create keyspace with default options", async () => {
      await schema.createKeyspace("test_keyspace")

      expect(mockDriver.query).toHaveBeenCalledWith(expect.stringContaining("'class': 'SimpleStrategy'"))
    })

    it("should drop a keyspace", async () => {
      await schema.dropKeyspace("test_keyspace")

      expect(mockDriver.query).toHaveBeenCalledWith("DROP KEYSPACE IF EXISTS test_keyspace")
    })

    it("should create a materialized view", async () => {
      await schema.createMaterializedView("user_emails", "users", (view) => {
        view.select(["id", "email", "name"])
        view.where("email IS NOT NULL")
        view.primaryKey("((email), id)")
      })

      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should create a user-defined type", async () => {
      await schema.createUserDefinedType("address", (type) => {
        type.text("street")
        type.text("city")
        type.text("country")
        type.text("postal_code")
      })

      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should drop a user-defined type", async () => {
      await schema.dropUserDefinedType("address")

      expect(mockDriver.query).toHaveBeenCalledWith("DROP TYPE IF EXISTS address")
    })

    it("should create an index", async () => {
      await schema.createIndex("users", "email", "users_email_idx")

      expect(mockDriver.query).toHaveBeenCalledWith("CREATE INDEX users_email_idx ON users (email)")
    })

    it("should create index with default name", async () => {
      await schema.createIndex("users", "email")

      expect(mockDriver.query).toHaveBeenCalledWith("CREATE INDEX users_email_idx ON users (email)")
    })

    it("should drop an index", async () => {
      await schema.dropIndex("users_email_idx")

      expect(mockDriver.query).toHaveBeenCalledWith("DROP INDEX users_email_idx")
    })

    it("should create a user-defined function", async () => {
      await schema.createUserDefinedFunction("calculate_age", (func) => {
        func.parameter("birth_date", "timestamp")
        func.returns("int")
        func.language("javascript")
        func.body("return Math.floor((Date.now() - birth_date) / (365.25 * 24 * 60 * 60 * 1000));")
      })

      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should drop a user-defined function", async () => {
      await schema.dropUserDefinedFunction("calculate_age", ["timestamp"])

      expect(mockDriver.query).toHaveBeenCalledWith("DROP FUNCTION IF EXISTS calculate_age(timestamp)")
    })

    it("should create a user-defined aggregate", async () => {
      await schema.createUserDefinedAggregate("avg_age", (agg) => {
        agg.withParameters(["int"])
        agg.stateFunction("avg_state")
        agg.stateType("tuple<int, bigint>")
        agg.finalFunction("avg_final")
        agg.initialCondition("(0, 0)")
      })

      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should drop a user-defined aggregate", async () => {
      await schema.dropUserDefinedAggregate("avg_age", ["int"])

      expect(mockDriver.query).toHaveBeenCalledWith(expect.stringContaining("DROP AGGREGATE IF EXISTS avg_age(int)"))
    })

    it("should throw error for non-ScyllaDB operations", async () => {
      const nonScyllaDriver = {
        ...mockDriver,
        constructor: { name: "PostgreSQLDriver" },
      } as unknown as DatabaseDriver

      const nonScyllaSchema = new Schema(nonScyllaDriver)

      await expect(nonScyllaSchema.createKeyspace("test")).rejects.toThrow("Keyspaces are only supported in ScyllaDB")

      await expect(nonScyllaSchema.createMaterializedView("test", "base", () => {})).rejects.toThrow(
        "Materialized views are only supported in ScyllaDB",
      )

      await expect(nonScyllaSchema.createUserDefinedType("test", () => {})).rejects.toThrow(
        "User-defined types are only supported in ScyllaDB",
      )
    })
  })
})
