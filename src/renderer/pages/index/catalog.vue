<template lang="pug">
  #catalog
    //- AppWindow(class="window" v-model="isShowDialog")
    AppLayer(:title="image.title")
      div(:class="isLoaded ? 'list' : 'list-flow'")
        .list-item(v-for="(image, index) in images" :key="index")
          img.list-item--image(:src="image.sampleUrl || image.largerUrl || image.originUrl || image.coverUrl")
          .list-item--title {{ image.title }}
</template>

<script>
import Sakurawler from '@/libs/sakurawler'

export default {
  /**
  props: {
    image: {
      type: Object,
      default: {}
    }
  },*/
  data: () => ({
    images: [],
    isLoaded: false
  }),
  computed: {
    image() {
      return this.$route.params.image
    }
  },
  watch: {
    isShowDialog(newVal) {
      if (!newVal) {
        this.$router.go(-1)
      }
    }
  },
  methods: {
    // 定义瀑布流算法函数
    fall() {
      // 获取滚动条的宽度
      function getScrollbarWidth() {
        const oDiv = document.createElement('div') //创建一个div
        // 给div设置样式。随便定义宽高，只要能获取到滚动条就可以
        oDiv.style.cssText = `width: 50px;height: 50px;overflow: scroll;`
        document.body.appendChild(oDiv) //把div添加到body中
        const scrollbarWidth = oDiv.offsetWidth - oDiv.clientWidth // 使最大宽度和可视宽度相减，获得到滚动条宽度。
        oDiv.remove() //移除创建的div
        return scrollbarWidth //返回滚动条宽度
      }
      const minGap = 20 // 最小间距，让每一列的最小空隙可以自定义，避免太过拥挤的情况发生。但是，会通过计算得到真实的间距。
      const itemWidth = 250 // 每一项的宽度，即当前每一个图片容器的宽度。保证每一列都是等宽不等高的。
      const scrollBarWidth = getScrollbarWidth() // 获取滚动条的宽度
      const pageWidth = window.innerWidth - scrollBarWidth // 获取当前页面的宽度 = window.innerWidth - 滚动条的宽度
      const column = Math.floor(pageWidth / (itemWidth + minGap)) // 实际列数=页面宽度/(图片宽度+最小间距)
      // const gap = (pageWidth - itemWidth * column) / (column + 1) // 计算真实间距 = (页面宽度- 图片宽度*实际列数)/实际列数/2
      const items = document.querySelectorAll('#catalog .list-item') // 获取所有的外层元素
      const heightArr = [] // 定义一个空数组，保存最低高度。

      const margin = (pageWidth - (itemWidth + minGap) * column) / 2

      // console.log('ITEMS: ', items)
      for (let i = 0; i < items.length; i++) {
        items[i].style.width = itemWidth + 'px'
        items[i].style.height = this.images[i]._height
        // 遍历所有的外层容器
        const height = items[i].offsetHeight
        // 如果当前处在第一行
        if (i < column) {
          // 直接设置元素距离上部的位置和距离左边的距离。
          // items[i].style.top = `${gap}px`
          items[i].style.top = 0
          // items[i].style.left = `${(itemWidth + gap) * i + gap}px`
          items[i].style.left = `${(itemWidth + minGap) * i + margin}px`
          
          // 保存当前元素的高度。
          heightArr.push(height)
        } else {
          // 不是第一行的话，就进行比对。
          let minHeight = heightArr[0] // 先保存第一项的高度
          let minIndex = 0 // 保存第一项的索引值
          for (let j = 0; j < heightArr.length; j++) {
            // 通过循环遍历比对，拿到最小值和最小值的索引。
            if (minHeight > heightArr[j]) {
              minHeight = heightArr[j]
              minIndex = j
            }
          }
          // 通过最小值为当前元素设置top值，通过索引为当前元素设置left值。
          // items[i].style.top = `${minHeight + gap * 2}px`
          items[i].style.top = `${minHeight + minGap}px`
          // items[i].style.left = `${(itemWidth + gap) * minIndex + gap}px`
          items[i].style.left = `${(itemWidth + minGap) * minIndex + margin}px`
          // 并修改当前索引的高度为当前元素的高度
          heightArr[minIndex] = minHeight + minGap + height
        }
      }
    },
    async getImageSize() {
      console.log(this.images)
      const promiseArr = []
      for (const [index, image] of this.images.entries()) {
        // 改变图片的src
        promiseArr.push(
          new Promise((resolve, reject) => {
            let timeout = 0
            const check = function() {
              const img = new Image()
              img.src = image.sampleUrl || image.largerUrl || image.originUrl || image.coverUrl
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
      }
      await Promise.allSettled(promiseArr)
      const heights = []
      this.images.forEach(item => heights.push(item._height))
      console.log('IMAGES_HEIGHT: ', heights)
    }
  },
  async mounted() {
    if (!this.image) this.$router.push('/')
    if (this.image.$children) {
      try {
        this.images = await new Sakurawler(this.image.spider.site, this.image.spider.page, this.image.spider.keywords).parseNext(this.image)
        if (this.images) {
          for (const img of this.images) {
            for (const k of Object.keys(this.image)) {
              if (!img[k]) img[k] = this.image[k]
            }
          }
          console.log(this.images)
        }
      } catch (error) {
        console.log(error)
      }
    } else {
      this.images.push(this.image)
    }

    await this.getImageSize()

    this.isLoaded = true
    this.$nextTick(() => {
      this.fall()
    })

    window.addEventListener('resize', () => {
      this.fall()
    })
  }
}
</script>

<style lang="less" scoped>
.list-flow {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: flex-end;
  .list-item {
    padding: 0.5rem;
    transition: all 0.3s ease;
    width: 250px;
    .list-item--image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: 0.3s ease;
    }
  }
}
.list {
  position: relative;
  width: 100%;
  margin: 0 auto;
  .list-item {
    position: absolute;
    overflow: hidden;
    transition: left 0.3s, top 0.3s;
    .list-item--image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .list-item--title {
      padding: 8px 0;
    }
  }
}
@keyframes fade {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
