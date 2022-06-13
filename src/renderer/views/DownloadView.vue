<template lang="pug">
#download
  ul.download-list
    li.download-item(v-for="item in downloadStore.list")
      img.item-cover(:src="item?.coverUrl || item?.sampleUrl || item?.largerUrl || item?.originUrl" alt="")
      .item-info
        .item-name {{ item?.title }}
        NProgress.item-progress(type="line" :percentage="(item?.progress?.progress * 100).toFixed(2)" processing :indicator-placement="'inside'" :border-radius="4" :class="{done: item?.progress?.progress  === 100}")
</template>

<script>
import { defineComponent } from 'vue'
import { invoke, invokeAsObject } from '@/electron'
import { useDownloadStore } from '@/stores/counter'
import { NProgress } from 'naive-ui'

export default defineComponent({
  components: {
    NProgress
  },
  name: 'download',
  data: () => ({
    sites: [],
    item: {
      coverUrl: 'https://assets.yande.re/data/preview/b3/f7/b3f71038c8a12de81cdc78a101b2bd98.jpg',
      title: '碧蓝档案-ひな',
      progress: {
        progress: 50
      }
    }
  }),
  methods: {},
  async mounted() {
    console.log(this.downloadStore.list);
  },
  setup() {
    
    const downloadStore = useDownloadStore()
    return {
      downloadStore
    }
  }
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
