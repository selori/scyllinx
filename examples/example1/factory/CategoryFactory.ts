import { faker } from "@faker-js/faker"
import { defineFactory } from "../../../src"
import { Category, CategoryAttributes } from "../models/Category"

export const CategoryFactory = defineFactory<Category, CategoryAttributes>("Category", {
  id: () => faker.string.uuid(),
  name: () => faker.lorem.word(),
  slug: () => faker.helpers.slugify(faker.lorem.word()),
})
.state("popular", () => ({
  name: "Popular",
  slug: "popular",
}))
