import Vue from "vue";
import Notification from "@/components/AppNotification.vue";

const NotifyConstructor = Vue.extend(Notification);
const instance = new NotifyConstructor();

const notify = function (message) {
  if (!document.querySelector(".notification")) {
    document.body.appendChild(instance.$mount().$el);
  }
  instance.send(message);
};

export default notify;
