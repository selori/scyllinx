import { BelongsTo, BelongsToMany, HasMany, Model, QueryBuilder } from "../../../src"
import { User } from "./User"
import { Category } from "./Category"
import { Comment } from "./Comment"
import { Tag } from "./Tag"

interface PostAttributes {
  id: string
  user_id: string
  category_id: string
  title: string
  content: string
  published: boolean
  created_at?: Date
  updated_at?: Date
  user?: User // İlişkili kullanıcı
  category?: Category
  comments?: Comment[]
  tags?: Tag[]
}

class Post extends Model<PostAttributes> {
  protected static table = "posts"
  protected static connection = "default" // ScyllaDB kullanıyoruz
  protected static primaryKey = "id"
  protected static fillable = ["user_id", "category_id", "title", "content", "published"]
  protected static timestamps = true

  // Bir post bir kullanıcıya aittir
  userRelation(): BelongsTo<Post, User> {
    return this.belongsTo(User, "user_id")
  }

  // Bir post bir kategoriye aittir
  categoryRelation(): BelongsTo<Post, Category> {
    return this.belongsTo(Category, "category_id")
  }

  // Bir postun birçok yorumu vardır
  commentsRelation(): HasMany<Post, Comment> {
    return this.hasMany(Comment, "post_id")
  }

  // Bir postun birçok etiketi vardır (many-to-many)
  tagsRelation(): BelongsToMany<Post, Tag> {
    return this.belongsToMany(Tag, "post_tag", "post_id", "tag_id", "id", "id")
  }

  // Scope for published posts
  public static published(): QueryBuilder<Post, PostAttributes> {
    return this.query().where("published", true)
  }

}

// Declaration merging for instance properties
interface Post extends PostAttributes {}

export { Post, PostAttributes }
