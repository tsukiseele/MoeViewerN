<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDownloadStore } from './stores/download'
import { RouterView } from 'vue-router'
import { NMessageProvider } from 'naive-ui'
import TheFrame from '@/components/TheFrame/index.vue'
import TheAside from '@/components/TheAside/index.vue'
import { ipcRenderer } from './electron'
const links = [
  { to: '/', icon: 'dashboard' },
  { to: '/favorites', icon: 'loyalty' },
  { to: '/subscribes', icon: 'code' },
  { to: '/settings', icon: 'tune' },
  { to: '/download', icon: 'download' },
  { to: '/about', icon: 'info' },
]


// window.$message = useMessage()
console.log(window.eapi.ipcRenderer);
// console.log(window.eapi.on);
console.log(ipcRenderer);

// window.eapi.ipcRenderer.on('appExit', () => {
//   const store = useDownloadStore()
//   window.eapi.io.writeText(JSON.stringify(store.statusMap), 'download.json')
// })

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
