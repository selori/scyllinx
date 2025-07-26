import { faker } from "@faker-js/faker";
import { Seeder } from "../../../src";
import { UserFactory } from '../factory/UserFactory'
import { PostFactory } from '../factory/PostFactory'
import { CategoryFactory } from '../factory/CategoryFactory'
import { TagFactory } from '../factory/TagFactory'
import { CommentFactory } from '../factory/CommentFactory'

export class DatabaseSeeder extends Seeder {
  async run(): Promise<void> {
    // Veritabanını temizle
    console.log("Veritabanı temizleniyor...");
    await this.truncate("users");
    await this.truncate("posts");
    await this.truncate("categories");
    await this.truncate("tags");
    await this.truncate("comments");
    await this.truncate("post_tag");
    console.log("Veritabanı temizlendi");

    // Önce kullanıcıları oluştur
    const users = await this.factory(() => UserFactory)
      .times(10)
      .create();
    
    // Admin kullanıcı oluştur
    const admin = await this.factory(() => UserFactory)
      .as("admin")
      .create({
        name: "Admin User",
        email: "admin@example.com",
      });

    // Kategorileri oluştur
    const categories = await this.factory(() => CategoryFactory)
      .times(5)
      .create();

    // Etiketleri oluştur
    const tags = await this.factory(() => TagFactory)
      .times(10)
      .create();

    // Her kullanıcı için 1-5 post oluştur
    for (const user of users) {
      const posts = await this.factory(() => PostFactory)
        .times(faker.number.int({ min: 1, max: 5 }))
        .create({
          user_id: user.id,
          category_id: faker.helpers.arrayElement(categories).id,
        });

      // Her post için 0-3 yorum oluştur
      for (const post of posts) {
        // Post'a 1-3 etiket ekle
        const postTags = faker.helpers.arrayElements(tags, { min: 1, max: 3 });
        await post.tagsRelation().attach(postTags.map(t => t.id));

        await this.factory(() => CommentFactory)
          .times(faker.number.int({ min: 0, max: 3 }))
          .create({
            post_id: post.id,
            user_id: faker.helpers.arrayElement(users).id,
          });
      }
    }
  }
}
