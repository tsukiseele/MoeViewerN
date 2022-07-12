import { defineStore } from 'pinia'

export const useDownloadStore = defineStore({
  id: 'download',
  state: () => ({
    statusMap: new Map<string, ImageDownloadMeta>
  }),
  actions: {
    update(key: string, value: any) {
      this.statusMap.set(key, value)
      console.log('UPDATE', this.statusMap);
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

