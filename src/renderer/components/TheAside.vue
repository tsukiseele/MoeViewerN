<template lang="pug">
aside.aside
  ul
    //- li.mdi.mdi-home(@click="$router.push('/')")
    li.mdi.mdi-image-multiple(@click="$router.push('/')")
    //- li.mdi.mdi-view-dashboard(@click="$router.push('/gallery')")
    li.mdi.mdi-star(@click="$router.push('/favorites')")
    li.mdi.mdi-package-variant-closed(@click="$router.push('/subscribes')")
    li.mdi.mdi-cog(@click="$router.push('/settings')")
    li.mdi.mdi-power(@click="onExit")
</template>
 
<script>
import { ipcRenderer } from "electron";

export default {
  methods: {
    onExit() {
      ipcRenderer.send("window-close");
    }
  }
};
</script>

<style lang="less" scoped>
.aside {
  display: flex;
  width: 3rem;
  flex-direction: column;
  background: rgba(96, 96, 128, 1);
  height: calc(100vh - var(--frame-height));
  li {
    color: var(--text);
    list-style: none;
    display: block;
    padding: 1rem;
    cursor: pointer;
    background-color: rgba(96, 96, 128, 1);
    transition: 0.2s;
    // border-radius: .33rem;
    &:hover {
      filter: brightness(1.2);
    }
  }
}
</style>
