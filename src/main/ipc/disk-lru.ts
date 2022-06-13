import LRU from 'lru-cache'
import { app } from 'electron'
import fs from 'fs'
import Base64 from 'js-base64'
import hash from './hash'

const options = {
  max: 500,
  // for use with tracking overall storage size
  maxSize: 1024 * 1024 * 64,
  sizeCalculation: (value: string, key: string) => {
    try {
      if (fs.existsSync(value)) {
        const stat = fs.statSync(value)
        if (stat.isFile()) return stat.size
      }
    } catch (error) {}
    return 1
  },

  // for use when you need to clean up something when objects
  // are evicted from the cache
  dispose: (value: string, key: string) => {
    try {
      fs.existsSync(value) && fs.rmSync(value)
    } catch (error) {}
  },

  // how long to live in ms
  // ttl: 1000 * 60 * 5,

  // return stale items before removing from cache?
  // allowStale: false,

  // updateAgeOnGet: false,
  // updateAgeOnHas: false,

  // async method to use for cache.fetch(), for
  // stale-while-revalidate type of behavior
  // fetch: async (key, staleValue, { options, signal }) => {}
}
// LRU cache
const cache = new LRU<string, string>(options)
// Cache directory
const cacheDir = `${app.getAppPath()}/cache`
// Cache map path
const cacheMapPath = `${app.getAppPath()}/cache.json`
// Create cache directory
fs.mkdirSync(cacheDir, { recursive: true })
// Resume cache status
if (fs.existsSync(cacheMapPath) && fs.statSync(cacheMapPath).isFile()) {
  try {
    const data = fs.readFileSync(cacheMapPath).toString()
    cache.load(JSON.parse(data))
  } catch (error) {
    console.log(error)
  }
}
// Add cache and write file
const set = (key: string, data: string | Uint8Array, options?: LRU.SetOptions<string, string> | undefined): LRU<string, string> => {
  const value = `${cacheDir}/${hash(key)}.png`
  // console.log('set cache:', value, ', cache size', cache.calculatedSize)
  if (typeof data == 'string') {
    fs.writeFileSync(value, Base64.toUint8Array(data))
  } else if (data instanceof Uint8Array) {
    fs.writeFileSync(value, data)
  } else {
    throw Error('缓存错误：无法识别的数据类型')
  }
  return cache.set(key, value, options)
}
// Get cache byte data
const get = (key: string, options?: LRU.GetOptions | undefined): Uint8Array | null => {
  const path = cache.get<string>(key, options)
  try {
    if (path && fs.statSync(path).isFile()) {
      return fs.readFileSync(path)
    } else {
      cache.delete(key)
    }
  } catch (error) {
    cache.delete(key)
  }
  return null
}
// Test cache exists
const has = cache.has
const remove = cache.delete

// save cache status
const saveCacheStatus = () => {
  fs.writeFileSync(cacheMapPath, JSON.stringify(cache.dump()))
}

export { set, get, has, remove, saveCacheStatus }
