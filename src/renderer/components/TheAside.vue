<template lang="pug">
aside.aside
  ul
    li.material-icons-outlined(@click="$router.push('/')") dashboard
    li.material-icons-outlined(@click="$router.push('/favorites')") loyalty
    li.material-icons(@click="$router.push('/subscribes')") code
    li.material-icons(@click="$router.push('/settings')") tune
    li.material-icons(@click="$router.push('/download')") download
    li.material-icons(@click="$router.push('/about')") info
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  methods: {}
}
</script>

<style lang="less" scoped>
.aside {
  display: flex;
  width: 3rem;
  flex-direction: column;
  background: rgba(96, 96, 128, 1);
  height: calc(100vh - var(--frame-height));
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
    }
  }
}
</style>
