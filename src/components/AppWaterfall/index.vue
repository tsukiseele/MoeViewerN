<!-- —————————————↓HTML————————分界线———————————————————————— -->
<template lang="pug">
.vue-waterfall-easy-container(
  :style="{ width: width && !isMobile ? width + 'px' : '', height: parseFloat(height) == height ? height + 'px' : height }"
)
  .loading.ball-beat(v-show="isPreloading_c", :class="{ first: isFirstLoad }")
    slot(name="loading", :isFirstLoad="isFirstLoad")
    .dot(
      v-if="!hasLoadingSlot",
      v-for="n in loadingDotCount",
      :style="loadingDotStyle"
    )
  //- 为了防止loading 跟随滚动
  .vue-waterfall-easy-scroll(ref="scrollEl")
    slot(name="waterfall-head")
    .vue-waterfall-easy(
      :style="isMobile ? '' : { width: colWidth * cols + 'px', left: '50%', marginLeft: (-1 * colWidth * cols) / 2 + 'px' }"
    )
      .img-box(
        v-for="(v, i) in imgsArr_c",
        :class="[cardAnimationClass, { __err__: v._error }]",
        :style="{ padding: (isMobile ? mobileGap : gap) / 2 + 'px', width: isMobile ? '' : colWidth + 'px' }"
      )
        component.img-inner-box(
          :is="isRouterLink && linkRange == 'card' ? 'router-link' : 'alink'",
          :data-index="i",
          :to="linkRange == 'card' ? v[hrefKey] : false"
        )
          component.img-wraper(
            v-if="v[srcKey]",
            :is="isRouterLink && linkRange == 'img' ? 'router-link' : 'alink'",
            :to="linkRange == 'img' ? v[hrefKey] : false",
            :style="{ width: imgWidth_c + 'px', height: v._height ? v._height + 'px' : false }"
          )
            img(:src="v[srcKey]")
          slot(:index="i", :value="v")
      .over(v-if="over", ref="over")
        slot(name="waterfall-over") 被你看光了
</template>

<!-- ——————————————↓JS—————————分界线———————————————————————— -->
<script>
import alink from "@/components/AppLink";
// import fetch from "electron-fetch"

import fetch from "node-fetch";

