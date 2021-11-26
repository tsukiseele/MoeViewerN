<template lang="pug">
div
  AppDialog(v-model='show' title='提示')
  button(@click='send') 发送通知
</template>

<script>
// import AppDialog from "../components/AppDialog.vue"

export default {
  data: () => ({
    show: false
  }),
  methods: {
    send() {
      // this.$notify(`SEND: ${Date.now()}`)
      this.show = true
    }
  }
}
</script>

<style lang="scss" scoped></style>
