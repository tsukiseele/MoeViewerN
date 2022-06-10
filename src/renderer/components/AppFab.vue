<template lang="pug">
//- 浮动按钮
.floating-btn(@click="$emit('click')")
  .search-icon.mdi.mdi-magnify
</template>

<script>

export default {
  
}
</script>

<style lang='scss' scoped>
.floating-btn {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 2rem;
  bottom: 2rem;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  background: rgba(192, 192, 255, 1);
  transition: box-shadow 0.3s ease;
  cursor: pointer;
  user-select: none;
  &:hover {
    box-shadow: 0 2px 16px rgba(0, 0, 32, 0.33);
  }
  .search-icon {
    font-size: 1.8rem;
  }
}
</style>