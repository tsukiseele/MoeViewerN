<template lang="pug">
a.link(:href="to",target="_blank")
  slot
</template>

<script>
export default {
  props: {
    to: {
      type: [ String, Boolean ],
      default: null
    }
  }
};
</script>

<style lang="less" scoped></style>
