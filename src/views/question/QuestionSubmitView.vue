<template>
    <div id="questionSubmitView">
      <h2>提交列表</h2>
      <a-form ref="formRef" :model="searchParams" layout="inline">
        <a-form-item field="questionId" label="题号" style="min-width: 240px;">
          <a-input v-model="searchParams.questionId"></a-input>
        </a-form-item>
        <a-form-item field="language" label="编程语言" style="min-width: 240px;">
          <a-select v-model="searchParams.language" :style="{width:'200px'}" placeholder="选择编程语言">
            <a-option>java</a-option>
            <a-option>cpp</a-option>
            <a-option>go</a-option>
            <a-option>c</a-option>
            <a-option>python</a-option>
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
        @sorter-change="onSorterChange"
      >
        <template #judgeInfo="{ record }">{{ JSON.stringify(record.judgeInfo) }}</template>
        <template #createTime="{ record }">{{ moment(record.createTime).format("YYYY-MM-DD") }}</template>
      </a-table>
    </div>
  </template>
  
  <script setup lang="ts">
  import { Question, QuestionControllerService, QuestionQueryRequest, QuestionSubmitQueryRequest } from "../../../generated";
  import { onMounted, reactive, ref, watchEffect, onUnmounted } from "vue";
  import message from "@arco-design/web-vue/es/message";
  import { useRouter } from "vue-router";
  import moment from "moment";
  
  const tableRef = ref();
  const dataList = ref([]);
  const total = ref(0);
  const searchParams = ref<QuestionSubmitQueryRequest>({
    questionId : undefined,
    language: undefined,
    pageSize: 10,
    current: 1,
    sortField: 'createTime', // 指定排序字段
    sortOrder: 'descend',    // 指定排序顺序，'descend' 表示降序
  });
  const formRef = ref();
  const initialSearchParams = {
    questionId: undefined,
    language: undefined,
    pageSize: 10,
    current: 1,
  };
  const timer = ref<number | NodeJS.Timeout | null>(null); // 定时器引用


  const loadData = async () => {
    const res = await QuestionControllerService.listQuestionSubmitByPageUsingPost(searchParams.value);
    if (res.code === 0) {
      // 根据排序字段和顺序对数据进行排序
      dataList.value = res.data.records;
      total.value = res.data.total;
    } else {
      message.error('加载失败，' + res.message);
    }
  };

  onMounted(() => {
    loadData();
    timer.value = setInterval(loadData, 3000); // 每3秒刷新一次数据
  });

  onUnmounted(() => {
    if (timer.value !== null) {
      clearInterval(timer.value);
    }
  });
  
  watchEffect(() => {
    loadData();
  });
  
  const columns = [{
      title: '提交号',
      dataIndex: 'id',
  }, {
      title: '编程语言',
      dataIndex: 'language',
  }, {
      title: '判题信息',
      dataIndex: 'judgeInfo',
      slotName: 'judgeInfo',
  }, {
      title: '判题状态',
      dataIndex: 'status',
  }, {
      title: '题目 id',
      dataIndex: 'questionId',
  }, {
      title: '提交者 id',
      dataIndex: 'userId',
  }, {
    title: '提交时间',
    dataIndex: 'createTime',
    sorter: (a: any, b: any) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime(),
    defaultSortOrder: 'descend', // 默认降序
    slotName: 'createTime',
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
   * 处理排序变更事件
   */
  const onSorterChange = (dataIndex: string, order: string) => {
    searchParams.value.sortField = dataIndex;
    searchParams.value.sortOrder = order;
    loadData();
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
  #questionSubmitView {
    max-width: 1300px;
    margin: 0 auto;
  }
  </style>