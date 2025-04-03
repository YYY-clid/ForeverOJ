<template>
    <div id="questionSubmitView">
      <h2>提交列表</h2>
      <a-form ref="formRef" :model="searchParams" layout="inline">
        <a-form-item field="questionId" label="题号" style="min-width: 240px;">
          <a-input v-model="searchParams.questionId"></a-input>
        </a-form-item>
        <a-form-item field="language" label="编程语言" style="min-width: 240px;">
          <a-select v-model="searchParams.language" :style="{width:'200px'}" placeholder="选择编程语言">
            <a-option>Java</a-option>
            <a-option>Cpp</a-option>
            <a-option>Go</a-option>
            <a-option>C</a-option>
            <a-option>Python</a-option>
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
        <template #createTime="{ record }">{{ moment(record.createTime).format("MM-DD HH:mm") }}</template>
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
      render: ({ record }) => {
        return record.language?.charAt(0).toUpperCase() + record.language?.slice(1).toLowerCase() || '-';
      }
  }, {
      title: '判题结果',
      dataIndex: 'judgeInfo',
      render: ({ record }) => {
        try {
          return record.judgeInfo?.message || '-';
        } catch (e) {
          return '信息获取错误';
        }
      }
  }, {
      title: '内存使用(KB)',
      dataIndex: 'judgeInfo',
      render: ({ record }) => {
        try {
          return record.judgeInfo?.memory || '-';
        } catch (e) {
          return '信息获取错误';
        }
      }
  }, {
      title: '运行时间(ms)',
      dataIndex: 'judgeInfo',
      render: ({ record }) => {
        try {
          return record.judgeInfo?.time || '-';
        } catch (e) {
          return '信息获取错误';
        }
      }
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