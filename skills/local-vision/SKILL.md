---
name: local-vision
description: 本地视觉模型识别 - 使用 Ollama 本地模型识别图片
metadata: {"openclaw": {"requires": {"tools": ["exec"]}}}
---

# 本地视觉模型识别 Skill

使用 Ollama 本地部署的视觉模型识别图片，比云端模型更准确！

## 已安装的模型

- `openbmb/minicpm-v4.5` - MiniCPM 多模态模型（5.9GB）

## 使用方法

### 方式一：直接调用脚本

```bash
python ~/.openclaw/workspace/skills/local-vision/scripts/recognize.py <图片路径>
```

### 方式二：在对话中让幼楚识别

直接发图片给我，说"用本地模型识别"即可！

## 原理

通过 exec 工具调用本地 Ollama 服务：
1. 读取图片并转为 base64
2. 调用 Ollama API (localhost:11434)
3. 返回识别结果

## 注意事项

- 需要 Ollama 服务运行中
- 模型需要提前下载
- 首次识别可能较慢
