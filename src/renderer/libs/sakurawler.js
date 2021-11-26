import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
/**
 * @author tsukiseele
 * @date 2021.11.25
 *
 */
export default class Sakurawler {
  // 当前站点抓取规则
  site = null
  // 最大请求超时时间
  timeout = 10000
  // 当前分页值
  page = 1
  // 搜索关键字
  keywords = null
  // 当前抓取板块
  currentSection = null
  // 中断控制器
  abortController = null
  /**
   * 通过配置构造一个爬虫对象
   * @param {Site} site 规则
   * @param {Number} page 当前页
   * @param {String} keywords 关键字
   */
  constructor(site, page = 1, keywords = null) {
    this.site = site
    this.page = page
    this.keywords = keywords
  }
  /**
   * 中断请求
   */
  abortRequest() {
    this.abortController.abort()
    this.abortController.isAbort = true
    clearTimeout(this.abortTimer)
  }
  /**
   * 解析Site对象，返回结果集
   * @returns {Promise<Array<Object>>}
   */
  async parseSite() {
    return await this.parseSection(this.getCurrentSection())
  }

  /**
   * 解析Section对象，返回结果集
   * @param {Section} section 站点板块
   * @param {Number} deep 解析深度
   * @returns {Promise<Array<Object>>}
   */
  async parseSection(section, deep = 1) {
    // 复用规则
    if (section.reuse) {
      section.rules = this.site.sections[section.reuse].rules
    }
    const data = []
    let next = null
    for (const rule of section.rules) {
      if (--deep < 0) return data
      const result = await this.parseRules(next || section.index, rule)
      next = result.next
      data.push(result)
    }
    return data
  }

  /**
   * 解析Rule对象，返回结果集
   * @param {Number} page 页码
   * @param {Number} keywords 关键字
   * @returns {Promise<Array<Object>>}
   */
  async parseRules(index, rule, nextUrl = null, page = this.page, keywords = this.keywords) {
    if (!rule) return []
    // 生成URL
    const url = nextUrl || this.replaceUrlTemplate(index, page, keywords)
    console.log('Request: ', url)
    // 发送请求
    const html = await this.requestAsText(url)
    // 检查中断
    if (this.abortController.isAbort) return
    // 检查无效响应
    if (!html) return []
    // 加载文档
    const $ = cheerio.load(html)
    const resultSet = []
    // 遍历选择器集
    for (const k of Object.keys(rule)) {
      const exp = rule[k]
      if (exp.regex) {
        let context = ''
        // 匹配选择器内容
        if (exp.selector) {
          // 此处的选择器只应选择一个元素，否则result会被刷新为最后一个
          this.selectEach($, exp.selector, (result, index) => {
            context = result
          })
        } else {
          context = $('html')
        }
        // 匹配正则内容
        const regexp = new RegExp(exp.regex, 'g')
        let res
        for (var i = 0; (res = regexp.exec(context)) != null; i++) {
          // 以第一个组为匹配值
          if (res[1]) {
            // 执行最终替换，并添加到结果集
            resultSet[i] || resultSet.push({})
            resultSet[i][k] = this.replaceRegex(res[1], exp.capture, exp.replacement)
          }
        }
      } else if (exp.selector) {
        this.selectEach($, exp.selector, (result, index) => {
          // 执行最终替换，并添加到结果集
          resultSet[index] || resultSet.push({})
          resultSet[index][k] = this.replaceRegex(result, exp.capture, exp.replacement)
        })
      }
      for (const res of resultSet) {
        res.spider = this
      }
    }
    return resultSet
  }

  /**
   * 解析下一层级
   * @param {Object} res 该层级对象
   * @returns {Promise<Array<Object>>}
   */
  async parseNext(res) {
    console.log(res);
    const section = this.getCurrentSection()
    return await this.parseRules(section.index, section.rules[1], res.$children)
  }

  /**
   * 请求方法
   * @param {String} url 链接
   * @param {Object} options 操作
   * @param {Number} timeout 最大超时
   * @returns {Promise<Response>}
   */
  async request(url, options, timeout) {
    this.abortController = new AbortController()
    this.abortTimer = setTimeout(() => {
      this.abortRequest()
      console.error(`request timeout: ${url}`)
    }, timeout)
    return fetch(url, { ...options, signal: this.abortController.signal })
  }

  /**
   * 请求并将响应转换为文本
   * @param {String} url
   * @returns {Promise<String>}
   */
  async requestAsText(url) {
    try {
      const response = await this.request(
        url,
        {
          headers: this.site.headers,
          credentials: 'include'
        },
        this.timeout
      )
      return response.text()
    } catch (e) {
      console.log(e)
    } finally {
      clearTimeout(this.abortTimer)
    }
    return null
  }

  /**
   * 获取当前板块
   * @returns {Section}
   */
  getCurrentSection() {
    const section = this.keywords ? this.site.sections.search : this.site.sections.home
    // 复用规则
    if (section.reuse) {
      section.rules = this.site.sections[section.reuse].rules
    }
    return section
  }

  /**
   * 遍历选择器
   * @param {Document} $ 文档上下文
   * @param {String} selector 选择器
   * @param {Function} each
   */
  selectEach($, selector, each) {
    const match = /\$\((.*?)\)\.(\w+?)\((.*?)\)/.exec(selector)
    if (!match) return
    const s = {
      select: match[1],
      fun: match[2],
      attr: match[3]
    }
    // 遍历元素集
    $(s.select).each((index, item) => {
      let result = ''
      switch (s.fun) {
        case 'attr':
          result = item.attribs[s.attr]
          break
        case 'text':
          result = $(item).text()
          break
        case 'html':
          result = $(item).html()
      }
      each(result, index)
    })
  }

  /**
   * 替换正则式
   * @param {String} text 文本
   * @param {String} capture 截取式
   * @param {String} replacement 替换式
   * @returns {String} 结果
   */
  replaceRegex(text, capture, replacement) {
    if (!text) return replacement
    if (!capture) return text
    if (!replacement) {
      const m = new RegExp(capture).exec(text)
      return m && m[0] ? m[0] : text
    }
    // 执行替换
    const match = new RegExp(capture).exec(text)
    match.forEach((item, index) => {
      replacement = replacement.replaceAll('$' + index, item)
    })
    return replacement
  }

  /**
   * 替换URL模板
   * @param {String} template 模板
   * @param {Number} page 当前页码
   * @param {String} keywords 关键字
   * @returns {String} 真实URL
   */
  replaceUrlTemplate(template, page, keywords) {
    const pageMatch = /\{page\s*?:\s*?(-?\d*)[,\s]*?(-?\d*?)\}/i.exec(template)
    const keywordMatch = /\{keywords\s*?:\s*?(.*?)\}/i.exec(template)
    // 获取默认keywords
    const _keywords = keywordMatch && keywordMatch[1] ? keywordMatch[1] : ''
    // 计算真实分页值
    page = pageMatch && pageMatch[1] ? page + parseInt(pageMatch[1]) : page
    page = pageMatch && pageMatch[2] ? page * parseInt(pageMatch[2]) : page
    // 生成真实URL
    return template.replace(/\{page\s*?:.*?\}/i, page.toString()).replace(/\{keywords\s*?:.*?\}/i, keywords || _keywords)
  }
}
