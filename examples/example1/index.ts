// index.ts
import { CacheManager, ConnectionManager, MigrationManager, ModelRegistry, SeederRunner } from "../../src"
import { CreateCategoriesTable, CreateCommentsTable, CreatePostsTable, CreatePostTagTable, CreateTagsTable, CreateUsersTable } from "./migrations"
import { DatabaseSeeder } from "./seeders/DatabaseSeeder"
import { User } from "./models/User"
import { Post } from "./models/Post"
import { Comment } from "./models/Comment"
import { Category } from "./models/Category"
import { Tag } from "./models/Tag"

async function main() {
  // Bağlantıyı kur
  const connManager = ConnectionManager.getInstance()
  const connectionConfig = {
    driver: 'scylladb' as const,
    host: '2.58.80.193', 
    localDataCenter: 'nova', 
    keyspace: 'blog_system',
    username: 'wyrex',
    password: 'g4z4i2d05Y',
    options: {}
  }

  await connManager.addConnection("default", connectionConfig)
  const connection = connManager.getConnection()

  const cacheManager = CacheManager.getInstance()
  cacheManager.addStore('redis', {
    driver: 'redis',
  })
  await cacheManager.getStore('redis').connect()
  
  try {
    console.log('Bağlanıyor...')
    await connection.connect()
    console.log('Bağlantı başarılı')

    // Modelleri kaydet
    ModelRegistry.getInstance()
      .register("User", User)
      .register("Post", Post)
      .register("Comment", Comment)
      .register("Category", Category)
      .register("Tag", Tag)

    // console.log((await connection.query('DROP TABLE IF EXISTS migrations')))
    // console.log((await connection.query('DROP TABLE IF EXISTS users')))
    // console.log((await connection.query('DROP TABLE IF EXISTS categories')))
    // console.log((await connection.query('DROP TABLE IF EXISTS tags')))
    // console.log((await connection.query('DROP TABLE IF EXISTS posts')))
    // console.log((await connection.query('DROP TABLE IF EXISTS comments')))
    // console.log((await connection.query('DROP TABLE IF EXISTS post_tag')))
    // Migrations çalıştır
    const migrations = [
      new CreateUsersTable(),
      new CreateCategoriesTable(),
      new CreateTagsTable(),
      new CreatePostsTable(),
      new CreateCommentsTable(),
      new CreatePostTagTable(),
    ]
    const migrationManager = new MigrationManager(connManager)
    await migrationManager.migrate(migrations)

    const tables = await connection.query(`
      SELECT table_name 
      FROM system_schema.tables 
      WHERE keyspace_name = ?
    `, ['blog_system'])

    if (tables.rowCount > 0) {
      console.log(`blog_system keyspace'indeki tablolar:`)
      tables.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`)
      })
    } else {
      console.log(`blog_system keyspace'inde hiç tablo bulunamadı.`)
    }

    //console.log((await connection.query('DESCRIBE TABLE post_tag')))
    // console.log((await connection.query('DESCRIBE KEYSPACE blog_system')))

    // Seeder çalıştır
    // console.log("Veritabanını dolduruyor...")
    // await SeederRunner.run([DatabaseSeeder])
    // console.log("Veritabanı dolduruldu")

    // Örnek sorgular
    console.log("\n--- ÖRNEK SORGULAR ---")

    // 1. Tüm yayınlanmış postları getir
    const publishedPosts = await Post.query().where("published", true).get()
    console.log(`Yayınlanmış post sayısı: ${publishedPosts.length}`)

    // 2. Bir kullanıcının tüm postlarını getir
    const user = await User.query().first()
    const u1 = await User.query().with('posts', 'posts.comments', 'posts.comments.user').cache(60).first()
    if (u1) console.log('KOMPLEKS QUERY WİTH RELATIONSHIPS', typeof u1, u1)
    if (user) {
      const userPosts = await user.postsRelation().get()
      const post = await userPosts[0].load('user')
      const u = post.user
      console.log(`Postun kullanıcısı: ${u?.name}`)
      console.log(`${user.name} kullanıcısının post sayısı: ${userPosts.length}`, post)
    }

    // Eager loading
    // const users = await User
    //   .query()
    //   .with('posts', 'posts.comments')
    //   .get()

    // for (const u of (users.slice(0,3))) {
    //   console.log('--Kullanıcı:', u.name)
    //   console.log('--Kullanıcının postları: ', u.posts)          // array of Post
    //   console.log('--ilk postun yorumları', u.posts![0].comments) // nested comments yüklü
    //   // console.log(u.profile)        // tek Profile objesi
    // }


    // 3. Bir postun yorumlarını ve yorum sahiplerini getir (eager loading)
    const post1 = await Post.findOrFail('e678b017-5bc1-458b-8dc0-ccfb6df9c869')
    if (post1) {
      const postWithComments = await post1.commentsRelation().with("user").get()
      console.log('FOREIGN KEY:', post1.commentsRelation().getForeignKeyName(), "LOCAL KEY:", post1.commentsRelation().getLocalKeyName())
      console.log(`Post #${post1.id} yorum sayısı: ${postWithComments.length}`)
      console.log(postWithComments[0].toObject())

      if (postWithComments.length > 0) {
        console.log(`İlk yorumun sahibi: ${postWithComments[0].user?.name}`)
      }
    }

    // 4. Bir kategorinin tüm postlarını getir
    const category = await Category.query().first()
    if (category) {
      const categoryPosts = await category.postsRelation().get()
      console.log(`${category.name} kategorisindeki post sayısı: ${categoryPosts.length}`)
    }

    // 5. Bir postun etiketlerini getir
    const post = await Post.first()
    if (post) {
      const postTags = await post.tagsRelation().getResults()
      console.log(`Post #${post.id} etiket sayısı: ${postTags.length}`)
    }

    // 6. Bir etikete sahip tüm postları getir
    const tag = await Tag.query().first()
    if (tag) {
      const tagPosts = await tag.postsRelation().get()
      console.log(`"${tag.name}" etiketine sahip post sayısı: ${tagPosts.length}`)
    }

    // // 7. Scope kullanımı
    // const activeUsers = await User.query().active().get()
    // console.log(`Aktif kullanıcı sayısı: ${activeUsers.length}`)
    const t1 = await Tag.query().where('name', "Action").first()
    const t2 = await Tag.query().where('name', "Adventure").first()

    // 8. Many-to-many ilişkisine yeni kayıt ekleme
    if (post && t1 && t2) {
      console.log(`Post #${post.id} için yeni etiket ekleniyor: ${(await post.tagsRelation().getResults()).map(t => t.name)}`)
      await post.tagsRelation().attach([t1.id, t2.id])
      console.log(`Post #${post.id} yeni etiket eklendi`, (await post.tagsRelation().getResults()).map(t => t.name))
    }

    // 9. Many-to-many ilişkisinden kayıt çıkarma
    if (post && t1 && t2) {
      console.log(`Post #${post.id} için etiket kaldırılıyor: ${(await post.tagsRelation().getResults()).map(t => t.name)}`)
      await post.tagsRelation().detach([t1.id])
      console.log(`Post #${post.id} etiket kaldırıldı`, (await post.tagsRelation().getResults()).map(t => t.name))
    }

    // // 10. Model olayları (events)
    // const newUser = new User({
    //   name: "Test User",
    //   email: "test@example.com",
    //   password: "secret",
    // })

    // await newUser.save()
    // console.log(`Yeni kullanıcı oluşturuldu: ${newUser.name}`)

  } catch (error) {
    console.error('Hata oluştu:', error)
  } finally {
    await connection.disconnect()
    console.log('\nBağlantı kapatıldı.')
  }
}

main().catch(console.error)
