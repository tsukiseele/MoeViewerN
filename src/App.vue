<script setup>
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { NMessageProvider } from 'naive-ui'
import TheFrame from '@/components/TheFrame/index.vue'
import TheAside from '@/components/TheAside/index.vue'
</script>

<template lang="pug">
TheFrame
  NMessageProvider
    #container
      TheAside.aside
      main#main
        RouterView.content
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
