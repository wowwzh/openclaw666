# CI/CD Pipeline持续集成部署技能

完整的CI/CD流程设计与实现。

## 流程

```
Code → Build → Test → Deploy → Monitor

Commit → CI → Staging → Production
```

## GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_TOKEN }} | docker login -u ${{ secrets.DOCKER_USER }} --password-stdin
          docker push myapp:${{ github.sha }}
```

## GitHub Actions部署

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Staging
        run: |
          kubectl set image deployment/myapp myapp=myapp:${{ github.sha }} -n staging
          kubectl rollout status deployment/myapp -n staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        run: |
          kubectl set image deployment/myapp myapp=${{ github.sha }} -n production
          kubectl rollout status deployment/myapp -n production
```

## GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run lint
    - npm test
  coverage: '/Coverage: \d+\.\d+%/'

build:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker build -t myapp:$CI_COMMIT_SHA .
    - docker push myapp:$CI_COMMIT_SHA

deploy-staging:
  stage: deploy
  script:
    - kubectl config set-cluster staging
    - kubectl set image deployment/myapp myapp=$CI_COMMIT_SHA
  only:
    - develop

deploy-production:
  stage: deploy
  script:
    - kubectl config set-cluster production
    - kubectl set image deployment/myapp myapp=$CI_COMMIT_SHA
  only:
    - main
  when: manual
```

## 测试

```javascript
// Jest配置
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/*.test.js'],
  // 并行执行
  maxWorkers: '50%',
  // 缓存
  cache: true,
  // 监视模式
  watchPathIgnorePatterns: ['node_modules', 'coverage']
};

// 单元测试
test('add function', () => {
  expect(add(1, 2)).toBe(3);
});

// 集成测试
describe('API', () => {
  beforeAll(async () => {
    await db.connect();
  });
  
  afterAll(async () => {
    await db.disconnect();
  });
  
  test('GET /users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
  });
});
```

## Docker多阶段构建

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER node
CMD ["node", "dist/index.js"]
```

## 环境管理

```yaml
# .env files
.env           # 本地
.env.development
.env.staging
.env.production

# 加载
const dotenv = require('dotenv');
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
```

## 回滚

```bash
# Kubernetes回滚
kubectl rollout undo deployment/myapp
kubectl rollout status deployment/myapp

# Docker回滚
docker pull myapp:previous-tag
kubectl set image deployment/myapp myapp=myapp:previous-tag
```

## 监控

```yaml
# deployment monitor
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

## 最佳实践

1. **快速反馈** - CI流程越快越好
2. **自动化** - 减少手动操作
3. **幂等性** - 可重复执行
4. **回滚** - 随时可回滚
5. **监控** - 部署后监控
6. **通知** - 失败及时通知
