// ============================================
// 工具库统一导出
// ============================================

// 快捷键
export { shortcutManager, registerDefaultShortcuts, initShortcuts } from './shortcuts'

// 主题
export { initTheme, themeVars, createThemeStore } from './theme'
export type { Theme } from './theme'

// 日志
export { logger, initGlobalErrorHandler, debug, info, warn, error } from './logger'

// 存储
export { storage, session, cookie, getStorageStats } from './storage'

// 工具函数
export * from './utils'

// 验证
export { validator, rules, useFormValidation } from './validation'
export type { ValidationRule, ValidationResult, ValidationError } from './validation'

// HTTP
export { http, gatewayApi, ApiClient } from './http'
export type { RequestOptions, ApiResponse } from './http'
