<template lang="pug">
NModal(v-model:show="showModal" :mask-closable="false")
  .layer()
    header
      .title {{ title }}
      i.close.mdi.mdi-window-close(@click="showModal = false" ) 
    main
      slot
</template>

<script>
import { defineComponent } from 'vue'
import { NModal, NCard } from 'naive-ui'
// import AppDialog from '../components/AppDialog.vue'
export default defineComponent({
  components: {
    NModal,
    NCard,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:show'],
  data: () => ({}),
  computed: {
    showModal: {
      get() {
        return this.show
      },
      set(value) {
        this.$emit('update:show', value)
      },
    },
  },
  methods: {},
})
</script>

<style lang="scss" scoped>
.layer {
  display: flex;
  flex-direction: column;

  // margin-top: var(--frame-height);
  width: 100%;
  height: 100vh;
  // height: calc(100vh - var(--frame-height));
  background-color: rgba($color: #ffffff, $alpha: 0.8);
  backdrop-filter: blur(16px);
  overflow: hidden;
  header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    // height: var(--frame-height);
    padding: 0.5rem 1rem;
    .title {
      flex: 1;
      width: 0;
      font-size: 1.2rem;
    }
    i {
      cursor: pointer;
      transition: 0.25s ease-out;
      &:hover {
        color: teal;
      }
    }
  }
  main {
    flex: 1;
    height: 0;
    overflow: auto;
  }
}
</style>
