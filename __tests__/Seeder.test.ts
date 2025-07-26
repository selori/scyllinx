import { Seeder, SeederRunner } from "../src/seeder/Seeder"
import { ConnectionManager } from "../src/connection/ConnectionManager"
import type { ModelFactory } from "../src/seeder/ModelFactory"
import jest from "jest" // Declare the jest variable

// Mock dependencies
jest.mock("../src/connection/ConnectionManager")

class TestSeeder extends Seeder {
  async run(): Promise<void> {
    await this.truncate("users")
    // Simulate seeding logic
  }
}

class AnotherSeeder extends Seeder {
  async run(): Promise<void> {
    await this.truncate("posts")
  }
}

describe("Seeder System", () => {
  let mockConnection: any
  let mockConnectionManager: any

  beforeEach(() => {
    mockConnection = {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    }

    mockConnectionManager = {
      getConnection: jest.fn().mockReturnValue(mockConnection),
    }
    ;(ConnectionManager.getInstance as jest.Mock).mockReturnValue(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Seeder Class", () => {
    it("should create seeder instance", () => {
      const seeder = new TestSeeder()
      expect(seeder).toBeInstanceOf(Seeder)
    })

    it("should truncate table", async () => {
      const seeder = new TestSeeder()
      await seeder.run()

      expect(mockConnection.query).toHaveBeenCalledWith("TRUNCATE users")
    })

    it("should call other seeders", async () => {
      class MainSeeder extends Seeder {
        async run(): Promise<void> {
          await this.call(TestSeeder)
          await this.call(AnotherSeeder)
        }
      }

      const mainSeeder = new MainSeeder()
      await mainSeeder.run()

      expect(mockConnection.query).toHaveBeenCalledWith("TRUNCATE users")
      expect(mockConnection.query).toHaveBeenCalledWith("TRUNCATE posts")
    })

    it("should use factory method", () => {
      const mockFactory = {
        create: jest.fn(),
        times: jest.fn().mockReturnThis(),
      } as unknown as ModelFactory<any, any>

      class FactorySeeder extends Seeder {
        async run(): Promise<void> {
          const factory = this.factory(() => mockFactory)
          expect(factory).toBe(mockFactory)
        }
      }

      const seeder = new FactorySeeder()
      seeder.run()
    })
  })

  describe("SeederRunner", () => {
    it("should register seeders", () => {
      SeederRunner.register(TestSeeder)
      SeederRunner.register(AnotherSeeder)

      expect(SeederRunner["seeders"]).toContain(TestSeeder)
      expect(SeederRunner["seeders"]).toContain(AnotherSeeder)
    })

    it("should run all registered seeders", async () => {
      // Clear previous registrations
      SeederRunner["seeders"] = []

      SeederRunner.register(TestSeeder)
      SeederRunner.register(AnotherSeeder)

      const consoleSpy = jest.spyOn(console, "log").mockImplementation()

      await SeederRunner.run()

      expect(consoleSpy).toHaveBeenCalledWith("Seeding: TestSeeder")
      expect(consoleSpy).toHaveBeenCalledWith("Seeded: TestSeeder")
      expect(consoleSpy).toHaveBeenCalledWith("Seeding: AnotherSeeder")
      expect(consoleSpy).toHaveBeenCalledWith("Seeded: AnotherSeeder")

      consoleSpy.mockRestore()
    })

    it("should run specific seeders", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation()

      await SeederRunner.run([TestSeeder])

      expect(consoleSpy).toHaveBeenCalledWith("Seeding: TestSeeder")
      expect(consoleSpy).toHaveBeenCalledWith("Seeded: TestSeeder")
      expect(consoleSpy).not.toHaveBeenCalledWith("Seeding: AnotherSeeder")

      consoleSpy.mockRestore()
    })

    it("should run one seeder", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation()

      await SeederRunner.runOne(TestSeeder)

      expect(consoleSpy).toHaveBeenCalledWith("Seeding: TestSeeder")
      expect(consoleSpy).toHaveBeenCalledWith("Seeded: TestSeeder")

      consoleSpy.mockRestore()
    })
  })
})
