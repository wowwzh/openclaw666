# 智能家居控制技能

通过自然语言控制智能家居设备。

## 支持设备

- 小米米家 (python-miio)
- 其他支持REST API的设备

## 架构

```
自然语言 → 意图识别 → GraphQL Mutation → 设备控制 → 状态验证
```

## 使用方法

```typescript
import { SmartHomeController } from './smart-home';

const controller = new SmartHomeController({
  token: '设备Token',
  deviceId: '设备ID'
});

// 自然语言控制
await controller.execute('设置热水器到42度');
await controller.execute('打开客厅灯');
await controller.execute('开启空调制冷模式');
```

## 常用命令

| 命令 | Action |
|------|--------|
| "设置温度42度" | setTemperature(42) |
| "打开/关闭" | powerOn() / powerOff() |
| "调亮一点" | brightnessUp() |
| "切换到节能模式" | setMode('eco') |

## 状态验证

每次操作后验证状态变化：

```typescript
const state = await controller.queryState();
if (state.power !== expected) {
  throw new Error('State verification failed');
}
```

## Token获取

```bash
# 云端获取
miiocli cloud
# 输入小米账号密码

# 本地发现
miiocli discovery
```
