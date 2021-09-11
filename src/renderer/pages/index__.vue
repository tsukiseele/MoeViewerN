<template lang="pug">
keep-alive
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
        @click="clickFn",
        @imgError="imgErrorFn",
        @pullDownMove="pullDownMove",
        @pullDownEnd="pullDownEnd"
      )
        template(#default="props")
          .img-info
            p.some-info {{ props.value.title || props.value.name }}
      aside.aside
        AppSiteList(:sites="sites" @click="onSiteClick")
      AppFab(@click="onFabClick")
      nuxt-child(:images="images")
  //- 对话框
  //- Dialog(
  //-   :onHide="onCloseDialog",
  //-   :show="isShowDialog",
  //-   title="对话框",
  //-   content="内容"
  //- )
  
  //- 提示框
  //- Snackbar(message="提示框", v-model="isShowSnackbar")
</template>

<script>
import Sakurawler from "@/libs/sakurawler";
import { ipcRenderer } from "electron";

export default {
  data: () => ({
    // 弹出组件状态
    isShowDialog: false,
    isShowSnackbar: false,
    // 瀑布流
    images: [],
    itemWidth: 200,
    maxCols: 99,
    isLoading: false,
    //
    page: 1, // 当前页码
    keywords: "",
    currentSite: null,
    //
    pullDownDistance: 0
  }),
  computed: {
    sites() {
      return this.$store.state.sites;
    },
    headers() {
      return this.currentSite ? this.currentSite.requestHeaders : null;
    }
  },
  watch: {
    sites() {
      this.openDefaultSite();
    },
    currentSite() {
      this.loadGallery();
    }
  },
  created() {
    this.openDefaultSite();
  },
  methods: {
    resetStatus() {
      this.page = 1;
      this.keywords = null;
    },
    onSiteClick(site, index) {
      if (!this.isLoading) {
        this.currentSite = site;
      } else {
        this.isShowSnackbar = true;
      }
    },
    onCloseDialog() {
      this.isShowDialog = false;
    },
    onFabClick() {
      // this.isShowDialog = true;
      ipcRenderer.send("openSectionWindow");
    },
    openDefaultSite() {
      if (this.sites && !this.currentSite) {
        this.currentSite = this.sites.find(item => {
          return item.title.toLowerCase().indexOf("lolibooru") >= 0;
        });
      }
    },
    preloaded() {
      this.isLoading = false;
    },
    async loadNext() {
      this.page++;
      this.images.push(...(await this.requestImages()));
    },

    async loadGallery() {
      this.openDefaultSite();
      this.resetStatus();
      this.keywords = "peko";
      // 请求
      try {
        const res = await this.requestImages();
        if (res) {
          this.images = res;
          console.log(this.images);
        }
      } catch (e) {
        console.log(e);
      }
    },

    async requestImages() {
      this.isLoading = true;
      console.log("isLoading", this.isLoading);
      let images;
      try {
        images = await new Sakurawler(this.currentSite).parse(
          this.page,
          this.keywords
        );
      } catch (e) {}
      this.isLoading = false;
      console.log("isLoading", this.isLoading);
      return images;
    },

    clickFn(event, { index, value }) {
      /*
    event.preventDefault();
    if (event.target.tagName.toLowerCase() == "img") {
      console.log("img clicked", index, value);
    }*/
      // this.isShowDialog = true;
      this.$router.push("/catalog");
      // ipcRenderer.send("openSectionWindow", "/catalog");
    },

    imgErrorFn(imgItem) {
      console.log("图片加载错误", imgItem);
    },

    pullDownMove(pullDownDistance) {
      this.pullDownDistance = pullDownDistance;
    },

    pullDownEnd(pullDownDistance) {
      console.log("pullDownEnd");
      if (this.pullDownDistance > 50) {
        alert("下拉刷新");
      }
      this.pullDownDistance = 0;
    }
  }
};
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
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5) !important;
  }
}
</style>
