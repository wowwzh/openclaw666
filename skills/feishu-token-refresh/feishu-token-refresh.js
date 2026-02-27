/**
 * 飞书 Token 刷新模块
 * 自动刷新过期的 tenant_access_token
 */

const https = require('https');

const TOKEN_FILE = process.env.FEISHU_TOKEN_FILE || 
  require('path').resolve(__dirname, '../../memory/feishu_token.json');

const fs = require('fs');

/**
 * 刷新 Token
 * @param {string} appId - 飞书 App ID
 * @param {string} appSecret - 飞书 App Secret
 * @returns {Promise<{success: boolean, access_token?: string, expires_in?: number, error?: string}>}
 */
async function refreshToken(appId, appSecret) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ app_id: appId, app_secret: appSecret });
    
    const options = {
      hostname: 'open.feishu.cn',
      port: 443,
      path: '/open-apis/auth/v3/tenant_access_token/internal',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          
          if (result.msg === 'ok') {
            // 保存新 Token
            saveToken({
              access_token: result.tenant_access_token,
              expires_at: Date.now() + (result.expires_in - 300) * 1000, // 提前5分钟过期
              app_id: appId
            });
            
            resolve({
              success: true,
              access_token: result.tenant_access_token,
              expires_in: result.expires_in
            });
          } else {
            resolve({
              success: false,
              error: result.msg || 'Unknown error',
              code: result.code
            });
          }
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      });
    });
    
    req.on('error', (e) => {
      resolve({ success: false, error: e.message });
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * 保存 Token 到文件
 */
function saveToken(tokenData) {
  try {
    const dir = require('path').dirname(TOKEN_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
  } catch (e) {
    console.error('保存 Token 失败:', e.message);
  }
}

/**
 * 加载保存的 Token
 */
function loadToken() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    }
  } catch (e) {}
  return null;
}

/**
 * 检查 Token 是否有效
 */
function isTokenValid() {
  const token = loadToken();
  if (!token || !token.access_token) return false;
  if (!token.expires_at) return true; // 没有过期时间，认为有效
  return Date.now() < token.expires_at;
}

/**
 * 获取有效 Token（自动刷新）
 */
async function getValidToken(appId, appSecret) {
  if (isTokenValid()) {
    const token = loadToken();
    return { success: true, access_token: token.access_token };
  }
  
  // Token 过期，刷新
  return refreshToken(appId, appSecret);
}

/**
 * 检测错误是否为 Token 过期
 */
function isTokenExpiredError(error) {
  if (!error) return false;
  
  // 检查 code
  if (error.code === 401 || error.code === 99991642) return true;
  
  // 检查 msg
  const msg = error.msg || '';
  return msg.includes('unauthorized') || msg.includes('invalid access_token');
}

/**
 * 带自动重试的 API 调用
 */
async function callFeishuAPIWithRetry(apiPath, options, appId, appSecret, maxRetries = 1) {
  let token = await getValidToken(appId, appSecret);
  
  for (let i = 0; i <= maxRetries; i++) {
    if (!token.success) {
      return { success: false, error: token.error };
    }
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token.access_token}`
    };
    
    const response = await new Promise((resolve) => {
      const isHttps = apiPath.startsWith('https://');
      const urlObj = new URL(isHttps ? apiPath : `https://open.feishu.cn${apiPath}`);
      
      const reqOptions = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers
      };
      
      const req = https.request(reqOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ 
              status: res.statusCode, 
              data: JSON.parse(body) 
            });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });
      
      req.on('error', e => resolve({ success: false, error: e.message }));
      
      if (options.body) req.write(options.body);
      req.end();
    });
    
    // 检查是否 Token 过期
    if (response.data?.code === 401 || response.data?.code === 99991642) {
      // 刷新 Token 重试
      token = await refreshToken(appId, appSecret);
      continue;
    }
    
    return response;
  }
  
  return { success: false, error: 'Max retries exceeded' };
}

// CLI 测试
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'refresh' && args[1] && args[2]) {
    refreshToken(args[1], args[2]).then(result => {
      console.log(JSON.stringify(result, null, 2));
    });
  } else if (args[0] === 'check') {
    console.log('Token 有效:', isTokenValid());
    console.log('Token 信息:', loadToken());
  } else {
    console.log(`
飞书 Token 刷新工具

用法:
  node feishu-token-refresh.js refresh <app_id> <app_secret>  # 刷新 Token
  node feishu-token-refresh.js check                          # 检查 Token 状态
    `);
  }
}

module.exports = { 
  refreshToken, 
  getValidToken, 
  isTokenExpiredError,
  callFeishuAPIWithRetry 
};
