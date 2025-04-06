<template>
  <div id="manageQuestionView">
    <h2>题目管理</h2>
    <a-table :ref="tableRef" :columns="columns" :data="dataList" :pagination="{
      showTotal: true,
      pageSize: searchParams.pageSize,
      current: searchParams.current,
      total,
    }" @page-change="onPageChange">
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="doUpdate(record)">
            修改
          </a-button>
          <a-button status="danger" @click="doDelete(record)">
            删除
          </a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { Question, QuestionControllerService } from "../../../generated/question";
import { onMounted, reactive, ref, watchEffect, h } from "vue";
import message from "@arco-design/web-vue/es/message"
import { Pagination } from "@arco-design/web-vue";
import { useRouter } from "vue-router";


const tableRef = ref()
const dataList = ref([])
const total = ref(0)
const searchParams = ref({
  pageSize: 10,
  current: 1
})


const loadData = async () => {
  const res = await QuestionControllerService.listQuestionByPageWithAdminUsingPost(
    searchParams.value
  )
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error('加载失败，' + res.message);
  }
};

/**
 * 监听searchParams 变量，改变时触发页面的重新加载
 */
watchEffect(() => {
  loadData();
})

/**
 * 页面加载时，请求数据
 */
onMounted(() => {
  loadData();
})


const columns = [{
  title: 'id',
  dataIndex: 'id',
  render: ({ record }) => record.id || '-'
}, {
  title: '标题',
  dataIndex: 'title',
  render: ({ record }) => {
    return h('div', {
      style: {
        'max-width': '250px',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap'
      }
    }, record.title || '-');
  }
}, {
  title: '内容',
  dataIndex: 'content',
  render: ({ record }) => {
    return h('div', {
      style: {
        'max-width': '200px',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap'
      }
    }, record.content || '-');
  }
}, {
  title: '标签',
  dataIndex: 'tags',
  render: ({ record }) => record.tags || '-'
}, {
  title: '难度',
  dataIndex: 'difficulty',
  render: ({ record }) => record.difficulty || '-'
}, {
  title: '答案',
  dataIndex: 'answer',
  width: 200,
  render: ({ record }) => {
    return h('div', {
      style: {
        'max-width': '200px',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap'
      }
    }, record.answer || '-');
  }
}, {
  title: '提交数',
  dataIndex: 'submitNum',
  render: ({ record }) => record.submitNum || '-'
}, {
  title: '通过数',
  dataIndex: 'acceptedNum',
  render: ({ record }) => record.acceptedNum || '-'
}, {
  title: '判题配置',
  dataIndex: 'judgeConfig',
  render: ({ record }) => {
    try {
      const config = JSON.parse(record.judgeConfig);
      return h('div', {
        innerHTML: `时间限制: ${config.timeLimit}ms<br>内存限制: ${config.memoryLimit}KB<br>栈限制: ${config.stackLimit}KB`
      });
    } catch (e) {
      return '-';
    }
  }
}, {
  title: '判题用例',
  dataIndex: 'judgeCase',
  render: ({ record }) => {
    try {
      const cases = JSON.parse(record.judgeCase);
      return h('div', {
        innerHTML: cases.map((testCase, index) =>
          `用例 ${index + 1}:<br>输入: ${testCase.input}<br>输出: ${testCase.output}`
        ).join('<br><br>')
      });
    } catch (e) {
      return '-';
    }
  }
}, {
  title: '用户id',
  dataIndex: 'userId',
  render: ({ record }) => record.userId || '-'
}, {
  title: '创建时间',
  dataIndex: 'createTime',
  render: ({ record }) => {
    return record.createTime ? new Date(record.createTime).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) : '-';
  }
}, {
  title: '操作',
  slotName: 'optional'
}];

const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

const doDelete = async (question: Question) => {
  const res = await QuestionControllerService.deleteQuestionUsingPost({
    id: question.id
  });
  if (res.code === 0) {
    message.success("删除成功");
    loadData();
  } else {
    message.error("删除失败，" + res.message);
  }
}

const router = useRouter();

const doUpdate = (question: Question) => {
  router.push({
    path: "/update/question",
    query: {
      id: question.id
    },
  })
}

</script>


<style scoped>
#manageQuestionView {
  
}

:deep(.arco-table-td) {
  line-height: 1.5;
}
</style>
