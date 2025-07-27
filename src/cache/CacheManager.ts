import { CacheConfig } from "@/types"
import { CacheStore } from "./CacheStore"
import { MemoryCacheStore } from "./MemoryCacheStore"
import { RedisCacheStore } from "./RedisCacheStore"

export class CacheManager {
  private static instance: CacheManager
  private stores: Map<string, CacheStore> = new Map()
  private defaultStore = "redis"

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  addStore(name: string, config: CacheConfig): void {
    let store: CacheStore

    switch (config.driver) {
      case "redis":
        store = new RedisCacheStore(config.redis, config.prefix)
        break
      case "memory":
      default:
        store = new MemoryCacheStore(config.memory)
        break
    }

    this.stores.set(name, store)
  }

  getStore(name?: string): CacheStore {
    const storeName = name || this.defaultStore
    const store = this.stores.get(storeName)

    if (!store) {
      throw new Error(`Cache store '${storeName}' not found`)
    }

    return store
  }

  setDefaultStore(name: string): void {
    this.defaultStore = name
  }

  async get(key: string, store?: string): Promise<any> {
    return this.getStore(store).get(key)
  }

  async set(key: string, value: any, ttl?: number, store?: string): Promise<void> {
    return this.getStore(store).set(key, value, ttl)
  }

  async forget(key: string, store?: string): Promise<void> {
    return this.getStore(store).forget(key)
  }

  async flush(store?: string): Promise<void> {
    return this.getStore(store).flush()
  }

  async remember<T>(key: string, ttl: number, callback: () => Promise<T>, store?: string): Promise<T> {
    return this.getStore(store).remember(key, ttl, callback)
  }

  tags(tags: string[]): TaggedCache {
    return new TaggedCache(this, tags)
  }
}

export class TaggedCache {
  constructor(
    private cacheManager: CacheManager,
    private tags: string[],
  ) {}

  async get(key: string): Promise<any> {
    return this.cacheManager.get(this.taggedKey(key))
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(this.taggedKey(key), value, ttl)

    // Store tag references
    for (const tag of this.tags) {
      const tagKeys = (await this.cacheManager.get(`tag:${tag}`)) || []
      tagKeys.push(this.taggedKey(key))
      await this.cacheManager.set(`tag:${tag}`, tagKeys)
    }
  }

  async flush(): Promise<void> {
    for (const tag of this.tags) {
      const tagKeys = (await this.cacheManager.get(`tag:${tag}`)) || []
      for (const key of tagKeys) {
        await this.cacheManager.forget(key)
      }
      await this.cacheManager.forget(`tag:${tag}`)
    }
  }

  private taggedKey(key: string): string {
    return `tagged:${this.tags.join(":")}:${key}`
  }
}
