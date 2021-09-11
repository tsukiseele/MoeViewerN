import * as cheerio from "cheerio";
import fetch from "node-fetch";
// import matchAll from "string.prototype.matchall";
/**
 *
 */
export default class MoeSpider {
  site = null;
  timeout = 10000;
  //
  page = 1;
  keywords = null;
  currentSection = null;
  /**
   *
   * @param {*} site
   * @param {*} page
   * @param {*} keywords
   */
  constructor(site, page = 1, keywords = null) {
    this.site = site;
    this.page = page;
    this.keywords = keywords;
  }

  async parseSite() {
    return await this.parseSection(this.getCurrentSection());
  }

  /**
   *
   * @param {*} section
   * @returns
   */
  async parseSection(section, deep = 1) {
    // 复用规则
    if (section.reuse) {
      section.rules = this.site.sections[section.reuse].rules;
    }
    const data = [];
    let next = null;
    for (const rule of section.rules) {
      if (--deep < 0) return data;
      const result = await this.parseRules(next || section.index, rule);
      next = result.next;
      data.push(result);
    }
    return data;
  }

  /**
   *
   * @param page
   * @param keywords
   * @returns
   */
  async parseRules(
    index,
    rule,
    nuxtUrl = null,
    page = this.page,
    keywords = this.keywords
  ) {
    if (!rule) return [];
    // 生成URL
    const url = nuxtUrl || this.replaceUrlTemplate(index, page, keywords);
    console.log("request: ", url);
    // 发送请求
    const html = await this.requestAsText(url);
    // 加载并解析
    const $ = cheerio.load(html);
    const resultSet = [];
    // 遍历选择器集
    for (const k of Object.keys(rule)) {
      const exp = rule[k];
      if (exp.regex) {
        let context = "";
        // 匹配选择器内容
        if (exp.selector) {
          // 此处的选择器只应选择一个元素，否则result会被刷新为最后一个
          this.selectEach($, exp.selector, (result, index) => {
            context = result;
          });
        } else {
          context = $("html");
        }
        // 匹配正则内容
        const regexp = new RegExp(exp.regex, "g");
        let res;
        for (var i = 0; (res = regexp.exec(context)) != null; i++) {
          // 以第一个组为匹配值
          if (res[1]) {
            // 执行最终替换，并添加到结果集
            resultSet[i] || resultSet.push({});
            resultSet[i][k] = this.replaceRegex(
              res[1],
              exp.capture,
              exp.replacement
            );
          }
        }
      } else if (exp.selector) {
        this.selectEach($, exp.selector, (result, index) => {
          // 执行最终替换，并添加到结果集
          resultSet[index] || resultSet.push({});
          resultSet[index][k] = this.replaceRegex(
            result,
            exp.capture,
            exp.replacement
          );
        });
      }
      for (const res of resultSet) {
        res.spider = this;
      }
    }
    return resultSet;
  }

  async parseNext(res) {
    const section = this.getCurrentSection();
    return await this.parseRules(section.index, section.rules[1], res.$next);
  }
  /**
   *
   * @param url
   * @returns
   */
  async requestAsText(url) {
    const controller = new AbortController();
    const signal = controller.signal;
    const timer = setTimeout(() => {
      controller.abort();
      console.error(`request timeout: ${url}`);
    }, this.timeout);
    const response = await fetch(url, {
      headers: this.site.headers,
      credentials: "include",
      signal
    });
    clearTimeout(timer);
    return response.text();
  }
  /**
   *
   * @returns
   */
  getCurrentSection() {
    const section = this.keywords
      ? this.site.sections.search
      : this.site.sections.home;
    // 复用规则
    if (section.reuse) {
      section.rules = this.site.sections[section.reuse].rules;
    }
    return section;
  }
  /**
   *
   * @param selector
   * @returns
   */
  selectEach($, selector, each) {
    const match = /\$\((.*?)\)\.(\w+?)\((.*?)\)/.exec(selector);
    if (!match) return;
    const s = {
      select: match[1],
      fun: match[2],
      attr: match[3]
    };
    // 遍历元素集
    $(s.select).each((index, item) => {
      let result = "";
      switch (s.fun) {
        case "attr":
          result = item.attribs[s.attr];
          break;
        case "text":
          result = $(item).text();
          break;
        case "html":
          result = $(item).html();
      }
      each(result, index);
    });
  }

  /**
   *
   * @param text
   * @param capture
   * @param replacement
   */
  replaceRegex(text, capture, replacement) {
    if (!text) return replacement;
    if (!capture) return text;
    if (!replacement) {
      const m = new RegExp(capture).exec(text);
      return m && m[0] ? m[0] : text;
    }
    // 执行替换
    const match = new RegExp(capture).exec(text);
    match.forEach((item, index) => {
      replacement = replacement.replaceAll("$" + index, item);
    });
    return replacement;
  }

  /**
   *
   * @param template
   * @param page
   * @param keywords
   * @returns
   */
  replaceUrlTemplate(template, page, keywords) {
    const pageMatch = /\{page\s*?:\s*?(-?\d*)[,\s]*?(-?\d*?)\}/i.exec(template);
    const keywordMatch = /\{keywords\s*?:\s*?(.*?)\}/i.exec(template);
    // 获取默认keywords
    const _keywords = keywordMatch && keywordMatch[1] ? keywordMatch[1] : "";
    // 计算真实分页值
    page = pageMatch && pageMatch[1] ? page + parseInt(pageMatch[1]) : page;
    page = pageMatch && pageMatch[2] ? page * parseInt(pageMatch[2]) : page;
    // 生成真实URL
    const url = template
      .replace(/\{page\s*?:.*?\}/i, page.toString())
      .replace(/\{keywords\s*?:.*?\}/i, keywords || _keywords);
    return url;
  }
}
