<template lang="pug">
//- NModal()
Transition(name='layer-fade')
  .layer(v-if="showModal")
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
.layer-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
}
.layer-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
}

.layer-fade-enter-from,
.layer-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.layer {
  position: absolute;
  left: 0;
  top: 0;
  // margin-top: 2rem;
  // margin-left: 3rem;
  display: flex;
  flex-direction: column;

  // margin-top: var(--frame-height);
  width: 100%;
  height: 100%;
  // height: calc(100vh - var(--frame-height));
  background-color: rgba($color: #ddd, $alpha: 1);
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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    i {
      cursor: pointer;
      transition: 0.25s ease-out;
      padding: 0 .5rem;
      color: teal;
      border-radius: 4px;
      &:hover {
        background-color: rgba(0,127,127,.33);
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
