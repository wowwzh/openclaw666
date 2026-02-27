/**
 * 飞书消息清理模块
 * 防止 HTTP 400 错误 (code 230001)
 * 
 * 原理：剥离或转换不合规字符
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加配置选项
 * - 添加便捷函数
 */

/** @type {Object.<string, string>} */
const UNICODE_MAP = {
  '\u200B': '', // 零宽空格
  '\u200C': '', // 零宽非连接器
  '\u200D': '', // 零宽连接器
  '\uFEFF': '', // 字节顺序标记
  '\u00A0': ' ', // 不间断空格
  '\u3000': ' ', // 全角空格
};

/**
 * 配置选项
 * @typedef {Object} CleanOptions
 * @property {boolean} normalize - 是否规范化Unicode
 * @property {boolean} trimWhitespace - 是否去除多余空白
 * @property {number} maxLength - 最大长度
 */

/**
 * 清理不合规字符
 * @param {string} text - 输入文本
 * @param {CleanOptions} options - 配置选项
 * @returns {string} 清理后的文本
 */
function sanitize(text, options = {}) {
  if (!text) return text;
  
  const { normalize = true, trimWhitespace = true, maxLength = 20000 } = options;
  let result = text;
  
  // 替换 Unicode 问题字符
  for (const [bad, good] of Object.entries(UNICODE_MAP)) {
    result = result.split(bad).join(good);
  }
  
  // 移除控制字符 (保留换行和制表符)
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // 规范化 Unicode
  if (normalize) {
    result = result.normalize('NFKC');
  }
  
  // 移除多余空白
  if (trimWhitespace) {
    result = result.replace(/[ \t]+/g, ' ').trim();
  }
  
  // 截断超长文本
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength);
  }
  
  return result;
}

/**
 * 验证消息是否合规
 * @param {string} text - 输入文本
 * @returns {object} - { valid: boolean, issues: string[] }
 */
function validate(text) {
  const issues = [];
  
  if (!text) return { valid: true, issues: [] };
  
  // 检查长度
  if (text.length > 20000) {
    issues.push('消息过长 (最大20000字符)');
  }
  
  // 检查不合规字符
  for (const [bad] of Object.entries(unicodeMap)) {
    if (text.includes(bad)) {
      issues.push(`包含不合规字符: ${bad}`);
    }
  }
  
  // 检查控制字符
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(text)) {
    issues.push('包含控制字符');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * 清理飞书富文本消息
 * @param {object} richText - 飞书富文本对象
 * @returns {object} - 清理后的富文本
 */
function sanitizeRichText(richText) {
  if (!richText) return richText;
  
  // 递归清理所有文本节点
  function clean(obj) {
    if (typeof obj === 'string') {
      return sanitize(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(clean);
    }
    if (typeof obj === 'object' && obj !== null) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = clean(value);
      }
      return result;
    }
    return obj;
  }
  
  return clean(richText);
}

module.exports = {
  sanitize,
  validate,
  sanitizeRichText,
  // v1.1 便捷函数
  createCleaner: (options) => ({
    clean: (text) => sanitize(text, options),
    check: (text) => validate(text)
  }),
  isClean: (text) => validate(text).valid
};
