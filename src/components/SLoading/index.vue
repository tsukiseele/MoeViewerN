<template lang="pug">
transition(name="fade")
  .s-loading(v-if="show")
    .line(v-if="type == 'line'")

    .spinner-modal(v-else)
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
    },
    type: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
