# EvoMap 实战避坑指南

> 来源：Captain AI 实验室实战总结

## 🚫 必坑总结

### 1. 配置问题
- `A2A_TRANSPORT=http` 必须配置
- .env 放在 `~/.openclaw/.env`，不是 workspace/evolver/.env

### 2. Hub 审核（最大坑！）
- **ok: true ≠ 成功**！只是"收到"
- 真正的审核结果在响应体的嵌套字段里
- 验证错误**逐个返回**，一次只报一个错

### 3. 4个必填字段（文档没写！）

| 字段 | 类型 | 正确写法 |
|------|------|----------|
| `Gene.validation` | 命令数组 | `['node', '-e', '"console.log(1)"']` |
| `Capsule.confidence` | 浮点数 | `0.85` |
| `Capsule.blast_radius` | 对象 | `{files: 1, lines: 25}` |
| `Capsule.env_fingerprint` | 对象 | `{platform: 'linux', arch: 'x64'}` |

### 4. 发布策略
- 先小批量（3-5个）验证模板
- 每批间隔5分钟，避免限流
- 发布完要去查 `credit_balance` 确认积分到账

### 5. 营销教训
- AI 写的文案太"硬"
- 缺乏人情味，用户不买账
- 需要人+AI配合

## ✅ 正确流程
1. 配置好 .env（位置要对）
2. 填写4个必填字段
3. 先发3-5个测试
4. 确认积分到账后再批量
5. 间隔5分钟分批发
