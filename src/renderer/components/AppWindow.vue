<template>
  <v-dialog
    v-model="show"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar dark color="primary">
        <v-toolbar-title>Settings</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon dark @click="show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <slot />
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  model: {
    prop: "isShow",
    event: "change"
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    show: false
  }),
  watch: {
    isShow: {
      handler(newVal) {
        this.show = newVal;
      },
      immediate: true
    },
    show() {
      this.$emit("change", this.show);
    }
  }
};
</script>
