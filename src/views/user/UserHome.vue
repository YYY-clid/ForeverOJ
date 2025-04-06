<template>
  <div id="home">
    <div class="container"
      :style="{ backgroundImage: `url(${currentIndex === 0 ? images[currentIndex] : images[currentIndex - 1]})` }">
      <a-carousel :autoPlay="{ delay: 1500 }" animation-name="card" show-arrow="never" indicator-position="outer" :style="{
        width: '100%',
        height: '500px',
      }" @change="handleChange">
        <a-carousel-item v-for="(image, index) in images" :key="index" :style="{ width: '60%' }">
          <img :src="image" :style="{
            width: '70%',
          }" />
        </a-carousel-item>
      </a-carousel>
    </div>
    <div class="components">
      <div class="chart">
        <Chart />
      </div>
      <div class="rank">
        <Rank :users="sortedData.slice(0, 10)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Chart from '@/components/Chart.vue';
import Rank from '@/components/Rank.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { ref } from 'vue';
import { User, UserControllerService, UserLoginRequest } from "../../../generated";
const modules = [Autoplay, Pagination, Navigation];
const currentIndex = ref(0);

const images = [
  'https://big-event-ricardo.oss-cn-hangzhou.aliyuncs.com/9c5bf27d-aef4-4ced-991b-d5f733732477.jpeg',
  'https://big-event-ricardo.oss-cn-hangzhou.aliyuncs.com/50cd5956-9f86-47eb-9cfc-504b058afe27.jpeg',
  'https://big-event-ricardo.oss-cn-hangzhou.aliyuncs.com/img1.wallspic.com-da_dun_guo_jia_gong_yuan-da_dun-she_he-sheng_tai_qu-zi_ran_jing_guan-3840x2400.jpg',
  'https://big-event-ricardo.oss-cn-hangzhou.aliyuncs.com/640.png',
  'https://big-event-ricardo.oss-cn-hangzhou.aliyuncs.com/pexels-71366650-31133725.jpg',
];

const handleChange = (index: number) => {
  currentIndex.value = index;
};

const sortedData = ref<User[]>([]);

UserControllerService.getAllUserSubmitUsingGet()
  .then((response) => {
    if (response && response.data) {
      // 假设 response.data 是一个数组
      sortedData.value = response.data.sort((a, b) => b.submitNumber - a.submitNumber);
      console.log(sortedData.value);
    } else {
      console.error("获取数据失败或数据格式不正确");
    }
  })
  .catch((error) => {
    console.error("请求失败", error);
  });
</script>

<style scoped>
.components {
  display: flex;
}

.chart {
  width: 70%;
}

.rank {
  width: 30%;
  margin-left: 40px;
}

img {
  height: 500px;
  margin: 0 auto;
  display: block;
}

.lunbo {
  width: 600px;
}

.container {
  position: relative;
  display: block;
  margin: 0 auto;
  background-size: cover;
  overflow: hidden;
  /* 确保伪元素不超出容器 */
}

.container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.5);
  /* 半透明白色背景 */
  backdrop-filter: blur(10px);
  /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(10px);
  /* 兼容性 */
  z-index: 1;
}

.container>* {
  position: relative;
  z-index: 2;
}

#home {
  /* background: url("https://gw.alipayobjects.com/zos/rmsportal/FfdJeJRQWjEeGTpqgBKj.png")
    0% 0% / 100% 100%; */
}
</style>