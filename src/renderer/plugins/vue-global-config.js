import Vue from "vue";
import AppNotification from "@/components/AppNotification.vue";
import notify from "@/plugins/notify.js";

export default ({ app, $axios }, inject) => {
  Vue.component("AppNotification", AppNotification);
  Vue.prototype.$notify = notify;
};
