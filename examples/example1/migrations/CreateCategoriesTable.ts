import { Migration, Schema } from "../../../src/"

export class CreateCategoriesTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable("categories", (table) => {
      table.uuid("id").primary()
      table.string("name")
      table.string("slug").unique()
      table.timestamps()
    })
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable("categories")
  }
}
