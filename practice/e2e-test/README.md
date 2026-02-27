# 计算器 E2E 测试

使用 Playwright 对计算器应用进行端到端测试。

## 测试内容

1. **页面加载测试** - 验证计算器页面正确加载，所有元素可见
2. **按钮点击测试** - 验证按钮点击事件正常工作
3. **计算功能测试** - 验证加法、减法、乘法、除法等计算功能
4. **清除功能测试** - 验证清除按钮功能
5. **复杂计算测试** - 验证混合运算

## 环境要求

- Node.js 18+
- npm 或 yarn

## 快速开始

### 1. 安装依赖

```bash
cd workspace/practice/e2e-test
npm install
```

### 2. 安装浏览器

```bash
npx playwright install chromium
# 或者安装所有浏览器
npx playwright install
```

### 3. 运行测试

**无头模式（默认）**
```bash
npm test
```

**有头模式（可见浏览器）**
```bash
npm run test:headed
```

**UI 模式（Playwright UI）**
```bash
npm run test:ui
```

### 4. 查看测试报告

```bash
npm run test:report
```

## 项目结构

```
e2e-test/
├── calculator.html      # 测试用的简单计算器页面
├── playwright.config.ts # Playwright 配置文件
├── package.json         # 项目依赖配置
├── tests/
│   └── calculator.spec.ts # 测试用例
└── README.md            # 说明文档
```

## 测试用例详情

| 测试名称 | 描述 |
|---------|------|
| 测试计算器页面加载 | 验证页面标题、显示框、按钮等元素 |
| 测试点击按钮是否正常 | 验证按钮点击后显示框内容更新 |
| 测试加法计算功能 | 验证 10 + 20 = 30 |
| 测试减法计算功能 | 验证 50 - 25 = 25 |
| 测试乘法计算功能 | 验证 6 * 7 = 42 |
| 测试除法计算功能 | 验证 100 / 4 = 25 |
| 测试清除按钮功能 | 验证 C 按钮清除显示框 |
| 测试复杂计算功能 | 验证 2 + 3 * 4 = 14 |

## Playwright 配置说明

- **testDir**: 测试文件目录 `./tests`
- **timeout**: 单个测试超时时间 30 秒
- **retries**: CI 环境下重试 2 次
- **reporter**: 输出 HTML 和列表报告
- **projects**: 支持 Chromium、Firefox、Safari 三个浏览器

## 常见问题

### Q: 测试找不到文件
A: 确保在 `e2e-test` 目录下运行测试，配置文件中的 baseURL 使用了相对路径。

### Q: 浏览器未安装
A: 运行 `npx playwright install` 安装浏览器。

### Q: 如何只运行单个测试
A: 使用 `--grep` 参数：
```bash
npx playwright test --grep "加法"
```

### Q: 如何只运行特定浏览器
A: 使用 `--project` 参数：
```bash
npx playwright test --project=chromium
```

## 参考资料

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright API](https://playwright.dev/docs/api/class-page)
