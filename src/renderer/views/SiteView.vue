<template>
  <div id="sites">
    <!-- <h1>This is an about page</h1> -->
    <ul class="site-list">
      <li class="site-list-item" v-for="site in sites">
        <img class="site-icon" :src="site.icon" alt="" />
        <div class="site-info">
          <div class="site-name">{{ site.name }}</div>
          <div class="site-details">{{ site.details }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { invoke, invokeAsObject } from '@/electron'

export default defineComponent({
  name: 'subscribes',
  data: () => ({
    sites: [],
  }),
  methods: {},
  async mounted() {
    this.sites = await invoke('getSiteList')
    console.log(this.sites)
    // console.log(this.sites);
    this.sites.forEach((site) => console.log(site))
    this.$forceUpdate()
  },
})
</script>

<style lang="scss" scoped>
.site-list {
  width: 100%;
  .site-list-item {
    display: flex;
    // justify-content: center;
    align-items: center;
    width: 100%;
    height: 48px;
    padding: 0.5rem;
    background-color: rgba(255, 255, 255, 0.5);
    transition: 0.25s ease-out;
    cursor: pointer;
    &:hover {
      background-color: white;
    }
    .site-icon {
      width: 36px;
      height: 36px;
      object-fit: cover;
    }
    .site-info {
      margin-left: 1rem;
    }
  }
}
@media (min-width: 1024px) {
  #sites {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
