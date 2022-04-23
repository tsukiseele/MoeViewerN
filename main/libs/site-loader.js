const fs = require('fs/promises')
const { session } = require('electron')
/**
 *
 * @param dir
 * @returns
 */
async function listFiles(dir, exts) {
  const files = []
  const items = await fs.readdir(dir)
  if (!dir.endsWith('/')) {
    dir += '/'
  }
  for (const item of items) {
    const path = `${dir}${item}`
    const stat = await fs.stat(path)
    if (stat.isDirectory()) {
      files.push(...(await listFiles(path, exts)))
    } else if (stat.isFile()) {
      if (exts) {
        for (const ext of exts) {
          if (path.endsWith(ext)) {
            files.push(path)
          }
        }
      } else {
        files.push(path)
      }
    }
  }
  return files
}

/**
 *
 * @param file
 * @returns
 */
async function loadSite(file) {
  return await fs.readFile(file)
}

/**
 *
 * @param dir
 * @returns 解析目录下所有json为对象
 */
async function loadSites(dir) {
  const resultSet = []

  for (const json of await listFiles(dir, ['.json'])) {
    try {
      const site = JSON.parse((await loadSite(json)).toString())
      // 注入默认请求头
      setDefaultHeaders(site)
      // 设置Cookies到会话，现已使用node-fetch进行请求，彻底摆脱浏览器环境，故弃用
      // setCookiesToSession(site)
      // 重用规则
      reuseRules(site)
      if (checkSite(site)) {
        resultSet.push(site)
      }
    } catch (e) {
      console.log(e);
    }
  }
  return resultSet
}

function checkSite(site) {
  if (site.name) {
    return site
  }
  return null
}

function reuseRules(site) {
  if (site && site.sections) {
    Object.entries(site.sections).forEach(([, section]) => {
      if (section.reuse && site.sections[section.reuse]) {
        section.rule = site.sections[section.reuse].rules
      }
    })
  }
  return site
}

/**
 * 设置默认的请求头
 * @param site
 */

function setDefaultHeaders(site) {
  if (!site) return
  const headers = site.headers || {}
  if (!headers.hasOwnProperty('User-Agent')) {
    headers['User-Agnet'] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
  }
  if (!headers.hasOwnProperty('Referer') && site.sections.home && site.sections.home.index) {
    const match = new RegExp('https?://.+?/').exec(site.sections.home.index)
    if (match && match[0]) headers['Referer'] = match[0]
    headers['Referrer'] = match[0]
  }
  // if (headers.hasOwnProperty('Cookie')) {
  //   headers['Cookie'] = headers['Cookie'] + 'SameSite=None; Secure;'
  // }
  site.headers = headers
}

/**
 * 设置Cookies到会话
 * @param site
 */
function setCookiesToSession(site) {
  if (!site || !site.headers || !site.sections.home || !site.sections.home.index) return
  const match = new RegExp('https?://.+?/').exec(site.sections.home.index)
  const cookie = site.headers['cookie'] || site.headers['Cookie']

  if (match && match[0] && cookie) {
    const domain = match[0]
    // const p = /https?:\/\/(.*?\.).+?\..+?\//g.exec(domain)
    // if (p && p[1]) {
    //   domain = domain.replace(p[1], '*.')
    // }
    // domain = domain.replace(/https?:\/\//, '*://') || domain
    for (const item of cookie.split(';')) {
      let [k, v] = item.split('=')
      if (k) {
        v = v || ''
        const name = k.trim()
        const value = v.trim()
        session.defaultSession.cookies.set({ domain, name, value, sameSite: 'none', secure: true })
      }
    }
  }
}
module.exports = {
  setCookiesToSession,
  setDefaultHeaders,
  reuseRules,
  checkSite,
  loadSite,
  loadSites,
}
