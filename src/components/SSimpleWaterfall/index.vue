<template lang="pug">
.waterfall-wrapper
  .waterfall
    slot(name="header")
    .waterfall--list
      .waterfall--list-item(v-for="(item, index) in items" :key="index" @click="$emit('click', item)")
        slot(:item='item' :index='index')
    slot(name="footer")
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    imageKey: {
      type: String,
      default: null,
    },
    itemWidth: {
      type: Number,
      default: 250,
    },
    gap: {
      type: Number,
      default: 20,
    },
    evenly: {
      type: Boolean,
      default: false,
    },
    maxColumn: {
      type: Number,
      default: null,
    },
    height: {
      type: Number || String,
      default: null,
    },
    handleImage: {
      type: Function,
      default: null,
    },
  },
  emits: ['loading', 'loaded', 'scroll-bottom'],
  data: () => ({
    column: 0,
    resizeObserver: null,
    timer: null,
  }),
  watch: {
    items: {
      handler(nv, ov) {
        if (nv && ov && nv.length != ov.length) {
          this.$emit('loading')
          try {
            this.refresh()
          } catch (error) {
            console.log(error)
          }
          this.$emit('loaded')
        } else {
          this.responsive()
        }
      },
      deep: true,
    },
  },
  methods: {
    init() {
      this.refresh()
      this.listenLayoutChanged()
      this.$el.addEventListener('scroll', this.onScroll)
    },
    refresh() {
      this.$nextTick(() => {
        this.getImageSize()
        this.responsive()
      })
    },
    onScroll(e) {
      const { scrollTop, clientHeight, scrollHeight } = this.$el
      if (scrollTop + clientHeight === scrollHeight) {
        this.$emit('scroll-bottom')
      }
    },
    responsive() {
      if (this.timer) return
      this.timer = setTimeout(() => {
        clearTimeout(this.timer)
        this.timer = null
        this.fall()
      }, 250)
    },
    fall() {
      const container = this.$el.children[0]
      // 获取当前页面的宽度
      const containerWidth = container.offsetWidth
      // 若传入列数，则使用，否则自动计算：实际列数 = 页面宽度 / (图片宽度 + 间距)
      this.column = Math.floor(containerWidth / (this.itemWidth + this.gap))
      this.column = this.maxColumn && this.column > this.maxColumn ? this.maxColumn : this.column
      // 若传入平均间距，则自动计算，否则使用传入的间距
      const realGap = this.evenly ? (containerWidth - this.itemWidth * this.column) / (this.column - 1) : this.gap
      // 若传入平均间距，则为0，否则自动计算
      const margin = this.evenly ? realGap : (containerWidth - (this.itemWidth + realGap) * this.column + realGap) / 2
      // 获取所有需要布局的项
      const itemEls = this.$el.querySelectorAll('.waterfall--list-item')
      // 数组，保存最低高度
      const heightArr = []
      // 保存偏移量
      let top, left
      // 遍历并通过已知高度布局
      itemEls.forEach((itemEl, i) => {
        itemEl.style.width = this.itemWidth + 'px'
        // const img = itemEl.querySelector('img')
        // img && img.setAttribute('loaded', '')
        // itemEl.style.height = this.items[i]._height
        // 遍历所有的外层容器
        const height = itemEl.offsetHeight
        // 如果当前处在第一行
        if (i < this.column) {
          top = 0
          left = (this.itemWidth + realGap) * i + margin
          heightArr.push(height)
        } else {
          const minHeight = Math.min(...heightArr)
          const minIndex = heightArr.indexOf(minHeight)
          top = minHeight + realGap
          left = (this.itemWidth + realGap) * minIndex + margin
          heightArr[minIndex] = minHeight + realGap + height
        }
        itemEl.style.top = top + 'px'
        itemEl.style.left = left + 'px'
        itemEl.style.opacity = 1
      })
      container.style.height = this.height ? this.height : Math.max(...heightArr) + 'px'
    },
    async getImageSize() {
      if (this.items && this.items.length) {
        if (this.handleImage) {
          await this.handleImage(this.items)
        } else {
          await Promise.allSettled(
            this.items.map(
              (item) =>
                new Promise((resolve) => {
                  const img = new Image()
                  img.src = this.imageKey ? item[this.imageKey] : item.src
                  img.onload = img.onerror = (e) => {
                    if (img.width > 0 && img.height > 0) {
                      item._height = img.height
                    }
                    resolve({ width: img.width, height: img.height })
                  }
                })
            )
          )
        }
      }
    },
    // 监听组件变化
    listenLayoutChanged() {
      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((ele) => {
          this.responsive()
        })
      })
      this.resizeObserver.observe(this.$el)
    },
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.resizeObserver && this.resizeObserver.disconnect()
  },
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
