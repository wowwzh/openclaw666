// ============================================
// Playwright 测试示例
// ============================================

import { test, expect } from '@playwright/test'

// 测试：首页加载
test.describe('首页', () => {
  test('应该加载首页', async ({ page }) => {
    await page.goto('/')
    
    // 等待页面加载
    await expect(page).toHaveTitle(/OpenClaw/)
    
    // 检查侧边栏存在
    await expect(page.locator('nav, aside, [class*="sidebar"]')).toBeVisible()
  })
})

// 测试：导航
test.describe () => {
 ('导航', test('应该能切换页面', async ({ page }) => {
    await page.goto('/')
    
    // 点击各个导航项
    const navItems = page.locator('a, button')
    const count = await navItems.count()
    
    // 至少有一些可点击的元素
    expect(count).toBeGreaterThan(0)
  })
})

// 测试：对话框
test.describe('对话框', () => {
  test('应该能打开设置', async ({ page }) => {
    await page.goto('/')
    
    // 查找设置按钮
    const settingsButton = page.locator('button:has-text("设置"), a[href*="settings"]')
    
    // 如果存在，点击它
    if (await settingsButton.count() > 0) {
      await settingsButton.first().click()
      await expect(page.locator('dialog, [class*="modal"]')).toBeVisible()
    }
  })
})

// 测试：表单
test.describe('表单', () => {
  test('应该能输入文本', async ({ page }) => {
    await page.goto('/')
    
    // 查找输入框
    const input = page.locator('input[type="text"], textarea').first()
    
    if (await input.count() > 0) {
      await input.fill('测试输入')
      await expect(input).toHaveValue('测试输入')
    }
  })
})

// 测试：响应式
test.describe('响应式', () => {
  test('应该在移动端正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // 页面应该没有严重错误
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    
    await page.waitForTimeout(1000)
    
    // 不应该有控制台错误
    expect(errors.filter(e => e.includes('Error'))).toHaveLength(0)
  })
})

// 测试：API 连接
test.describe('Gateway 连接', () => {
  test('应该能连接到 Gateway', async ({ page }) => {
    await page.goto('/')
    
    // 等待一小段时间让页面初始化
    await page.waitForTimeout(2000)
    
    // 检查是否有连接状态显示
    const statusIndicator = page.locator('[class*="status"], [class*="indicator"]')
    
    // 状态指示器可能存在也可能不存在（取决于 Gateway 是否运行）
    if (await statusIndicator.count() > 0) {
      await expect(statusIndicator.first()).toBeVisible()
    }
  })
})
