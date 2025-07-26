import { HasMany, Model } from "../../../src"
import { Post } from "./Post"

interface CategoryAttributes {
  id: string
  name: string
  slug: string
  created_at?: Date
  updated_at?: Date
  posts?: Post[]
}

class Category extends Model<CategoryAttributes> {
  protected static table = "categories"
  protected static primaryKey = "id"
  protected static fillable = ["name", "slug"]
  protected static timestamps = true

  // Bir kategorinin birçok postu vardır
  postsRelation(): HasMany<Category, Post> {
    return this.hasMany(Post, "category_id")
  }
}

// Declaration merging for instance properties
interface Category extends CategoryAttributes {}

export { Category, CategoryAttributes }
