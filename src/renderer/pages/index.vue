<template lang="pug">
  .layout
    .gallery
      AppWaterfall.waterfall(
        ref="waterfall",
        srcKey="coverUrl",
        :imgsArr="images",
        :imgWidth="itemWidth",
        :maxCols="maxCols",
        :headers="headers",
        @preloaded="preloaded"
        @scrollReachBottom="loadNext",
        @click="onItemClick",
        @imgError="onImageLoadError",
        @pullDownMove="pullDownMove",
        @pullDownEnd="pullDownEnd"
      )
        template(#default="props")
          .img-info
            p.some-info {{ props.value.title }}
      aside.aside
        AppSiteList(:sites="sites" @itemClick="onSiteClick")
      AppFab(@click="onFabClick")
    AppSearchBar(v-model="keywords" @submit="onSearchSubmit" @close="onSearchClose" :visible="isShowSearchBar")
    nuxt-child
</template>

<script>
import Sakurawler from '@/libs/sakurawler'
import { ipcRenderer } from 'electron'

export default {
  data: () => ({
    // 弹出组件状态
    isShowDialog: false,
    isShowSearchBar: false,
    //
    resultSet: [],
    // 瀑布流
    images: [],
    itemWidth: 200,
    maxCols: 99,
    isLoading: false,
    //
    page: 1, // 当前页码
    keywords: '',
    currentSite: null,
    //
    currImage: null,
    //
    pullDownDistance: 0,
    //
    sakurawler: null
  }),
  computed: {
    sites() {
      return this.$store.state.sites
    },
    headers() {
      return this.currentSite ? this.currentSite.headers : null
    }
  },
  watch: {
    sites() {
      this.openDefaultSite()
    },
    currentSite() {
      this.sakurawler && this.sakurawler.abortRequest()
      this.reload()
    }
  },
  created() {
    this.openDefaultSite()
  },
  methods: {
    onSearchSubmit() {
      this.reload()
      this.isShowSearchBar = false
    },
    onSearchClose() {
      this.isShowSearchBar = false
    },
    onSiteClick(site, index) {
      if (this.isLoading) {
        // this.$notify('正在加载，请等待')
        this.sakurawler.abortRequest()
        this.currentSite = site
      } else {
        this.currentSite = site
      }
    },
    onCloseDialog() {
      this.isShowDialog = false
    },
    onFabClick() {
      this.isShowSearchBar = true
    },
    openDefaultSite() {
      if (this.sites && !this.currentSite) {
        this.currentSite = this.sites.find(item => {
          return item.name.toLowerCase().indexOf('safebooru')
        })
      }
    },
    preloaded() {
      this.isLoading = false
    },
    async loadNext() {
      this.page++
      this.images.push(...(await this.getImageList()))
    },
    async reload() {
      this.page = 1
      this.keywords = null
      try {
        this.images = await this.getImageList() || []
        console.log(this.images)
      } catch (e) {
        console.log(e)
      }
    },
    async getImageList() {
      this.isLoading = true
      try {
        this.sakurawler = new Sakurawler(this.currentSite, this.page, this.keywords)
        this.resultSet = await this.sakurawler.parseSite()
      } catch (e) {
        console.log(e)
      }
      this.isLoading = false
      return this.resultSet ? this.resultSet[0] : null
    },
    onItemClick(event, { index, value }) {
      
      this.currImage = this.images[index]
      this.$router.push({
        name: 'index-catalog',
        params: { image: this.images[index] }
      })
    },
    onImageLoadError(imgItem) {
      console.log('图片加载错误', imgItem)
    },
    pullDownMove(pullDownDistance) {
      this.pullDownDistance = pullDownDistance
    },
    pullDownEnd(pullDownDistance) {
      console.log('pullDownEnd')
      if (this.pullDownDistance > 50) {
        alert('下拉刷新')
      }
      this.pullDownDistance = 0
    }
  }
}
</script>

<style lang="less" scoped>
.layout {
  position: relative;
  width: 100%;
  height: calc(100vh - var(--frame-height));
}

.gallery {
  display: flex;
  width: 100%;
  height: 100%;
}

.waterfall {
  flex: 1;
}

.aside {
  color: white;
  width: 200px;
  border-left: 1px solid rgba(160, 160, 192);
  .site-item {
    font-family: Shizuku;
    list-style: none;
    padding: 0.2rem;

    background-color: rgba(160, 160, 192);
    &:nth-child(2n) {
      filter: brightness(1.2);
    }
    &:hover {
      filter: brightness(0.8);
    }
  }
}

.img-info {
  padding: 0.33rem;
  // background: rgba(192, 192, 255, 1);
}

/deep/ a.img-inner-box {
  border-radius: 0 !important;
  overflow: hidden;
  transition: box-shadow 0.25s ease;
  cursor: pointer;
  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5) !important;
  }
}
</style>
