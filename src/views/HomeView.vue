<script setup>
import { onMounted, ref, watch, reactive } from 'vue'
import AppSimpleWaterfall from '@/components/AppSimpleWaterfall/index.vue'
import AppLoading from '@/components/AppLoading/index.vue'
import SInput from '@/components/SInput/index.vue'
import pRetry from 'p-retry'

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
const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays, { type: contentType })
  return blob
}
async function handleImage(items) {
  if (this.items && this.items.length) {
    return await Promise.allSettled(
      this.items.map(
        (item) =>
          new Promise(async (resolve, reject) => {
            try {
              // const base64 = await $native.request(JSON.stringify({ url: item.coverUrl, options: { headers: currentSite.value.headers, timeout: 5000 } }))
              const base64 = await pRetry(async () => $native.request(JSON.stringify({ url: item.coverUrl, options: { headers: currentSite.value.headers, timeout: 5000 } })), {retries: 3})
              // console.log(base64);
              // const base64 = await $native.request(JSON.stringify({ url: item.coverUrl, options: { headers: currentSite.value.headers, timeout: 5000 } }))
              const blob = b64toBlob(base64, 'image/jpeg')
              const img = new Image()
              item._src = img.src = URL.createObjectURL(blob)
              img.onload = img.onerror = (e) => {
                if (img.width > 0 && img.height > 0) {
                  item._height = img.height
                }
                resolve({ width: img.width, height: img.height })
              }
            } catch (error) {
              console.log(error)
              reject(error)
            }
          })
      )
    )
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
          img.item-image(:src="item ? item._src : ''")
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
