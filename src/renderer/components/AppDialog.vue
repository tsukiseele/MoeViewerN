<template lang="pug">
.dialog-wrap(v-if="show" @click="onHide" )
  .dialog(@click.stop :style="{'width': typeof width === 'number' ? width + 'px' : width, 'height': typeof height === 'number' ? height + 'px' : height }")
    .dialog-title {{ title }}
    .dialog-content {{ content }}
</template>

<script>
export default {
  props: {
    width: {
      type: String | Number,
      default: '50vw'
    },
    height: {
      type: String | Number,
      default: '50vw'
    },
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: false
    },
    show: {
      type: Boolean,
      default: null
    },
    onHide: {
      type: Function,
      default: null
    }
  }
}
</script>

<style lang="less" scoped>
.dialog-wrap {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  z-index: 99;
  .dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    padding: 1rem;
    transform: translate(-50%, -50%);
    background: rgba(216, 216, 255, 1);
    border-radius: 0.33rem;
    animation: identifier 0.3s;
    display: flex;
    flex-direction: column;
    .dialog-title {
      font-size: 1.5rem;
      padding-bottom: 1rem;
    }
    .dialog-content {
      flex: 1;
      background-color: rgba(224, 224, 255, 1);
      padding: 1rem;
    }
  }
}

@keyframes identifier {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
