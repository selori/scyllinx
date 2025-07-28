export interface CacheStore {
  connect(): Promise<void>
  get(key: string): Promise<any>
  set(key: string, value: any, ttl?: number): Promise<void>
  forget(key: string): Promise<void>
  flush(): Promise<void>
  remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T>
}