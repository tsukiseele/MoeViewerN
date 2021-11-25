<template>
  <div>
    <button @click="send">发送通知</button>
  </div>
</template>

<script>
export default {
  methods: {
    send() {
      // this.$refs.notify.send(`SEND: ${Date.now()}`);
      this.$notify("xxxxxxxxxxxxxxxxxxx")
    }
  }
};
</script>

<style lang="scss" scoped></style>
