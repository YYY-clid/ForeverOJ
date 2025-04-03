<template>
  <a-row id="globalHeader" align="center" :wrap="false">
    <a-col flex="auto">
      <a-menu
        mode="horizontal"
        :selected-keys="selectedKeys"
        @menu-item-click="doMenuClick"
      >
        <a-menu-item
          key="0"
          :style="{ padding: 0, marginRight: '38px' }"
          disabled
        >
          <div class="title-bar">
            <img class="logo" src="../assets/logo.png" />
            <div class="title">ForeverOJ</div>
          </div>
        </a-menu-item>
        <a-menu-item v-for="item in visibleRoutes" :key="item.path">
          {{ item.name }}
        </a-menu-item>
      </a-menu>
    </a-col>
    <a-col flex="100px">
      <div>
        <a-popover
          trigger="hover"
          popover-class="custom-popover"
        >
          <template #content>
            <div class="user-info-popover">
              <p>用户名：{{ store.state.user?.loginUser?.userName ?? "未登录" }}</p>
              <p>邮箱：{{ store.state.user?.loginUser?.email ?? "未绑定" }}</p>
              <a-button type="primary" @click="handleLogout">退出登录</a-button>
            </div>
          </template>
          <div class="username-display">
            {{ store.state.user?.loginUser?.userName ?? "未登录" }}
          </div>
        </a-popover>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { routes } from "../router/routes";
import { useRoute, useRouter } from "vue-router";
import { computed, ref } from "vue";
import { useStore } from "vuex";
import checkAccess from "@/access/checkAccess";
import ACCESS_ENUM from "@/access/accessEnum";
import message from "@arco-design/web-vue/es/message";
import { UserControllerService } from "../../generated";
import axios from "axios";

const router = useRouter();
const store = useStore();

// 展示在菜单的路由数组
const visibleRoutes = computed(() => {
  return routes.filter((item, index) => {
    if (item.meta?.hideInMenu) {
      return false;
    }
    // 根据权限过滤菜单
    if (
      !checkAccess(store.state.user.loginUser, item?.meta?.access as string)
    ) {
      return false;
    }
    return true;
  });
});

// 默认主页
const selectedKeys = ref(["/"]);

// 路由跳转后，更新选中的菜单项
router.afterEach((to, from, failure) => {
  selectedKeys.value = [to.path];
});

console.log();

setTimeout(() => {
  store.dispatch("user/getLoginUser", {
    userName: "管理员",
    userRole: ACCESS_ENUM.ADMIN,
  });
}, 3000);

const doMenuClick = (key: string) => {
  router.push({
    path: key,
  });
};

const handleLogout = async () => {
  await UserControllerService.userLogoutUsingPost();
  router.push({
    path: "/user/login",
    replace: true,
  });
}
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: #444;
  margin-left: 16px;
}

.logo {
  height: 48px;
}

.username-display {
  cursor: pointer;
  text-align: center;
  margin-right: 30px;
}

.user-info-popover {
  text-align: center;
}

.user-info-popover p {
  margin: 8px 0;
}

.user-info-popover .a-button {
  margin-top: 8px;
}

.custom-popover {
  max-width: 50px;
}
</style>
