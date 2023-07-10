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
    items: { type: Array, default: () => [] },
    loadedCount: { type: Number, default: 0 },
    imageKey: { type: String, default: null },
    itemWidth: { type: Number, default: 250 },
    gap: { type: Number, default: 20 },
    evenly: { type: Boolean, default: false },
    maxColumn: { type: Number, default: null },
    height: { type: Number | String, default: null },
  },
  emits: ['loading', 'loaded', 'scroll-bottom'],
  data: () => ({
    column: 0,
    resizeObserver: null,
    timer: null,
    heightArr: [],
  }),
  watch: {
    'items.length': {
      handler(nv, ov) {
        console.log(ov, ' => ', nv);
        if (ov && nv) {
          this.responsive(ov.length)
        } else {
          this.responsive()
        }
      },
    },
    loadedCount(nv, ov) {
      this.responsive()
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
        this.responsive()
      })
    },
    onScroll(e) {
      requestAnimationFrame(() => {
        const { scrollTop, offsetHeight, scrollHeight } = e.target
        const visibleTop = scrollTop;
        const visibleBottom = scrollTop + offsetHeight;
        if (scrollHeight - visibleBottom < 16) {
          this.$emit('scroll-bottom')
        }
        // const allItems = Array.from(this.$el.querySelectorAll('.waterfall--list-item'))
        // allItems.forEach(item => {
        //   if (item.offsetTop + item.offsetHeight - 300 < visibleTop/* || item.offsetTop + 300 > visibleBottom*/) {
        //     item.style.display = 'none'
        //   } else {
        //     item.style.display = 'flex'
        //   }
        // })
      })
    },
    responsive(offset = 0) {
      if (this.timer) return
      this.timer = setTimeout(() => {
        clearTimeout(this.timer)
        this.timer = null
        this.fall(Array.from(this.$el.querySelectorAll('.waterfall--list-item')).slice(offset))
      }, 1000)
    },
    fall(itemEls) {
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
      // const itemEls = this.$el.querySelectorAll('.waterfall--list-item')
      // 数组，保存最低高度
      const heightArr = []
      // 保存偏移量
      let top, left
      // 遍历并通过已知高度布局
      itemEls.forEach((itemEl, i) => {
        itemEl.style.width = this.itemWidth + 'px'
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
        if (itemEl.style.transform) {
          itemEl.style.transition = `transform cubic-bezier(0.075, 0.82, 0.165, 1) .1s, opacity .2s ease`
        }
        itemEl.style.top = top + 'px'
        itemEl.style.left = left + 'px'    
        // itemEl.style.transform = `translate3d(${left}px, ${top}px, 0)`
        itemEl.style.opacity = 1
      })
      container.style.height = this.height ? this.height : Math.max(...heightArr) + 'px'
      // Check container full
      if (this.$el.offsetHeight > container.offsetHeight) {
        this.$emit('scroll-bottom')
      }
    },
    // 监听组件变化
    listenLayoutChanged() {
      this.resizeObserver = new ResizeObserver((entries) => {
        // entries.forEach((ele) => {
        entries && entries.length && this.responsive()
        // })
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
