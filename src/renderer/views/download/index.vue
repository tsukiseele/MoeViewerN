<template lang="pug">
#download
  div(v-if="!(downloadStore.statusMap && downloadStore.statusMap.size)" style="font-size: 1rem; padding: 1rem;") 暂无下载任务
  ul.download-list
    li(v-for="[_, item] in downloadStore.statusMap" @click="onItemClick(item)")
      .download-group(v-if="item.childTask")
        .download-item
          .item-cover
            img(:src="item?._src" alt="")
          .item-info
            .item-name
              i.item-type.mdi.mdi-folder-download 
              span [任务组] - {{ item?.title || item?.tags }}
            .item-progress(v-if="getGroupProgress(item.childTask) < 100")
              NProgress(
                type="line" 
                :percentage="getGroupProgress(item.childTask)"  
                :indicator-placement="'inside'" 
                :border-radius="4" 
                :class="{done: item?.progress?.progress  === 100}")
              .item-progress--info {{ `${ getGroupStatus(item.childTask) } / ${ item.childTask.size }` }} pics
            .item-finish(v-else) {{ `下载完成 - ${ item.childTask.size }个条目` }}
            
        .download-children(:class="{expand: item.isExpand}")
          .download-item(v-for="[_, child] in item.childTask" @click.stop="onChildItemClick(child)")
            img.item-cover(:src="child?._src" alt="")
            .item-info
              .item-name {{ child?.title || child?.tags }}
              .item-progress(v-if="child.progress?.progress !== 1")
                NProgress(
                  type="line" 
                  :percentage="formatProgress(child)" 
                  :indicator-placement="'inside'" 
                  :border-radius="4" 
                  :class="{done: child?.progress?.progress  === 100}")
                .item-progress--info {{ `${filesize(child.progress?.current || 0)} / ${filesize(child.progress?.total || 0)}` }}
              .item-finish {{ `${getStatus(child.progress?.status)} - ${filesize(child.progress?.current || 0)}` }}
              i.item-reload.mdi.mdi-refresh(@click="onReload(item, child)")
      .download-item(v-else)
        img.item-cover(:src="item?._src" alt="")
        .item-info
          .item-name {{ item?.title || item?.tags }}
          .item-progress(v-if="item.progress?.progress !== 1")
            NProgress(
              type="line" 
              :percentage="formatProgress(item)" 
              :indicator-placement="'inside'" 
              :border-radius="4" 
              :class="{done: item?.progress?.progress  === 100}")
            .item-progress--info {{ `${filesize(item.progress?.current || 0)}/${filesize(item.progress?.total || 0)}` }}
          .item-finish {{ `${getStatus(item.progress?.status)} - ${filesize(item.progress?.current || 0)}` }}
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useThemeVars, NProgress } from 'naive-ui'
import { changeColor } from 'seemly'
import { useDownloadStore } from '@/stores/download'
import FileSize from 'filesize'


export default defineComponent({
  components: {
    NProgress,
  },
  name: 'download',
  setup() {
    return {
      downloadStore: useDownloadStore(),
      themeVars: useThemeVars(),
      changeColor,
    }
  },
  data: () => ({
    sites: [],
  }),
  computed: {
    filesize() {
      return FileSize.partial({ base: 2, standard: 'jedec' })
    },
  },
  methods: {
    getStatus(type: number | undefined) {
      switch (type) {
        case 1:
          return '下载等待'
        case 2:
          return '下载准备'
        case 4:
          return '下载中'
        case 8:
          return '下载完成'
        case 16:
          return '下载错误'
        default:
          return ''
      }
    },
    onReload(item: ImageDownloadMeta, child: ImageDownloadMeta) {
      this.downloadStore.downloadGroup(item, [child])
      // window.$message(`下载开始: ${child.title}`)
    },
    onItemClick(item: ImageDownloadMeta) {
      if (item.childTask) {
        item.isExpand = !item.isExpand
      } else {
        this.onChildItemClick(item)
      }
    },
    onChildItemClick(item: ImageDownloadMeta) {
      window.eapi.app.writeClipboardText(JSON.stringify(item))
      
    },
    getGroupStatus(items: Map<string, ImageDownloadMeta>) {
      let count = 0
      items.forEach((item, k) => {
        item.progress?.done && count++
      })
      return count
    },
    getGroupProgress(items: Map<string, ImageDownloadMeta>) {
      return Number(((this.getGroupStatus(items) / items.size) * 100).toFixed(2))
    },
    formatProgress(item: ImageDownloadMeta): number | undefined {
      return item && item.progress && item.progress.progress ? Number((item.progress.progress * 100).toFixed(2)) : undefined
    },
  },
  async mounted() {},
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
