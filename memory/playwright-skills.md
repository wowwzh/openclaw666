# Playwright 浏览器自动化高级技巧

> 学习来源：Kimi 搜索 + 官方文档
> 日期：2026-02-18

---

## 一、模拟手机环境 (Mobile Emulation)

### 1.1 基础设备模拟

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    # 使用预定义设备配置
    iphone_14 = p.devices['iPhone 14 Pro']
    browser = p.chromium.launch()
    context = browser.new_context(**iphone_14)
    page = context.new_page()
```

### 1.2 自定义手机配置

```python
# 自定义iPhone配置
DEVICE_CONFIG = {
    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    "viewport": {"width": 393, "height": 852},
    "device_scale_factor": 3,
    "is_mobile": True,
    "has_touch": True,
}
```

### 1.3 模拟微信环境

```python
# 微信浏览器UA
WEIXIN_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.0"
```

---

## 二、绕过反爬检测 (Anti-Detection)

### 2.1 使用 stealth 模式

```python
# 方法1: playwright-stealth 插件
pip install playwright-stealth
from playwright_stealth import stealth
page = context.new_page()
stealth(page)
```

### 2.2 移除 webdriver 特征

```python
# 通过JavaScript移除自动化特征
page.add_init_script("""
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
    });
""")
```

### 2.3 模拟真实用户行为

```python
# 随机延迟
import random
import time

time.sleep(random.uniform(0.5, 2.0))

# 随机滚动
await page.mouse.wheel(random.randint(100, 500))
```

---

## 三、处理滑块验证 (Slider Captcha)

### 3.1 常用方法

| 方法 | 说明 |
|------|------|
| 手动输入 | 用户手动完成 |
| 打码平台 | 付费服务如 2Captcha |
| 行为模拟 | 模拟人类滑动轨迹 |
| 更换IP | 使用代理IP减少验证 |

### 3.2 模拟人类滑动

```python
async def human_slide(page, slider_element):
    """模拟人类滑动轨迹"""
    # 获取滑块初始位置
    box = await slider_element.bounding_box()
    start_x = box['x']
    
    # 模拟加速-减速轨迹
    import random
    current_x = start_x
    steps = 20
    
    for i in range(steps):
        # 越往后速度越慢，模拟减速
        speed = random.uniform(5, 15) * (1 + i/steps)
        current_x += speed
        await page.mouse.move(current_x, box['y'])
        await page.wait_for_timeout(20)
```

---

## 四、Cookie 管理

### 4.1 保存Cookie

```python
import json

# 访问页面后保存
cookies = await context.cookies()
with open('cookies.json', 'w') as f:
    json.dump(cookies, f, ensure_ascii=False, indent=2)
```

### 4.2 加载Cookie

```python
# 加载保存的Cookie
with open('cookies.json', 'r') as f:
    cookies = json.load(f)
await context.add_cookies(cookies)
```

---

## 五、位置权限 (Geolocation)

```python
context = await browser.new_context(
    permissions=['geolocation'],
    geolocation={'latitude': 31.2304, 'longitude': 121.4737},  # 上海
)
```

---

## 六、常见问题

### Q: 为什么模拟手机还是被检测？
A: 
1. Canvas / WebGL 指纹暴露
2. 缺少传感器API（陀螺仪、加速计）
3. 需要更完整的浏览器指纹

### Q: Cookie 多久过期？
A: 一般1-30天，建议定期更新

### Q: 如何处理验证码？
A: 
1. 滑动验证码：模拟人类轨迹
2. 点选验证码：用打码平台
3. 短信验证码：需要手机号

---

## 七、京东/微信特定技巧

### 7.1 微信环境关键点
- 使用微信UA + 微信Cookie
- 需要Referer模拟
- 某些接口需要登录态

### 7.2 京东反爬特点
- 滑动验证码较频繁
- 短链接跳转后是推广页
- 领券入口可能在微信内

---

*持续更新中...*
