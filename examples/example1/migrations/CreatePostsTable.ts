import { Migration, Schema } from "../../../src/"

export class CreatePostsTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable("posts", (table) => {
      table.uuid("id").primary()
      table.uuid("user_id")
      table.uuid("category_id")
      table.string("title")
      table.text("content")
      table.boolean("published")
      table.timestamps()

      table.clusteringKey('published')
    })
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable("posts")
  }
}
