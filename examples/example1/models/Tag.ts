import { BelongsTo, BelongsToMany, Model } from "../../../src"
import { Post } from "./Post"

interface TagAttributes {
  id: string
  name: string
  slug: string
  created_at?: Date
  updated_at?: Date
  posts?: Post[]
}

class Tag extends Model<TagAttributes> {
  protected static table = "tags"
  protected static primaryKey = "id"
  protected static connection = "default" // ScyllaDB kullanıyoruz
  protected static fillable = ["name", "slug"]
  protected static timestamps = true

  // Bir etiket birçok posta aittir (many-to-many)
  postsRelation(): BelongsToMany<Tag, Post> {
    return this.belongsToMany(Post, "post_tag", "tag_id", "post_id")
  }
}

// Declaration merging for instance properties
interface Tag extends TagAttributes {}

export { Tag, TagAttributes }
