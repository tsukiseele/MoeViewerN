<template lang="pug">
.s-input
  input(v-model="val" @input="onInput")
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    val: '',
  }),
  created() {
    this.val = this.value
  },
  methods: {
    onInput() {
      this.$emit('update:value', this.val)
    },
  },
}
</script>

<style lang="scss" scoped>
.s-input {
  padding: 0.5rem;
  font-family: Consolas, monospace;
  input {
    height: 2rem;
    transition: .25s ease-out;
  }
}
</style>
