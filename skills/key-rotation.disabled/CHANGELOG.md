# Key Manager 更新日志

## v1.2 (2026-02-26)

### 新增功能
- `getKeys(provider)` - 获取指定提供商的所有Keys
- `getCurrentKey(provider)` - 通用获取当前Key方法
- `smartRotate(provider)` - 智能轮换，自动跳过不健康的Key
- `markKeyUnhealthy(provider, index)` - 标记Key为不健康
- `resetHealth()` - 重置所有Key健康状态
- `getStatusReport()` - 获取详细状态报告

### Bug修复
- 修复重复 `module.exports` 问题

### 改进
- 改进错误处理和日志输出
- 为所有提供商（Tavily + OpenAI）初始化健康状态
