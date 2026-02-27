import { test, expect } from '@playwright/test';

test.describe('计算器 E2E 测试', () => {
  
  // 测试 1: 验证计算器页面加载
  test('测试计算器页面加载', async ({ page }) => {
    // 导航到计算器页面
    await page.goto('file://' + process.cwd() + '/calculator.html');
    
    // 验证页面标题
    await expect(page).toHaveTitle('计算器');
    
    // 验证显示框存在
    const display = page.locator('#display');
    await expect(display).toBeVisible();
    
    // 验证按钮容器存在
    const buttons = page.locator('.buttons');
    await expect(buttons).toBeVisible();
    
    // 验证所有数字按钮存在 (0-9)
    for (let i = 0; i <= 9; i++) {
      await expect(page.locator(`button[data-value="${i}"]`)).toBeVisible();
    }
    
    // 验证运算符按钮存在
    await expect(page.locator('button[data-value="+"]')).toBeVisible();
    await expect(page.locator('button[data-value="-"]')).toBeVisible();
    await expect(page.locator('button[data-value="*"]')).toBeVisible();
    await expect(page.locator('button[data-value="/"]')).toBeVisible();
    
    // 验证等号和清除按钮
    await expect(page.locator('button[data-value="="]')).toBeVisible();
    await expect(page.locator('button[data-value="C"]')).toBeVisible();
    
    console.log('✓ 页面加载测试通过');
  });

  // 测试 2: 验证按钮点击功能
  test('测试点击按钮是否正常', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/calculator.html');
    
    const display = page.locator('#display');
    
    // 点击数字按钮 5
    await page.locator('button[data-value="5"]').click();
    await expect(display).toHaveValue('5');
    
    // 点击数字按钮 3
    await page.locator('button[data-value="3"]').click();
    await expect(display).toHaveValue('53');
    
    // 点击加号
    await page.locator('button[data-value="+"]').click();
    await expect(display).toHaveValue('53+');
    
    // 点击数字按钮 7
    await page.locator('button[data-value="7"]').click();
    await expect(display).toHaveValue('53+7');
    
    console.log('✓ 按钮点击测试通过');
  });

  // 测试 3: 验证计算功能 - 加法
  test('测试加法计算功能', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/calculator.html');
    
    const display = page.locator('#display');
    
    // 输入: 10 + 20
    await page.locator('button[data-value="1"]').click();
    await page.locator('button[data-value="0"]').click();
    await page.locator('button[data-value="+"]').click();
    await page.locator('button[data-value="2"]').click();
    await page.locator('button[data-value="0"]').click();
    await page.locator('button[data-value="="]').click();
    
    // 验证结果
    await expect(display).toHaveValue('30');
    
    console.log('✓ 加法计算测试通过');
  });

  // 测试 4: 验证计算功能 - 减法
  test('测试减法计算功能', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/calculator.html');
    
    const display = page.locator('#display');
    
    // 输入: 50 - 25
    await page.locator('button[data-value="5"]').click();
    await page.locator('button[data-value="0"]').click();
    await page.locator('button[data-value="-"]').click();
    await page.locator('button[data-value="2"]').click();
    await page.locator('button[data-value="5"]').click();
    await page.locator('button[data-value="="]').click();
    
    // 验证结果
    await expect(display).toHaveValue('25');
    
    console.log('✓ 减法计算测试通过');
  });

  // 测试 5: 验证计算功能 - 乘法
  test('测试乘法计算功能', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/calculator.html');
    
    const display = page.locator('#display');
    
    // 输入: 6 * 7
    await page.locator('button[data-value="6"]').click();
    await page.locator('button[data-value="*"]').click();
    await page.locator('button[data-value="7"]').click();
    await page.locator('button[data-value="="]').click();
    
    // 验证结果
    await expect(display).toHaveValue('42');
    
    console.log('✓ 乘法计算测试通过');
  });

  // 测试 6: 验证计算功能 - 除法
  test('测试除法计算功能', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/calculator.html');
    
    const display = page.locator('#display');
    
    // 输入: 100 / 4
    await page.locator('button[data-value="1"]').click();
    await page.locator('button[data-value="0"]').click();
    await page.locator('button[data-value="0"]').click();
    await page.locator('button[data-value="/"]').click();
    await page.locator('button[data-value="4"]').click();
    await page.locator('button[data-value="="]').click();
    
    // 验证结果
    await expect(display).toHaveValue('25');
    
    console.log('✓ 除法计算测试通过');
  });

  // 测试 7: 验证清除按钮功能
  test('测试清除按钮功能', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/calculator.html');
    
    const display = page.locator('#display');
    
    // 输入一些数字
    await page.locator('button[data-value="1"]').click();
    await page.locator('button[data-value="2"]').click();
    await page.locator('button[data-value="3"]').click();
    await expect(display).toHaveValue('123');
    
    // 点击清除按钮
    await page.locator('button[data-value="C"]').click();
    await expect(display).toHaveValue('');
    
    console.log('✓ 清除按钮测试通过');
  });

  // 测试 8: 验证复杂计算 - 混合运算
  test('测试复杂计算功能', async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/calculator.html');
    
    const display = page.locator('#display');
    
    // 输入: 2 + 3 * 4 = (先加后乘，按照 JavaScript eval 顺序)
    await page.locator('button[data-value="2"]').click();
    await page.locator('button[data-value="+"]').click();
    await page.locator('button[data-value="3"]').click();
    await page.locator('button[data-value="*"]').click();
    await page.locator('button[data-value="4"]').click();
    await page.locator('button[data-value="="]').click();
    
    // JavaScript eval: 2 + 3 * 4 = 14
    await expect(display).toHaveValue('14');
    
    console.log('✓ 复杂计算测试通过');
  });
});
