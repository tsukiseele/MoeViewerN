// @ts-nocheck
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

const REG_PAGE_TEMPLATE = /\{page\s*?:\s*?(-?\d*)[,\s]*?(-?\d*?)\}/i
const REG_PAGE_MATCH = /\{page\s*?:.*?\}/i
const REG_KEYWORD_TEMPLATE = /\{keywords\s*?:\s*?(.*?)\}/i
const REG_KEYWORD_MATCH = /\{keywords\s*?:.*?\}/i
const REG_SELECTOR_TEMPLATE = /\$\((.*?)\)\.(\w+?)\((.*?)\)/
/**
 * @author tsukiseele
 * @date 2021.11.25
 *
 */
export default class Kumoko {
  // 当前站点抓取规则
  site = null
  // 当前分页值
  page = 0
  // 搜索关键字
  keywords = null
  //
  request = null
  /**
   * 通过配置构造一个爬虫对象
   * @param {Site} site 规则
   * @param {Number} page 当前页
   * @param {String} keywords 关键字
   */
  constructor(site, page = 0, keywords = null, request) {
    this.site = site
    this.page = page
    this.keywords = keywords
    this.request = request
  }
  /**
   * 解析Site对象，返回结果集
   * @returns {Promise<Array<Object>>}
   */
  async parseSite(isParseChildren = false) {
    return await this.parseSection(this.getCurrentSection(), isParseChildren)
  }

  /**
   * 解析Section对象，返回结果集
   * @param {Section} section 站点板块
   * @param {Number} deep 解析深度
   * @return {Promise<Array<Object>>}
   */
  async parseSection(section, isParseChildren = false) {
    // 复用规则
    if (section.reuse) {
      section.rules = this.site.sections[section.reuse].rules
    }
    const result = await this.parseRules(section.index, section.rules)
    result.forEach((item) => {
      item.$section = section
      item.$site = this.site
    })
    // console.log(this.site);
    // console.log(result)
    if (isParseChildren && section.rules.$children) {
      await this.parseChildrenOfList(result, section.rules)
    }
    return result
  }
  async parseChildrenOfList(list, rules) {
    await Promise.allSettled(list.map((item) => this.parseChildrenConcurrency(item, rules)))
  }
  /**
   * 解析Children，自动检测末尾，自动继承父级，自动拉平单项子级
   * @param {*} item
   * @param {*} rules
   */
  async parseChildrenConcurrency(item, rules, extend = true) {
    if (item.$children && rules.$children) {
      let histroy = null
      let page = 0
      do {
        const children = await this.parseRules(item.$children, rules.$children.rules, page++, null)
        if (children && histroy && children.length && histroy.length && children.length === histroy.length && this.objectEquals(children[0], histroy[0])) break
        histroy = JSON.parse(JSON.stringify(children))
        if (children && children.length) {
          // 解析下级子节点
          if (children[0].$children) {
            await Promise.allSettled(children.map((child) => this.parseChildrenConcurrency(child, rules.$children.rules)))
          }
          // 判断是否拉平子节点，否则追加到子节点下
          if (rules.$children.flat) {
            Object.assign(item, children[0])
            break
          } else {
            // 判断并继承父节点字段
            extend && children.forEach((child, index) => (children[index] = Object.assign({}, item, child)))
            item.children ? item.children.push(...children) : (item.children = children)
            break
          }
        }
      } while (histroy && histroy.length)
    }
    return item
  }

  /**
   * 解析Rule对象，返回结果集
   * @param {Number} page 页码
   * @param {Number} keywords 关键字
   * @returns {Promise<Array<Object>>}
   */
  async parseRules(_url, rule, page = this.page, keywords = this.keywords) {
    if (!rule) return []
    // 生成URL
    const url = this.replaceUrlTemplate(_url, page, keywords)
    // 发送请求
    const html = await this.requestText(url, this.site.headers)
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
          this.selectEach($, exp.selector, (result) => (context = result))
        } else {
          context = $('html')
        }
        // 匹配正则内容
        const regexp = new RegExp(exp.regex, 'g')
        let res
        for (let i = 0; (res = regexp.exec(context)) != null; i++) {
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
    }
    return resultSet
  }

  /**
   * 解析下一层级
   * @param {Object} res 该层级对象
   * @returns {Promise<Array<Object>>}
   */
  async parseNext(res) {
    const section = this.getCurrentSection()
    return await this.parseRules(section.index, section.rules[1], res.$children)
  }

  /**
   * 请求文档内容，默认使用fetch发送请求，自动注入请求头
   * @param {String} url 链接
   * @param {Object} options 操作
   * @param {Number} timeout 最大超时
   * @returns {Promise<String>} 响应文本
   */
  async requestText(url, options) {
    // 如果已有传入请求，则使用传入的
    if (this.request) {
      return await this.request(url, options || {})
    }
    const resp = await fetch(url, options)
    if (resp.ok) {
      return await resp.text()
    }
    return ''
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
    const match = REG_SELECTOR_TEMPLATE.exec(selector) ///\$\((.*?)\)\.(\w+?)\((.*?)\)/.exec(selector)
    if (!match) return
    const s = {
      select: match[1],
      fun: match[2],
      attr: match[3],
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
    const result = new RegExp(capture).exec(text)
    result && result.forEach((item, index) => (replacement = replacement.replace(new RegExp('\\$' + index, 'g'), item)))
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
    const pageMatch = REG_PAGE_TEMPLATE.exec(template)
    const keywordMatch = REG_KEYWORD_TEMPLATE.exec(template)
    // 获取默认keywords
    const _keywords = keywordMatch && keywordMatch[1] ? keywordMatch[1] : ''
    // 计算真实分页值
    page = pageMatch && pageMatch[1] ? page + parseInt(pageMatch[1]) : page
    page = pageMatch && pageMatch[2] ? page * parseInt(pageMatch[2]) : page
    // 生成真实URL
    return template.replace(REG_PAGE_MATCH, page.toString()).replace(REG_KEYWORD_MATCH, keywords || _keywords)
  }
  /**
   * 对象比较
   * see https://stackoverflow.com/a/6713782
   * @author Jean Vincent
   * @param {*} x
   * @param {*} y
   * @param {*} deep deep equals
   * @returns
   */
  objectEquals(x, y, deep = false) {
    if (x === y) return true
    // if both x and y are null or undefined and exactly the same
    if (!(x instanceof Object) || !(y instanceof Object)) return false
    // if they are not strictly equal, they both need to be Objects
    if (x.constructor !== y.constructor) return false
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.
    for (var p in x) {
      if (!x.hasOwnProperty(p)) continue
      // other properties were tested using x.constructor === y.constructor
      if (!y.hasOwnProperty(p)) return false
      // allows to compare x[ p ] and y[ p ] when set to undefined
      if (x[p] === y[p]) continue
      // if they have the same strict value or identity then they are equal
      if (typeof x[p] !== 'object') return false
      // Numbers, Strings, Functions, Booleans must be strictly equal
      if (deep && !objectEquals(x[p], y[p], deep)) return false
      // Objects and Arrays must be tested recursively
    }
    for (p in y) if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false
    // allows x[ p ] to be set to undefined
    return true
  }
}
