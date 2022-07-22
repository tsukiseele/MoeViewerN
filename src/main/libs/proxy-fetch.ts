/**
 * @author TsukiSeele
 * @version 1.0
 * @license MIT
 * 该 Fetch 模块修补了 中断控制器，连接超时（真实中断连接而非丢弃），连接重试，获取本机代理，屏蔽了NodeFetch2的超时功能。
 */
import nodeFetch, { Response } from 'node-fetch'
import * as ProxySettings from 'get-proxy-settings'
import HttpsProxyAgent from 'https-proxy-agent'
import pRetry, { AbortError } from 'p-retry'
import pTimeout,  { TimeoutError }  from './p-timeout'
import delay from 'delay'

;(async () => {
  try {
    const proxy = await ProxySettings.getProxySettings()
    if (proxy) {
      const setting = proxy.https || proxy.http
      // @ts-ignore
      const proxyAgent = new HttpsProxyAgent(setting.toString()) 
      global.proxy = proxy
      global.proxyAgent = proxyAgent
      // console.info('Use proxy: ', setting?.toString())
    console.log(`\u001b[1;42mUse proxy: \u001b[0m ${setting?.toString()}`);

    }
  } catch (error) {
    console.warn('\u001b[1;43mFailed to get proxy configuration: \u001b[0m', error)
  }
})()
 
/**
 * 默认使用系统代理
 * 默认超时时间：10s
 * 默认重试次数：3次
 */
export default async (...args: any[]) => {
  args[1] = args[1] || {}
  args[1].agent = args[1].agent || global.proxyAgent || null
  args[1].retries = args[1].retries || 3
  args[1]._timeout = args[1].timeout || 10000
  args[1].timeout = null
  return await pRetry(
    async () => {
      const abortController = new AbortController()
      const onTimeout = () => {
        abortController.abort()
        throw new TimeoutError(`Promise timed out after ${args[1]._timeout} milliseconds`)
      }
      const response = await pTimeout(nodeFetch(args[0], args[1]), args[1]._timeout, onTimeout, abortController.signal) as Response
      if (response && response.status === 404) {
        throw new AbortError(response.statusText)
      }
      return response
    },
    {
      retries: args[1].retries,
      onFailedAttempt: async (error) => {
        console.info(`${error.message}: Waiting for 1~3 second before retrying`)
        await delay(1000 + Math.random() * 2000)
      },
    }
  )
}
