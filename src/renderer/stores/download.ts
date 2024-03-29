import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'
// import { cyrb53 } from '@/../main/utils/hashcode';
import _ from 'lodash'

export const useDownloadStore = defineStore({
  id: 'download',
  state: () => ({
    statusMap: new Map<string, ImageDownloadMeta>
  }),
  actions: {
    update(uuid: string, value: any, gid?: string) {
      if (gid) {
        const group = this.statusMap.get(gid)
        if (group) {
          group.childTask = group.childTask || new Map<string, ImageDownloadMeta>()
          group.childTask.set(uuid, value)
        }
      } else {
        this.statusMap.set(uuid, value)
      }
      console.log('UPDATE', this.statusMap);
    },
    /**
     * 
     * @param item ImageMeta 图片数据
     */
    download(item: ImageMeta) {
      const filename = `${item.title || ''} ${item.tags || ''} ${Date.now()}`.trim().substring(0, 64)
      console.log('Download: ', item, filename);
      window.eapi.http.download({ url: item.originUrl || item.largerUrl || item.sampleUrl || item.coverUrl }, (p: Progress) => {
        if (!p.uuid) throw new Error('下载失败：无效的唯一标识符')
        this.update(p.uuid, JSON.parse(JSON.stringify({ ...item, progress: p })))
        if (p.done) {
          if (!p.response) throw new Error('下载失败：空响应')
          window.eapi.io.writeDownload(p.response.data, `${filename}.${p.response.type.split('/')[1]}`)
        }
      })
    },
    /**
      * 
      * @param parent 父级数据项
      * @param images 下载任务数据集
      */
    downloadGroup(parent: ImageMeta, images: ImageMeta[]) {
      // 任务组目录名，最长16字符
      const dirname = parent.title?.substring(0, 16) || Date.now().toString()
      const gid = CryptoJS.MD5(dirname).toString()
      images.forEach((image, index) => {
        // 组内文件名，最长64字符
        const filename = `${index.toString().padStart(3, '0')}` + `_${image.title || ''} ${image.tags || ''}`.trim().substring(0, 64)
        window.eapi.http.download({ url: image.originUrl || image.largerUrl || image.sampleUrl || image.coverUrl }, (p: Progress) => {
          if (!p.uuid) throw new Error('下载失败：无效的唯一标识符')
          this.statusMap.set(gid, parent)
          this.update(p.uuid, JSON.parse(JSON.stringify({ ...image, progress: p })), gid)
          if (p.done) {
            if (!p.response) throw new Error('下载失败：空响应')
            window.eapi.io.writeDownload(p.response.data, `${filename}.${p.response.type.split('/')[1]}`, dirname)
          }
        })
      })
      // window.eapi.io.writeText(JSON.stringify(Object.fromEntries(this.statusMap)), 'download.json')
    }
  }
}) 
// export const useCounterStore = defineStore({
//   id: 'counter',
//   state: () => ({
//     counter: 0
//   }),
//   getters: {
//     doubleCount: (state) => state.counter * 2
//   },
//   actions: {
//     increment() {
//       this.counter++
//     }
//   }
// })

