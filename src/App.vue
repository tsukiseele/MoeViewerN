<script setup>
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { NMessageProvider } from 'naive-ui'
import TheFrame from '@/components/TheFrame/index.vue'
import TheAside from '@/components/TheAside/index.vue'

const links = [
  { to: '/', icon: 'dashboard' },
  { to: '/favorites', icon: 'loyalty' },
  { to: '/subscribes', icon: 'code' },
  { to: '/settings', icon: 'tune' },
  { to: '/download', icon: 'download' },
  { to: '/about', icon: 'info' },
]
</script>

<template lang="pug">
TheFrame
  NMessageProvider
    #container
      TheAside.aside(:links="links")
      main#main
        RouterView(v-slot="{ Component }")
          Transition
            KeepAlive
              component(:is="Component")
</template>

<style lang="scss" scoped>
#container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;
  main#main {
    flex: 1;
    width: 0;
    overflow: auto;
  }
}
</style>
