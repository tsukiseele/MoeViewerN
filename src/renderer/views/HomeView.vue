<script setup lang="ts">
import { Base64 } from 'js-base64'
import { onMounted, ref, watch, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NSelect, NInputNumber, NAutoComplete, NResult, NTag, useMessage } from 'naive-ui'
import SSimpleWaterfall from '../components/SSimpleWaterfall/index.vue'
import SLoading from '../components/SLoading/index.vue'
import CatalogLayer from '@/views/Layer/CatalogLayer.vue'
import _ from 'lodash'
import { invoke, invokeAsObject } from '../electron'
import placeholder from '@/assets/images/placeholder.webp'
import pQueue from 'p-queue'

const showCatalog = ref(false)
const childItem = ref<ImageMeta>()
const router = useRouter()
const results = ref<any[]>([])
const query = ref({ page: 1, keywords: 'namori', siteId: 923 })
const sites = ref<Site[]>([])
const currentSite = ref<Site>()
const isLoaded = ref(false)
const isListLoading = ref(false)
const keywordsOptions = ref([])
const loadedCount = ref(0)
const queue = new pQueue({ concurrency: 16 })
const siteOptions = computed(() => sites.value && sites.value.length && sites.value.map(site => ({ label: site.name, value: site.id })))

onMounted(async () => {
  sites.value = await invoke('getSiteList')
  console.log(sites.value)
  if (sites.value && sites.value.length) {
    onSearch()
  }
})

function onLoaded() {
  isLoaded.value = true
}

async function onSearch() {
  query.value.page = 1
  currentSite.value = sites.value.find(site => site.id == query.value.siteId)
  loadList(query.value)
}
async function loadList(params: any) {
  isLoaded.value = false
  results.value = await invokeAsObject('load', params)
  // if (!results.value || !results.value.length) $message.error(`资源未找到！`)
  isLoaded.value = true
}
async function loadNext(params: any) {
  const next = await invokeAsObject('load', params)
  results.value.push(...next)
}
const base64ToBlob = (base64: string, type: string) => {
  return new Blob([Base64.toUint8Array(base64)], { type: type })
}
// async function getImageSize(src: string) {
//   const img = new Image()
//   img.src = src
//   return await new Promise((resolve, reject) => {
//     try {
//       img.onload = img.onerror = e => resolve({ width: img.width, height: img.height })
//     } catch (error) {
//       reject(error)
//     }
//   })
// }
function onImgLoaded(e: Event, item: any) {
  //@ts-ignore
  console.log(e);
  const el = e.path[0]
  !el.loaded && loadImage(el, item)
}
async function loadImage(el: HTMLImageElement, item: any) {
  if (item._src) return
  queue.add(async () => {
    const { data, type } = await invoke('request', { url: item.coverUrl, options: { headers: currentSite.value?.headers, timeout: 5000, retries: 5 } })
    //@ts-ignore
    el.loaded = true
    item._src = URL.createObjectURL(base64ToBlob(data, type))
    loadedCount.value = loadedCount.value ? loadedCount.value + 1 : 1
    // console.log('queue.size', queue.size)
  })
}
async function onScrollBottom() {
  if (isListLoading.value) return
  isListLoading.value = true
  try {
    query.value.page++
    await loadNext(query.value)
  } catch (error) {
    console.log(error)
  } finally {
    isListLoading.value = false
  }
}
function openChild(item: any) {
  childItem.value = item
  showCatalog.value = true
}
const renderLabel = (option: any) => {
  const typeMap = {
    0: { type: 'General', color: '#0075f8' },
    1: { type: 'Artist', color: '#c00004' },
    3: { type: 'Copyright', color: '#a800aa' },
    4: { type: 'Character', color: '#00ab2c' },
    5: { type: 'Meta', color: '#007f7f' },
  }
  //@ts-ignore
  const type = typeMap[option.value.category as number]
  return [`${option.value.value}`, ` ${option.value.antecedent ? `→ ${option.value.antecedent} ` : ' '}`, h(NTag, { size: 'small', color: { color: type.color, borderColor: type.color, textColor: 'white' } }, { default: () => type.type })]
}
const getKeywordsOptions = _.throttle(async nv => {
  keywordsOptions.value = []
  if (nv) {
    const kwds = nv.split(' ')
    const word = kwds[kwds.length - 1]

    if (word) {
      const tags = await (await fetch(`https://danbooru.donmai.us/autocomplete.json?search[query]=${word}&search[type]=tag_query&limit=10`)).json()
      const label = tags.map((tag: any) => ({
        label: nv.replace(word, '') + tag.value,
        value: tag,
      }))
      keywordsOptions.value = label
    }
  }
}, 300)

watch(() => query.value.keywords, getKeywordsOptions)
</script>

<template lang="pug">
#home
  header
    NSelect(v-model:value="query.siteId" :options="siteOptions")
    NInputNumber(v-model:value="query.page" min="1")
    NAutoComplete(v-model:value="query.keywords" :options="keywordsOptions" :render-label="renderLabel" type="text" placeholder="Enter keywords" @keyup.enter="onSearch" :input-props="{'spellcheck': false}")
      template(#suffix)
        i.mdi.mdi-magnify(@click="onSearch" )
  main
    SSimpleWaterfall(v-if="isLoaded && results && results.length" :items="results" :loadedCount="loadedCount" image-key="coverUrl" :item-width="200" @loaded="onLoaded" @loading="isLoaded = false" @scroll-bottom="onScrollBottom")
      template(v-slot="{item, index}")
        .list-item(v-if="item" @click="openChild(item)")
          img.item-image(:src="item._src || placeholder" @load="(e) => onImgLoaded(e, item)")
          .item-title {{ item.title }}
    NResult(v-else-if="isLoaded" status="404" title="Resource Not Found" description="可能因素：目标未命中，网络不可用，防火墙拦截（尤其是在中国大陆）")
      template(#footer)
        NButton(@click="onSearch") Reload
    SLoading(:show="!isLoaded")

    SLoading.list-loading(:show="isListLoading" type="line")
  CatalogLayer(v-model:show="showCatalog" :item="childItem")
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
    > * {
      margin-right: 0.5rem;
      &:first-of-type {
        margin-left: 0.5rem;
      }
    }
    .n-select {
      width: 16rem;
    }
    .n-input-number {
      width: 10rem;
    }
    .n-auto-complete {
      i {
        // transition: 0.25s ease-out;
        cursor: pointer;
        user-select: none;
        border-radius: 50%;
        width: 2rem;
        height: 2rem;
        text-align: center;
        transition: 0.25s ease-out;
        &:hover {
          color: teal;
        }
        &:focus,
        &:active {
          background-color: #eee;
        }
      }
    }
  }
  // padding: 1rem;
  main {
    position: relative;
    flex: 1;
    height: 0;
    // overflow: auto;
    padding: 1rem 0;
  }
  .list-loading {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 8px;
  }
  .n-result {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .list-item {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.12);
    background-color: whitesmoke;
    cursor: pointer;
    .item-title {
      padding: 0.5rem;
    }
  }
}
</style>
