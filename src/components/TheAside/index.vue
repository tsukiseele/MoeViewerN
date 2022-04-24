<template lang="pug">
aside.aside
  ul
    li.material-icons(@click="$router.push('/')") dashboard
    li.material-icons(@click="$router.push('/favorites')") loyalty
    li.material-icons(@click="$router.push('/subscribes')") code
    li.material-icons(@click="$router.push('/settings')") tune
    li.material-icons(@click="$router.push('/download')") download
    li.material-icons(@click="$router.push('/about')") info
  
</template>

<script>
export default {
  methods: {}
}
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
    }
  }
}
</style>
