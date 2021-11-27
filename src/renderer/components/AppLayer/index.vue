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

<style lang="less" scoped>
.layer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  .layer-nav {
    display: flex;
    align-items: center;
    height: 3rem;
    padding: 0 1rem;
    .layer-title {
      flex: 1;
    }
    .layer-close {
      padding: 0.5rem;
      text-align: center;
      transition: 0.2s;
      cursor: pointer;
      user-select: none;
      border-radius: 50%;
      font-size: 1.8rem;
      &:hover {
        background-color: rgba(128, 128, 128, 0.3);
      }
    }
  }
  .layer-content {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
}

.fade-up-enter-active {
  transition: 0.2s ease-out;
}
.fade-up-leave-active {
  transition: 0.2s ease-in;
}
.fade-up-enter,
.fade-up-leave-to {
  transform: translateY(100%);
}
</style>
