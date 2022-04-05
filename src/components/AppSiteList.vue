<template lang="pug">
.site-list-wrap
  ul.site-list
    li.site-item(v-for="(site, index) in sites" :key="index" @click="onItemClick(site, index)" :class='{active: activeItem.name == site.name}')
      .site-item-icon(:class='{ error: site._error }')
        div.error(v-if='site._error') {{ site.name.slice(0, 1) }}
        img(v-else='' :src='site.icon' @error='site._error = true' alt='')
      .site-item-content {{ site.name }}
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

<style lang="scss" scoped>
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
    display: flex;
    height: 2rem;
    line-height: 2rem;
    list-style: none;
    color: black;
    border-bottom: 1px solid rgba(192, 192, 224, 1);
    transition: background 0.2s ease;
    font-family: Shizuku;
    cursor: pointer;
    user-select: none;
    font-size: 1rem;
    .site-item-icon {
      width: 2rem;
      height: 100%;
      font-size: 1.3rem;

      .error {
        color: rgba(48, 48, 96, 1);
        line-height: 2rem;
        text-align: center;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        padding: .2rem;
      }
    }
    .site-item-content {
      padding-left: .5rem;
    }
    &:hover {
      background-color: rgba(192, 192, 224, .67);
    }
    &.active {
      background-color: rgba(192, 192, 224, 1);
    }
  }
}
</style>
