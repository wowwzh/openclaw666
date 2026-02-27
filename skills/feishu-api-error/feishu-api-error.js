/**
 * 飞书 API 错误处理模块
 */

const ERROR_MESSAGES = {
  // 认证错误
  99991663: 'App Secret 无效，请检查配置',
  99991642: 'Access Token 已过期，请刷新',
  99991664: 'App ID 无效',
  99991665: 'access_token 已过期',
  
  // 参数错误
  99991720: '请求参数错误',
  16436: '消息内容不能为空',
  212314: '请求体不能为空',
  
  // Emoji 相关
  230001: 'Emoji 类型无效',
  230003: 'Emoji 不存在',
  
  // 权限错误
  99991603: '无权限访问该资源',
  99991608: '应用没有该 API 的权限',
  
  // 资源错误
  99991673: '消息不存在',
  99991721: '群聊不存在',
  
  // 其他
  99999999: '系统错误'
};

/**
 * 解析飞书错误响应
 * @param {object} response - 飞书 API 响应
 * @returns {object} 解析后的错误对象
 */
function parseFeishuError(response) {
  const code = response?.code;
  const msg = response?.msg || '';
  
  return {
    code,
    msg,
    message: ERROR_MESSAGES[code] || msg,
    retryable: isRetryableError({ code }),
    needsTokenRefresh: code === 99991642 || code === 99991665
  };
}

/**
 * 判断错误是否可重试
 * @param {object} error - 错误对象
 * @returns {boolean}
 */
function isRetryableError(error) {
  const code = error?.code;
  
  // 网络错误或服务器错误，可重试
  if (!code) return true;
  
  // 认证错误，刷新 token 后可重试
  if (code === 99991642 || code === 99991665) return true;
  
  // 限流错误
  if (code === 429) return true;
  
  // 服务器错误
  if (code >= 500 && code < 600) return true;
  
  return false;
}

/**
 * 判断是否需要刷新 Token
 * @param {object} error - 错误对象
 * @returns {boolean}
 */
function needsTokenRefresh(error) {
  const code = error?.code;
  return code === 99991642 || code === 99991665 || code === 401;
}

/**
 * 格式化错误消息用于显示
 * @param {object} error - 错误对象
 * @returns {string}
 */
function formatErrorMessage(error) {
  const parsed = parseFeishuError(error);
  return `[飞书 API 错误 ${parsed.code}] ${parsed.message}`;
}

/**
 * 带重试的 API 调用
 * @param {Function} apiFunc - API 调用函数
 * @param {Object} options - 重试选项
 * @returns {Promise<any>}
 */
async function callWithRetry(apiFunc, options = {}) {
  const { 
    maxRetries = 3, 
    baseDelay = 1000, 
    onRetry = null 
  } = options;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await apiFunc();
      
      // 检查错误
      if (response?.code !== undefined && response.code !== 0) {
        const error = parseFeishuError(response);
        
        // Token 过期，抛出特殊错误让调用方刷新
        if (error.needsTokenRefresh) {
          throw new FeishuTokenExpiredError(error.message, error);
        }
        
        // 不可重试的错误
        if (!error.retryable) {
          throw new FeishuAPIError(error.message, error);
        }
        
        // 可重试错误
        if (i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          if (onRetry) onRetry(error, i + 1, delay);
          await sleep(delay);
          continue;
        }
      }
      
      return response;
    } catch (error) {
      // 已知错误类型，直接抛出
      if (error instanceof FeishuTokenExpiredError || 
          error instanceof FeishuAPIError) {
        throw error;
      }
      
      // 网络错误，可重试
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        if (onRetry) onRetry({ message: error.message }, i + 1, delay);
        await sleep(delay);
        continue;
      }
      
      throw error;
    }
  }
}

/**
 * 睡眠函数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 飞书 Token 过期错误
 */
class FeishuTokenExpiredError extends Error {
  constructor(message, error) {
    super(message);
    this.name = 'FeishuTokenExpiredError';
    this.error = error;
  }
}

/**
 * 飞书 API 错误
 */
class FeishuAPIError extends Error {
  constructor(message, error) {
    super(message);
    this.name = 'FeishuAPIError';
    this.error = error;
  }
}

// CLI 测试
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'parse' && args[1]) {
    try {
      const response = JSON.parse(args[1]);
      console.log(JSON.stringify(parseFeishuError(response), null, 2));
    } catch (e) {
      console.log('JSON 解析失败');
    }
  } else if (args[0] === 'retry' && args[1]) {
    console.log('可重试:', isRetryableError({ code: parseInt(args[1]) }));
  } else {
    console.log(`
飞书 API 错误处理工具

用法:
  node feishu-api-error.js parse <json>    # 解析错误响应
  node feishu-api-error.js retry <code>   # 检查错误是否可重试
    `);
  }
}

module.exports = {
  parseFeishuError,
  isRetryableError,
  needsTokenRefresh,
  formatErrorMessage,
  callWithRetry,
  FeishuTokenExpiredError,
  FeishuAPIError,
  ERROR_MESSAGES
};
