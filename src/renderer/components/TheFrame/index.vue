<template lang="pug">
.frame
  .frame-bar
    .frame-icon.mdi.mdi-alpha-m-box
    .frame-title MoeViewerN
    .frame-spacer
    .frame-btn.mdi.mdi-window-minimize(@click="onMinimize")
    .frame-btn.mdi.mdi-window-restore(@click="onMaximize")
    .frame-btn.mdi.mdi-window-close(@click="onClose")
  .frame-main
    slot
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  mounted() {
  },
  methods: {
    onMinimize() {
      window.eapi.app.minimize()
    },
    onMaximize() {
      window.eapi.app.maximize()
    },
    onClose() {
      window.eapi.app.close()
    },
  },
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
