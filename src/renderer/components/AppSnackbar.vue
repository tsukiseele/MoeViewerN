<template lang="pug">
.snackbar-wrap(:class="{ 'snackbar-show': show }")
  .snackbar {{ message }}
</template>

<script>
export default {
  name: "app-snackbar",
  // 使用 show 替换 value 参数，使用 change() 替换 input()
  model: {
    event: "change",
    prop: "show"
  },

  props: {
    value: Boolean,
    message: String,
    timeout: { type: Number, default: 3000 }
  },

  methods: {
    send() {
      this.$emit("change");
    }
  },
  watch: {
    // 监听 show 变化，等待 timeout 后通知关闭
    showChange(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.send(false);
        }, this.timeout);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.snackbar-wrap {
  position: fixed;
  bottom: -5rem;
  height: 3rem;
  width: 30vw;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 0.33rem;
  background-color: pink;
  transition: 0.3s ease;

  &.snackbar-show {
    bottom: 2rem;
  }
}
</style>
