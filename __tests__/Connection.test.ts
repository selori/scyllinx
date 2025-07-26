import { Connection, ConnectionManager } from "../src"

describe("ConnectionManager", () => {
  let connManager: ConnectionManager
  let connection: Connection

  beforeAll(() => {
    connManager = ConnectionManager.getInstance()
    const connectionConfig = {
        driver: 'scylladb' as const,
        host: '2.58.80.193', 
        localDataCenter: 'nova', 
        keyspace: 'anihime',
        username: 'wyrex',
        password: 'g4z4i2d05Y',
        options: {}
    }

    connManager.addConnection("default", connectionConfig)
    connection = connManager.getConnection()
  })

  afterAll(async () => {
    connection = connManager.getConnection()
    if (connection.isConnected()) {
      await connection.disconnect()
    }
    await connManager.disconnectAll()
  })

  describe("connection", () => {
    it("should add a new connection and connect", async () => {      
      await expect(connection.connect()).resolves.not.toThrow()
    }, 15000)

    it("Bağlantıyı test etmek için basit bir sorgu çalışmalı", async () => {
        const query = 'SELECT keyspace_name FROM system_schema.keyspaces LIMIT 1';
        const result = await connection.query(query);
        
        expect(result).not.toBeNull()
    })
  })
})
