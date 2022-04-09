<template lang="pug">
SLayer(:show="show" @update:show="$emit('update:show', nv)")
  NResult(status="404" title="资源未找到" description="可能因素：目标未命中，网络不可用，防火墙拦截（尤其是在中国大陆）")
  template(#footer)
    NButton(@click="onSearch") 重新加载
</template>

<script>
import { defineComponent } from '@vue/runtime-core'
import SLayer from '@/components/SLayer/index.vue'
import { NButton, NResult } from 'naive-ui'

export default defineComponent({
  components: {
    SLayer,
    NButton,
    NResult,
  },
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:show'],
  data: () => ({}),
  async mounted() {
  },
})
</script>

<style></style>
