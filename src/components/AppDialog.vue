<template lang="pug">
div
  transition(name="fade" mode="out-in")
    .dialog-modal(v-if="!isFirstActivation" v-show="show" @click="onClose")
  transition(name="zoom")
    .dialog-wrap(v-if="!isFirstActivation" v-show="show")
      .dialog(:style="{'width': typeof width === 'number' ? width + 'px' : width, 'height': typeof height === 'number' ? height + 'px' : height }")
        .dialog-title(v-if="title") {{ title }}
        .dialog-content
          slot
</template>

<script>
export default {
  model: {
    prop: 'show',
    event: 'change'
  },
  props: {
    width: {
      type: String | Number,
      default: '60vw'
    },
    height: {
      type: String | Number,
      default: '60vh'
    },
    title: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: null
    }
  },
  watch: {
    show(newVal) {
      if (this.isFirstActivation) this.isFirstActivation = false
    }
  },
  data: () => ({
    isFirstActivation: true
  }),
  methods: {
    onClose() {
      this.$emit('change', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-modal {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
  perspective: 1000px;
  background-color: rgba(0, 0, 0, 0.33);
}
.dialog-wrap {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
  pointer-events: none;
  .dialog {
    padding: 1rem;
    background: rgba(216, 216, 255, 1);
    border-radius: 0.33rem;
    display: flex;
    flex-direction: column;
    pointer-events: all;
    .dialog-title {
      font-size: 1.2rem;
      padding-bottom: 1rem;
    }
    .dialog-content {
      flex: 1;
      background-color: rgba(224, 224, 255, 1);
      padding: 1rem;
    }
  }
}
.zoom-enter-active {
  transition: 0.3s ease-out;
}
.zoom-leave-active {
  transition: 0.2s ease-in;
}
.zoom-enter,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
