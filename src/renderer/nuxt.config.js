/**
 * By default, Nuxt.js is configured to cover most use cases.
 * This default configuration can be overwritten in this file
 * @link {https://nuxtjs.org/guide/configuration/}
 */


module.exports = {
  ssr: false,
  target: "static",
  head: {
    title: "MoeViewerN",
    meta: [{ charset: "utf-8" }]
  },
  loading: false,
  components: true,
  plugins: [
    { ssr: false, src: "@/plugins/utils.js" },
    { ssr: false, src: "@/plugins/icons.js" },
    { ssr: false, src: "@/plugins/vue-global-config.js" }
  ],
  buildModules: ["@nuxt/typescript-build"],
  modules: ["@nuxtjs/vuetify"],
  css: ["@/assets/css/initialized.css", "@/assets/css/global.less"],
  vuetify: {
    theme: {
      themes: {
        light: {
          primary: "#1867c0",
          secondary: "#b0bec5",
          accent: "#8c9eff",
          error: "#b71c1c"
        }
      }
    }
  }
};