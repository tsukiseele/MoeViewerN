const nodeFetch = require('node-fetch')
const HttpsProxyAgent = require('https-proxy-agent')
const ProxySettings = require('get-proxy-settings')

let pRetry = null
let pTimeout = null
let _fetch = null

const load = async () => {
  try {
    pRetry = (await import('p-retry')).default
    // pTimeout = (await import('p-timeout')).default
    pTimeout = (await import('./p-timeout.mjs')).default
    const proxy = await ProxySettings.getProxySettings()

    if (proxy) {
      const setting = proxy.https || proxy.http
      const proxyAgent = new HttpsProxyAgent(setting.toString())
      globalThis.proxy = proxy
      globalThis.proxyAgent = proxyAgent
      console.log('Use proxy: ', setting.toString())
    }
  } catch (error) {
    console.warn('Failed to get proxy configuration: ', error)
  }
  return (_fetch = async (...args) => {
    args[1] = args[1] || {}
    args[1].agent = args[1].agent || globalThis.proxyAgent || null
    args[1].retries = args[1].retries || 3
    args[1]._timeout = args[1].timeout || 10000
    args[1].timeout = null
    const timeoutPromise = pTimeout(nodeFetch(...args), args[1]._timeout)
    return pRetry(
      async () => {
        console.log('request: ', args[0]);
        const response = await timeoutPromise
        if (response.status === 404) {
          throw new AbortError(response.statusText)
        }
        return response
      },
      {
        retries: args[1].retries,
        onFailedAttempt: async error => {
          // console.log('Waiting for 1 second before retrying')
          // await delay(1000)
        },
      }
    )
  })
}

const fetch = async () => {
  return _fetch || (await load())
}
module.exports = fetch
