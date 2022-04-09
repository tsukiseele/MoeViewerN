/**
 * 该 Fetch 模块修补了 中断控制器，连接超时（真实中断连接而非丢弃），连接重试，获取本机代理，屏蔽了NodeFetch2的超时功能。
 */
const { AbortController, abortableFetch } = require('abortcontroller-polyfill/dist/cjs-ponyfill')
const { fetch: nodeFetch } = abortableFetch(require('node-fetch'))
const HttpsProxyAgent = require('https-proxy-agent')
const ProxySettings = require('get-proxy-settings')
const delay = require('delay')
// const { pTimeout, TimeoutError } = require('./p-timeout.js')

let pTimeout = null
let pRetry = null
let _fetch = null

const load = async () => {
  try {
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

  pTimeout = (await import('p-timeout')).default
  pRetry = (await import('p-retry')).default

  return (_fetch = async (...args) => {
    args[1] = args[1] || {}
    args[1].agent = args[1].agent || globalThis.proxyAgent || null
    args[1].retries = args[1].retries || 3
    args[1]._timeout = args[1].timeout || 10000
    args[1].timeout = null
    return await pRetry(
      async () => {
        console.log('request: ', args[0])
        // const abortController = new AbortController()
        // const onTimeout = () => {
        //   abortController.abort()
        //   throw new TimeoutError(`Promise timed out after ${args[1]._timeout} milliseconds`)
        // }
        const response = await pTimeout(nodeFetch(...args), args[1]._timeout /*, onTimeout, abortController.signal*/)
        if (response && response.status === 404) {
          throw new AbortError(response.statusText)
        }
        return response
      },
      {
        retries: args[1].retries,
        onFailedAttempt: async (error) => {
          console.log('Waiting for 1~3 second before retrying')
          await delay(1000 + Math.random() * 2000)
        },
      }
    )
  })
}

const fetch = async () => {
  return _fetch || (await load())
}
module.exports = fetch
