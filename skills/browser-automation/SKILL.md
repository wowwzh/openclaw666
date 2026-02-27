# 浏览器自动化技能学习

## 1. Playwright Skill (Claude Code)

**项目**: lackeyjb/playwright-skill
**Stars**: ⭐1804
**语言**: JavaScript

### 功能特点
- **任意自动化任务** - Claude根据需求自动编写Playwright代码
- **可视化浏览器** - 默认可见浏览器(headless: false)
- **零模块解析错误** - 通用的executor处理模块访问
- **智能清理** - 安全的临时文件管理

### 使用示例
```bash
# 测试任何页面
"Test the homepage"
"Check if the contact form works"
"Verify the signup flow"

# 视觉测试
"Take screenshots of the dashboard in mobile and desktop"
"Test responsive design across different viewports"

# 交互测试
"Fill out the registration form and submit it"
"Click through the main navigation"
"Test the search functionality"

# 验证
"Check for broken links"
"Verify all images load"
"Test form validation"
```

### 默认配置
- Headless: false (浏览器可见)
- Slow Motion: 100ms
- Timeout: 30s
- Screenshots: 保存到 /tmp/

## 2. 其他相关项目

| 项目 | Stars | 说明 |
|------|-------|------|
| playwright-undetected-skill | ⭐4 | 反检测浏览器自动化 |
| playwright-browser-skill | ⭐2 | OpenClaw MCP协议，101个工具 |
| openclaw-skill-browser-use | ⭐4 | Agent+CLI双模式 |

## 3. CDP/DCP 直连浏览器

CDP (Chrome DevTools Protocol) 是Chrome的调试协议，可以：
- 直接控制浏览器
- 拦截网络请求
- 修改响应
- 注入JavaScript
- 截图/录屏

### CDP vs Playwright
| 特性 | CDP | Playwright |
|------|-----|------------|
| 底层 | Chrome原生协议 | 高级封装 |
| 速度 | 更快 | 更易用 |
| 反检测 | 较难 | 有undetected版本 |
| 学习曲线 | 较陡 | 较平缓 |

## 4. 当前OpenClaw浏览器能力

OpenClaw已有浏览器控制能力（我正在用的）：
- navigate - 导航
- snapshot - 页面快照
- act - 点击/输入等交互
- screenshot - 截图

## 5. 提升方向

1. **安装playwright-skill** - 获取更强大的自动化能力
2. **研究CDP** - 深入浏览器底层控制
3. **反检测** - 避免被网站识别为机器人

## 参考链接
- https://github.com/lackeyjb/playwright-skill
- https://github.com/dalbit-mir/playwright-undetected-skill
- https://developers.google.com/devtools/protocol
