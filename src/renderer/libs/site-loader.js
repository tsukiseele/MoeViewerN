import * as fs from 'fs/promises'
import { ipcRenderer } from 'electron'
/**
 *
 * @param dir
 * @returns
 */
export async function listFiles(dir, exts) {
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
export async function loadSite(file) {
  return await fs.readFile(file)
}

/**
 *
 * @param dir
 * @returns 解析目录下所有json为对象
 */
export async function loadSites(dir) {
  const resultSet = []

  for (const json of await listFiles(dir, ['.json'])) {
    try {
      const site = JSON.parse((await loadSite(json)).toString())
      // 注入默认请求头
      await setDefaultHeaders(site)
      // 设置Cookies到会话
      setCookiesToSession(site)
      // 重用规则
      reuseRules(site)
      if (checkSite(site)) {
        resultSet.push(site)
      }
    } catch (e) {}
  }
  console.log(resultSet);
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

export async function setDefaultHeaders(site) {
  if (!site) return
  const headers = site.headers || {}
  if (!headers.hasOwnProperty('User-Agent')) {
    headers['User-Agnet'] = 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.94 Safari/537.36'
  }
  if (!headers.hasOwnProperty('Referer') && site.sections.home && site.sections.home.index) {
    const match = new RegExp('https?://.+?/').exec(site.sections.home.index)
    if (match && match[0]) headers['Referer'] = match[0]
    headers['Referrer'] = match[0]
  }
  if (headers.hasOwnProperty('Cookie')) {
    headers['Cookie'] = headers['Cookie'] + 'SameSite=None; Secure;'
  }
  site.headers = headers
}
/*
export async function setDefaultHeaders(site) {
  if (!site) return;
  const headers = site.requestHeaders || {};
  if (!headers.hasOwnProperty("User-Agent")) {
    headers["User-Agnet"] =
      "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.94 Safari/537.36";
  }
  if (
    !headers.hasOwnProperty("Referer") &&
    site.homeSection &&
    site.homeSection.indexUrl
  ) {
    const match = new RegExp("https?://.+?/").exec(site.homeSection.indexUrl);
    if (match && match[0]) headers["Referer"] = match[0];
    headers["Referrer"] = match[0];
  }
  if (headers.hasOwnProperty("Cookie")) {
    headers["Cookie"] = headers["Cookie"] + "SameSite=None; Secure;";
  }
  site.requestHeaders = headers;
}
*/
/**
 * 设置Cookies到会话
 * @param site
 */
export function setCookiesToSession(site) {
  if (!site || !site.headers || !site.sections.home || !site.sections.home.index) return
  const match = new RegExp('https?://.+?/').exec(site.sections.home.index)
  const cookie = site.headers['cookie'] || site.headers['Cookie']
  if (match && match[0] && cookie) {
    const domain = match[0]
    /*
            const p = /https?:\/\/(.*?\.).+?\..+?\//g.exec(domain)
            if (p && p[1]) {
              domain = domain.replace(p[1], "*.");
            }
            domain = domain.replace(/https?:\/\//, "*://") || domain*/
    ipcRenderer.send('setCookies', domain, cookie)
  }
}
/*
export function setCookiesToSession(site) {
  if (
    !site ||
    !site.requestHeaders ||
    !site.homeSection ||
    !site.homeSection.indexUrl
  )
    return;
  const match = new RegExp("https?://.+?/").exec(site.homeSection.indexUrl);
  const cookie = site.requestHeaders["cookie"] || site.requestHeaders["Cookie"];
  if (match && match[0] && cookie) {
    const domain = match[0];
    ipcRenderer.send("setCookies", domain, cookie);
  }
}
*/
