<template>
  <div class="subscribe-wrap">
    <ul class="subscribes">
      <li class="subscribe" v-for="site in sites" :key="site.name">
        <div class="subscribe-icon" :class="{ error: site.error }">
          <div v-if="site.error">{{site.name.slice(0, 1)}}</div>
          <img :src="site.icon" @error="site.error = true" alt="" />
        </div>
        <div class="subscribe-info">
          <span> {{ site.name }} </span>
          <span> {{ site.details }}</span>
        </div>
      </li>
    </ul>
  </div>
  <!-- <v-list>
    <v-list-item v-for="(site, i) in sites" :key="i">
      <v-list-item-content>
        <v-list-item-title> {{ site.name }} </v-list-item-title>
        <v-list-item-subtitle> {{ site.details }} </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list> -->
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
    }
  },
  methods: {},
  mounted() {
    console.log(this.sites);
  }
};
</script>

<style lang="less" scoped>
.subscribes {
  display: flex;
  flex-direction: column;
  .subscribe {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    transition: 0.2s;
    cursor: pointer;
    .subscribe-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;

        background-color: var(--bg);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      &.error {
        img {
          display: none;
        }
        font-size: 32px;
      }
    }
    .subscribe-info {
      display: flex;
      flex-direction: column;
      padding-left: 0.5rem;
    }
    &:hover {
      background-color: rgba(224, 224, 224, 1);
    }
  }
}
</style>
