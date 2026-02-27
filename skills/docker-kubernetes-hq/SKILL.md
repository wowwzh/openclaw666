# Docker Kubernetes生产部署技能

完整的容器化部署方案。

## Dockerfile最佳实践

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 运行镜像
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

## Kubernetes部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Helm Chart

```bash
# 创建chart
helm create myapp

# 部署
helm install myapp ./myapp --set image.tag=v1.0.0

# 升级
helm upgrade myapp ./myapp --set image.tag=v1.0.1

# 回滚
helm rollback myapp 1
```

## 健康检查

```javascript
// K8s liveness/readiness
app.get('/health', (req, res) => {
  const memory = process.memoryUsage();
  if (memory.heapUsed > 512 * 1024 * 1024) {
    return res.status(503).json({ status: 'unhealthy', reason: 'memory' });
  }
  res.json({ status: 'healthy' });
});

app.get('/ready', async (req, res) => {
  const dbReady = await checkDatabase();
  const redisReady = await checkRedis();
  if (dbReady && redisReady) {
    res.json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});
```

## 监控

```yaml
# prometheus.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: myapp
spec:
  selector:
    matchLabels:
      app: myapp
  endpoints:
  - port: metrics
    path: /metrics
```

## 持续部署

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: azure/k8s-set-context@v1
      - uses: azure/k8s-deploy@v1
        with:
          manifests: k8s/
          images: myregistry/myapp:${{ github.sha }}
```

## 资源优化

| 资源 | 推荐值 |
|------|--------|
| CPU Request | 100-500m |
| Memory Request | 128-512Mi |
| Memory Limit | 2x Request |
| Replicas | 2-3 生产 |

## 安全

```dockerfile
# 非root用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup
USER appuser
```
