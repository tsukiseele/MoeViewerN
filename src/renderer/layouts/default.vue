<template lang="pug">
#app(data-app="true")
  TheFrame
    #container
      TheAside
      main
        nuxt(:keep-alive="true")
</template>

<script>
import * as SiteLoader from '@/libs/site-loader'
import TheFrame from '@/components/TheFrame.vue'
import TheAside from '@/components/TheAside.vue'

export default {
  components: {
    TheFrame,
    TheAside
  },
  computed: {
    sites() {
      return this.$store.state.sites
    }
  },
  async created() {
    if (!this.sites) {
      const sites = await SiteLoader.loadSites('./static/rules/')
      this.$store.commit('sites', sites)
    }
  },
  mounted() {
    document.addEventListener('keydown', event => {
      switch (event.key) {
        case 'Escape':
          console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
          console.log(this.$route, ' ======> ');
          this.$router.go(-1)
          
          console.log(this.$route);
          break

        default:
          break
      }
    })
  },
  beforeDestroy() {},
  methods: {
    onKeyDown() {}
  }
}
</script>

<style lang="less" scoped>
#app {
  user-select: none;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow: hidden;
  // background: var(--bg);
  #container {
    display: flex;
    flex: 1;
    main {
      flex: 1;
      max-height: calc(100vh - var(--frame-height));
      overflow: auto;
    }
  }
}
</style>
