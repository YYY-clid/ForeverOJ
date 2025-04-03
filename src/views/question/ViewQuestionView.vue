<template>
  <div id="viewQuestionView">
    <a-row :gutter="[8, 24]">
      <a-col :md="9" :xs="24" style="margin-left: -30px;">
        <a-tabs default-active-key="question">
          <a-tab-pane key="question" title="题目">
            <a-card v-if="question" :title="question.title">
              <a-descriptions title="判题条件" :column="{ xs: 1, md: 2, lg: 3 }">
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
                  <a-tag v-if="question?.difficulty" :color="getDifficultyColor(question.difficulty)">{{
                    question.difficulty }}</a-tag>
                </a-space>
              </template>
            </a-card>
          </a-tab-pane>
          <a-tab-pane key="comment" title="评论" disabled>
            评论区
          </a-tab-pane>
          <a-tab-pane key="answer" title="答案">
            暂时无法查看答案
          </a-tab-pane>
        </a-tabs>
      </a-col>
      <a-col :md="isChatCollapsed ? 13 : 10">
        <a-form :model="form" layout="inline">
          <a-form-item field="title" label="编程语言" style="min-width: 240px;">
            <a-select v-model="form.language" :style="{ width: '100px' }" placeholder="选择编程语言">
              <a-option>java</a-option>
              <a-option>cpp</a-option>
              <a-option>go</a-option>
              <a-option>c</a-option>
              <a-option>python</a-option>
            </a-select>
            <a-popover trigger="hover" placement="top">
              <template #content>
                <p>编程语言版本说明</p>
                <p>java : 1.8</p>
                <p>cpp : c11</p>
                <p>python : 3</p>
                <p>go : 3.2.1</p>
                <p>c : c11</p>
              </template>
              <a-button style="margin-left: 10px">?</a-button>
            </a-popover>
          </a-form-item>
        </a-form>
        <CodeEditor :value="form.code as string" :language="form.language as string" :handle-change="changeCode"
          :options="{ minimap: { enabled: false } }" />
      </a-col>
      <a-col :md="6" :xs="24" class="chat-panel" :class="{ 'collapsed': isChatCollapsed }">
        <div class="chat-toggle" @click="toggleChat">
          {{ isChatCollapsed ? '>>' : '<<' }} </div>
            <a-card class="chat-card">
              <template #title>
                <div class="chat-header">
                  <h3>Chat</h3>
                </div>
              </template>
              <div ref="messagesContainer" class="messages-container">
                <div v-for="(message, index) in messages" :key="index"
                  :class="['message', message.type === 'user' ? 'message-user' : 'message-system']">
                  <div class="message-content">
                    <template v-if="message.type === 'system'">
                      <MdViewer :value="message.content" />
                    </template>
                    <template v-else>
                      {{ message.content }}
                    </template>
                  </div>
                  <div class="message-time">{{ message.time }}</div>
                </div>
              </div>
              <div class="chat-input">
                <!-- <a-input-group compact>
                  <a-input v-model="inputMessage" placeholder="输入消息..." class="input-box" @keyup.enter="sendMessage" />
                  <a-button type="primary" class="send-button" @click="sendMessage">发送</a-button>
                </a-input-group> -->
                <div class="input-container">
                  <input v-model="inputMessage" class="input-box" placeholder="输入消息..." />
                  <button class="send-button" @click="sendMessage">发送</button>
                </div>
              </div>
            </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { QuestionVO, QuestionControllerService, QuestionSubmitAddRequest, Question } from "../../../generated";
import { onMounted, reactive, ref, watchEffect, defineProps, onUnmounted, nextTick } from "vue";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import { languages } from "monaco-editor/esm/metadata";
import { IconDoubleLeft, IconDoubleRight } from '@arco-design/web-vue/es/icon';
import { IconDoubleLeft as IconDoubleLeftComponent, IconDoubleRight as IconDoubleRightComponent } from '@arco-design/web-vue/es/icon';

const question = ref<QuestionVO>();
const codeValue = ref<string>('');
const content = ref({
  java: "1.8",
});

interface Props {
  id: string;
}

onMounted(async () => {
  await nextTick(); // 确保 DOM 已加载

  // 先检查 Live2D 画布是否已经存在，防止重复加载
  if (document.querySelector("#live2d")) {
    console.log("Live2D 已经存在，无需重复加载");
    return;
  }

  const script = document.createElement("script");
  script.src = "https://fastly.jsdelivr.net/gh/RicardoLou/live2d-widget@v1.1.0/dist/autoload.js";
  script.async = true;

  script.onload = () => {
    setTimeout(() => {
      try {
        if (window.L2Dwidget) {
          window.L2Dwidget.init({
            model: {
              jsonPath: "https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget-models@latest/tororo/assets/tororo.model.json",
              scale: 1
            },
            display: {
              position: "right",
              width: 300,
              height: 400
            },
            mobile: {
              show: true
            },
            react: {
              opacity: 0.8
            }
          });
        }
      } catch (error) {
        console.error("L2Dwidget 加载时出错：", error);
      }
    }, 500);
  };

  script.onerror = () => {
    console.error("Live2D 脚本加载失败，但不会影响页面。");
  };

  document.body.appendChild(script);
});

