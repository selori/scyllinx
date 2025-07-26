import { faker } from "@faker-js/faker"
import { defineFactory } from "../../../src"
import { Post, PostAttributes } from "../models/Post"

export const PostFactory = defineFactory<Post, PostAttributes>("Post", {
  id: () => faker.string.uuid(),
  user_id: () => faker.string.uuid(), // Gerçekte UserFactory'den gelecek
  category_id: () => faker.string.uuid(), // Gerçekte CategoryFactory'den gelecek
  title: () => faker.lorem.sentence(),
  content: () => faker.lorem.paragraphs(3),
  published: () => faker.datatype.boolean(),
})
.state("published", () => ({
  published: true,
}))
