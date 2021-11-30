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

<style lang="less" scoped>
.app-image-preview {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    object-fit: contain;
  }
}
</style>