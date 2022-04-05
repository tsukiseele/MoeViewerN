import nodeFetch from 'node-fetch'
import HttpsProxyAgent from 'https-proxy-agent'
import ProxySettings from 'get-proxy-settings'

try {
  const proxy = await ProxySettings.getProxySettings()

  if (proxy) {
    const setting = proxy.https || proxy.http
    const proxyAgent = new HttpsProxyAgent(setting.toString())
    globalThis.proxy = proxy
    globalThis.proxyAgent = proxyAgent
    console.log('Use proxy: ', setting.toString());
  }
} catch (error) {
  console.warn('Failed to get proxy configuration: ', error)
}

const fetch = async (...args) => {
  if (globalThis.proxyAgent) {
    args[1] ? (args[1].agent = proxyAgent) : (args[1] = { agent: proxyAgent })
  }
  return nodeFetch(...args)
}

export default fetch
