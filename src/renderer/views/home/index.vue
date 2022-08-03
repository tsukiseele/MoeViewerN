<script setup lang="ts">
import { onMounted, ref, watch, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import pQueue from 'p-queue'
import { Base64 } from 'js-base64'
import { NImage, NTooltip, NButton, NSelect, NInputNumber, NAutoComplete, NResult, NTag } from 'naive-ui'
import SSimpleWaterfall from '@/components/SSimpleWaterfall/index.vue'
import SLoading from '@/components/SLoading/index.vue'
import CatalogLayer from '@/views/layer/catalog.vue'
import placeholder from '@/assets/images/placeholder.webp'
import { useFavorites } from '@/stores/favorites'
import { useDownloadStore } from '@/stores/download'
const showCatalog = ref(false)
const childItem = ref<ImageMeta>()
const router = useRouter()
const results = ref<any[]>([])
const query = ref({ page: 1, keywords: 'namori', siteId: 923 })
const sites = ref<Site[]>([])
const currentSite = ref<Site>()
const isLoaded = ref(false)
const isListLoading = ref(false)
const keywordsOptions = ref([] as { label: string; value: any }[])
const loadedCount = ref(0)
const queue = new pQueue({ concurrency: 16 })
const siteOptions = computed(() => (sites.value && sites.value.length && sites.value.map((site) => ({ label: site.name, value: site.id }))) || undefined)

onMounted(async () => {
  sites.value = await window.eapi.invoke('getSiteList')
  console.log('Sites: ', sites.value)
  if (sites.value && sites.value.length) {
    onSearch()
  }
  // const store = useDownloadStore()
  // store.download({originUrl: 'https://r3---sn-ni57rn7r.gvt1.com/edgedl/android/studio/ide-zips/2021.1.1.21/android-studio-2021.1.1.21-windows.zip?utm_source=androiddevtools&utm_medium=website&cms_redirect=yes&mh=-1&mip=43.243.192.40&mm=28&mn=sn-ni57rn7r&ms=nvh&mt=1658977463&mv=m&mvi=3&pl=24&rmhost=r2---sn-ni57rn7r.gvt1.com&shardbypass=sd&smhost=r2---sn-ni57rn7d.gvt1.com', title: 'AndroidStudio'})
})

function onLoaded() {
  isLoaded.value = true
}

async function onSearch() {
  query.value.page = 1
  currentSite.value = sites.value.find((site) => site.id == query.value.siteId)
  loadList(query.value)
}
async function loadList(params: any) {
  isLoaded.value = false
  results.value = await window.eapi.invokeAsObject('load', params)
  // if (!results.value || !results.value.length) $message.error(`资源未找到！`)
  isLoaded.value = true
}
async function loadNext(params: any) {
  const next = await window.eapi.invokeAsObject('load', params)
  results.value.push(...next)
}
const base64ToBlob = (base64: string, type: string) => {
  return new Blob([Base64.toUint8Array(base64)], { type: type })
}
interface PreloadImageElement extends HTMLImageElement {
  loaded?: boolean
}
function onImgLoaded(e: Event, item: any) {
  const el = (e.composedPath && e.composedPath())[0] as PreloadImageElement
  !el.loaded && loadImage(el, item)
}
async function loadImage(el: PreloadImageElement, item: any) {
  if (item._src) return
  queue.add(async () => {
    const { data, type } = await window.eapi.invoke('request', { url: item.coverUrl, options: { headers: currentSite.value?.headers, timeout: 5000, retries: 5 } })
    el.loaded = true
    item._src = URL.createObjectURL(base64ToBlob(data, type))
    loadedCount.value = loadedCount.value ? loadedCount.value + 1 : 1
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

interface KeywordsOption {
  label: string
  value: {
    value: string
    category: number
    antecedent?: string
  }
}
const renderLabel = (option: KeywordsOption) => {
  const typeMap = {
    0: { type: 'General', color: '#0075f8' },
    1: { type: 'Artist', color: '#c00004' },
    3: { type: 'Copyright', color: '#a800aa' },
    4: { type: 'Character', color: '#00ab2c' },
    5: { type: 'Meta', color: '#007f7f' },
    64: { type: 'Unknown', color: '#cd5da0' },
  }

  //@ts-ignore
  const type = typeMap[option.value.category]
  return [`${option.value.value}`, ` ${option.value.antecedent ? `→ ${option.value.antecedent} ` : ' '}`, h(NTag, { size: 'small', color: { color: type.color || 'black', borderColor: type.color || 'black', textColor: 'white' } }, { default: () => type.type || '' })]
}
const getKeywordsOptions = _.throttle(async (nv) => {
  keywordsOptions.value = []
  if (nv) {
    const kwds = nv.split(' ')
    const word = kwds[kwds.length - 1]
    // 第一项默认值
    const first = { label: nv, value: { value: nv, category: 64 } }
    if (word) {
      const tags = await (await fetch(`https://danbooru.donmai.us/autocomplete.json?search[query]=${word}&search[type]=tag_query&limit=10`)).json()
      const label = tags.map((tag: any) => ({
        label: nv.replace(word, '') + tag.value,
        value: tag,
      }))
      label.unshift(first)
      keywordsOptions.value = label
    } else {
      keywordsOptions.value = [first]
    }
  }
}, 500)

watch(() => query.value.keywords, getKeywordsOptions)

//

const favorites = useFavorites()
const onItemStar = (item: any) => {
  console.log(item)
  favorites.add(item)
  console.log(favorites)
}
function onItemDownload(item: ImageMeta) {
  console.log(item)
}
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
    SSimpleWaterfall(v-if="isLoaded && results && results.length" :items="results" :loaded-count="loadedCount" image-key="coverUrl" :item-width="200" @loaded="onLoaded" @loading="isLoaded = false" @scroll-bottom="onScrollBottom")
      template(v-slot="{item, index}")
        .list-item(v-if="item" @click="openChild(item)")
          img.item-cover(:src="item._src || placeholder" @load="(e) => onImgLoaded(e, item)")
          .item-info 
            NTooltip(trigger="hover")
              template(#trigger)
                .item-title {{ item.title }}{{ item.tags ? ` ${item.tags}` : ''}}
              span(style="max-width: 10rem;") {{ item.title }}{{ item.tags ? ` ${item.tags}` : ''}}
            //- .item-title {{ item.title }}{{ item.tags ? ` ${item.tags}` : ''}}
            //- .item-tags {{ item.tags }}
            .item-options
              i.mdi.mdi-download(@click.stop="onItemDownload(item)")
              NTooltip
                template(#trigger)
                  i.mdi.mdi-star(@click.stop="onItemStar(item)")
                | 收藏
          .item-mask 
    NResult(v-else-if="isLoaded && results.length === 0" status="info" title="提示" description="已经到底了")
    NResult(v-else-if="isLoaded" status="404" title="资源未找到" description="可能因素：网络不可用，防火墙拦截（尤其是在中国大陆）")
      template(#footer)
        NButton(@click="onSearch") Reload
    SLoading(:show="!isLoaded")

    SLoading.list-loading(:show="isListLoading" type="line")
  CatalogLayer(v-model:show="showCatalog" :item="childItem")
</template>

<style lang="scss" scoped>
@import './index.scss';
</style>
