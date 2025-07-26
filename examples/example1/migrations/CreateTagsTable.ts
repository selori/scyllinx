import { Migration, Schema } from "../../../src/"
import { v4 as uuid } from "uuid"

export class CreateTagsTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable("tags", (table) => {
      table.uuid("id").primary()
      table.string("name")
      table.string("slug")
      table.timestamps()

      table.clusteringKey('name')
    })
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable("tags")
  }
}
