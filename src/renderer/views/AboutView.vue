<template>
  <div class="about">
    <section class="about-item">
      <h3 class="about-title">Developer</h3>
      <img class="about-avatar" src="../assets/images/github-avatar.webp" alt="">
      <div class="about-content"><a href="https://github.com/tsukiseele/MoeViewerN" target="_blank">TsukiSeele</a></div>
    </section>
    <section class="about-item">
      <h3 class="about-title">License</h3>
      <div class="about-content">GPL-v3.0</div>
    </section>
    <section class="about-item">
      <h3 class="about-title">Support</h3>
      <div class="about-content">NO QRCode</div>
    </section>
    <section class="about-item">
      <h3 class="about-title">Thanks</h3>
      <div class="about-content code">
        <ul>
          <li v-for="item in thanks" :key="item.name">{{ item.name }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  data: () => ({
    thanks: [
      {
        name: 'Vue',
        link: 'https://github.com/vuejs/',
      },
      {
        name: 'Electron',
        link: 'https://github.com/electron/electron',
      },
    ],
  }),
  methods: {},
})
</script>
<style lang="scss" scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    // padding: .5rem;
    .about-item {
      padding: 0.5rem;
      .about-title {
        padding: .5rem;
      }
      .about-content {
        padding: 0.5rem;
      }
      .about-avatar {
        width: 6rem;
        height: 6rem;
        overflow: hidden;
        border-radius: 50%;
      }
    }

    /* align-items: center; */
  }
}
.code {
  font-family: 'JetBrain Mono', 'Consolas', 'Courier New', Courier, monospace;
}
</style>
