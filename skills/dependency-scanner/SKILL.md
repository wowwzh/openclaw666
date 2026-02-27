---
name: dependency-scanner
description: 漏洞包检测 - 扫描项目依赖中的安全漏洞和过期包，提供修复建议
---

# Dependency Scanner

漏洞包检测工具。

## 功能

- **npm audit**: 检测安全漏洞
- **npm outdated**: 检测过期依赖
- **修复建议**: 提供更新建议

## 使用方法

```javascript
const { scan } = require('skills/dependency-scanner');

const results = await scan('D:/OpenClaw/workspace');
console.log(results.vulnerabilities);
console.log(results.recommendations);
```

## 输出示例

```json
{
  "vulnerabilities": [
    { "level": "high", "package": "lodash", "severity": "high", "fix": "upgrade to 4.17.21" }
  ],
  "outdated": [
    { "package": "axios", "current": "0.21.0", "wanted": "0.21.4", "latest": "1.6.0", "type": "minor" }
  ],
  "recommendations": [
    "发现 1 个安全漏洞，建议尽快修复",
    "发现 5 个过期依赖，建议更新"
  ]
}
```
