<template lang="pug">
SLayer(:show="show" :title="resultSet && resultSet[0].title && resultSet[0].tags" @update:show="(show) => $emit('update:show', show)")
  template(v-if="isLoaded")
    section(v-if="resultSet && resultSet.length === 1")
      NImageGroup(:theme-overrides="imageGroupThemeOverrides" show-toolbar-tooltip)
        NImage(:src="resultSet[0]._src" object-fit="contain")
    section(v-else-if="resultSet && resultSet.length")
      NImageGroup(:theme-overrides="imageGroupThemeOverrides" show-toolbar-tooltip)
        NImage(v-for="item in resultSet"  :src="item.originUrl || item.largerUrl || item.sampleUrl || item.cover" object-fit="contain")

        img(:src="item.coverUrl")
    NResult(v-else status="404" title="资源未找到" description="可能因素：目标未命中，网络不可用，防火墙拦截（尤其是在中国大陆）")
  AppLoading(:show="!isLoaded")
  template(#footer)
    NButton(@click="onSearch") 重新加载
</template>

<script>
import { defineComponent, computed } from '@vue/runtime-core'
import SLayer from '@/components/SLayer/index.vue'
import { NButton, NResult, NImage, NImageGroup, useThemeVars } from 'naive-ui'

import { Base64 } from 'js-base64'
import AppLoading from '@/components/AppLoading/index.vue'
export default defineComponent({
  components: {
    SLayer,
    NButton,
    NResult,
    NImage,
    NImageGroup,
    AppLoading,
  },
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:show'],
  data: () => ({
    isLoaded: false,
    resultSet: null,
    scale: 1.0,
  }),
  watch: {
    async show(nv) {
      if (nv) {
        try {
          if (this.item) {
            this.isLoaded = false
            if (this.item.$children) {
              this.resultSet = await $native.loadChild(JSON.stringify({ item: this.item }))
            } else {
              this.resultSet = [this.item]
            }
            if (this.resultSet.length === 1) {
              const once =this.resultSet[0]
              const { data, type } = await $native.request(JSON.stringify({ url: once.originUrl || once.largerUrl || once.sampleUrl, options: { headers: once.spider.site.headers } }))
              const src = URL.createObjectURL(this.base64ToBlob(data, type))
              console.log("SRC", src);
              once._src = src
            }
          }
          console.log(this.resultSet.length, 'LENGTH')
        } catch (error) {
          console.log(error)
        } finally {
          this.isLoaded = true
        }
      } else {
      }
    },
  },
  async mounted() {
    // document.addEventListener('wheel', this.onWheel, false)
  },
  methods: {
    base64ToBlob(base64, type) {
      return new Blob([Base64.toUint8Array(base64)], { type: type })
    },
    onWheel(e) {
      const v = e.deltaY
      const el = document.querySelector('.n-image-preview-wrapper')
      if (el) {
        if (v > 0) {
          this.scale += 0.25
        } else if (this.scale > 0.5) {
          this.scale -= 0.25
        }
        el.style.transition = '.25s ease'
        el.style.transform = el.style.transform.replace(/scale\(.*\)/g, '')
        el.style.transform += ` scale(${this.scale})`
        console.log(v)
      }
    },
  },
  beforeUnmount() {
    // document.removeEventListener('wheel', this.onWheel, false)
  },
  setup() {
    return {
      imageGroupThemeOverrides: computed(() => {
        const { popoverColor, boxShadow2, textColor2, borderRadius } = useThemeVars().value
        const themeOverrides = {
          toolbarColor: popoverColor,
          toolbarBoxShadow: boxShadow2,
          toolbarIconColor: textColor2,
          toolbarBorderRadius: borderRadius,
        }
        return themeOverrides
      }),
    }
  },
})
</script>

<style lang="scss" scoped>
section {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  // img {
  //   // width: 100%;
  //   // height: 100%;
  //   object-fit: contain;
  // }
  .n-image {
    width: 100%;
    height: 100%;
    justify-content: center;
  }
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
  li {
    display: flex;
    flex-direction: column;
    img {
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
