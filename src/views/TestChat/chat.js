const apiKey = 'sk-d3315afda4b248d2bfe056db48c810c4'; // 替换为您的 DeepSeek API 密钥

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

// 初始化对话历史
let messages = [
  { role: 'system', content: '您正在与 AI 助手聊天。' }
];

// 发送请求到 DeepSeek API
async function sendMessage(content) {
  messages.push({ role: 'user', content });
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      stream: false
    })
  });
  const data = await response.json();
  const reply = data.choices[0].message.content;
  messages.push({ role: 'assistant', content: reply });
  updateChatBox();
}

// 更新聊天框显示
function updateChatBox() {
  chatBox.innerHTML = '';
  messages.forEach(message => {
    const messageElement = document.createElement('div');
    messageElement.style.marginBottom = '10px';
    messageElement.style.padding = '5px';
    messageElement.style.borderRadius = '5px';
    if (message.role === 'user') {
      messageElement.style.backgroundColor = '#e0f7fa';
      messageElement.style.alignSelf = 'flex-end';
    } else {
      messageElement.style.backgroundColor = '#f1f1f1';
      messageElement.style.alignSelf = 'flex-start';
    }
    messageElement.textContent = message.content;
    chatBox.appendChild(messageElement);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 处理用户输入
userInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && userInput.value.trim() !== '') {
    const content = userInput.value.trim();
    userInput.value = '';
    sendMessage(content);
  }
});

// 初始化聊天框
updateChatBox();