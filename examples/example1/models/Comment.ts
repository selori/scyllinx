import { Model } from "../../../src"
import { Post } from "./Post"
import { User } from "./User"

interface CommentAttributes {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at?: Date
  updated_at?: Date
  user?: User
  post?: Post
}

class Comment extends Model<CommentAttributes> {
  protected static table = "comments"
  protected static primaryKey = "id"
  protected static fillable = ["user_id", "post_id", "content"]
  protected static timestamps = true

  // Bir yorum bir kullanıcıya aittir
  userRelation() {
    return this.belongsTo(User, "user_id")
  }

  // Bir yorum bir posta aittir
  postRelation() {
    return this.belongsTo(Post, "post_id")
  }
}

// Declaration merging for instance properties
interface Comment extends CommentAttributes {}

export { Comment, CommentAttributes }
