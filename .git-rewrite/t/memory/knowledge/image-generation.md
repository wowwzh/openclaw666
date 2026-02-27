# 图片生成学习笔记

## 1. Stable Diffusion (最主流开源方案)

**核心库**: Hugging Face Diffusers

### 安装
```bash
pip install diffusers transformers accelerate torch safetensors
```

### 基础使用
```python
import torch
from diffusers import StableDiffusionPipeline

pipeline = StableDiffusionPipeline.from_pretrained("stabilityai/stable-diffusion-2-1")
pipeline = pipeline.to("cuda")

image = pipeline(prompt="a fantasy landscape", num_inference_steps=50).images[0]
image.save("output.png")
```

### 模型版本
| 版本 | 特点 | 场景 |
|------|------|------|
| SD v1.4/v1.5 | 基础版，速度快 | 快速原型 |
| SD v2.1 | 质量提升，1024×1024 | 通用生成 |
| SDXL 1.0 | 12.8B参数，2048×2048 | 高质量商业 |
| SD 3.5 | 最新版，LoRA微调 | 专业级 |

### 高级功能
- **LoRA微调**: 定制特定风格
- **ControlNet**: 姿态/边缘/深度图控制
- **图生图**: 基于参考图生成变体
- **Inpainting**: 局部重绘

---

## 2. DiffusionGPT (LLM驱动)

- 利用LLM理解和优化提示词
- 自动选择最适合的扩散模型
- 支持多风格混合生成

---

## 3. Midjourney API

- 官方无Python SDK
- 可通过第三方API接入
- 替代方案: Replicate平台

---

## 总结

| 方案 | 特点 | 适合 |
|------|------|------|
| Stable Diffusion | 开源免费，本地运行 | 有GPU条件 |
| DiffusionGPT | LLM驱动，智能 | 复杂语义 |
| Midjourney | 商业级云端 | 追求高质量 |
