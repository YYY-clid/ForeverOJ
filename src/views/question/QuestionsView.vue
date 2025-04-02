<template>
    <div id="questionsView">
      <h2>浏览题目</h2>
      <a-form ref="formRef" :model="searchParams" layout="inline">
        <a-form-item field="id" label="id" style="min-width: 240px;">
          <a-input v-model="searchParams.id" placeholder="请输入id" />
        </a-form-item>
        <a-form-item field="title" label="题目名称" style="min-width: 240px;">
          <a-input v-model="searchParams.title" placeholder="请输入题目名称" />
        </a-form-item>
        <a-form-item field="tags" label="标签" style="min-width: 240px;">
          <a-input-tag v-model="searchParams.tags" placeholder="请输入标签" />
        </a-form-item>
        <a-form-item field="difficulty" label="难度" style="width: 240px;">
          <a-select v-model="searchParams.difficulty" placeholder="请选择难度">
          <a-option value="简单">简单</a-option>
          <a-option value="中等">中等</a-option>
          <a-option value="困难">困难</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="doSubmit">搜索</a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="resetForm">重置</a-button>
        </a-form-item>
      </a-form>
      <a-divider size="0"/>
      <a-table 
        :ref="tableRef"
        :columns="columns" 
        :data="dataList" 
        :pagination="{
          showTotal: true,
          pageSize: searchParams.pageSize, 
          current: searchParams.current, 
          total,
        }"
        @page-change="onPageChange"
      >
        <template #tags="{ record }">
          <a-space wrap>
            <a-tag v-for="(tag, index) of record.tags" :key="index" :color="getTagColor(tag)">{{ tag }}</a-tag>
          </a-space>
        </template>
        <template #difficulty="{ record }">
          <a-space wrap>
            <a-tag :color="getTagColor(record.difficulty)">{{ record.difficulty }}</a-tag>
          </a-space>
        </template>
        <template #acceptedRate="{ record }">
          {{ 
            `${record.submitNum ? (record.acceptedNum / record.submitNum) * 100 : "0"}% 
            (${record.acceptedNum}/${record.submitNum})` 
          }}
        </template>
        <template #createTime="{ record }">{{ moment(record.createTime).format("YYYY-MM-DD") }}</template>
        <template #optional="{ record }">
          <a-space>
            <a-button type="primary" @click="toQuestionPage(record)">做题</a-button>
          </a-space>
        </template>
      </a-table>
    </div>
  </template>
  
  <script setup lang="ts">
  import { Question, QuestionControllerService, QuestionQueryRequest } from "../../../generated";
  import { onMounted, reactive, ref, watchEffect, onUnmounted } from "vue";
  import message from "@arco-design/web-vue/es/message";
  import { useRouter } from "vue-router";
  import moment from "moment";
  
  const tableRef = ref();
  const dataList = ref([]);
  const total = ref(0);
  const searchParams = ref<QuestionQueryRequest>({
    id : undefined,
    title: "",
    tags: [],
    difficulty: "",
    pageSize: 10,
    current: 1
  });
  const timer = ref<number | NodeJS.Timeout | null>(null); // 定时器引用

  const formRef = ref();
  const initialSearchParams = {
    id : undefined,
    title: "",
    tags: [],
    difficulty: "",
    pageSize: 10,
    current: 1
  };
  
  const tagColors: {[key: string]: string} = {
    'C++': 'red',
    'Java': 'pinkpurple',
    'Python': 'arcoblue',
    '简单': 'green',
    '中等': 'orange',
    '困难': 'red',
    '算法': 'blue',
    '数据结构': 'purple',
    '栈': 'purple',
  };
  
  const getTagColor = (tag: string) => {
    return tagColors[tag] || 'gray'; // 默认颜色为灰色
  };

  const loadData = async () => {
    const res = await QuestionControllerService.listQuestionVoByPageUsingPost(
      searchParams.value
    );
    if (res.code === 0) {
      dataList.value = res.data.records;
      total.value = res.data.total;
    } else {
      message.error('加载失败，' + res.message);
    }
  };
  
  watchEffect(() => {
    loadData();
  });
  
  onMounted(() => {
    loadData();
    timer.value = setInterval(loadData, 3000); // 每3秒刷新一次数据
  });

  onUnmounted(() => {
    if (timer.value !== null) {
      clearInterval(timer.value);
    }
  });
  
  const columns = [{
      title: '题号',
      dataIndex: 'id',
  }, {
      title: '题目名称',
      dataIndex: 'title',
  }, {
      title: '标签',
      slotName: 'tags',
  }, {
      title: '难度',
      slotName: 'difficulty',
  }, {
      title: '通过率',
      slotName: 'acceptedRate',
  }, {
      title: '创建时间',
      slotName: 'createTime',
  }, {
      slotName: 'optional'
  }];
  
  const onPageChange = (page: number) => {
    searchParams.value = {
      ...searchParams.value,
      current: page,
    };
  };
  
  
  const router = useRouter();
  /**
   * 跳转到做题页面
   * @param question
   */
  const toQuestionPage = (question: Question) => {
    router.push({
      path: `/view/question/${question.id}`,
    });
  };

  /**
   * 确认搜索，重新加载数据
   */
  const doSubmit = () => {
    searchParams.value = {
      ...searchParams.value,
      current: 1,
    };
  }
  const resetForm = () => {
    Object.assign(searchParams, initialSearchParams);
    formRef.value.resetFields();
    loadData();
  };
  </script>
  
  <style scoped>
  #questionsView {
    max-width: 1300px;
    margin: 0 auto;
  }
  </style>