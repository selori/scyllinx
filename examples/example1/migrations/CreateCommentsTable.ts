import { Migration, Schema } from "../../../src/"

export class CreateCommentsTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable("comments", (table) => {
      table.uuid("id").primary()
      table.uuid("user_id")
      table.uuid("post_id")
      table.text("content")
      table.timestamps()
    })
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable("comments")
  }
}
