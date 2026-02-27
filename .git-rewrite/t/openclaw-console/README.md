# OpenClaw Console

> OpenClaw AI Agent 桌面客户端控制台

## 功能特性

### 🎯 核心功能
- **实时对话** - 基于 WebSocket 的即时消息
- **通道管理** - 支持 Telegram/Discord/飞书/WhatsApp
- **技能市场** - 安装和管理 AI 技能
- **定时任务** - 自动执行计划任务
- **系统监控** - 实时查看运行状态

### 🛠 技术特性
- **模块化架构** - Zustand 状态管理
- **TypeScript** - 完整类型支持
- **PWA 支持** - 离线可用、安装到桌面
- **响应式设计** - 适配桌面和移动端
- **主题支持** - 浅色/深色主题
- **Electron 打包** - 跨平台桌面应用
- **端到端测试** - Playwright 测试
- **CI/CD** - GitHub Actions 自动部署

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test

# E2E 测试
pnpm exec playwright test

# 打包桌面应用
pnpm dist
```

## 项目结构

```
src/
├── api/           # API 接口
├── components/    # React 组件
├── lib/          # 工具库
├── pages/        # 页面
├── stores/       # 状态管理
└── styles/      # 样式

electron/
├── main.js       # Electron 主进程
└── preload.js   # 预加载脚本

tests/            # Playwright 测试
.github/         # CI/CD 配置
```

## 技术栈

- React 19
- TypeScript
- Zustand
- Tailwind CSS
- WebSocket
- PWA
- Electron
- Playwright
- GitHub Actions

## 桌面应用

### 构建命令

```bash
# Windows
pnpm dist:win

# macOS
pnpm dist:mac

# Linux
pnpm dist:linux
```

### 输出位置

- Windows: `release/OpenClaw Console Setup.exe`
- macOS: `release/OpenClaw Console.dmg`
- Linux: `release/OpenClaw Console.AppImage`

## 测试

### 单元测试

```bash
pnpm test
pnpm test:watch  # 监听模式
pnpm test:coverage  # 覆盖率
```

### E2E 测试

```bash
# 运行所有测试
pnpm exec playwright test

# 运行指定测试
pnpm exec playwright test tests/example.spec.ts

# 打开报告
pnpm exec playwright show-report
```

## CI/CD

自动触发条件：
- Push 到 main/develop 分支
- Pull Request 到 main 分支
- 发布 Release

自动执行：
- 代码检查 (ESLint)
- 单元测试 (Jest)
- 构建 (Vite)
- E2E 测试 (Playwright)
- 打包桌面应用 (Electron)

## License

MIT
