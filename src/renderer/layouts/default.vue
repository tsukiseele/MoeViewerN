<template lang="pug">
#app(data-app="true")
  TheFrame
    #container
      TheAside
      main
        nuxt
</template>

<script>
import * as SiteLoader from "@/libs/site-loader";
import TheFrame from "@/components/TheFrame.vue";
import TheAside from "@/components/TheAside.vue";

export default {
  components: {
    TheFrame,
    TheAside
  },
  computed: {
    sites() {
      return this.$store.state.sites;
    }
  },
  async created() {
    if (!this.sites) {
      const sites = await SiteLoader.loadSites("./static/rules/");
      this.$store.commit("sites", sites);
    }
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
    }
  }
}
</style>