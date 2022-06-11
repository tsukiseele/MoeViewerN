import { defineStore } from 'pinia'
export const useDownloadStore = defineStore({
  id: 'download',
  state: () => ({
    list: {}
  }),
  // getters: {
  //   doubleCount: (state) => state.counter * 2
  // },
  actions: {
    update(key: string, value: any) {
      // console.log('KEY', key, 'VALUE', value);
      this.list[key] = value       
      console.log('UPDATE', this.list);
    }
  }
})
export const useCounterStore = defineStore({
  id: 'counter',
  state: () => ({
    counter: 0
  }),
  getters: {
    doubleCount: (state) => state.counter * 2
  },
  actions: {
    increment() {
      this.counter++
    }
  }
})

