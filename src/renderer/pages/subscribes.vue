<template lang="pug">
.subscribe-wrap
  ul.subscribes
    transition-group(name="list" tag="div")
      li.subscribe(v-for='site in availableSites' :key='site.name' @click="onItemClick(site)")
        .subscribe-icon(:class='{ error: site._error }')
          div(v-if='site._error') {{ site.name.slice(0, 1) }}
          img(v-else='' :src='site.icon' @error='site._error = true' alt='')
        .subscribe-info
          span  {{ site.name }} 
          span  {{ site.details }}
  AppDialog(v-model="show" :title='activeSite.name')
    span {{ activeSite.details }}
</template>

<script>
import { remote } from 'electron'

export default {
  components: {},
  data() {
    return {
      show: false,
      activeSite: {},
      availableSites: []
    }
  },
  watch: {
    sites(newVal) {
      this.availableSites = newVal
    }
  },
  computed: {
    sites() {
      return this.$store.state.sites
    }
  },
  methods: {
    onItemClick(site) {
      this.activeSite = site
    },
    async animated() {
      const waitTime = 500 / this.sites.length
      for (const site of this.sites) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
        this.availableSites.push(site)
      }
    }
  },
  mounted() {
    this.animated()
  }
}
</script>

<style lang="less" scoped>
.subscribe-wrap {
  // height: 100vh;
  // height: 100%;
  // overflow-y: scroll;
  // overflow-x: hidden;
}
.subscribes {
  display: flex;
  flex-direction: column;
  .list-enter {
    opacity: 0;
    transform: translateX(-2rem);
  }
  .list-enter-active,
  .list-leave-active {
    transition: 0.3s;
  }
  .list-leave-to {
    opacity: 0;
    transform: translateX(2rem);
  }
  .subscribe {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    transition: 0.2s;
    cursor: pointer;
    .subscribe-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background-color: var(--bg);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      &.error {
        img {
          display: none;
        }
        font-size: 32px;
      }
    }
    .subscribe-info {
      display: flex;
      flex-direction: column;
      padding-left: 0.5rem;
    }
    &:hover {
      background-color: rgba(224, 224, 224, 1);
    }
  }
}
</style>