export default {
  components: {
    alink
  },
  props: {
    width: {
      // 容器宽度
      type: Number
    },
    height: {
      // 容器高度
      type: [Number, String]
    },
    reachBottomDistance: {
      // 滚动触底距离，触发加载新图片
      type: Number, // selector
      default: 20 // 默认在最低那一列到底时触发
    },
    loadingDotCount: {
      // loading 点数
      type: Number,
      default: 3
    },
    loadingDotStyle: {
      type: Object
    },
    gap: {
      // .img-box 间距
      type: Number,
      default: 20
    },
    mobileGap: {
      type: Number,
      default: 8
    },
    maxCols: {
      type: Number,
      default: 5
    },
    imgsArr: {
      type: Array,
      required: true
    },
    srcKey: {
      type: String,
      default: "src"
    },
    hrefKey: {
      type: String,
      default: "href"
    },
    imgWidth: {
      type: Number,
      default: 240
    },
    isRouterLink: {
      type: Boolean,
      default: false
    },
    linkRange: {
      // card | img | custom 自定义通过slot自定义链接范围
      type: String,
      default: "card"
    },
    loadingTimeOut: {
      // 预加载事件小于500毫秒就不显示加载动画，增加用户体验
      type: Number,
      default: 500
    },
    cardAnimationClass: {
      type: [String],
      default: "default-card-animation"
    },
    enablePullDownEvent: {
      type: Boolean,
      default: false
    },
    headers: {
      type: Object
    }
  },
  data() {
    return {
      msg: "this is from vue-waterfall-easy.vue",
      isMobile: !!navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i), // 初始化移动端
      isPreloading: true, // 正在预加载中，显示加载动画
      isPreloading_c: true,
      imgsArr_c: [], // 待图片预加载imgsArr完成，插入新的字段height之后,才会生成imgsArr_c，这时才开始渲染
      loadedCount: 0,
      cols: NaN, // 需要根据窗口宽度初始化
      imgBoxEls: null, // 所有的.img-box元素
      beginIndex: 0, // 开始要排列的图片索引,首次为第二列的第一张图片，后续加载则为已经排列图片的下一个索引
      colsHeightArr: [],
      // 自定义loading
      LoadingTimer: null,
      isFirstLoad: true, // 首次加载
      over: false, // 结束waterfall加载
      // 观察组件变化
      resizeObserver: null
    };
  },
  computed: {
    colWidth() {
      // 每一列的宽度
      return this.imgWidth + this.gap;
    },
    imgWidth_c() {
      // 对于移动端重新计算图片宽度`
      return this.isMobile
        ? window.innerWidth / 2 - this.mobileGap
        : this.imgWidth;
      // return this.isMobile ? this.$refs.scrollEl.clientWidth / 2 - this.mobileGap : this.imgWidth
    },
    hasLoadingSlot() {
      return !!this.$scopedSlots.loading;
    }
  },
  mounted() {
    this.bindClickEvent();
    this.loadingMiddle();
    this.preload();
    this.cols = this.calcuCols();
    this.$on("preloaded", () => {
      this.isFirstLoad = false;
      this.imgsArr_c = this.imgsArr.concat([]); // 预加载完成，这时才开始渲染
      this.$nextTick(() => {
        this.isPreloading = false;
        this.imgBoxEls = this.$el.getElementsByClassName("img-box");
        // console.log('图片总数', this.imgBoxEls.length)
        this.waterfall();
      });
    });

    if (!this.isMobile && !this.width) {
      // window.addEventListener("resize", this.response);
      this.listenLayoutChanger();
    }
    if (this.isMobile && this.enablePullDownEvent) this.pullDown();
    this.scroll();
  },
  beforeDestroy() {
    // window.removeEventListener("resize", this.response);
    this.resizeObserver.disconnect();
  },
  watch: {
    isPreloading(newV, oldV) {
      if (newV) {
        setTimeout(() => {
          if (!this.isPreloading) return; // 500毫秒内预加载完图片则不显示加载动画
          this.isPreloading_c = true;
        }, this.loadingTimeOut);
      } else {
        this.isPreloading_c = false;
      }
    },
    imgsArr(newV, oldV) {
      if (
        this.imgsArr_c.length > newV.length ||
        (this.imgsArr_c.length > 0 && newV[0] && !newV[0]._height)
      ) {
        // console.log('reset')
        this.reset();
      }
      this.preload();
    }
  },
  methods: {
    // ==1== 预加载
    preload(src, imgIndex) {
      this.imgsArr.forEach((imgItem, imgIndex) => {
        if (imgIndex < this.loadedCount) return; // 只对新加载图片进行预加载
        // 无图时
        if (!imgItem[this.srcKey]) {
          this.imgsArr[imgIndex]._height = "0";
          this.loadedCount++;

          // 支持无图模式
          if (this.loadedCount == this.imgsArr.length) {
            this.$emit("preloaded");
          }
          return;
        }
        /*
        if (this.headers) {
          fetch(imgItem[this.srcKey], {
            headers: this.headers,
            credentials: "include",
            // useElectronNet: false,
          }).then(response => {
            response.arrayBuffer().then(res => {
              console.log(res);
              var blob = new Blob([res], { type: "image/jpg" });
              var objectUrl = URL.createObjectURL(blob);
              var oImg = new Image();
              oImg.src = objectUrl;
              oImg.onload = oImg.onerror = e => {
                this.loadedCount++;
                this.imgsArr[imgIndex][this.srcKey] = objectUrl;
                // 预加载图片，计算图片容器的高
                this.imgsArr[imgIndex]._height =
                  e.type == "load"
                    ? Math.round(this.imgWidth_c / (oImg.width / oImg.height))
                    : this.isMobile
                    ? this.imgWidth_c
                    : this.imgWidth;
                if (e.type == "error") {
                  this.imgsArr[imgIndex]._error = true;
                  this.$emit("imgError", this.imgsArr[imgIndex]);
                }

                if (this.loadedCount == this.imgsArr.length) {
                  this.$emit("preloaded");
                }
              };
            });
          });
        } else {*/
        var oImg = new Image();
        oImg.src = imgItem[this.srcKey];
        oImg.onload = oImg.onerror = e => {
          this.loadedCount++;
          // 预加载图片，计算图片容器的高
          this.imgsArr[imgIndex]._height =
            e.type == "load"
              ? Math.round(this.imgWidth_c / (oImg.width / oImg.height))
              : this.isMobile
              ? this.imgWidth_c
              : this.imgWidth;
          if (e.type == "error") {
            this.imgsArr[imgIndex]._error = true;
            this.$emit("imgError", this.imgsArr[imgIndex]);
          }
          if (this.loadedCount == this.imgsArr.length) {
            this.$emit("preloaded");
          }
        };
        // }
      });
    },
    // ==2== 计算cols
    calcuCols() {
      // 列数初始化
      var waterfallWidth = this.width
        ? this.width
        : this.$refs.scrollEl.offsetWidth;
      var cols = parseInt(waterfallWidth / this.colWidth);
      cols = cols === 0 ? 1 : cols;
      return this.isMobile ? 2 : cols > this.maxCols ? this.maxCols : cols;
    },
    // ==3== waterfall布局
    waterfall() {
      if (!this.imgBoxEls) return;
      var top,
        left,
        height,
        colWidth = this.isMobile
          ? this.imgBoxEls[0].offsetWidth
          : this.colWidth;
      if (this.beginIndex == 0) this.colsHeightArr = [];
      for (var i = this.beginIndex; i < this.imgsArr.length; i++) {
        if (!this.imgBoxEls[i]) return;
        height = this.imgBoxEls[i].offsetHeight;
        if (i < this.cols) {
          this.colsHeightArr.push(height);
          top = 0;
          left = i * colWidth;
        } else {
          var minHeight = Math.min.apply(null, this.colsHeightArr); // 最低高低
          var minIndex = this.colsHeightArr.indexOf(minHeight); // 最低高度的索引
          top = minHeight;
          left = minIndex * colWidth;
          // 设置元素定位的位置
          // 更新colsHeightArr
          this.colsHeightArr[minIndex] = minHeight + height;
        }

        this.imgBoxEls[i].style.left = left + "px";
        this.imgBoxEls[i].style.top = top + "px";
      }

      this.beginIndex = this.imgsArr.length; // 排列完之后，新增图片从这个索引开始预加载图片和排列
    },

    // ==4== resize 响应式
    response() {
      var old = this.cols;
      this.cols = this.calcuCols();
      if (old === this.cols) return; // 列数不变直接退出
      this.beginIndex = 0; // 开始排列的元素索引
      this.waterfall();
      if (this.over) this.setOverTipPos();
    },

    // ==5== 滚动触底事件
    scrollFn() {
      var scrollEl = this.$refs.scrollEl;
      if (this.isPreloading) return;
      var minHeight = Math.min.apply(null, this.colsHeightArr);
      if (
        scrollEl.scrollTop + scrollEl.offsetHeight >
        minHeight - this.reachBottomDistance
      ) {
        this.isPreloading = true;
        this.$emit("scrollReachBottom"); // 滚动触底
      }
    },
    scroll() {
      this.$refs.scrollEl.addEventListener("scroll", this.scrollFn);
    },
    waterfallOver() {
      this.$refs.scrollEl.removeEventListener("scroll", this.scrollFn);
      this.isPreloading = false;
      this.over = true;
      this.setOverTipPos();
    },
    setOverTipPos() {
      var maxHeight = Math.max.apply(null, this.colsHeightArr);
      this.$nextTick(() => {
        this.$refs.over.style.top = maxHeight + "px";
      });
    },
    // ==6== 点击事件绑定
    bindClickEvent() {
      this.$el
        .querySelector(".vue-waterfall-easy")
        .addEventListener("click", e => {
          var targetEl = e.target;
          if (e.target.className.indexOf("over") !== -1) return;
          if (targetEl.className.indexOf("img-box") != -1) return;
          while (targetEl.className.indexOf("img-inner-box") == -1) {
            targetEl = targetEl.parentNode;
          }
          var index = targetEl.getAttribute("data-index");
          this.$emit("click", e, {
            index,
            value: this.imgsArr_c[index]
          });
        });
    },
    // ==7== 下拉事件
    pullDown() {
      var scrollEl = this.$el.querySelector(".vue-waterfall-easy-scroll");
      var startY;
      scrollEl.addEventListener("touchmove", e => {
        if (scrollEl.scrollTop === 0) {
          var t = e.changedTouches[0];
          if (!startY) startY = t.pageY;
          var pullDownDistance = t.pageY - startY;
          if (pullDownDistance > 0) {
            e.preventDefault();
          }
          this.$emit("pullDownMove", pullDownDistance);
        }
      });
      scrollEl.addEventListener("touchend", e => {
        if (scrollEl.scrollTop === 0) {
          startY = NaN;
          this.$emit("pullDownEnd");
        }
      });
    },
    // other
    loadingMiddle() {
      // 对滚动条宽度造成的不居中进行校正
      var scrollEl = this.$el.querySelector(".vue-waterfall-easy-scroll");
      var scrollbarWidth = scrollEl.offsetWidth - scrollEl.clientWidth;
      this.$el.querySelector(".loading").style.marginLeft =
        -scrollbarWidth / 2 + "px";
    },
    // 重置状态
    reset() {
      this.imgsArr_c = [];
      this.beginIndex = 0;
      this.loadedCount = 0;
      this.isFirstLoad = true;
      this.isPreloading = true;
      this.scroll();
      this.over = false;
    },
    // 监听组件变化
    listenLayoutChanger() {
      this.resizeObserver = new ResizeObserver(entries => {
        entries.forEach(ele => {
          this.response();
        });
      });
      this.resizeObserver.observe(this.$refs.scrollEl);
    }
  }
};
</script>

<!-- —————————————↓SCSS———————分界线————————————————————————— -->
<style lang="scss" scoped>
@import './index.scss';
</style>
