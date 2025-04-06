<!-- src/components/RankList.vue -->
<template>
    <div class="rank-list">
      <h2>排行榜 - 提交次数 TOP</h2>
      <ol>
        <li v-for="(user, index) in users" :key="user.id">
          <span class="rank">
            <img :src="getIconPath(index)" :alt="`Rank ${index + 1}`" />
          </span>
          <span class="name">{{ user.userName }}</span>
          <span class="count">{{ user.submitNumber }} 次</span>
        </li>
      </ol>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps } from 'vue';
  import type { User } from '../../generated';
  
  const props = defineProps<{
    users: User[];
  }>();
  
  // 构建图标路径数组
  const iconPaths = Array.from({ length: 10 }, (_, i) => require(`@/assets/rankIcon/${i}.svg`));
  
  // 获取图标路径
  const getIconPath = (index: number) => {
    return iconPaths[index] || iconPaths[9]; // 如果超过9，使用最后一个图标
  };
  </script>
  
  <style scoped>
  .rank-list {
    padding: 16px;
    margin-top: 20px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    width: 100%;
    margin-left: 30px;
    max-width: 650px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-left: auto;
    margin-right: auto;
    height: 517px;
  }
  
  .rank-list h2 {
    text-align: center;
  }
  
  ol {
    list-style: none;
    padding: 0;
  }
  
  li {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
  }
  
  .rank {
    font-weight: bold;
    color: #ff5722;
    flex: 0 0 10%;
  }
  
  .name {
    flex: 1;
    text-align: center;
    font-size: 17px;
  }
  
  .count {
    color: #333;
    flex: 0 0 20%;
  }
  
  .rank img {
    width: 24px; /* 根据需要调整图标大小 */
    height: 24px;
  }
  </style>