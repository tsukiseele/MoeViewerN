<template>
  <div class="about">
    <h1>This is an about page</h1>
    <ul>
      <li v-for="site in sites">{{ site.name}}</li>
    </ul>
  </div>
</template>

<script>
import native from '@/composables/native.js'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'subscribes',
  data: () => ({
    sites: []
  }),
  methods: {

  },
  async mounted() {
    setTimeout(async () => {
      this.sites = await native.getSiteList()
      // console.log(this.sites);
      this.sites.forEach(site => console.log(site))
      this.$forceUpdate()
    }, 3000);
  }
})
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
