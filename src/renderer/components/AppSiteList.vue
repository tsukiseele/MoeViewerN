<template lang="pug">
.site-list-wrap
  ul.site-list
    li.site-item(v-for="(site, index) in sites" :key="index" @click="$emit('click', site, index)")
      .item-content {{ index + 1  + ". " + site.name }}
</template>

<script>
export default {
  props: {
    sites: {
      type: Array,
      default: []
    }
  }
};
</script>

<style lang="less" scoped>
.site-list-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}
.site-list {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  .site-item {
    list-style: none;
    padding: 0.33rem;
    color: black;
    border: 1px solid rgba(192, 192, 224);
    transition: background 0.3s ease;
    font-family: Shizuku;
    &:hover {
      background: rgba(192, 192, 224);
    }
  }
}
</style>
