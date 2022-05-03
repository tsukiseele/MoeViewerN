<template lang="pug">
SLayer(:show="show" :title="resultSet && resultSet[0].title && resultSet[0].tags" @update:show="(show) => $emit('update:show', show)")
  .container
    main
      .image-wrapper(v-if="isLoaded")
        section(v-if="resultSet && resultSet.length === 1")
          NImageGroup(:theme-overrides="imageGroupThemeOverrides" show-toolbar-tooltip)
            NImage(:src="resultSet[0]._src" object-fit="contain")
        section(v-else-if="resultSet && resultSet.length")
          NImageGroup(:theme-overrides="imageGroupThemeOverrides" show-toolbar-tooltip)
            NImage(v-for="item in resultSet"  :src="item.originUrl || item.largerUrl || item.sampleUrl || item.coverUrl" object-fit="cover")
            img(:src="item.coverUrl")

    SLoading(:show="!isLoaded")
    NResult(v-if="isLoaded && !(resultSet && resultSet.length)" status="404" title="Resource Not Found" description="可能因素：目标未命中，网络不可用，防火墙拦截（尤其是在中国大陆）")
      template(#footer)
        NButton(@click="onSearch") Reload
    aside.aside(v-if="tags && tags.length")
      .gallery-tags
        NTag(type="info" v-for="tag in tags" :key="tag") {{ tag }}
        
</template>

<script>
import { Base64 } from 'js-base64'
import { defineComponent, computed } from '@vue/runtime-core'
import { NButton, NResult, NImage, NImageGroup, NTag, useThemeVars } from 'naive-ui'
import SLayer from '@/components/SLayer/index.vue'
import SLoading from '@/components/SLoading/index.vue'
import native from '@/composables/native.js'

export default defineComponent({
  components: {
    SLayer,
    SLoading,
    NButton,
    NResult,
    NImage,
    NImageGroup,
    NTag,
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
    tags: [],
    scale: 1.0,
  }),
  watch: {
    async show(nv) {
      if (nv) {
        try {
          this.tags = (this.item && this.item.tags && this.item.tags.split(' ')) || null
          if (this.item) {
            this.isLoaded = false
            if (this.item.$children) {
              this.resultSet = await native.loadChild({ item: this.item })
            } else {
              this.resultSet = [this.item]
            }
            this.tags = this.tags || (this.resultSet && this.resultSet.length && this.resultSet[0].tags && this.resultSet[0].tags.split(' '))
            console.log('this.tags', this.tags)
            if (this.resultSet.length === 1) {
              const once = this.resultSet[0]
              const { data, type } = await native.request({ url: once.originUrl || once.largerUrl || once.sampleUrl, options: { headers: once.spider.site.headers } })
              const src = URL.createObjectURL(this.base64ToBlob(data, type))
              once._src = src
            }
          }
        } catch (error) {
          console.log(error)
        } finally {
          console.log('resultSet', this.resultSet)
          this.$forceUpdate()
          this.isLoaded = true
        }
      } else {
      }
    },
  },
  computed: {},
  async mounted() {
    this.tags = (this.item && this.item.tags && this.item.tags.split(' ')) || null
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
.container {
  display: flex;

  main {
    flex: 1;
    width: 0;
    overflow: hidden;
  }
  .aside {
    flex: 0 0 256px;
    width: 0;
    display: flex;
    flex-direction: column;
    .gallery-tags {
      display: flex;
      align-items: flex-start;
      justify-content: space-evenly;
      flex-direction: row;
      flex-wrap: wrap;
      width: 100%;

      .n-tag {
        margin: 0.25rem 0;
      }
    }
  }
}
section {
  display: flex;
  flex-wrap: wrap;
  // justify-content: center;
  align-items: center;
  height: 100%;
  .n-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0;
    height: 250px;
    flex: 0 0 23%;
    margin: 0.5rem;

    // img {
    //   // width: 100%;
    //   // height: 100%;
    //   object-fit: contain;
    // }
    :deep(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
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
