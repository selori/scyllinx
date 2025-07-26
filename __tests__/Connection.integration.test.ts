import { ConnectionManager } from "../src/connection/ConnectionManager"
import { Connection } from "../src/connection/Connection"
import { ScyllaDBDriver } from "../src/drivers/ScyllaDBDriver"
import type { ConnectionConfig } from "../src/types"

// This would be an integration test that requires actual ScyllaDB instance
describe("Connection Integration Tests", () => {
  let connectionManager: ConnectionManager
  let config: ConnectionConfig

  beforeAll(() => {
    config = {
      driver: "scylladb",
      host: process.env.SCYLLA_HOST || "localhost",
      port: Number.parseInt(process.env.SCYLLA_PORT || "9042"),
      keyspace: process.env.SCYLLA_KEYSPACE || "test_keyspace",
      localDataCenter: process.env.SCYLLA_DC || "datacenter1",
    }

    connectionManager = ConnectionManager.getInstance()
  })

  // Skip these tests if no ScyllaDB instance is available
  const skipIfNoScylla = process.env.SKIP_INTEGRATION_TESTS ? describe.skip : describe

  skipIfNoScylla("ScyllaDB Connection", () => {
    it("should add and retrieve connection", () => {
      connectionManager.addConnection("test", config)
      const connection = connectionManager.getConnection("test")

      expect(connection).toBeInstanceOf(Connection)
      expect(connection.getDriver()).toBeInstanceOf(ScyllaDBDriver)
    })

    it("should connect to ScyllaDB", async () => {
      connectionManager.addConnection("test", config)
      const connection = connectionManager.getConnection("test")

      await connection.connect()
      expect(connection.isConnected()).toBe(true)

      await connection.disconnect()
      expect(connection.isConnected()).toBe(false)
    })

    it("should execute queries", async () => {
      connectionManager.addConnection("test", config)
      const connection = connectionManager.getConnection("test")

      await connection.connect()

      // Create keyspace if not exists
      await connection.query(`
        CREATE KEYSPACE IF NOT EXISTS ${config.keyspace}
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
      `)

      // Use keyspace
      await connection.query(`USE ${config.keyspace}`)

      // Create test table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS test_users (
          id uuid PRIMARY KEY,
          name text,
          email text
        )
      `)

      // Insert test data
      const result = await connection.query("INSERT INTO test_users (id, name, email) VALUES (?, ?, ?)", [
        "550e8400-e29b-41d4-a716-446655440000",
        "John Doe",
        "john@example.com",
      ])

      expect(result.rowCount).toBe(0) // ScyllaDB doesn't return affected rows for INSERT

      // Query test data
      const selectResult = await connection.query("SELECT * FROM test_users WHERE id = ?", [
        "550e8400-e29b-41d4-a716-446655440000",
      ])

      expect(selectResult.rows).toHaveLength(1)
      expect(selectResult.rows[0].name).toBe("John Doe")

      await connection.disconnect()
    })

    // it("should handle transactions (lightweight transactions)", async () => {
    //   connectionManager.addConnection("test", config)
    //   const connection = connectionManager.getConnection("test")

    //   await connection.connect()

    //   await connection.query(`USE ${config.keyspace}`)

    //   const result = await connection.transaction(async (conn) => {
    //     // ScyllaDB uses lightweight transactions instead of traditional transactions
    //     await conn.query("INSERT INTO test_users (id, name, email) VALUES (?, ?, ?) IF NOT EXISTS", [
    //       "550e8400-e29b-41d4-a716-446655440001",
    //       "Jane Doe",
    //       "jane@example.com",
    //     ])

    //     return "success"
    //   })

    //   expect(result).toBe("success")

    //   await connection.disconnect()
    // })
  })

  afterAll(async () => {
    await connectionManager.disconnectAll()
  })
})
