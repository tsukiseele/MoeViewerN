<template lang="pug">
#sites
  ul.site-list
    li.site-list-item(v-for="site in sites" @click="onItemClick(site)")
      img.site-icon(:src="site.icon" alt="")
      .site-info
        .site-name {{ site.name }}
        .site-details {{ site.details }}
        .site__btn-edit
  NModal(v-model:show="showModal")
    SSiteEditor(v-if="editItem" :data="editItem" @generated="onGenerated")
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { invoke, invokeAsObject, io } from '@/electron'
import { NModal } from 'naive-ui'
import SSiteEditor from '@/components/SSiteEditor/index.vue' 

export default defineComponent({
  name: 'subscribes',
  components: {
    NModal,
    SSiteEditor
  },
  data: () => ({
    sites: [] as Site[],
    showModal: false,
    editItem: null as Site | null
  }),
  methods: {
    onItemClick(site: Site) {
      this.editItem = site
      this.showModal = true
    },
    onGenerated(text: string) {
      window.eapi.app.writeClipboardText(text)
      window.$message.success('已导出到剪贴板')
    }
  },
  async mounted() {
    this.sites = await invoke('getSiteList')
    console.log(this.sites)
    this.$forceUpdate()
  },
})
</script>

<style lang="scss" scoped>
.site-list {
  width: 100%;
  .site-list-item {
    display: flex;
    // justify-content: center;
    align-items: center;
    width: 100%;
    height: 48px;
    padding: 0.5rem;
    background-color: rgba(255, 255, 255, 0.5);
    transition: 0.25s ease-out;
    cursor: pointer;
    &:hover {
      background-color: white;
    }
    .site-icon {
      width: 36px;
      height: 36px;
      object-fit: cover;
    }
    .site-info {
      margin-left: 1rem;
    }
  }
}
@media (min-width: 1024px) {
  #sites {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
