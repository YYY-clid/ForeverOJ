<template>
  <div id="container">
    <div class="chart-title">近一周提交和通过次数</div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref(null);
let chartInstance = null;

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);

    // 生成近七天的日期
    const getLastSevenDays = () => {
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(`${date.getMonth() + 1}/${date.getDate()}`); // 格式化为 MM/DD
      }
      return dates;
    };

    const option = {
      legend: {
        data: ['提交数', '通过数'], // 图例名称
        top: 'bottom'
      },
      xAxis: {
        data: getLastSevenDays() // 使用近七天的日期
      },
      yAxis: {},
      series: [
        {
          name: '提交数', // 图例对应的名称
          data: [10, 22, 28, 35, 19, 30, 25],
          type: 'line',
          areaStyle: {
            color: '#84a2ff',
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}'
          }
        },
        {
          name: '通过数', // 图例对应的名称
          data: [1, 14, 11, 28, 10, 7, 15],
          type: 'line',
          areaStyle: {
            color: '#28FF28',
            opacity: 0.5
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}'
          }
        }
      ]
    };
    chartInstance.setOption(option);
  }
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeChart);
});

const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<style scoped>
#container {
  margin-top: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.chart-title {
  background: linear-gradient(to right, #366ef4, #3d6ee1 50%, #ffffff); /* 从左到右的渐变色 */
  padding: 10px;
  color: #ffffff;
  text-align: left;
  font-weight: bold;
  font-size: 21px;
  height: 30px;
  border-radius: 16px 16px 0 0;
  display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 垂直居中 */
}

.chart-container {
  width: 100%;
  height: 500px;
}
</style>