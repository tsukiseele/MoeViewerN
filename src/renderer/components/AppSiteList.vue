<template lang="pug">
.site-list-wrap
  ul.site-list
    li.site-item(v-for="(site, index) in sites" :key="index" @click="onItemClick(site, index)" :class='{active: activeItem.name == site.name}')
      .item-content {{ index + 1  + ". " + site.name }}
</template>

<script>
export default {
  props: {
    sites: {
      type: Array,
      default: []
    },
  },
  data: () => ({
    activeItem: {}
  }),
  methods: {
    onItemClick(site, index) {
      this.activeItem = site
      this.$emit('itemClick', site, index)
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
    border-bottom: 1px solid rgba(192, 192, 224, 1);
    transition: background 0.3s ease;
    font-family: Shizuku;
    cursor: pointer;
    user-select: none;
    &:hover {
      background-color: rgba(192, 192, 224, .67);
    }
    &.active {
      background-color: rgba(192, 192, 224, 1);
    }
  }
}
</style>
