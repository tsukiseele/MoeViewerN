<template lang="pug">
  #catalog
    AppWindow(class="window" v-model="isShowDialog")
      .list
        .list-item(v-for="(image, index) in images" :key="index")
          img.list-item--image(:src="image.sampleUrl || image.largerUrl || image.originUrl || image.coverUrl")
          .list-item--title {{ image.title }}
</template>

<script>
import Sakurawler from "@/libs/sakurawler";

export default {
  /*
  props: {
    image: {
      type: Object,
      default: {}
    }
  },*/
  data: () => ({
    isShowDialog: true,
    images: []
  }),
  computed: {
    image() {
      return this.$route.params.image;
    }
  },
  watch: {
    isShowDialog(newVal) {
      if (!newVal) {
        this.$router.go(-1);
      }
    }
  },
  async created() {
    if (!this.image) this.$router.push("/");
    if (this.image.$next) {
      try {
        this.images = await new Sakurawler(
          this.image.spider.site,
          this.image.spider.page,
          this.image.spider.keywords
        ).parseNext(this.image);

        for (const img of images) {
          for (const k of Object.keys(this.image)) {
            if (!img[k]) img[k] = this.image[k];
          }
        }
        // for (const image of images) {
        //   if (image.)
        // }
        console.log(this.images);
      } catch (error) {
        console.log(error);
      }
    } else {
      this.images.push(this.image);
    }
  }
};
</script>

<style lang="less" scoped>
.list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  .list-item {
    margin: 0.5rem;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.33);
    transition: 0.3s ease;
    .list-item--image {
      object-fit: cover;
      max-width: 80vw;
      max-height: 80vh;
      transition: 0.3s ease;
      animation: fade 0.67s;
      width: 250px;
    }

    .list-item--title {
      font-size: 1.1rem;
    }
  }
}
@keyframes fade {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
