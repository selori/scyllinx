import { CacheStore } from "./CacheStore"

export class RedisCacheStore implements CacheStore {
  private client: any
  private prefix: string
  private redisModule: typeof import("redis") | null = null

  private config: Record<string, any>

  constructor(config: Record<string, any> = {}, prefix = "") {
    this.prefix = prefix
    this.config = config
  }

  async connect(): Promise<void> {
    if (!this.redisModule) {
      this.redisModule = await import("redis")
    }

    this.client = this.redisModule.createClient({
      socket: {
        host: this.config.host || "localhost",
        port: this.config.port || 6379,
      },
      password: this.config.password,
      database: this.config.db || 0,
    })

    await this.client.connect()
  }

  async get(key: string): Promise<any> {
    const raw = await this.client.get(this.prefixKey(key))

    // Buffer ise string'e çevir
    const value = typeof raw === "string" ? raw : raw?.toString?.("utf-8")

    return value ? JSON.parse(value) : undefined
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await this.client.setEx(this.prefixKey(key), ttl, serialized)
    } else {
      await this.client.set(this.prefixKey(key), serialized)
    }
  }

  async forget(key: string): Promise<void> {
    await this.client.del(this.prefixKey(key))
  }

  async flush(): Promise<void> {
    const keys = await this.client.keys(`${this.prefix}*`)
    if (keys.length > 0) {
      await this.client.del(keys)
    }
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

  private prefixKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key
  }
}