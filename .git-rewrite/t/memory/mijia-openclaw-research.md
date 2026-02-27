# 米家智能家居对接 OpenClaw 研究

> 研究日期: 2026-02-24
> 来源: Kimi AI + Home Assistant 官方文档

---

## 方案概述

通过 **Home Assistant** 作为中间层，实现 OpenClaw 语音控制米家设备。

**优势：**
- ✅ 隐私保护（本地运行）
- ✅ 自然语言理解
- ✅ 统一管理

---

## 技术架构

```
用户语音/文字指令 
    ↓
OpenClaw (AI Agent本地运行) 
    ↓
Home Assistant Skill (REST API调用)
    ↓
Home Assistant (智能家居中枢)
    ↓
米家设备 (通过Xiaomi Miio集成)
```

---

## 完整实施步骤（确保成功）

### 步骤1：安装 Home Assistant（Windows）

**推荐方案：VirtualBox 虚拟机**

| 组件 | 要求 |
|------|------|
| 操作系统 | Windows 10/11 |
| 内存 | 4GB+ |
| 硬盘 | 32GB+ |
| 软件 | VirtualBox 7.0+ |

**安装步骤：**

1. **下载 VirtualBox**
   - 官网：https://www.virtualbox.org/wiki/Downloads

2. **下载 Home Assistant VM 镜像**
   - 官网：https://www.home-assistant.io/installation/windows
   - 选择 "Virtual Appliance" 版本

3. **导入 VirtualBox**
   - 打开 VirtualBox → 文件 → 导入 appliance
   - 选择下载的 .ova 文件
   - 配置网络为 "桥接网卡"（Bridget Adapter）

4. **启动 Home Assistant**
   - 启动虚拟机
   - 等待 5-10 分钟初始化
   - 浏览器访问：http://homeassistant.local:8123

**备选方案：Docker**
```powershell
# Windows 上安装 Docker Desktop
# 然后运行 Home Assistant 容器
docker run -d --name homeassistant --privileged -p 8123:8123 -v /path/to/config:/config ghcr.io/home-assistant/home-assistant:stable
```

### 步骤2：初始化 Home Assistant

1. 首次访问会进入设置向导
2. 创建管理员账户
3. 设置家庭位置（用于时区和天气）
4. 设备发现（会自动发现同网络设备）

### 步骤3：接入米家设备

**方法一：通过 Xiaomiiot Cloud（推荐）**

1. 进入 Home Assistant → 设置 → 集成
2. 点击 "添加集成" → 搜索 "Xiaomi"
3. 选择 "Xiaomi Cloud" 或 "Xiaomi MIoT"
4. 输入米家账号和密码
5. 等待设备同步

**方法二：本地 Token 方式**

1. 获取设备 Token：
   - 方法1：使用 Mi Home 导出工具
   - 方法2：查看日志文件
2. 配置本地集成：
   - 设置 → 集成 → 添加 "Xiaomi Miio"
   - 手动输入 Token

### 步骤4：获取 API 令牌

1. 登录 Home Assistant Web 界面
2. 点击左上角用户名
3. 向下滚动 → "长期访问令牌"
4. 点击 "创建令牌"
5. 命名：OpenClaw
6. 复制生成的令牌（只会显示一次）

**记录以下信息：**
- HA URL: http://192.168.x.x:8123（内网IP）
- HA Token: xxxxxxxxxxxxx

### 步骤5：测试米家设备控制

在 Home Assistant 中：
1. 进入开发者工具 → 服务
2. 测试以下服务：

```yaml
# 打开开关
service: switch.turn_on
data:
  entity_id: switch.xxx

# 关闭开关
service: switch.turn_off
data:
  entity_id: switch.xxx

# 调节灯光
service: light.turn_on
data:
  entity_id: light.xxx
  brightness_pct: 50
```

### 步骤6：创建 OpenClaw Home Assistant Skill

在 `~/openclaw/workspace/skills/` 创建 `homeassistant/` 目录：

```
homeassistant/
├── SKILL.md
└── config.json
```

**SKILL.md 内容：**

```yaml
---
name: homeassistant
description: 控制Home Assistant智能家居系统，支持米家设备
metadata:
  emoji: 🏠
  env:
    - HA_URL
    - HA_TOKEN
---

# 智能家居控制

## 环境配置
- HA_URL: Home Assistant 地址
- HA_TOKEN: 长期访问令牌

## 支持的设备

### 灯光控制
- 打开/关闭灯光
- 调节亮度
- 调节色温

### 开关控制
- 打开/关闭插座
- 查看开关状态

### 传感器
- 温度
- 湿度
- 电量

### 扫地机器人
- 开始清扫
- 暂停
- 返回充电
- 查看状态

## 使用示例
- "打开客厅灯"
- "关闭卧室插座"
- "查询扫地机器人状态"
- "把灯光调到50%"
```

### 步骤7：配置环境变量

在 OpenClaw 中设置：
```bash
export HA_URL="http://192.168.x.x:8123"
export HA_TOKEN="你的令牌"
```

### 步骤8：测试完整流程

1. 通过飞书发送："打开客厅灯"
2. OpenClaw 接收指令
3. 调用 Home Assistant API
4. 米家设备执行
5. 返回执行结果

---

## 常见问题排查

| 问题 | 原因 | 解决方法 |
|------|------|----------|
| 无法发现设备 | 网络不通 | 检查同一局域网 |
| Token 无效 | 令牌过期 | 重新创建 |
| 设备不响应 | 离线 | 检查设备 WiFi |
| API 调用失败 | 权限不足 | 检查 Long-Lived Access Token |

---

## 替代方案：直接米家 API（无需 Home Assistant）

```python
# 使用 mijia-api 库
pip install mijia-api

from mijiaAPI import mijiaAPI
api = mijiaAPI()
api.login(username="手机号", password="密码")
devices = api.get_devices()
api.set_prop('设备ID', 'power', 'on')
```

**但推荐 Home Assistant**，因为：
- ✅ 统一管理多品牌设备
- ✅ 本地化，不依赖云端
- ✅ 丰富的自动化能力
- ✅ 成熟的 OpenClaw 集成

---

## 哥哥的设备清单

待确认后配置：
- [ ] 灯控设备
- [ ] 智能开关
- [ ] 扫地机器人
