import { ModelFactory, defineFactory, factory } from "../src/seeder/ModelFactory"
import { Model } from "../src/model/Model"
import { ModelRegistry } from "../src/model/ModelRegistry"
import { faker } from "@faker-js/faker"

interface UserAttributes {
  id: string
  name: string
  email: string
  age?: number
  is_admin?: boolean
}

class User extends Model<UserAttributes> {
  protected static table = "users"
  protected static primaryKey = "id"
  protected static fillable = ["name", "email", "age", "is_admin"]
}

interface User extends UserAttributes {}

describe("Model Factory", () => {
  let mockModelRegistry: any

  beforeEach(() => {
    mockModelRegistry = {
      get: jest.fn().mockReturnValue(User),
    }
    ;(ModelRegistry.getInstance as jest.Mock).mockReturnValue(mockModelRegistry)

    // Mock User.create method
    User.create = jest.fn().mockImplementation(async (attrs) => {
      const user = new User(attrs, true)
      user.setExists(true)
      return user
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Factory Definition", () => {
    it("should define a factory", () => {
      const userFactory = defineFactory<User, UserAttributes>("User", {
        id: () => faker.string.uuid(),
        name: () => faker.person.fullName(),
        email: () => faker.internet.email(),
        age: () => faker.number.int({ min: 18, max: 80 }),
        is_admin: false,
      })

      expect(userFactory).toBeInstanceOf(ModelFactory)
    })

    it("should retrieve a defined factory", () => {
      defineFactory<User, UserAttributes>("User", {
        id: () => faker.string.uuid(),
        name: () => faker.person.fullName(),
        email: () => faker.internet.email(),
      })

      const userFactory = factory<User, UserAttributes>("User")
      expect(userFactory).toBeInstanceOf(ModelFactory)
    })

    it("should throw error for undefined factory", () => {
      expect(() => factory<User, UserAttributes>("NonExistent")).toThrow("Factory for model 'NonExistent' not found")
    })
  })

  describe("Factory States", () => {
    let userFactory: ModelFactory<User, UserAttributes>

    beforeEach(() => {
      userFactory = defineFactory<User, UserAttributes>("User", {
        id: () => faker.string.uuid(),
        name: () => faker.person.fullName(),
        email: () => faker.internet.email(),
        age: () => faker.number.int({ min: 18, max: 80 }),
        is_admin: false,
      })
    })

    it("should define and apply states", () => {
      userFactory.state("admin", { is_admin: true })
      userFactory.state("young", { age: () => faker.number.int({ min: 18, max: 25 }) })

      const adminFactory = userFactory.as("admin")
      expect(adminFactory).toBeInstanceOf(ModelFactory)
    })

    it("should apply multiple states", () => {
      userFactory.state("admin", { is_admin: true })
      userFactory.state("young", { age: 20 })

      const factory = userFactory.as("admin").as("young")
      expect(factory).toBeInstanceOf(ModelFactory)
    })

    it("should apply state with function", () => {
      userFactory.state("senior", (faker) => ({
        age: faker.number.int({ min: 60, max: 80 }),
        name: `Senior ${faker.person.firstName()}`,
      }))

      const seniorFactory = userFactory.as("senior")
      expect(seniorFactory).toBeInstanceOf(ModelFactory)
    })
  })

  describe("Factory Generation", () => {
    let userFactory: ModelFactory<User, UserAttributes>

    beforeEach(() => {
      userFactory = defineFactory<User, UserAttributes>("User", {
        id: () => faker.string.uuid(),
        name: () => faker.person.fullName(),
        email: () => faker.internet.email(),
        age: () => faker.number.int({ min: 18, max: 80 }),
        is_admin: false,
      })
    })

    it("should create a single model", async () => {
      const users = await userFactory.create()

      expect(users).toHaveLength(1)
      expect(users[0]).toBeInstanceOf(User)
      expect(User.create).toHaveBeenCalledTimes(1)
    })

    it("should create multiple models", async () => {
      const users = await userFactory.times(3).create()

      expect(users).toHaveLength(3)
      expect(User.create).toHaveBeenCalledTimes(3)
    })

    it("should create one model with createOne", async () => {
      const user = await userFactory.createOne()

      expect(user).toBeInstanceOf(User)
      expect(User.create).toHaveBeenCalledTimes(1)
    })

    it("should create with overrides", async () => {
      const users = await userFactory.create({ name: "John Doe", is_admin: true })

      expect(users[0].name).toBe("John Doe")
      expect(users[0].is_admin).toBe(true)
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ name: "John Doe", is_admin: true }))
    })

    it("should make models without persisting", () => {
      const user = userFactory.make() as User

      expect(user).toBeInstanceOf(User)
      // expect(user.exists).toBe(false)
      expect(User.create).not.toHaveBeenCalled()
    })

    it("should make multiple models", () => {
      const users = userFactory.times(2).make() as User[]

      expect(users).toHaveLength(2)
      expect(users[0]).toBeInstanceOf(User)
      expect(users[1]).toBeInstanceOf(User)
    })

    it("should generate raw attributes", () => {
      const attributes = userFactory.raw() as UserAttributes

      expect(attributes).toHaveProperty("id")
      expect(attributes).toHaveProperty("name")
      expect(attributes).toHaveProperty("email")
      expect(attributes).toHaveProperty("age")
      expect(attributes).toHaveProperty("is_admin")
    })

    it("should generate multiple raw attributes", () => {
      const attributesArray = userFactory.times(2).raw() as UserAttributes[]

      expect(attributesArray).toHaveLength(2)
      expect(attributesArray[0]).toHaveProperty("name")
      expect(attributesArray[1]).toHaveProperty("name")
    })

    it("should apply states to generated data", async () => {
      userFactory.state("admin", { is_admin: true })

      const users = await userFactory.as("admin").create()

      expect(users[0].is_admin).toBe(true)
    })

    it("should resolve function values", () => {
      const attributes = userFactory.raw() as UserAttributes

      expect(typeof attributes.id).toBe("string")
      expect(typeof attributes.name).toBe("string")
      expect(typeof attributes.email).toBe("string")
      expect(typeof attributes.age).toBe("number")
      expect(attributes.is_admin).toBe(false)
    })
  })

  describe("Factory Cloning", () => {
    it("should clone factory for independent state", () => {
      const userFactory = defineFactory<User, UserAttributes>("User", {
        id: () => faker.string.uuid(),
        name: () => faker.person.fullName(),
        email: () => faker.internet.email(),
      })

      userFactory.state("admin", { is_admin: true })

      const factory1 = factory<User, UserAttributes>("User").as("admin")
      const factory2 = factory<User, UserAttributes>("User")

      expect(factory1).not.toBe(factory2)
    })
  })
})
