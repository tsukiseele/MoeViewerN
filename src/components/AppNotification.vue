<template lang="pug">
.notification
  template(v-for="notification in notificationQueue")
    .notification-item(:key='notification.timestamp' :class="notification.show ? 'notification-content-show': 'notification-content-hide'")
      .notification-content {{ notification.message }}
</template>

<script>
export default {
  name: "app-notification",
  // 使用 show 替换 value 参数，使用 change() 替换 input()
  model: {
    event: "change",
    prop: "show"
  },
  props: {
    timeout: {
      type: Number,
      default: 3000
    }
  },
  data: () => ({
    notificationQueue: [],
  }),
  methods: {
    send(message) {
      const timer = setTimeout(() => {
        const item = this.notificationQueue.find(item => item.show);
        item.show = false;
        clearTimeout(item.timer);
        item.timer = setTimeout(() => {
          clearTimeout(this.notificationQueue.shift().timer);
        }, 1000);
      }, this.timeout);
      this.notificationQueue.push({
        timestamp: Date.now(),
        message: message,
        show: true,
        timer: timer
      });
    }
  },
  created() {}
};
</script>

<style lang="scss" scoped>
.notification {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  .notification-item {
    position: relative;
    height: 3rem;
    width: 100%;
    margin: 1rem 0;
    border-radius: 0.33rem;
    transition: 0.3s ease;
    display: block;
    z-index: 9;
    .notification-content {
      color: white;
      background-color: rgba(48, 48, 64, 1);
      padding: 1rem;
      border-radius: 5px;
      box-shadow: 0 0 8px 2px rgba(0, 0, 0, 0.12);
    }
    &.notification-content-show {
      animation: fadeIn 0.3s ease;
    }
    &.notification-content-hide {
      height: 0;
      margin: 0;
      opacity: 0;
      transform: translateY(-100%);
    }
  }
}

@keyframes fadeIn {
  0% {
    transform: translateY(10rem);
    opacity: 0;
  }
  100% {
    transform: translateY(0rem);
    opacity: 1;
  }
}
</style>
