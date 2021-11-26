<template lang="pug">
div
  .app-search-bar-wrap(v-show="visible" @click="$emit('close', false)")
  transition(name="drop")
    .app-search-bar(v-show="visible" :class="{ active: isActive }")
      input.app-search-input(v-model="inputValue" @focus="isActive = true" @blur="isActive = false")
      i.material-icons(@click="onSubmit") search
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    }
  },
  watch: {
    inputValue(newVal) {
      this.$emit("input", newVal)
    },
    value(newVal) {
      this.inputValue = newVal
    }
  },
  data: () => ({
    inputValue: '',
    isActive: ''
  }),
  methods: {
    onSubmit() {
      this.$emit('submit')
    }
  }
}
</script>
<style lang="scss" scoped>
.app-search-bar-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.app-search-bar {
  position: absolute;
  width: 20rem;
  top: 0%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  background-color: white;
  padding: 0.5rem 1rem;
  box-shadow: 0 0 8px 2px rgba(0, 0, 0, 0.12);
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background-color: teal;
    transition: 0.3s ease;
  }
  &.active {
    &::before {
      left: 0;
      width: 100%;
    }
  }
  .app-search-input {
    outline: none;
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 100%;
    line-height: 2.4rem;
    height: 2.4rem;
    overflow: hidden;
    transition: 0.3s;
  }
  i {
    cursor: pointer;
    user-select: none;
    padding: 0.5rem;
    transition: 0.2s;
    border-radius: 50%;
    &:hover {
      background-color: rgba(128, 128, 128, 0.33);
    }
  }
}

.drop-enter-active {
  transition: 0.3s ease-out;
}
.drop-leave-active {
  transition: 0.2s ease-in;
}
.drop-enter,
.drop-leave-to {
  transform: translateX(-50%) translateY(-100%);
  opacity: 0;
}
</style>
