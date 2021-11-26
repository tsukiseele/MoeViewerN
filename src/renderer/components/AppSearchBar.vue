<template lang="pug">
  .app-search-bar-wrap(v-show="visible" @click="$emit('change', false)")
    .app-search-bar(:class="classList")
      i.mdi.mdi-star
      input.app-search-input(@focus="onActive(true)" @blur="onActive(false)")
</template>

<script>
export default {
  model: { 
    prop: 'visible',
    event: 'change'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    classList: ""
  }),
  methods: {
    onActive(state) {
      this.classList = { active: state };
    }
  }
};
</script>
<style lang="scss" scoped>
.app-search-bar-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,.33);
}
.app-search-bar {
  position: absolute;
  display: flex;
  align-items: center;
  background-color: white;
  width: 80%;
  top: 20%;
  left: 10%;
  padding: 10px;
  box-shadow: 0 0 8px 2px rgba(0, 0, 0, 0.12);
  transition: 0.3s;
  
  &::before {
    content: "";
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
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    // border-radius: 5px;
    padding: 5px;
    overflow: hidden;
    transition: 0.3s;
  }
}
</style>
