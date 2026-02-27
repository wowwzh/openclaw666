# Agent Self-Debug Framework

Agent自检调试框架 - 自动捕获错误、分析根因、尝试修复

## 功能
- 错误捕获与分类
- 根因分析（规则库匹配80%+常见错误）
- 自动修复（创建文件、修复权限等）
- 生成自检报告

## 使用
```javascript
const { AgentDebugger } = require('./agent-debugger.js');

const debugger = new AgentDebugger();
const report = await debugger.handle(error);
console.log(report.recommendation);
```

## 错误类型
- file_not_found, permission_denied, connection_refused
- timeout, rate_limit, command_not_found
- syntax_error, memory_error, auth_error
