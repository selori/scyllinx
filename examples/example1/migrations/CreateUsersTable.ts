import { Migration, Schema } from "../../../src/"

export class CreateUsersTable extends Migration {
  async up(schema: Schema): Promise<void> {
    await schema.createTable("users", (table) => {
      table.uuid("id").primary()
      table.string("name")
      table.string("email")
      table.string("password")
      table.boolean("is_admin")
      table.timestamps()
    })
  }

  async down(schema: Schema): Promise<void> {
    await schema.dropTable("users")
  }
}
