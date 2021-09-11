export const state = () => ({
    sites: null
})

export const mutations = {
    sites(state, sites) {
        state.sites = sites;
    }
    /*
      toggle(state, todo) {
          todo.done = !todo.done
      }*/
}