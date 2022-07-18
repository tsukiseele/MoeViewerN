<template lang="pug">
#favorites
  div(style="font-size: 1rem; height: 2rem; line-height: 2rem;") 收藏夹
  ul.favorite-list
    li.favorite-list-item(v-for="item in favorites")
      img.item-cover(:src="item._src" width="200px")
      //- img.item-cover(:src="item._src" width="200px")
      span.item-title {{ item.title }}
</template>

<script lang="ts" setup>
import { useFavorites } from '../../stores/favorites'
import { NImage } from 'naive-ui';

const favorites = useFavorites().favorites

console.log(favorites);

</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
