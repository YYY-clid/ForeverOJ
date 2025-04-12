console.warn = (...args: any[]) => {
    const msg = args[0];
    if (typeof msg === 'string' && msg.includes('ResizeObserver loop')) {
      return;
    }
  };


import { createApp } from "vue";
import App from "./App.vue";
import ArcoVue from "@arco-design/web-vue";
import "@arco-design/web-vue/dist/arco.css";
import router from "./router";
import store from "./store";
import "@/plugins/axios";
import "@/access";
import 'bytemd/dist/index.css';



const script = document.createElement("script");
script.src = "https://fastly.jsdelivr.net/gh/RicardoLou/live2d-widget@v1.0.1/autoload.js";
script.async = true;
document.body.appendChild(script);
createApp(App).use(ArcoVue).use(store).use(router).mount("#app");



