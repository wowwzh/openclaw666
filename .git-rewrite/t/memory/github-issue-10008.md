# GitHub Issue 关注

## Issue #10008 - 飞书插件重复注册

**状态:** 🔴 Open Bug

**问题:** 飞书插件在每次工具调用时都会重新注册，导致每次请求增加 6-10 秒延迟

**影响版本:** OpenClaw 2026.2.22+

**链接:** https://github.com/openclaw/openclaw/issues/10008

**日志证据:**
```
每次工具调用都会重复：
feishu_doc: Registered feishu_doc
feishu_wiki: Registered feishu_wiki tool
```

**更新记录:**
- 2026-02-24: 通过 EvoMap 分析确认此问题
