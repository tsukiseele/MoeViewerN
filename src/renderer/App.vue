<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { NMessageProvider } from 'naive-ui';
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

.v-enter-active {
  transition: all 0.3s ease-out;
}

.v-leave-active {
  transition: none;
}

.v-enter-from,
.v-leave-to {
  transform: translateX(-10vh);
  opacity: 0;
}
// .v-enter-active,
// .v-leave-active {
//   transition: opacity 0.5s ease-out;
// }
// .v-enter-from,
// .v-leave-to {
//   opacity: 0;
// }
#container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;
  main#main {
    position: relative;
    flex: 1;
    width: 0;
    overflow: auto;
  }
}
</style>
