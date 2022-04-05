# MoeViewerN

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Install all the required tools and configurations using Microsoft's windows-build-tools (only windows) 

1. `npm install -g windows-build-tools`

2. Download and install [python3](https://www.python.org/downloads/)

## Project Setup
```sh
yarn
```

### Run yarn dev to open vite in browser in development mode.
```sh
yarn dev
```
### Run yarn build to build files and can be served.
```sh
yarn build
```

### Run yarn build to build files and can be served.
```sh
yarn preview
```

### Run yarn electron:dev to work with electron in development mode.
```sh
yarn electron:dev
```

### Run yarn electron:build to build your electron app.
```sh 
yarn electron:build
```
