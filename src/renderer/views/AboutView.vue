<template>
  <div class="about">
    <section class="about-item">
      <h3>Developer</h3>
      <div class="about-content">TsukiSeele</div>
    </section>
    <section class="about-item">
      <h3>License</h3>
      <div class="about-content">GPL-v3.0</div>
    </section>
    <section class="about-item">
      <h3>Support</h3>
      <div class="about-content">NO QRCode</div>
    </section>
    <section class="about-item">
      <h3>Thanks</h3>
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
      .about-content {
        margin: 0.5rem;
      }
    }

    /* align-items: center; */
  }
}
.code {
  font-family: 'JetBrain Mono', 'Consolas', 'Courier New', Courier, monospace;
}
</style>
