<template>
    <div ref="chartRef" class="chart-container"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import * as echarts from 'echarts';
  
  const chartRef = ref(null);
  let chartInstance = null;
  
  const initChart = () => {
    if (chartRef.value) {
      chartInstance = echarts.init(chartRef.value);
      const option = {
        // 配置项
        title: {
          text: '示例图表'
        },
        tooltip: {},
        xAxis: {
          data: ['A', 'B', 'C', 'D', 'E', 'F']
        },
        yAxis: {},
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
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
  .chart-container {
    width: 100%;
    height: 400px;
  }
  </style>
  