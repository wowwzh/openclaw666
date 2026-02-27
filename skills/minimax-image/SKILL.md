# MiniMax 图片识别 Skill

使用 MiniMax API 进行图片识别和分析。

## 使用方式

### 基本用法
```
发送图片路径给沈幼楚，让她用 MiniMax 分析
```

### 直接调用脚本
```bash
node skills/minimax-image.js <图片路径> [提示词]
```

## API 说明

MiniMax 多模态模型支持图片识别，需要：
1. 使用 vision-capable 模型 (如 MiniMax-M2.5)
2. 在 messages 中传入图片 URL 或 base64

## 实现代码

```javascript
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 读取图片并转为 base64
function imageToBase64(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', 
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  const mime = mimeTypes[ext] || 'image/jpeg';
  const data = fs.readFileSync(imagePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

// 调用 MiniMax API
async function analyzeImage(imagePath, prompt = '请描述这张图片的内容') {
  const apiKey = process.env.MINIMAX_API_KEY || 'sk-cp-DoJjRT4lfaeeRLQT07jwuIHUepp_vfZgPdS10lyFue2U42pJysVSMRkS5SqiNe3If2pqvthJdomtUBCe0pSRDFRTD4em9ZaCIN5AAiSvYX7sH7id6AV45kE';
  
  const imageBase64 = imageToBase64(imagePath);
  
  const response = await axios.post('https://api.minimax.chat/v1/text/chatcompletion_v2', {
    model: 'MiniMax-M2.5',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageBase64 } }
        ]
      }
    ]
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
}

// 主函数
const imagePath = process.argv[2];
const prompt = process.argv[3] || '请描述这张图片的内容';

if (!imagePath) {
  console.log('用法: node minimax-image.js <图片路径> [提示词]');
  process.exit(1);
}

analyzeImage(imagePath, prompt)
  .then(result => console.log(result))
  .catch(err => console.error('错误:', err.message));
