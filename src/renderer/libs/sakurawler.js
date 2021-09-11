import * as cheerio from "cheerio";
import fetch from "node-fetch";
// import fetch from "electron-fetch"

export default class Sakurawler {
  site = null;
  timeout = 10000;
  //
  page = 1;
  keywords = null;

  constructor(site, page = 1, keywords = null) {
    this.site = site;
    this.page = page;
    this.keywords = keywords;
  }

  /**
   *
   * @param page
   * @param keywords
   * @returns
   */
  async parse(page = this.page, keywords = this.keywords) {
    const section = keywords ? this.site.searchSection : this.site.homeSection;
    // 复用规则
    if (section.reuse) {
      section.gallerySelectors = this.site[section.reuse].gallerySelectors;
    }
    if (!section || !section.indexUrl) return [];
    // 合成URL
    const url = this.generateUrlFromTemplate(section.indexUrl, page, keywords);
    console.log("request: ", url);
    // 发送请求
    const html = await this.requestAsText(url);
    // 加载并解析
    const $ = cheerio.load(html);
    const resultSet = [];
    // 遍历选择器集
    for (const k of Object.keys(section.gallerySelectors)) {
      const selector = section.gallerySelectors[k];
      const s = this.parseSelector(selector.selector);
      const el = $(s.select);
      // 遍历元素集
      el.each((index, item) => {
        const attrs = item.attribs;
        let content = "";
        switch (s.fun) {
          case "attr":
            content = attrs[s.attr];
            break;
          case "text":
            content = $(item).text();
            break;
          case "html":
            content = $(item).html();
        }
        // 执行最终替换，并添加到结果集
        resultSet[index] || resultSet.push({});
        resultSet[index][k] = this.replaceRegex(
          content,
          selector.capture,
          selector.replacement
        );
      });
    }
    return resultSet;
  }

  async parseRule() {
    const section = this.keywords
      ? this.site.searchSection
      : this.site.homeSection;
    // 复用规则
    if (section.reuse) {
      section.gallerySelectors = this.site[section.reuse].gallerySelectors;
    }
    if (!section || !section.indexUrl) return [];
    // 合成URL
    const url = this.generateUrlFromTemplate(
      section.indexUrl,
      this.page,
      this.keywords
    );
    console.log("request: ", url);
    // 发送请求
    const html = await this.requestAsText(url);
    // 加载并解析
    const $ = cheerio.load(html);
    const resultSet = [];
    // 遍历选择器集
    for (const k of Object.keys(section.gallerySelectors)) {
      const selector = section.gallerySelectors[k];
      const s = this.parseSelector(selector.selector);
      const el = $(s.select);
      // 遍历元素集
      el.each((index, item) => {
        const attrs = item.attribs;
        let content = "";
        switch (s.fun) {
          case "attr":
            content = attrs[s.attr];
            break;
          case "text":
            content = $(item).text();
            break;
          case "html":
            content = $(item).html();
        }
        // 执行最终替换，并添加到结果集
        resultSet[index] || resultSet.push({});
        resultSet[index][k] = this.replaceRegex(
          content,
          selector.capture,
          selector.replacement
        );
      });
    }
    return resultSet;
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
      headers: this.site.requestHeaders,
      credentials: "include",
      signal
    });
    clearTimeout(timer);
    return response.text();
  }

  /**
   *
   * @param selector
   * @returns
   */
  parseSelector(selector) {
    const result = { select: null, fun: null, attr: null };
    const match = /\$\((.*?)\)\.(\w+?)\((.*?)\)/.exec(selector);
    if (match) {
      result.select = match[1];
      result.fun = match[2];
      result.attr = match[3];
    }
    return result;
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
    if (!replacement) return new RegExp(capture).exec(text)[0];
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
  generateUrlFromTemplate(template, page, keywords) {
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
