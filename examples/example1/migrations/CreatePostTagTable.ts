import { Migration, Schema } from "../../../src/"

// (pivot table)
export class CreatePostTagTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable("post_tag", (table) => {
      table.uuid("post_id")
      table.uuid("tag_id")
      table.partitionKey("post_id", "tag_id")
    })
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable("post_tag")
  }
}
