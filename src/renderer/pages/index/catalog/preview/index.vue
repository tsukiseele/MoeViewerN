<template lang="pug">
  AppLayer(:title="image.title")
    AppImagePreview(:src='image.src')
</template>

<script>
export default {
  data: () => ({
    
  }),
  computed: {
    image() {
      return this.$route.params.image
    }
  },
  methods: {
    
  }
}
</script>

<style lang='less' scoped>

</style>
