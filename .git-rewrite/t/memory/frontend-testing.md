# 前端测试知识指南

## 一、前端测试方法

### 1. 单元测试 (Unit Testing)

**定义**：对软件中的最小可测试单元进行验证

**特点**：
- 隔离测试单个函数、组件或模块
- 速度快，执行频率高
- 不依赖外部环境（数据库、API）
- 通常使用 Mock 隔离依赖

**适用场景**：
- 工具函数、纯函数
- 业务逻辑
- 组件的 props/emit 验证
- Redux/状态管理逻辑

**常用工具**：Jest, Vitest, Mocha, Jasmine

---

### 2. 集成测试 (Integration Testing)

**定义**：验证多个模块/组件协同工作是否正常

**特点**：
- 测试模块间的交互
- 速度适中
- 可能涉及部分真实依赖
- 更接近真实使用场景

**适用场景**：
- 组件间通信
- API 调用流程
- 路由跳转
- 表单提交流程

**常用工具**：Jest, Vitest, React Testing Library, Cypress

---

### 3. E2E 测试 (End-to-End Testing)

**定义**：从用户角度验证整个应用流程

**特点**：
- 模拟真实用户操作
- 速度最慢，成本最高
- 使用真实浏览器环境
- 覆盖完整用户场景

**适用场景**：
- 关键业务流程
- 登录/注册流程
- 支付流程
- 跨页面交互

**常用工具**：Playwright, Cypress, Selenium, Puppeteer

---

## 二、测试工具对比

### Jest vs Vitest

| 特性 | Jest | Vitest |
|------|------|--------|
| **速度** | 较慢（启动慢） | 快（基于 Vite） |
| **配置** | 开箱即用 | 开箱即用 |
| **HMR** | 不支持 | 支持 |
| **TypeScript** | 需要额外配置 | 原生支持 |
| **Vue 支持** | 需 vue-test-utils | 原生支持 |
| **生态系统** | 大而成熟 | 快速增长 |
| **API** | expect().toBe() | expect().toBe() |

**推荐**：
- **新项目 / Vite 项目**：Vitest（更快，体验更好）
- **老项目 / Jest 生态**：继续使用 Jest

---

### Playwright vs Cypress

| 特性 | Playwright | Cypress |
|------|------------|---------|
| **浏览器支持** | Chromium, Firefox, WebKit | Chromium, Firefox, WebKit |
| **并行执行** | 原生支持 | 付费版支持 |
| **自动等待** | 智能等待 | 自动等待 |
| **网络拦截** | 灵活 | 强大 |
| **移动端测试** | 支持 | 有限支持 |
| **多标签/窗口** | 原生支持 | 有限支持 |
| **速度** | 快 | 较快 |
| **学习曲线** | 较低 | 较低 |

**推荐**：
- **复杂项目 / 多浏览器**：Playwright
- **简单项目 / 快速上手**：Cypress

---

## 三、前端测试学习路径

### 阶段一：基础入门

1. **理解测试概念**
   - 什么是测试驱动开发 (TDD)
   - 行为驱动开发 (BDD) 简介
   - 测试金字塔

2. **学习 Jest 基础**
   ```bash
   npm install --save-dev jest
   ```
   - describe/test/it
   - expect 断言
   - beforeEach/afterEach
   - Mock 函数

### 阶段二：实战技能

3. **Vitest 进阶**（推荐）
   ```bash
   npm install --save-dev vitest
   ```
   - 配置 HMR
   - TypeScript 支持
   - CSS Modules 测试

4. **React/Vue 组件测试**
   - React Testing Library
   - @vue/test-utils
   - 测试组件交互
   - 模拟事件

### 阶段三：E2E 测试

5. **Playwright 入门**
   ```bash
   npm init playwright@latest
   ```
   - 定位元素
   - 模拟用户操作
   - 截图/录制
   - CI 集成

### 阶段四：工程化

6. **CI/CD 集成**
   - GitHub Actions 配置
   - 测试覆盖率
   - 测试报告

---

## 四、快速开始模板

### Vitest + React Testing Library

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**vite.config.js**:
```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js'
  }
})
```

### Playwright E2E

```bash
npm init playwright@latest
```

**test.spec.js**:
```js
import { test, expect } from '@playwright/test';

test('登录流程', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-btn"]');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 五、最佳实践

### 测试文件组织
```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx      # 单元测试
      Button.e2e.ts        # E2E 测试
  hooks/
    useAuth.ts
    useAuth.test.ts
  utils/
    format.ts
    format.test.ts
```

### 命名规范
- `*.test.ts` - 单元测试
- `*.spec.ts` - E2E 测试
- `*.int.test.ts` - 集成测试

### 测试优先顺序（建议）
1. 核心业务逻辑（单元测试）
2. 关键用户流程（E2E）
3. 组件交互（集成测试）
4. 边界情况

---

## 六、资源推荐

- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest 文档](https://jestjs.io/)

---

*最后更新：2024*
