import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'
// import { cyrb53 } from '@/../main/utils/hashcode';

export const useFavorites = defineStore({
  id: 'favorites',
  state: () => ({
    favorites: new Array<any>()
  }),
  actions: {
    add(item: any) {
      this.favorites.push(item)
      // this.saveStatus()
    },
    saveStatus() {
      window.eapi.io.writeText(JSON.stringify(this.favorites), 'favorites.json')
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

