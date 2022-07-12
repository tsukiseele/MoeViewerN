<template lang="pug">
SLayer(:show="show" title="Gallery" @update:show="(show: boolean) => $emit('update:show', show)")
  .container
    main
      .images-wrapper(v-if="isLoaded")
        section.single(v-if="resultSet && resultSet.length == 1")
          NImageGroup(:theme-overrides="imageGroupThemeOverrides" show-toolbar-tooltip)
            NImage(:src="resultSet[0]._src" object-fit="contain")
        section.multiple(v-else-if="resultSet && resultSet.length")
          NImageGroup(:theme-overrides="imageGroupThemeOverrides" show-toolbar-tooltip)
            NImage(v-for="item in resultSet"  :src="item._src" object-fit="cover")
        NProgress(v-if="resultSet && resultSet.length == 1" type="line" :percentage="percentage" processing :indicator-placement="'inside'" :border-radius="4" :class="{done: percentage === 100}")
    
    SLoading(:show="!isLoaded")
    
    NResult(v-if="isLoaded && !(resultSet && resultSet.length)" status="404" title="Resource Not Found" description="可能因素：目标未命中，网络不可用，防火墙拦截（尤其是在中国大陆）")
      template(#footer)
        NButton(@click="onSearch") Reload
    aside.aside
      .gallery-cover
        NImage(:src="item._src" object-fit="cover")
      .gallery-title {{resultSet && resultSet.length && resultSet[0].title && resultSet[0].tags}}
      .gallery-options
        NButton(color="#007f7f" @click="onDownloadGallery") Download
        NButton(color="#ff69b4") Star
        NButton(color="#8318df") Reload
      .gallery-tags(v-if="tags && tags.length")
        NTag(type="info" v-for="tag in tags" :key="tag") {{ tag }}
        
</template>

<script lang="ts">
import { Base64 } from 'js-base64'
import { defineComponent, computed } from 'vue'
import type { PropType } from 'vue'
import { NSpace, NButton, NResult, NImage, NImageGroup, NTag, NProgress, useThemeVars } from 'naive-ui'
import SLayer from '@/components/SLayer/index.vue'
import SLoading from '@/components/SLoading/index.vue'
import { invoke, invokeAsObject, requestAsync, io } from '@/electron'
import { useDownloadStore } from '@/stores/download'

export default defineComponent({
  components: {
    NSpace,
    NButton,
    NResult,
    NImage,
    NImageGroup,
    NTag,
    NProgress,
    SLayer,
    SLoading,
  },
  props: {
    item: {
      type: Object as PropType<ImageMeta>,
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
    resultSet: [] as ImageMeta[],
    tags: [] as string[],
    scale: 1.0,
    percentage: 0,
  }),
  watch: {
    async show(nv) {
      if (nv) {
        try {
          this.percentage = 0
          this.tags = (this.item && this.item.tags && this.item.tags.split(' ')) || []
          if (this.item) {
            this.isLoaded = false
            if (this.item.$children) {
              const tree = await invokeAsObject('loadChildren', { item: this.item })
              if (tree && tree.children && tree.children.length) {
                this.resultSet = tree.children
              } else {
                this.resultSet = [this.item]
              }
            } else {
              this.resultSet = [this.item]
            }
            this.tags = this.tags || (this.resultSet && this.resultSet.length && this.resultSet[0].tags && this.resultSet[0].tags.split(' '))
            if (this.resultSet.length === 1) {
              const once = this.resultSet[0]
              this.download(once)
            } else {
              Promise.all(
                this.resultSet.map(async (item) => {
                  const once = item
                  const { data, type } = await invoke('request', { url: once.coverUrl || once.sampleUrl || once.largerUrl || once.originUrl })
                  const src = URL.createObjectURL(this.base64ToBlob(data, type))
                  once._src = src
                  console.log('_src, ', src)
                })
              )
            }
          }
        } catch (error) {
          console.log(error)
        } finally {
          this.$forceUpdate()
          this.isLoaded = true
        }
      } else {
      }
    },
  },
  computed: {},
  async mounted() {
    this.tags = (this.item && this.item.tags && this.item.tags.split(' ')) || []
    // document.addEventListener('wheel', this.onWheel, false)
  },
  methods: {
    async download(once: ImageMeta) {
      const response = requestAsync({ url: once.originUrl || once.largerUrl || once.sampleUrl }, (p) => {
        console.log(p)
        this.percentage = Number((p.progress * 100).toFixed(2))
        if (p.done && p.response) {
          const { data, type } = p.response
          const src = URL.createObjectURL(this.base64ToBlob(data, type))
          once._src = src
        }
      })
    },
    onDownloadGallery() {
      if (this.isLoaded) {
        if (this.resultSet && this.resultSet.length) {
          console.log('this.resultSet', this.resultSet)
          this.resultSet.forEach(async (item) => {
            const response = requestAsync({ url: item.originUrl || item.largerUrl || item.sampleUrl || item.coverUrl }, (p) => {
              if (!p.uuid) throw Error('无效的唯一标识符')
              this.downloadStore.update(p.uuid || '', JSON.parse(JSON.stringify({ ...item, progress: p })))
              if (p.done) {
                if (!p.response) throw Error('空响应')

                io.writeFile(`${item.title}-${Date.now()}.${p.response.type.split('/')[1]}`, p.response.data)
              }
            })
          })
        }
      } else {
        alert('请等待列表加载完成！')
      }
    },
    base64ToBlob(base64: string, type: string) {
      return new Blob([Base64.toUint8Array(base64)], { type: type })
    },
    onSearch() {},
    onWheel(e: WheelEvent) {
      const v = e.deltaY
      const el = document.querySelector('.n-image-preview-wrapper') as HTMLDivElement
      if (el) {
        if (v > 0) {
          this.scale += 0.25
        } else if (this.scale > 0.5) {
          this.scale -= 0.25
        }
        el.style.transition = '.25s ease'
        el.style.transform = el.style.transform.replace(/scale\(.*\)/g, '')
        el.style.transform += ` scale(${this.scale})`
      }
    },
  },
  beforeUnmount() {
    // document.removeEventListener('wheel', this.onWheel, false)
  },
  setup() {
    const downloadStore = useDownloadStore()
    return {
      downloadStore,
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
  width: 100%;
  height: 100%;
  .n-progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    transition: 0.5s ease-in;
    &.done {
      opacity: 0;
    }
  }
  main {
    flex: 1;
    width: 0;
    height: 100%;
    overflow: hidden;
    .images-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      .single,
      .multiple {
        display: flex;
        flex-wrap: wrap;
        // justify-content: center;
        align-items: center;
        height: 100%;
      }
      .single {
        .n-image {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
        }
      }
      .multiple {
        overflow: auto;
        .n-image {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 0;
          height: 250px;
          flex: 0 0 23%;
          margin: 0.5rem;
        }
      }
    }
  }
  .aside {
    flex: 0 0 256px;
    width: 0;
    display: flex;
    flex-direction: column;
    border-left: 1px dashed rgba($color: teal, $alpha: 0.5);
    padding: 0 0.5rem;
    .gallery-title {
      margin-bottom: 0.5rem;
    }
    .gallery-cover {
      margin-bottom: 0.5rem;
      width: 100%;
      overflow: hidden;
      .n-image {
        width: 100%;
      }
    }
    .gallery-options {
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      .n-button {
        flex: 1;
        margin-right: 0.5rem;
        &:last-of-type {
          margin-right: 0;
        }
      }
    }
    .gallery-tags {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      flex-direction: row;
      flex-wrap: wrap;
      width: 100%;
      .n-tag {
        margin: 0.25rem;
      }
    }
  }
}

// ul {
//   margin: 0;
//   padding: 0;
//   list-style: none;
//   li {
//     display: flex;
//     flex-direction: column;
//     img {
//       height: 100%;
//       object-fit: contain;
//     }
//   }
// }
</style>
