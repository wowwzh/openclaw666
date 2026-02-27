# 本地大模型图片识别方案

> 学习来源：Kimi 搜索
> 日期：2026-02-18

---

## 一、Ollama 安装与配置

### 1.1 下载安装
- 访问 [Ollama 官网](https://ollama.com/download/) 下载 Windows 安装包
- 默认安装到 C 盘，可通过环境变量修改模型存储位置

### 1.2 修改模型存储路径（重要！）
在系统环境变量中新建 `OLLAMA_MODELS`，指向自定义路径（如 `D:\ollama\models`），避免 C 盘空间不足。

### 1.3 验证安装
```bash
ollama --version
ollama list  # 查看已安装模型
```

---

## 二、支持的视觉模型推荐

| 模型 | 特点 | 显存需求 | 适用场景 |
|------|------|----------|----------|
| **LLaVA** | 经典视觉模型，生态成熟 | 4-8GB | 通用图像理解 |
| **MiniCPM-V 2.6/4.5** | 中文优化，端侧性能强 | 4-8GB | 中文场景、OCR |
| **Gemma 3** | Google 开源，多模态能力强 | 4-12GB | 图文理解 |
| **Llama 3.2 Vision** | Meta 官方，11B 参数 | 8GB+ | 高质量视觉问答 |

---

## 三、在线安装（有网络时）

### 安装 LLaVA（最简方案）
```bash
ollama pull llava
ollama run llava

# 或指定量化版本（节省显存）
ollama pull llava:7b
ollama pull llava:13b
```

### 安装 MiniCPM-V（中文推荐）
```bash
# MiniCPM-V 4.5 已官方支持
ollama run openbmb/minicpm-v4.5

# 或社区量化版（适合 8G 显存）
ollama run aiden_lu/minicpm-v2.6:Q4_K_M
```

### 安装 Gemma 3
```bash
ollama run gemma3  # 自动下载
```

---

## 四、离线部署方案（完全断网环境）

### 方案 A：模型文件迁移（推荐）

**步骤 1：联网电脑准备模型**
```bash
ollama pull llava:7b
```

**步骤 2：复制模型文件**
- Windows 默认路径：`C:\Users\<用户名>\.ollama\models`
- 或自定义的 OLLAMA_MODELS 路径
- 将 `manifests` 和 `blobs` 文件夹复制到离线电脑的对应目录

**步骤 3：离线导入**
```bash
# 重启 Ollama 后自动识别
ollama list  # 应显示已迁移的模型
ollama run llava:7b
```

### 方案 B：GGUF 格式手动导入（通用）

适用于从 Hugging Face 等渠道下载的 GGUF 模型文件：

**1. 准备文件**
- 下载视觉模型的 GGUF 文件（如 `llava-v1.5-7b-Q4_K_M.gguf`）
- 下载对应的 projector 文件（视觉模型必需！）

**2. 创建 Modelfile**
```dockerfile
FROM ./llava-v1.5-7b-Q4_K_M.gguf
FROM ./mmproj-model-f16.gguf  # 关键：视觉投影层

TEMPLATE """{{ if .System }}<|im_start|>system {{ .System }}<|im_end|>{{ end }} {{ if .Prompt }}<|im_start|>user {{ .Prompt }}<|im_end|>{{ end }} <|im_start|>assistant {{ .Response }}<|im_end|>"""
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|im_start|>"
```

**3. 创建并运行**
```bash
ollama create llava-local -f Modelfile
ollama run llava-local
```

⚠️ **关键提示**：视觉模型必须包含 projector 组件，否则无法处理图像！

---

## 五、Python API 调用示例

```python
import requests

# 图片转 base64
import base64
with open("test.jpg", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()

# 调用 Ollama API
response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "llava",
        "prompt": "描述这张图片",
        "images": [img_b64]
    }
)
print(response.json())
```

---

## 六、你已有的资源

你电脑上已经有：
- **Ollama** 安装在 `D:\ollama`
- **OllamaModels** 文件夹在 `D:\OllamaModels`
- **NVIDIA 显卡** - 可以跑本地模型

## 推荐方案

1. **中文场景**：用 `MiniCPM-V`，中文理解能力强
2. **通用场景**：用 `LLaVA 7B`，生态成熟
3. **离线**：先联网下载模型，再迁移到D盘

---

*持续更新中...*
