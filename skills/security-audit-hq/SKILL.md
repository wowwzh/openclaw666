# Security安全审计技能

完整的安全审计与渗透测试指南。

## OWASP Top 10

```
1. A01:2021 失效的访问控制
2. A02:2021 加密失败
3. A03:2021 注入
4. A04:2021 不安全设计
5. A05:2021 安全配置错误
6. A06:2021 易受攻击和过时的组件
7. A07:2021 识别和身份验证失败
8. A08:2021 软件和数据完整性失败
9. A09:2021 安全日志和监控失败
10. A10:2021 服务端请求伪造(SSRF)
```

## 常见漏洞

### 1. SQL注入

```javascript
// 漏洞
const query = `SELECT * FROM users WHERE id = ${userId}`;

// 修复
const query = 'SELECT * FROM users WHERE id = $1';
const result = await client.query(query, [userId]);
```

### 2. XSS

```javascript
// 漏洞
div.innerHTML = userInput;

// 修复
div.textContent = userInput;
// 或
div.innerHTML = DOMPurify.sanitize(userInput);
```

### 3. CSRF

```javascript
// 修复
app.use(csrf());
app.use(session({ cookie: { sameSite: 'strict' } }));
```

## 安全头

```javascript
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:']
  }
}));
```

## 密码安全

```javascript
const bcrypt = require('bcrypt');

// 加密
const hash = await bcrypt.hash(password, 12);

// 验证
const match = await bcrypt.compare(password, hash);
```

## 审计工具

```bash
# npm audit
npm audit
npm audit fix

# Snyk
npx snyk test

# SonarQube
sonar-scanner

# OWASP ZAP
zap-baseline.py -t https://example.com
```

## 日志审计

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'audit.log' })
  ]
});

// 审计日志
logger.info('user_action', {
  userId: req.user.id,
  action: 'login',
  ip: req.ip,
  timestamp: new Date()
});
```

## 渗透测试

```bash
# 信息收集
nmap -sV -O target.com
whois target.com
sublist3r -d target.com

# 漏洞扫描
nikto -h target.com
sqlmap -u "target.com?id=1"

# 爆破
hydra -L users.txt -P passwords.txt target.com ssh
```

## 最佳实践

1. **输入验证** - 严格验证所有输入
2. **参数化查询** - 防止SQL注入
3. **输出编码** - 防止XSS
4. **HTTPS** - 强制使用
5. **安全头** - Helmet设置
6. **日志审计** - 记录所有操作
7. **定期扫描** - 自动化审计
