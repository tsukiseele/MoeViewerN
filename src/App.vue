<script setup>
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { NMessageProvider } from 'naive-ui'
import TheFrame from '@/components/TheFrame/index.vue'
</script>

<template lang="pug">
TheFrame
  NMessageProvider
    RouterView
</template>

<style lang="scss" scoped>

</style>
