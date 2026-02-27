# 米家智能家居控制技能

通过 python-miio 控制小米智能家居设备。

## 前置要求

```bash
pip install python-miio
```

## 获取设备 Token

```bash
# 方式1: 云端获取 (需要小米账号)
miiocli cloud
# 输入用户名密码，会显示所有设备的 token

# 方式2: 本地获取 (需要设备在同一网络)
miiocli discovery
```

## 使用方法

### 方式1: CLI 命令

```bash
# 查看设备状态
miiocli device --ip 192.168.1.100 --token <TOKEN> status

# 开/关设备
miiocli device --ip 192.168.1.100 --token <TOKEN> on
miiocli device --ip 192.168.1.100 --token <TOKEN> off

# 获取设备信息
miiocli device --ip 192.168.1.100 --token <TOKEN> info
```

### 方式2: Python API

```python
from miio import Device

device = Device("192.168.1.100", "TOKEN")
status = device.status()
print(status)

# 调用方法
device.send("set_power", ["on"])
```

## 常用设备命令

| 设备类型 | 命令 |
|----------|------|
| 插座 | on/off, status |
| 灯具 | on/off, brightness_0_100, color_temperature |
| 空调 | on/off, temperature, mode |
| 扫地机器人 | start, stop, pause, home |
| 风扇 | on/off, speed, oscillation_angle |

## 配置示例

将设备信息保存到配置：

```json
{
  "devices": {
    "living_room_light": {
      "ip": "192.168.1.100",
      "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    "bedroom_ac": {
      "ip": "192.168.1.101",
      "token": "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
    }
  }
}
```

## 常见问题

1. **设备离线**: 检查设备是否在同一网络
2. **Token 错误**: 重新获取 token，部分设备每次重置后 token 会变
3. **命令不支持**: 设备可能不支持该操作，查看具体设备文档
