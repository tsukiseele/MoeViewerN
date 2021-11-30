<template lang="pug">
  transition(name="fade")
    .spinner-modal(v-if="show")
      .spinner
        .rect1
        .rect2
        .rect3
        .rect4
        .rect5
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