const tagColors: { [key: string]: string } = {
  'C++': 'red',
  'Java': 'pinkpurple',
  'Python': 'arcoblue',
  '简单': 'green',
  '中等': 'orange',
  '困难': 'red',
  '算法': 'blue',
  '数据结构': 'purple',
  '栈': 'purple',
  '队列': 'red',
  '链表': 'red',
  '树': 'yellow',
  '图': 'arcoblue',
  '堆': 'purple',
  '排序': 'lime',
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
  id: () => "",
});

const loadData = async () => {
  const res = await QuestionControllerService.getQuestionVoByIdUsingGet(props.id as any);
  if (res.code === 0) {
    question.value = res.data;
  } else {
    message.error('加载失败，' + res.message);
  }
};

const form = ref<QuestionSubmitAddRequest>({
  language: 'java',
  code: '',
});

const router = useRouter();

/**
 * 提交代码
 */
const doSubmit = async () => {
  if (!question.value?.id) {
    return;
  }
  // 将 questionId 合并到 form.value 中
  const res = await QuestionControllerService.doQuestionSubmitUsingPost({
    ...form.value,
    questionId: question.value.id,
  });
  if (res.code === 0) {
    message.success('提交成功');
    router.push({
      path: `/questions_submit`,
    });
  } else {
    message.error('提交失败，' + res.message);
  }
};

onMounted(() => {
  loadData();
});

const changeCode = (value: string) => {
  form.value.code = value;
};

// 添加聊天相关的响应式变量
const messages = ref<Array<{ type: 'user' | 'system', content: string, time: string }>>([]);
const inputMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

// 发送消息
const apiKey = "sk-d3315afda4b248d2bfe056db48c810c4";
const apiUrl = "https://api.deepseek.com/v1/chat/completions";

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // 用户消息
  messages.value.push({
    type: "user",
    content: inputMessage.value,
    time: timeStr,
  });

  const userMessage = inputMessage.value;
  inputMessage.value = "";

  // 显示等待状态
  const loadingMessage = {
    type: "system",
    content: "思考中...",
    time: timeStr,
  };
  messages.value.push(loadingMessage);

  // 滚动到底部
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content || "出错了，请稍后再试";

    // 移除 "思考中..." 消息
    messages.value.pop();

    // 添加 deepseek 回复
    messages.value.push({
      type: "system",
      content: botReply,
      time: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    });

    // 滚动到底部
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });

  } catch (error) {
    console.error("调用 DeepSeek API 失败:", error);
    messages.value.pop();
    messages.value.push({
      type: "system",
      content: "AI 回复失败，请稍后再试。",
      time: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    });

    // 滚动到底部
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
  }
};

// 添加聊天框折叠状态
const isChatCollapsed = ref(false);

// 切换聊天框状态
const toggleChat = () => {
  isChatCollapsed.value = !isChatCollapsed.value;
};
</script>

<style>
#viewQuestionView {
  max-width: 1600px;
  margin: 0 auto;
  /* 移除 padding-left 以便左移 */
}

#viewQuestionView .arco-space-horizontal .arco-space-item {
  margin-bottom: 0 !important;
}

/* 调整 a-col 的宽度以便左移 */
.a-col {
  padding-left: 0;
}

.chat-panel {
  position: fixed;
  right: 0;
  top: 80px;
  /* 调整 top，使其不遮盖 header */
  bottom: 0;
  width: 300px;
  transition: transform 0.3s ease;
  z-index: 100;
  padding-top: 20px;
  height: calc(100vh - 80px);
  /* 调整高度，避免遮挡 header */
}

.chat-panel.collapsed {
  transform: translateX(calc(100% - 30px));
}

.chat-toggle {
  position: absolute;
  left: -30px;
  top: 0;
  width: 30px;
  height: 100%;
  /* 继承 chat-panel 的高度 */
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-right: none;
  border-radius: 4px 0 0 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.chat-toggle:hover {
  background-color: rgb(var(--arcoblue-6));
  color: white;
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 4px 0 0 4px;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 4px;
  position: relative;
}

.messages-container {
  max-height: 60%;
  overflow-y: auto;
}

.message-content {
  word-break: break-word;
}

.message-time {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
  text-align: right;
}

.message-user {
  background-color: var(--color-primary-light-1);
  color: var(--color-primary);
  align-self: flex-end;
}

.message-system {
  background-color: var(--color-fill-2);
  color: var(--color-text-1);
  align-self: flex-start;
}

.chat-input {
  padding: 12px;
  border-top: 1px solid var(--color-border);
}

:deep(.arco-card-header) {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

:deep(.arco-card-body) {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.input-container {
  position: absolute;
  bottom: 0;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid var(--color-border);
}

.input-box {
  width: 400px; /* 输入框占据大部分宽度 */
  padding: 10px;
  font-size: 14px;
  border-radius: 20px;
  border: 1px solid #dcdcdc;
  outline: none;
  transition: all 0.3s ease;
}

.input-box:focus {
  border-color: #4d90fe; /* 聚焦时的边框颜色 */
}

.send-button {
  width: 70px; /* 设置按钮宽度 */
  padding: 10px;
  margin-left: 10px;
  background-color: #4d90fe;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-button:hover {
  background-color: #357ae8; /* 悬停时的按钮颜色 */
}

.send-button:focus {
  outline: none; /* 去掉按钮的焦点框 */
}

.send-button:hover {
  background-color: #0056b3;
}
</style>