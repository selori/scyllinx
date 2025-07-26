import { Migration } from "../src/migration/Migration"
import { MigrationManager } from "../src/migration/MigrationManager"
import { ConnectionManager } from "../src/connection/ConnectionManager"
import type { Schema } from "../src/schema/Schema"

// Mock dependencies
jest.mock("../src/connection/ConnectionManager")
jest.mock("../src/schema/Schema")

class TestMigration extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable("test_table", (table) => {
      table.uuid("id").primary()
      table.string("name")
      table.timestamps()
    })
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable("test_table")
  }
}

class AnotherTestMigration extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable("another_table", (table) => {
      table.uuid("id").primary()
      table.string("title")
    })
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable("another_table")
  }
}

describe("Migration System", () => {
  let mockConnection: any
  let mockDriver: any
  let mockConnectionManager: any
  let migrationManager: MigrationManager

  beforeEach(() => {
    mockDriver = {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      getGrammar: jest.fn().mockReturnValue({
        wrapTable: jest.fn((table) => table),
      }),
    }

    mockConnection = {
      getDriver: jest.fn().mockReturnValue(mockDriver),
    }

    mockConnectionManager = {
      getConnection: jest.fn().mockReturnValue(mockConnection),
    }
    ;(ConnectionManager.getInstance as jest.Mock).mockReturnValue(mockConnectionManager)

    migrationManager = new MigrationManager(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Migration Class", () => {
    it("should create migration instance", () => {
      const migration = new TestMigration()

      expect(migration).toBeInstanceOf(Migration)
      expect(migration.getName()).toBe("TestMigration")
    })

    it("should extract timestamp from migration name", () => {
      class Migration_2023_12_01_120000_CreateUsersTable extends Migration {
        async up(schema: Schema): Promise<void> {}
        async down(schema: Schema): Promise<void> {}
      }

      const migration = new Migration_2023_12_01_120000_CreateUsersTable()
      const timestamp = migration.getTimestamp()

      expect(timestamp).toBe("2023_12_01_120000")
    })

    it("should generate timestamp if not in name", () => {
      const migration = new TestMigration()
      const timestamp = migration.getTimestamp()

      expect(timestamp).toMatch(/^\d{15}$/)
    })
  })

  describe("Migration Manager", () => {
    it("should create migrations table", async () => {
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      await migrationManager.migrate([])

      expect(mockDriver.query).toHaveBeenCalledWith(expect.stringContaining("CREATE TABLE IF NOT EXISTS migrations"))
    })

    it("should run pending migrations", async () => {
      const migration1 = new TestMigration()
      const migration2 = new AnotherTestMigration()

      // Mock migrations table creation
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
      // Mock get executed migrations (empty)
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
      // Mock migration execution
      mockDriver.query.mockResolvedValue({ rows: [], rowCount: 1 })

      const consoleSpy = jest.spyOn(console, "log").mockImplementation()

      await migrationManager.migrate([migration1, migration2])

      expect(consoleSpy).toHaveBeenCalledWith("Running migration: TestMigration")
      expect(consoleSpy).toHaveBeenCalledWith("Migrated: TestMigration")
      expect(consoleSpy).toHaveBeenCalledWith("Running migration: AnotherTestMigration")
      expect(consoleSpy).toHaveBeenCalledWith("Migrated: AnotherTestMigration")

      consoleSpy.mockRestore()
    })

    it("should skip already executed migrations", async () => {
      const migration = new TestMigration()

      // Mock migrations table creation
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
      // Mock get executed migrations (contains TestMigration)
      mockDriver.query.mockResolvedValueOnce({
        rows: [{ migration: "TestMigration" }],
        rowCount: 1,
      })

      const consoleSpy = jest.spyOn(console, "log").mockImplementation()

      await migrationManager.migrate([migration])

      expect(consoleSpy).not.toHaveBeenCalledWith("Running migration: TestMigration")

      consoleSpy.mockRestore()
    })

    it("should rollback migrations", async () => {
      const migration = new TestMigration()

      // Mock get executed migrations
      mockDriver.query.mockResolvedValueOnce({
        rows: [{ migration: "TestMigration" }],
        rowCount: 1,
      })
      // Mock rollback execution
      mockDriver.query.mockResolvedValue({ rows: [], rowCount: 1 })

      const consoleSpy = jest.spyOn(console, "log").mockImplementation()

      await migrationManager.rollback([migration], 1)

      expect(consoleSpy).toHaveBeenCalledWith("Rolling back: TestMigration")
      expect(consoleSpy).toHaveBeenCalledWith("Rolled back: TestMigration")

      consoleSpy.mockRestore()
    })

    it("should get migration status", async () => {
      const migration1 = new TestMigration()
      const migration2 = new AnotherTestMigration()

      // Mock migrations table creation
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
      // Mock get executed migrations with batch info
      mockDriver.query.mockResolvedValueOnce({
        rows: [{ migration: "TestMigration", batch_number: 1 }],
        rowCount: 1,
      })

      const status = await migrationManager.status([migration1, migration2])

      expect(status).toHaveLength(2)
      expect(status[0]).toMatchObject({
        name: "TestMigration",
        executed: true,
        batch: 1,
      })
      expect(status[1]).toMatchObject({
        name: "AnotherTestMigration",
        executed: false,
      })
    })

    it("should reset all migrations", async () => {
      const migration = new TestMigration()

      // Mock get executed migrations
      mockDriver.query.mockResolvedValueOnce({
        rows: [{ migration: "TestMigration" }],
        rowCount: 1,
      })
      // Mock reset execution
      mockDriver.query.mockResolvedValue({ rows: [], rowCount: 1 })

      await migrationManager.reset([migration])

      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should refresh migrations (reset + migrate)", async () => {
      const migration = new TestMigration()

      // Mock reset operations
      mockDriver.query.mockResolvedValueOnce({
        rows: [{ migration: "TestMigration" }],
        rowCount: 1,
      })
      mockDriver.query.mockResolvedValue({ rows: [], rowCount: 1 })

      // Mock migrate operations
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // migrations table
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }) // get executed

      await migrationManager.refresh([migration])

      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should handle migration errors", async () => {
      const migration = new TestMigration()

      // Mock migrations table creation
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
      // Mock get executed migrations (empty)
      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
      // Mock migration error
      mockDriver.query.mockRejectedValueOnce(new Error("Migration failed"))

      const consoleSpy = jest.spyOn(console, "error").mockImplementation()

      await expect(migrationManager.migrate([migration])).rejects.toThrow("Migration failed")

      expect(consoleSpy).toHaveBeenCalledWith("Migration failed: TestMigration", expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})
