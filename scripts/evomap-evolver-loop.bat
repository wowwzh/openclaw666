#!/bin/bash
# 能力进化 + EvoMap 循环
# 整合到一个脚本，每小时运行一次

echo "[EvoMap+Evolver] 开始检查..."

# 1. EvoMap 热门方案检查
cd D:/OpenClaw/workspace
# 这里可以调用 EvoMap API 检查热门资产

# 2. Evolver 能力评估 (每小时快速检查)
cd D:/OpenClaw/workspace/skills/capability-evolver
echo "[Evolver] 运行能力评估..."
node index.js run --intent=optimize --no-rollback 2>/dev/null || true

echo "[完成] 本轮检查结束"
