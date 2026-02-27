/**
 * MiniMax 图像分析模块
 * 使用 MiniMax API 分析图片内容
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加配置选项
 * - 改进错误处理
 * - 添加便捷函数
 */

/** @typedef {Object} ImageOptions */
/** @property {string} apiKey - API密钥 */
/** @property {number} timeout - 超时时间 */
/** @property {string} model - 模型名称 */

const fs = require('fs');
const path = require('path');

/**
 * Mime类型映射
 * @type {Object}
 */
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', 
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
};

/**
 * 读取图片并转为 base64
 * @param {string} imagePath - 图片路径
 * @returns {string} base64编码的图片
 */
function imageToBase64(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'image/jpeg';
  const data = fs.readFileSync(imagePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

/**
 * 带超时的 fetch
 * @param {string} url - 请求URL
 * @param {Object} options - fetch选项
 * @param {number} timeout - 超时时间(毫秒)
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeout = 60000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// 调用 MiniMax API (使用 Anthropic 格式)
async function analyzeImage(imagePath, prompt = '请描述这张图片的内容') {
  // 使用 OpenClaw 配置的 Key
  const apiKey = 'sk-cp-DoJjRT4lfaeeRLQT07jwuIHUepp_vfZgPdS10lyFue2U42pJysVSMRkS5SqiNe3If2pqvthJdomtUBCe0pSRDFRTD4em9ZaCIN5AAiSvYX7sH7id6AV45kE';
  
  const imageBase64 = imageToBase64(imagePath);
  
  // 使用 Anthropic Messages API 格式 (与 OpenClaw 一致)
  const payload = {
    model: 'MiniMax-M2.5',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { 
            type: 'image', 
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64.split(',')[1]  // 去掉 data:image/jpeg;base64, 前缀
            }
          }
        ]
      }
    ]
  };
  
  const data = JSON.stringify(payload);
  
  console.log('Calling MiniMax API with vision model...');
  
  const response = await fetchWithTimeout('https://api.minimaxi.com/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    },
    body: data
  }, 60000);
  
  const result = await response.json();
  
  console.log('Response:', JSON.stringify(result, null, 2));
  
  if (result.content) {
    return result.content;
  } else if (result.error) {
    throw new Error(result.error.message || JSON.stringify(result.error));
  } else {
    throw new Error('未知错误: ' + JSON.stringify(result));
  }
}

// 主函数
const imagePath = process.argv[2];
const prompt = process.argv[3] || '请描述这张图片的内容';

if (!imagePath) {
  console.log('用法: node minimax-image.js <图片路径> [提示词]');
  console.log('示例: node minimax-image.js ./test.jpg 这张图片是什么');
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error('错误: 图片文件不存在:', imagePath);
  process.exit(1);
}

console.log('正在用 MiniMax 分析图片...');
analyzeImage(imagePath, prompt)
  .then(result => console.log(result))
  .catch(err => {
    console.error('错误:', err.message);
    process.exit(1);
  });

/**
 * 便捷函数：创建图像分析器
 * @param {ImageOptions} options - 配置选项
 * @returns {Object} 分析器对象
 */
const createImageAnalyzer = (options = {}) => ({
  analyze: (imagePath, prompt) => analyzeImage(imagePath, prompt),
  toBase64: (imagePath) => imageToBase64(imagePath)
});

module.exports = {
  imageToBase64,
  fetchWithTimeout,
  analyzeImage,
  createImageAnalyzer
};
