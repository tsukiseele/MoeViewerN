# MoeViewerN
<img src="./public/icon.ico" alt="MoeViewerN" width="128px" />

一个可爱的二次元网络画廊浏览器，目前处在dev阶段。

## 预览
![](./sample/preview_2.webp)

## 主要功能
1. 图库，漫画的预览与阅读
2. 图库，漫画的批量下载
3. Booru的搜索关键字补全
4. 可扩展的自定义抓取配置
5. 相对友好的抓取规则编辑器
6. 更多的功能等待开发

## 协议
[GPLv3.0 LICENSE](./LICENSE)

## 开发指南
### 准备工作
- 安装VisualStudio Code插件：
[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (和禁用) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

### 使用 Microsoft 的 windows-build-tools 安装所有必需的工具和配置（仅限 windows）
- ```sh
  yarn global add windows-build-tools
  ```

### 运行与构建
- 初始化
  ```sh
  yarn
  ```

- 运行`yarn dev`以开发模式在浏览器中打开Vite。
  ```sh
  yarn dev
  ```
- 运行`yarn build`来构建文件。
  ```sh
  yarn build
  ```

- 运行`yarn build:win`来构建文件（仅Window）。
  ```sh
  yarn build:win
  ```

- 运行`yarn build:mac`来构建文件（仅MAC）。
  ```sh
  yarn build:mac
  ```

- 运行`yarn build:linux`来构建文件（仅LINUX）。
  ```sh 
  yarn build:linux
  ```
