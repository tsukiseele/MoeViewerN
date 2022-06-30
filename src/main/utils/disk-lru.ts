import { app } from 'electron'
import fs from 'fs'
import { writeFile } from 'fs/promises'
import LRU from 'lru-cache'
import Base64 from 'js-base64'
import CryptoJS from 'crypto-js'

const options = {
  max: 500,
  // for use with tracking overall storage size
  maxSize: 1024 * 1024 * 128,
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
const cacheDir = `${process.cwd()}/.cache`
// Cache map path
const cacheMapPath = `${cacheDir}/cache.json`
// Create cache directory
fs.mkdirSync(cacheDir, { recursive: true })
// Resume cache status
if (fs.existsSync(cacheMapPath) && fs.statSync(cacheMapPath).isFile()) {
  try {
    cache.load(JSON.parse(fs.readFileSync(cacheMapPath).toString()))
  } catch (error) {
    console.log(error)
  }
}
// save cache status
const saveCacheStatus = () => {
  fs.writeFileSync(cacheMapPath, JSON.stringify(cache.dump()))
}
// Add cache and write file
const set = (key: string, data: string | Uint8Array, options?: LRU.SetOptions<string, string> | undefined): LRU<string, string> => {
  // const value = `${cacheDir}/${cyrb53(key)}.png`
  const value = `${cacheDir}/${CryptoJS.SHA256(key)}.png`
  
  // console.log('set cache:', value, ', cache size', cache.calculatedSize)
  if (typeof data == 'string') {
    writeFile(value, Base64.toUint8Array(data))
  } else if (data instanceof Uint8Array) {
    writeFile(value, data)
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

export { set, get, has, remove, saveCacheStatus }
