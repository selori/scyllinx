import { Model } from "../src/model/Model"
import { HasMany } from "../src/relationships/HasMany"
import { BelongsTo } from "../src/relationships/BelongsTo"
import { BelongsToMany } from "../src/relationships/BelongsToMany"
import { ConnectionManager } from "../src/connection/ConnectionManager"
import jest from "jest"

// Mock the connection manager
jest.mock("../src/connection/ConnectionManager")

interface UserAttributes {
  id: string
  name: string
  email: string
}

interface PostAttributes {
  id: string
  user_id: string
  title: string
  content: string
  user?: User
}

interface TagAttributes {
  id: string
  name: string
  posts?: Post[]
}

class User extends Model<UserAttributes> {
  protected static table = "users"
  protected static primaryKey = "id"

  postsRelation(): HasMany<User, Post> {
    return this.hasMany(Post, "user_id")
  }
}

class Post extends Model<PostAttributes> {
  protected static table = "posts"
  protected static primaryKey = "id"

  userRelation(): BelongsTo<Post, User> {
    return this.belongsTo(User, "user_id")
  }

  tagsRelation(): BelongsToMany<Post, Tag> {
    return this.belongsToMany(Tag, "post_tag", "post_id", "tag_id")
  }
}

class Tag extends Model<TagAttributes> {
  protected static table = "tags"
  protected static primaryKey = "id"

  postsRelation(): BelongsToMany<Tag, Post> {
    return this.belongsToMany(Post, "post_tag", "tag_id", "post_id")
  }
}

interface User extends UserAttributes {}
interface Post extends PostAttributes {}
interface Tag extends TagAttributes {}

describe("Relationships", () => {
  let mockConnection: any
  let mockDriver: any
  let mockGrammar: any

  beforeEach(() => {
    mockGrammar = {
      compileSelect: jest.fn().mockReturnValue("SELECT * FROM posts WHERE user_id = ?"),
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

  describe("HasMany Relationship", () => {
    it("should create has many relationship", () => {
      const user = new User({ id: "1", name: "John", email: "john@example.com" }, true)
      const relationship = user.postsRelation()

      expect(relationship).toBeInstanceOf(HasMany)
      expect(relationship.getForeignKeyName()).toBe("user_id")
      expect(relationship.getLocalKeyName()).toBe("id")
    })

    it("should get related models", async () => {
      const user = new User({ id: "1", name: "John", email: "john@example.com" }, true)
      const mockPosts = [
        { id: "1", user_id: "1", title: "Post 1", content: "Content 1" },
        { id: "2", user_id: "1", title: "Post 2", content: "Content 2" },
      ]

      mockDriver.query.mockResolvedValueOnce({ rows: mockPosts, rowCount: 2 })

      const posts = await user.postsRelation().get()

      expect(posts).toHaveLength(2)
      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should get first related model", async () => {
      const user = new User({ id: "1", name: "John", email: "john@example.com" }, true)
      const mockPost = { id: "1", user_id: "1", title: "Post 1", content: "Content 1" }

      mockDriver.query.mockResolvedValueOnce({ rows: [mockPost], rowCount: 1 })

      const post = await user.postsRelation().first()

      expect(post).toBeTruthy()
      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should add where constraints to relationship query", async () => {
      const user = new User({ id: "1", name: "John", email: "john@example.com" }, true)

      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      await user.postsRelation().where("title", "like", "%test%").get()

      expect(mockDriver.query).toHaveBeenCalled()
    })
  })

  describe("BelongsTo Relationship", () => {
    it("should create belongs to relationship", () => {
      const post = new Post({ id: "1", user_id: "1", title: "Post 1", content: "Content 1" }, true)
      const relationship = post.userRelation()

      expect(relationship).toBeInstanceOf(BelongsTo)
      expect(relationship.getForeignKeyName()).toBe("user_id")
      expect(relationship.getLocalKeyName()).toBe("id")
    })

    it("should get related model", async () => {
      const post = new Post({ id: "1", user_id: "1", title: "Post 1", content: "Content 1" }, true)
      const mockUser = { id: "1", name: "John", email: "john@example.com" }

      mockDriver.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 })

      const user = await post.userRelation().first()

      expect(user).toBeTruthy()
      expect(mockDriver.query).toHaveBeenCalled()
    })
  })

  describe("BelongsToMany Relationship", () => {
    it("should create belongs to many relationship", () => {
      const post = new Post({ id: "1", user_id: "1", title: "Post 1", content: "Content 1" }, true)
      const relationship = post.tagsRelation()

      expect(relationship).toBeInstanceOf(BelongsToMany)
    })

    it("should get related models through pivot table", async () => {
      const post = new Post({ id: "1", user_id: "1", title: "Post 1", content: "Content 1" }, true)
      const mockTags = [
        { id: "1", name: "Tag 1" },
        { id: "2", name: "Tag 2" },
      ]

      mockDriver.query.mockResolvedValueOnce({ rows: mockTags, rowCount: 2 })

      const tags = await post.tagsRelation().get()

      expect(tags).toHaveLength(2)
      expect(mockDriver.query).toHaveBeenCalled()
    })
  })

  describe("Eager Loading", () => {
    it("should load relationships eagerly", async () => {
      const user = new User({ id: "1", name: "John", email: "john@example.com" }, true)
      user.setExists(true)

      const mockPosts = [
        { id: "1", user_id: "1", title: "Post 1", content: "Content 1" },
        { id: "2", user_id: "1", title: "Post 2", content: "Content 2" },
      ]

      mockDriver.query.mockResolvedValueOnce({ rows: mockPosts, rowCount: 2 })

      await user.load("posts")

      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should load nested relationships", async () => {
      const user = new User({ id: "1", name: "John", email: "john@example.com" }, true)
      user.setExists(true)

      // Mock posts query
      const mockPosts = [{ id: "1", user_id: "1", title: "Post 1", content: "Content 1" }]
      mockDriver.query.mockResolvedValueOnce({ rows: mockPosts, rowCount: 1 })

      // Mock tags query for the post
      const mockTags = [{ id: "1", name: "Tag 1" }]
      mockDriver.query.mockResolvedValueOnce({ rows: mockTags, rowCount: 1 })

      await user.load("posts.tags")

      expect(mockDriver.query).toHaveBeenCalledTimes(2)
    })
  })

  describe("Relationship Constraints", () => {
    it("should apply constraints to relationship queries", async () => {
      const user = new User({ id: "1", name: "John", email: "john@example.com" }, true)

      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const query = user.postsRelation().where("published", true)
      await query.get()

      expect(mockDriver.query).toHaveBeenCalled()
    })

    it("should support with constraints on relationships", async () => {
      const user = new User({ id: "1", name: "John", email: "john@example.com" }, true)

      mockDriver.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      const query = user.postsRelation().with("tags")
      await query.get()

      expect(mockDriver.query).toHaveBeenCalled()
    })
  })
})
