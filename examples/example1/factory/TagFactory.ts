import { faker } from "@faker-js/faker"
import { defineFactory } from "../../../src"
import { Tag, TagAttributes } from "../models/Tag"

export const TagFactory = defineFactory<Tag, TagAttributes>("Tag", {
  id: () => faker.string.uuid(),
  name: () => faker.lorem.word(),
  slug: () => faker.helpers.slugify(faker.lorem.word()),
})
.state("trending", () => ({
  name: "Trending",
  slug: "trending",
}))
