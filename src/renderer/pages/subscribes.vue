<template>
  <v-card class="mx-auto" max-width="400" tile>
    <v-list>
      <v-list-item v-for="(site, i) in sites" :key="i">
        <v-list-item-content>
          <v-list-item-title> {{ site.title }} </v-list-item-title>
          <v-list-item-subtitle> {{ site.remarks }} </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
import { remote } from "electron";
export default {
  components: {},
  data() {
    return {};
  },
  computed: {
    sites() {
      return this.$store.state.sites;
    },
  },
  methods: {

  },
};
</script>

<style lang="less" scoped>
.v-list {
  overflow-y: scroll;
}
</style>
