<template>
  <div class="about">
    <section class="about-item">
      <h2 class="about-title">Developer</h2>
      <!-- <img class="about-avatar" src="../../assets/images/github-avatar.webp" alt="" /> -->
      <img class="about-avatar" src="https://avatars.githubusercontent.com/u/28500231?v=4" alt="" />
      <div class="about-content"><a href="https://github.com/tsukiseele" target="_blank">TsukiSeele</a></div>
    </section>
    <section class="about-item">
      <h2 class="about-title">License</h2>
      <div class="about-content"><a href="https://github.com/tsukiseele/MoeViewerN/blob/alpha/LICENSE" target="_blank">GPL-v3.0</a></div>
    </section>
    <section class="about-item">
      <h2 class="about-title">Support</h2>
      <div class="about-content"><a href="https://github.com/tsukiseele/MoeViewerN" target="_blank">MoeViewerN</a></div>
    </section>
    <section class="about-item">
      <h2 class="about-title">Thanks</h2>
      <div class="about-content code">
        <ul>
          <li v-for="item in thanks" :key="item.name">
            <a :href="item.link" target="_blank">{{ item.name }}</a>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data: () => ({
    thanks: [
      {
        name: 'Electron',
        link: 'https://github.com/electron/electron',
      },
      {
        name: 'Vue',
        link: 'https://github.com/vuejs/',
      },
      {
        name: 'cheerio',
        link: 'https://github.com/cheeriojs/cheerio',
      },
      {
        name: 'lru-cache',
        link: 'https://github.com/isaacs/node-lru-cache',
      },
      {
        name: 'naive-ui',
        link: 'https://github.com/TuSimple/naive-ui',
      },
      {
        name: 'node-fetch',
        link: 'https://github.com/node-fetch/node-fetch',
      },
      {
        name: 'promise-fun',
        link: 'https://github.com/sindresorhus/promise-fun',
      },
      {
        name: 'sqlite3',
        link: 'https://github.com/TryGhost/node-sqlite3',
      },
      {
        name: 'crypto-js',
        link: 'https://github.com/brix/crypto-js',
      },
      {
        name: 'electron-acrylic-window',
        link: 'https://github.com/Seo-Rii/electron-acrylic-window',
      },
      {
        name: 'get-proxy-settings',
        link: 'https://github.com/Azure/get-proxy-settings',
      },
      {
        name: 'https-proxy-agent',
        link: 'https://github.com/TooTallNate/node-https-proxy-agent',
      },
      {
        name: 'js-base64',
        link: 'https://github.com/dankogai/js-base64',
      },
      {
        name: 'lodash',
        link: 'https://github.com/lodash/lodash',
      },
      {
        name: 'material-design-icons',
        link: 'https://github.com/google/material-design-icons',
      },
    ],
  }),
  methods: {
    onOpenExternalLink(link: string) {
      window.eapi.app.openExternal(link)
    },
  },
})
</script>
<style lang="scss" scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    text-align: center;
    // padding: .5rem;
    .about-item {
      padding: 0.5rem;
      .about-title {
        font-family: serif;
        font-weight: bold;
        text-transform: uppercase;
        padding: 0.5rem;
        font-size: 1.8rem;
        color: #cd5da0;
      }
      .about-content {
        padding: 0.5rem;
        font-size: 1.25rem;
      }
      .about-avatar {
        width: 6rem;
        height: 6rem;
        overflow: hidden;
        border-radius: 50%;
      }
    }

    /* align-items: center; */
  }
}
.code {
  font-family: 'JetBrain Mono', 'Consolas', 'Courier New', Courier, monospace;
  font-size: 1.25rem;
  line-height: 2rem;
}
</style>
