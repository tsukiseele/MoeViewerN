<template lang="pug">
aside.aside
  ul
    li.material-icons(v-for="link in links" :key="link.to" :class="{active: $route.path == link.to}" @click="$router.push(link.to)") {{ link.icon }}
</template>

<script lang="ts" >
import { defineComponent } from 'vue'

// interface Link {
//   to: string,
//   icon: string
// }

export default defineComponent({
  props: {
    links: []
    // links: {
    //   type: Link[],
    //   default: ''
    // },
  },
  methods: {},
})
</script>

<style lang="scss" scoped>
.aside {
  display: flex;
  flex: 0 0 3rem;
  width: 0;
  flex-direction: column;
  background: rgba(96, 96, 128, 1);
  overflow: hidden;
  ul {
    list-style: none;
    li {
      display: block;
      text-align: center;
      line-height: 3rem;
      margin-bottom: 0.5rem;
      font-size: 22px;
      cursor: pointer;
      user-select: none;
      color: var(--text);
      background-color: rgba(96, 96, 128, 1);
      transition: 0.25s;
      &:hover {
        filter: brightness(1.2);
      }
      &.active {
        filter: brightness(1.2);
      }
    }
  }
}
</style>
