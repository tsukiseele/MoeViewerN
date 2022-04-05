<template lang="pug">
  .app-image-preview
    img(:src='src' @click="onClick")
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      default: null
    }
  },
  data: () => ({
    
  }),
  methods: {
    onClick() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>