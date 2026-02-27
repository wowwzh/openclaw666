import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试目录
  testDir: './tests',
  
  // 完全匹配的文件模式
  testMatch: '**/*.spec.ts',
  
  // 超时时间
  timeout: 30 * 1000,
  
  // 期望超时
  expect: {
    timeout: 5000
  },
  
  // 完全并行运行
  fullyParallel: true,
  
  // 在 CI 上失败时禁止重试，本地环境可以重试
  retries: process.env.CI ? 2 : 0,
  
  // 并行工作进程数
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  
  // 共享设置
  use: {
    // 基础 URL
    baseURL: 'file://' + process.cwd() + '/calculator.html',
    
    // 收集失败的跟踪信息
    trace: 'on-first-retry',
    
    // 截图模式
    screenshot: 'only-on-failure',
    
    // 视频录制
    video: 'retain-on-failure',
  },
  
  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  
  // 本地 Web 服务器配置（如果需要）
  webServer: {
    command: 'npx http-server -p 8080',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
});
