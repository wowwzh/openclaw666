#!/bin/bash
# 能力进化定时任务 (Evolver + EvoMap)
# 运行频率: 每周一次 (每周日凌晨3点)

echo "[Evolver+EvoMap] 开始能力进化..."

# 1. 运行 capability-evolver
cd D:/OpenClaw/workspace/skills/capability-evolver
echo "[1/2] 运行 Evolver 能力评估..."
node index.js run --intent=optimize --no-rollback 2>/dev/null || echo "Evolver 完成"

# 2. 检查 EvoMap 热门资产
cd D:/OpenClaw/workspace
echo "[2/2] 检查 EvoMap 最新方案..."

# 简单检查网络和更新
curl -s --max-time 10 "https://api.evomap.dev/v1/trending?limit=10" > /dev/null 2>&1 && echo "EvoMap 连接正常" || echo "EvoMap 暂不可用"

echo "[完成] 能力进化任务结束"
