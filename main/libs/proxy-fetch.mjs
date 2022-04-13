/**
 * 该 Fetch 模块修补了 中断控制器，连接超时（真实中断连接而非丢弃），连接重试，获取本机代理，屏蔽了NodeFetch2的超时功能。
 */
// import { AbortController, abortableFetch } from 'abortcontroller-polyfill/dist/cjs-ponyfill'
import nodeFetch from 'node-fetch'
import HttpsProxyAgent from 'https-proxy-agent'
import ProxySettings from 'get-proxy-settings'
import delay from 'delay'
import pRetry from 'p-retry'
import pTimeout from './p-timeout.mjs'
import log from 'electron-log'

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
      log.info('Use proxy: ', setting.toString())
    }
  } catch (error) {
    console.warn('Failed to get proxy configuration: ', error)
    log.warn('Failed to get proxy configuration: ', error)
  }
  return async (...args) => {
    args[1] = args[1] || {}
    args[1].agent = args[1].agent || globalThis.proxyAgent || null
    args[1].retries = args[1].retries || 3
    args[1]._timeout = args[1].timeout || 10000
    args[1].timeout = null
    return pRetry(
      async () => {
        try {
          console.log('request: ', args[0])
          log.info('request: ', args[0])
          const abortController = new AbortController()
          const onTimeout = () => {
            abortController.abort()
            throw new TimeoutError(`Promise timed out after ${args[1]._timeout} milliseconds`)
          }
          const response = await pTimeout(nodeFetch(...args), args[1]._timeout, onTimeout, abortController.signal)
          if (response && response.status === 404) {
            throw new AbortError(response.statusText)
          }
        } catch (error) {
          console.error(error)
          log.error(error)
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
  }
}

const fetch = async () => {
  // console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDD');
  // log.info('fetch before', _fetch)
  // const ft = _fetch || (await load())
  // log.info('fetch', ft)
  if (!_fetch) {
    _fetch = await(await load())
    console.log('FETCHHHHHHHHHHHHHHHHHHHHH', _fetch)
  }
  return _fetch // || (await load())
}

export default fetch
