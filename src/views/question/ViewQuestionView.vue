<template>
    <div id="viewQuestionView">
      <a-row :gutter="[24, 24]">
        <a-col :md="12" :xs="24">
          <a-tabs default-active-key="question">
            <a-tab-pane key="question" title="题目">
              <a-card v-if="question" :title="question.title">
                <a-descriptions title="判题条件" :column="{xs: 1, md: 2, lg: 3}">
                  <a-descriptions-item label="时间限制">
                    {{ question.judgeConfig?.timeLimit ?? 0 }}
                  </a-descriptions-item>
                  <a-descriptions-item label="内存限制">
                    {{ question.judgeConfig?.memoryLimit ?? 0 }}
                  </a-descriptions-item>
                  <a-descriptions-item label="堆栈限制">
                    {{ question.judgeConfig?.stackLimit ?? 0 }}
                  </a-descriptions-item>
                </a-descriptions>
                <MdViewer :value="question.content || ''" />
                <template #extra>
                  <a-space wrap>
                    <a-tag v-for="(tag, index) of question.tags" :key="index" :color="getTagColor(tag)">{{ tag }}</a-tag>
                  </a-space>
                  <a-space wrap style="margin-left: 8px;">
                    <a-tag v-if="question?.difficulty" :color="getDifficultyColor(question.difficulty)">{{ question.difficulty }}</a-tag>
                  </a-space>
                </template>
              </a-card>
            </a-tab-pane>
            <a-tab-pane key="comment" title="评论" disabled>
              评论区
            </a-tab-pane>
            <a-tab-pane key="answer" title="答案">
              暂时无法查看答案
              <!-- {{ (question && question.answer) || "" }} -->
            </a-tab-pane>
          </a-tabs>
        </a-col>
        <a-col :md="12">
          <a-form :model="form" layout="inline">
            <a-form-item field="title" label="编程语言" style="min-width: 240px;">
              <a-select v-model="form.language" :style="{width:'320px'}" placeholder="选择编程语言">
                <a-option>java</a-option>
                <a-option>python</a-option>
                <a-option>cpp</a-option>
                <a-option>c</a-option>
                <a-option>go</a-option>
              </a-select>
            </a-form-item>
          </a-form>
          <CodeEditor 
            :value="form.code as string" 
            :language="form.language as string" 
            :handle-change="changeCode" 
          />
          <a-divider size="0" />
          <a-button type="primary" style="min-width: 200px;" @click="doSubmit">提交代码</a-button>
        </a-col>
      </a-row>
    </div>
  </template>
  
  <script setup lang="ts">
  import { QuestionVO, QuestionControllerService, QuestionQueryRequest, QuestionSubmitControllerService, QuestionSubmitAddRequest } from "../../../generated";
  import { onMounted, reactive, ref, watchEffect,defineProps } from "vue";
  import message from "@arco-design/web-vue/es/message";
  import { useRouter } from "vue-router";
  import moment from "moment";
  import CodeEditor from "@/components/CodeEditor.vue";
  import MdViewer from "@/components/MdViewer.vue";
  import { languages } from "monaco-editor/esm/metadata";
  
  const question = ref<QuestionVO>();
  const codeValue = ref<string>('');


  interface Props {
    id: string;
  }


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

  // 难度级别颜色映射
  const difficultyColors: { [key: string]: string } = {
    '简单': 'green',
    '中等': 'orange',
    '困难': 'red',
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string): string => {
    return difficultyColors[difficulty] || 'gray'; // 默认颜色为灰色
  };

  const props = withDefaults(defineProps<Props>(), {
    id: () => "" 
  });



  const loadData = async () => {
    const res = await QuestionControllerService.getQuestionVoByIdUsingGet(
      props.id as any
    );
    if (res.code === 0) {
      question.value = res.data;
    } else {
      message.error('加载失败，' + res.message);
    }
  };

  const form = ref<QuestionSubmitAddRequest>({
    language: 'java',
    code:'',
  })

  /**
   * 提交代码
   */
  const doSubmit = async () => {
    if(!question.value?.id) {
      return;
    }
    // 将 questionId 合并到 form.value 中
    const submitData: QuestionSubmitAddRequest = {
      ...form.value,
      questionId: question.value.id, // 添加 questionId 字段
    };
    const res = await QuestionSubmitControllerService.doQuestionSubmitUsingPost(submitData);
    if(res.code === 0) {
      message.success('提交成功');
    } else {
      message.error('提交失败，' + res.message);
    }
  }
  
  onMounted(() => {
    loadData();
  });
  
  const changeCode = (value: string) => {
    form.value.code = value;
  }
 
  </script>
  
  <style>
  #viewQuestionView {
    max-width: 1600px;
    margin: 0 auto;
  }
  #viewQuestionView .arco-space-horizontal .arco-space-item {
    margin-bottom: 0 !important;
  }
  </style>