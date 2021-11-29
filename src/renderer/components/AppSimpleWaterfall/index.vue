<template lang="pug">
  .simple-waterfall
    slot(name="header")
    .list
      .list-item(v-for="(item, index) in items" :key="index")
        img.list-item--image(:src="imageKey ? item[imageKey] : item.src")
        .list-item--title {{ item.title }}
          slot(:index='i', :item='item')
    slot(name="footer")
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    imageKey: {
      type: String,
      default: null
    },
    itemWidth: {
      type: Number,
      default: 250
    },
    gap: {
      type: Number,
      default: 20
    },
    evenly: {
      type: Boolean,
      default: false
    },
    column: {
      type: Number,
      default: null
    },
    height: {
      type: Number | String,
      default: null
    }
  },
  watch: {
    items() {
      await this.getImageSize()
      this.fall()
    }
  },
  methods: {
    // 获取滚动条的宽度
    getScrollbarWidth() {
      const oDiv = document.createElement('div')
      oDiv.style.cssText = `width: 50px; height: 50px; overflow: scroll;`
      document.body.appendChild(oDiv)
      const scrollbarWidth = oDiv.offsetWidth - oDiv.clientWidth
      oDiv.remove()
      return scrollbarWidth
    },
    fall() {
      // 获取当前页面的宽度 = window.innerWidth - 滚动条的宽度
      const pageWidth = window.innerWidth - this.getScrollbarWidth()
      // 若传入列数，则使用，否则自动计算：实际列数 = 页面宽度 / (图片宽度 + 间距)
      const column = this.column || Math.floor(pageWidth / (this.itemWidth + this.gap))
      // 若传入平均间距，则自动计算，否则使用传入的间距
      const realGap = this.evenly ? (pageWidth - this.itemWidth * column) / (column + 1) : this.gap
      // 若传入平均间距，则为0，否则自动计算
      const margin = this.evenly ? 0 : (pageWidth - (this.itemWidth + realGap) * column + realGap) / 2
      // 获取所有需要布局的项
      const itemEls = this.$el.querySelectorAll('.list-item')
      // 数组，保存最低高度
      const heightArr = []
      let top, left
      // 遍历并通过已知高度布局
      itemEls.forEach((itemEl, i) => {
        itemEl.style.width = this.itemWidth + 'px'
        itemEl.style.height = this.items[i]._height
        // 遍历所有的外层容器
        const height = itemEl.offsetHeight
        // 如果当前处在第一行
        if (i < column) {
          top = 0
          left = (this.itemWidth + realGap) * i + margin
          heightArr.push(height)
        } else {
          const minHeight = Math.min.apply(null, this.heightArr) // 最低高低
          const minIndex = this.heightArr.indexOf(minHeight) // 最低高度的索引
          // 通过最小值为当前元素设置top值，通过索引为当前元素设置left值。
          top = minHeight + realGap
          left = (this.itemWidth + realGap) * minIndex + margin
          // 并修改当前索引的高度为当前元素的高度
          heightArr[minIndex] = minHeight + realGap + height
        }
        itemEl.style.top = top
        itemEl.style.left = left
      })
    },
    async getImageSize() {
      const promiseArr = []
      this.items.forEach(image =>
        promiseArr.push(
          new Promise((resolve, reject) => {
            let timeout = 0
            const check = () => {
              const img = new Image()
              console.log('ImageKey: ', this.imageKey)
              img.src = this.imageKey ? image[this.imageKey] : image.src
              console.log(image)
              if (img.width > 0 && img.height > 0) {
                clearInterval(set)
                image._height = img.height
                resolve({ width: img.width, height: img.height })
              }
              if (timeout > 10000) {
                clearInterval(set)
                console.log('reject: ', img.width, img.height)
                reject()
              }
              timeout += 100
            }
            const set = setInterval(check, 100)
          })
        )
      )
      await Promise.allSettled(promiseArr)
    }
  },
  mounted() {
    this.$nextTick(async () => {
      await this.getImageSize()
      this.fall()
    })
  }
}
</script>

<style lang="scss" scoped>
.list {
  position: relative;
  // height: 100vh;
  .list-item {
    position: absolute;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
