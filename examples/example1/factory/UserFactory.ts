import { faker } from "@faker-js/faker"
import { defineFactory } from "../../../src"
import { User, UserAttributes } from "../models/User"

export const UserFactory = defineFactory<User, UserAttributes>("User", {
  id: () => faker.string.uuid(),
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
  is_admin: () => false, // %10 şans admin olma
})
.state("admin", () => ({
  is_admin: true,
}))
