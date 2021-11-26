<template lang='pug'>
  div
    section
      span License: MIT
    section
      a(href="#" @click.prevent="openExternalLink('https://github.com/tsukiseele')") Github
</template>

<script>
import {shell} from 'electron' 
  export default {
    methods: {
      openExternalLink(url) {
        // e.preventDefault()
        shell.openExternal(url)
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>