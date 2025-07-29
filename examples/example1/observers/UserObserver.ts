import { Model, ModelObserver } from "../../../src"
import type { User } from "../models/User"

export class UserObserver extends ModelObserver {
  async saving(user: User): Promise<void> {
      console.log(console.log(`Saving user: ${user.id}`))
  }

  async saved(user: User): Promise<void> {
      console.log(console.log(`Saved user: ${user.id}`))
  }

  async creating(user: User): Promise<void> {
    console.log(`Creating user: ${user.getAttribute("email")}`)
  }

  async created(user: User): Promise<void> {
    console.log(`User created: ${user.getAttribute("name")} (ID: ${user.id})`)

    // Send welcome email (mock)
    await this.sendWelcomeEmail(user)
  }

  async updating(user: User): Promise<void> {
    // Log important changes
    if (user.isDirty(["email"])) {
      console.log(`Email changing from ${user.getOriginal("email")} to ${user.getAttribute("email")}`)
    }
  }

  async updated(user: User): Promise<void> {
    console.log(`User updated: ${user.getAttribute("name")}`)
  }

  async deleting(user: User): Promise<void> {
    console.log(`Deleting user: ${user.getAttribute("name")}`)
  }

  async deleted(user: User): Promise<void> {
    console.log(`User deleted: ${user.getAttribute("name")}`)
  }

  private async sendWelcomeEmail(user: User): Promise<void> {
    // Mock email sending
    console.log(`📧 Welcome email sent to ${user.getAttribute("email")}`)
  }
}
