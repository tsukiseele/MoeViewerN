const nodeFetch = require('node-fetch')
const timeoutSignal = require('timeout-signal')
const HttpsProxyAgent = require('https-proxy-agent')
const ProxySettings = require('get-proxy-settings')

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
  return (_fetch = async (...args) => {
    args[1] = args[1] ? args[1] : {}
    args[1].agent = globalThis.proxyAgent || args[1].agent
    // args[1].signal = timeoutSignal(args[1].timeout || 0)
    // args[1].timeout = 0
    return nodeFetch(...args)
  })
}
const fetch = async () => {
  return _fetch || (await load())
}
module.exports = fetch
