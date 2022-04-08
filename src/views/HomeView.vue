<script setup>
import { onMounted, ref, watch, reactive } from 'vue'
import PLimit from 'p-limit'
import { Base64 } from 'js-base64';
import AppSimpleWaterfall from '@/components/AppSimpleWaterfall/index.vue'
import AppLoading from '@/components/AppLoading/index.vue'
import SInput from '@/components/SInput/index.vue'
import placeholder from '@/assets/images/placeholder.webp'

const results = ref(() => [])
const keywords = ref('')
const currentSiteId = ref(() => ({}))
const page = ref(1)
const query = ref({
  page: 1,
  keywords: 'namori',
  siteId: 923,
})
const sites = ref(() => [])
const currentSite = ref(() => ({}))
const isLoaded = ref(false)

onMounted(async () => {
  sites.value = await $native.getSiteList()
  currentSiteId.value = sites && sites.value.length ? sites.value[25].id : 923
  currentSite.value = sites && sites.value.length ? sites.value[25] : null
  query.value.siteId = currentSiteId.value
  results.value = await $native.load({ ...query.value })
})

function onLoaded() {
  isLoaded.value = true
}

async function onSearch() {
  if (currentSiteId != query.value.siteId || keywords.value != query.value.keywords) {
    isLoaded.value = false
    query.value.keywords = keywords.value
    query.value.siteId = currentSiteId.value
    currentSite.value = sites.value.find((site) => site.id == query.value.siteId)
    results.value = await $native.load({ ...query.value })
  }
}
const base64ToBlob = (base64, type) => {
  return new Blob([Base64.toUint8Array(base64)], { type: type })
}
async function getImageSize(src) {
  const img = new Image()
  img.src = src
  return await new Promise((resolve, reject) => {
    try {
      img.onload = img.onerror = (e) => resolve({ width: img.width, height: img.height })
    } catch (error) {
      reject(error)
    }
  })
}
async function handleImage(items) {
  if (this.items && this.items.length) {
    const pLimit = PLimit(10)
    const success = await Promise.allSettled(
      this.items.map((item) =>
        pLimit(async (item) => {
          const { data, type } = await $native.request(JSON.stringify({ url: item.coverUrl, options: { headers: currentSite.value.headers, timeout: 5000 } }))
          const src = URL.createObjectURL(base64ToBlob(data, type))
          item._src = src
          const { width, height } = getImageSize(src)
          // if (width > 0 && height > 0) {
          //   item._height = height
          // }
        }, item)
      )
    )
    return success
  }
}
</script>

<template lang="pug">
#home
  header
    select(v-model="currentSiteId") 
      option(v-for="site in sites" :key="site.name" :value="site.id") {{ site.name }}
    SInput(v-model:value="keywords")
    i.mdi.mdi-magnify(@click="onSearch" ) 
  main
    AppSimpleWaterfall(v-show="isLoaded && results && results.length" :items="results" :handleImage="handleImage" image-key="coverUrl" :item-width="200" @loaded="onLoaded" @loading="isLoaded = false")
      template(v-slot="{item, index}")
        .list-item(v-if="item")
          img.item-image(:src="item._src || placeholder")
          .item-title {{ item.title }}
    AppLoading(:show="!isLoaded")
    h1.no-data(v-show="isLoaded && (!results || !results.length)") 没有数据
</template>

<style lang="scss" scoped>
#home {
  // background-color: aliceblue;
  height: 100%;
  display: flex;
  flex-direction: column;
  header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 3rem;
    i {
      text-align: center;
      vertical-align: middle;
      margin: 0 0.5rem;
      border-radius: 50%;
      height: 2.5rem;
      width: 2.5rem;
      transition: 0.25s ease-out;
      border: 1px solid transparent;
      cursor: pointer;
      user-select: none;
      font-size: 2rem;
      &:hover {
        color: teal;
        border: 1px solid teal;
        background-color: rgba(255, 255, 255, 0.67);
      }
    }
  }
  // padding: 1rem;
  main {
    flex: 1;
    height: 0;
    overflow: auto;
    padding: 1rem 0;
  }
  .list-item {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.12);
    background-color: whitesmoke;
    .item-title {
      padding: 0.5rem;
    }
  }
  header {
  }
}
</style>
