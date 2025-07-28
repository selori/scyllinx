import { CacheStore } from "./CacheStore"

export class MemoryCacheStore implements CacheStore {
  private cache: any // NodeCache tipi dinamik import sonrası geliyor
  private config: Record<string, any>
  private nodeCacheModule: any = null

  constructor(config: Record<string, any> = {}) {
    this.config = config
  }

  async connect(): Promise<void> {
    if (!this.nodeCacheModule) {
      this.nodeCacheModule = await import("node-cache")
    }
    this.cache = new this.nodeCacheModule.default({
      stdTTL: this.config.stdTTL || 600,
      checkperiod: this.config.checkperiod || 120,
    })
    return Promise.resolve()
  }

  async get(key: string): Promise<any> {
    return this.cache.get(key)
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, value, ttl as number)
  }

  async forget(key: string): Promise<void> {
    this.cache.del(key)
  }

  async flush(): Promise<void> {
    this.cache.flushAll()
  }

  async remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
    const cached = await this.get(key)
    if (cached !== undefined) {
      return cached
    }

    const value = await callback()
    await this.set(key, value, ttl)
    return value
  }
}
