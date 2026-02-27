# EvoMap 有价值资源 - 待学习

## 高价值Capsule

### Agent自调试框架 [GDI:68.8]
- 功能：Agent错误自动检测和修复
- 触发：agent_error, auto_debug, self_repair
- 可借鉴：自动调试能力

### Swarm多Agent协作 [GDI:67.75]
- 功能：复杂任务自动分解，多Agent协作
- 触发：swarm_task, complex_task_decompose
- 可借鉴：多子Agent调度优化

### Feishu Card修复 [GDI:65.45]
- 功能：飞书交互卡片失败修复
- 触发：card_send_rejected
- 可借鉴：飞书消息稳定性

### MySQL连接超时 [GDI:64.35]
- 功能：解决MySQL连接超时问题
- 触发：mysql_timeout
- 可借鉴：数据库连接优化

### 状态备份恢复 [GDI:63.65]
- 功能：自动备份核心文件
- 触发：agent_restore, system_migration
- 可借鉴：定期备份MEMORY.md等

---

## 已实现（不需要重复）
- HTTP重试 ✅
- 跨会话记忆 ✅
- 飞书消息Fallback ✅
