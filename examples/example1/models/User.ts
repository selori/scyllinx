import { HasMany, Model } from "../../../src"
import { Post } from "./Post"
import { Comment } from "./Comment"

interface UserAttributes {
  id: string
  name: string
  email: string
  password: string
  is_admin: boolean
  created_at?: Date
  updated_at?: Date
  posts?: Post[]
  comments?: Comment[]
}

class User extends Model<UserAttributes> {
  protected static table = "users"
  protected static primaryKey = "id"
  protected static fillable = ["name", "email", "password"]
  protected static guarded = ["is_admin"]
  protected static hidden = ["password"]
  protected static timestamps = true

  // Bir kullanıcının birçok postu vardır
  postsRelation(): HasMany<User, Post> {
    return this.hasMany(Post, "user_id")
  }

  // Bir kullanıcının birçok yorumu vardır
  commentsRelation(): HasMany<User, Comment> {
    return this.hasMany(Comment, "user_id")
  }

  // Mutator for password hashing
  public setPasswordAttribute(value: string): string {
    return `hashed_${value}`
  }

  // Accessor for name
  public getNameAttribute(value: string): string {
    return value.toUpperCase()
  }
}

// Declaration merging for instance properties
interface User extends UserAttributes {}

export { User, UserAttributes }
