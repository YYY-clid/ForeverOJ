<template>
  <div id="app">
    <template v-if="route.path.startsWith('/user')">
      <router-view />
    </template>
    <template v-else>
      <BasicLayout />
    </template>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
<script setup lang="ts">
import BasicLayout from "@/layouts/BasicLayout.vue";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

/**
 * 全局初始化函数，有全局单次调用的代码，都可以写到这里
 */
const doInit = () => {
  console.log("Hello Welcome To ForeverOJ");
};

onMounted(() => {
  doInit();
});

import { debounce } from "lodash";
const resizeObserver  = (window as any).ResizeObserver;
(window as any).ResizeObserver = class ResizeObserver extends resizeObserver  {
  constructor(callback: (...args: any[]) => void) {
    callback = debounce(callback, 100);
    super(callback);
  }
};

</script>
