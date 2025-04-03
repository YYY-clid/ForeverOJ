<template>
    <div id="home">
    <div class="container1">
        <swiper
          :modules="modules"
          :slides-per-view="1"
          :space-between="30"
          :loop="true"
          :autoplay="{ delay: 2500, disableOnInteraction: false }"
          :pagination="{ clickable: true }"
          :navigation="true"
          class = "lunbo"
        >
            <swiper-slide v-for="(image, index) in images" :key="index">
                <img :src="image" alt="轮播图" />
            </swiper-slide>
        </swiper>
    </div>
    <div>
        <Chart />
    </div>
    </div>
</template>

<script lang="ts" setup>
import Chart from '@/components/Chart.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';


const modules = [Autoplay, Pagination, Navigation];

const images = [
    require('@/assets/img/1.jpg'),
    require('@/assets/img/2.jpg'),
    require('@/assets/img/3.jpg'),
];
</script>

<style scoped>
img {
  width: 500px;
  height: auto;
  margin: 0 auto;
  display: block;
}
.lunbo{
    width: 600px;
}
.container1{
    background-color: gray;
    display: block;
    margin: 0 auto;
}
#home{
    /* background: url("https://gw.alipayobjects.com/zos/rmsportal/FfdJeJRQWjEeGTpqgBKj.png")
    0% 0% / 100% 100%; */
}
</style>