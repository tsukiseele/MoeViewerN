<script setup>
import { Base64 } from 'js-base64'
import { onMounted, ref, watch, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NSelect, NInputNumber, NAutoComplete, NResult, NTag, useMessage } from 'naive-ui'
import SSimpleWaterfall from '@/components/SSimpleWaterfall/index.vue'
import SLoading from '@/components/SLoading/index.vue'
import CatalogLayer from '@/views/Layer/CatalogLayer.vue'
import _ from 'lodash'
import PLimit from 'p-limit'
import native from '@/composables/native.js'
import placeholder from '@/assets/images/placeholder.webp'

const showCatalog = ref(false)
const childItem = ref(null)
const router = useRouter()
const results = ref(() => [])
const keywords = ref('')
const currentSiteId = ref(() => ({}))
const query = ref({
  page: 1,
  keywords: 'namori',
  siteId: 923,
})
const sites = ref([])
const currentSite = ref(() => ({}))
const isLoaded = ref(false)

window.$message = useMessage()

onMounted(async () => {
  sites.value = await native.getSiteList()
  currentSiteId.value = sites && sites.value.length ? sites.value[25].id : 923
  currentSite.value = sites && sites.value.length ? sites.value[25] : null
  query.value.siteId = currentSiteId.value
  loadList(query.value)
})

function onLoaded() {
  isLoaded.value = true
}

async function onSearch() {
  if (currentSiteId != query.value.siteId || keywords.value != query.value.keywords) {
    query.value.keywords = keywords.value
    query.value.siteId = currentSiteId.value
    currentSite.value = sites.value.find((site) => site.id == query.value.siteId)
    loadList(query.value)
  }
}
async function loadList(params) {
  isLoaded.value = false
  console.log('params: ', params)
  results.value = await native.load(params)
  // if (!results.value || !results.value.length) $message.error(`资源未找到！`)
  isLoaded.value = true
}
async function loadNext(params) {
  console.log('params: ', params)
  const next = await native.load(params)
  console.log("NEXT", next);
  results.value.push({...next})
  console.log(  results.value);
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
  console.log('ITEMS', items)
  if (this.items && this.items.length) {
    const pLimit = PLimit(10)
    const success = await Promise.allSettled(
      this.items.map((item) =>
        pLimit(async (item) => {
          const { data, type } = await native.request({ url: item.coverUrl, options: { headers: currentSite.value.headers, timeout: 5000 } })
          const src = URL.createObjectURL(base64ToBlob(data, type))
          item._src = src
          // const { width, height } = getImageSize(src)
          // if (width > 0 && height > 0) {
          //   item._height = height
          // }
        }, item)
      )
    )
    return success
  }
}
function onScrollBottom() {
  query.value.page++
  loadNext(query.value)
}
function openChild(item) {
  childItem.value = item
  showCatalog.value = true
}
const siteOptions = computed(() => sites.value && sites.value.length && sites.value.map((site) => ({ label: site.name, value: site.id })))

const keywordsOptions = ref([])

const renderLabel = (option) => {
  const typeMap = {
    0: { type: 'General', color: '#0075f8' },
    1: { type: 'Artist', color: '#c00004' },
    3: { type: 'Copyright', color: '#a800aa' },
    4: { type: 'Character', color: '#00ab2c' },
    5: { type: 'Meta', color: '#007f7f' },
  }
  const type = typeMap[option.value.category]
  return [`${option.value.value}`, ` ${option.value.antecedent ? `→ ${option.value.antecedent} ` : ' '}`, h(NTag, { size: 'small', color: { color: type.color, borderColor: type.color, textColor: 'white' } }, { default: () => type.type })]
}

const getKeywordsOptions = _.throttle(async (nv) => {
  keywordsOptions.value = []
  if (nv) {
    const kwds = nv.split(' ')
    const word = kwds[kwds.length - 1]

    if (word) {
      const tags = await (await fetch(`https://danbooru.donmai.us/autocomplete.json?search[query]=${word}&search[type]=tag_query&limit=10`)).json()
      const label = tags.map((tag) => ({
        label: nv.replace(word, '') + tag.value,
        value: tag,
      }))
      keywordsOptions.value = label
    }
  }
}, 300)

watch(keywords, getKeywordsOptions)
</script>

<template lang="pug">
#home
  header
    NSelect(v-model:value="currentSiteId" :options="siteOptions")
    NInputNumber(v-model:value="query.page" min="1")
    NAutoComplete(v-model:value="keywords" :options="keywordsOptions" :render-label="renderLabel" type="text" placeholder="Enter keywords" @keyup.enter="onSearch" :input-props="{'spellcheck': false}")
      template(#suffix)
        i.mdi.mdi-magnify(@click="onSearch" )
  main
    SSimpleWaterfall(v-if="isLoaded && results && results.length" :items="results" :handleImage="handleImage" image-key="coverUrl" :item-width="200" @loaded="onLoaded" @loading="isLoaded = false" @scroll-bottom="onScrollBottom")
      template(v-slot="{item, index}")
        .list-item(v-if="item" @click="openChild(item)")
          img.item-image(:src="item._src || placeholder")
          .item-title {{ item.title }}
    NResult(v-else-if="isLoaded" status="404" title="Resource Not Found" description="可能因素：目标未命中，网络不可用，防火墙拦截（尤其是在中国大陆）")
      template(#footer)
        NButton(@click="onSearch") Reload
    SLoading(:show="!isLoaded")
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
    flex: 1;
    height: 0;
    overflow: auto;
    padding: 1rem 0;
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
