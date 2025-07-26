import { faker } from "@faker-js/faker"
import { defineFactory } from "../../../src"
import { Comment, CommentAttributes } from "../models/Comment"

export const CommentFactory = defineFactory<Comment, CommentAttributes>("Comment", {
  id: () => faker.string.uuid(),
  user_id: () => faker.string.uuid(), // Gerçekte UserFactory'den gelecek
  post_id: () => faker.string.uuid(), // Gerçekte PostFactory'den gelecek
  content: () => faker.lorem.paragraph(),
})
.state("long", () => ({
  content: faker.lorem.paragraphs(3),
}))
.state("short", () => ({
  content: faker.lorem.sentence(),
}))
