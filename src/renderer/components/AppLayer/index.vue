<template lang="pug">
transition(name="fade-up")
  .layer(v-show="isShow")
    .layer-nav
      .layer-title {{ title }}
      i.layer-close.material-icons(@click="onClose") close
    .layer-content
      slot
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    isShow: false
  }),
  methods: {
    onClose() {
      this.isShow = false
      this.$router.go(-1)
    }
  },
  mounted() {
    this.isShow = true
  }
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
