<template lang="pug">
  keep-alive
    #catalog
      AppLayer(:title="image.title")
        AppSimpleWaterfall(:items="images" @loaded="onLoaded" @click="onItemClick")
          template(v-slot="{ image }")
            span test
        AppLoading(:show="!isLoaded")
      nuxt-child
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
    image: {},
    images: [],
    isLoaded: false
  }),
  watch: {
    isShowDialog(newVal) {
      if (!newVal) {
        this.$router.go(-1)
      }
    }
  },
  methods: {
    onLoaded() {
      this.isLoaded = true
    },
    onItemClick(item) {
      this.saveStatus()
      this.$router.push({
        name: 'index-catalog-preview',
        params: { image: item }
      })
    },
    saveStatus() {
      if (this.image) {
        localStorage.setItem(this.$route.name, JSON.stringify(this.image))
      }
    }
  },
  async mounted() {
    this.image = this.$route.params.image || JSON.parse(localStorage.getItem(this.$route.name))
    if (!this.image) {
      this.$router.go(-1)
      return
    }
    if (this.image.$children) {
      try {
        this.images = await new Sakurawler(this.image.spider.site, this.image.spider.page, this.image.spider.keywords).parseNext(this.image)
        if (this.images) {
          this.images.forEach(item => {
            Object.entries(this.image).forEach(([key, value]) => (!item[key] ? (item[key] = value) : null))
            item.src = item.sampleUrl || item.largerUrl || item.originUrl || item.coverUrl
          })
          console.log(this.images)
        }
      } catch (error) {
        console.log(error)
      }
    } else {
      this.images.push(this.image)
    }
  }
}
</script>
