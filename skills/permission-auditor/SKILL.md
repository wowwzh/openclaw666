---
name: permission-auditor
description: 工具使用模式审查 - 审计 OpenClaw 工具调用，检测敏感操作和高风险行为
---

# Permission Auditor

工具使用模式审查和权限审计。

## 功能

- **工具调用审计**: 记录所有工具使用
- **敏感工具监控**: 监控 exec, gateway, process 等敏感工具
- **高风险操作检测**: 检测 rm -rf, format 等危险操作
- **报告生成**: 生成权限审计报告

## 使用方法

```javascript
const { PermissionAuditor } = require('skills/permission-auditor');

const auditor = new PermissionAuditor();

// 记录工具使用
auditor.logToolUsage('exec', { command: 'ls' }, { success: true });

// 获取报告
const report = auditor.getReport();
console.log(report.summary);

// 保存报告
const file = auditor.saveReport();
```

## 监控的敏感工具

- exec
- gateway
- process
- subagents
- sessions_spawn
