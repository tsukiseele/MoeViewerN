<template lang="pug">
#download
  ul.download-list
    li.download-item(v-for="[_, item] in downloadStore.statusMap")
      img.item-cover(:src="item?.coverUrl || item?.sampleUrl || item?.largerUrl || item?.originUrl" alt="")
      .item-info
        .item-name {{ item?.title }}
        NProgress.item-progress(type="line" :percentage="formatProgress(item)" :processing="item.progress?.progress !== 1" :indicator-placement="'inside'" :border-radius="4" :class="{done: item?.progress?.progress  === 100}")
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { invoke, invokeAsObject } from '@/electron'
import { useDownloadStore } from '@/stores/counter'
import { NProgress } from 'naive-ui'
import filesize from 'filesize'

export default defineComponent({
  components: {
    NProgress,
  },
  name: 'download',
  data: () => ({
    sites: [],
  }),
  methods: {
    formatProgress(item: ImageDownloadMeta): number | undefined {
      return item && item.progress && item.progress.progress ? Number((item.progress.progress * 100).toFixed(2)) : undefined
    },
  },
  async mounted() {},
  setup() {
    const downloadStore = useDownloadStore()
    return {
      downloadStore,
    }
  },
})
</script>

<style lang="scss" scoped>
.download-list {
  width: 100%;
  .download-item {
    display: flex;
    // justify-content: center;
    align-items: center;
    width: 100%;
    height: 4rem;
    background-color: rgba(255, 255, 255, 0.5);
    transition: 0.25s ease-out;
    cursor: pointer;
    &:hover {
      background-color: white;
    }
    .item-cover {
      width: 4rem;
      height: 4rem;
      object-fit: cover;
    }
    .item-info {
      flex: 1;
      width: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      margin: 0 1rem;
      .item-progress {

      }
    }
  }
}
@media (min-width: 1024px) {
  #sites {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
