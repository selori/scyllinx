import NodeCache from "node-cache"
import { CacheStore } from "./CacheStore"

export class MemoryCacheStore implements CacheStore {
  private cache: NodeCache

  constructor(config: Record<string, any> = {}) {
    this.cache = new NodeCache({
      stdTTL: config.stdTTL || 600,
      checkperiod: config.checkperiod || 120,
    })
  }
  connect(): Promise<void> {
    throw new Error("Method not implemented.")
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