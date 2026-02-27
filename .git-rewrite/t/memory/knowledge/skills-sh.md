# Skills.sh 学习笔记

## 今日学习 (2026-02-17)

### 1. 四阶段调试法 (systematic-debugging) ✅
**来源**: obra/superpowers

**核心原则**: 先找根因，再修复！

| 阶段 | 内容 |
|------|------|
| 1. 根因调查 | 仔细读错误信息、复现问题、检查最近改动 |
| 2. 模式分析 | 找相似 working code、理解依赖 |
| 3. 假设与测试 | 最小化改动验证假设 |
| 4. 实现 | 修复根因，不是症状 |

### 2. PDF 处理 (pdf) ✅
**来源**: anthropics/skills

**Python 库**:
- **pypdf** - 合并、拆分、旋转、提取元数据
- **pdfplumber** - 文本和表格提取 → pandas/DataFrame
- **reportlab** - 创建 PDF

### 3. DOCX 处理 (docx) ✅
**来源**: anthropics/skills

**方法**:
- 创建: docx-js (npm)
- 编辑: 解压 → 修改 XML → 重新打包
- 转换: pandoc --track-changes=all

### 4. XLSX 处理 (xlsx) ✅
**来源**: anthropics/skills

**规范**:
- 蓝色: 硬编码输入
- 黑色: 公式
- 绿色: 同工作簿链接
- 红色: 外部链接
- 零错误原则

### 5. PPTX 处理 (pptx) ✅
**来源**: anthropics/skills

**工具**:
- 读取: markitdown / thumbnail.py
- 创建: pptxgenjs
- 设计: 色彩搭配 + 视觉元素重复

### 6. TTS 语音交互 ✅
**来源**: Kimi 搜索

| 库 | 特点 | 推荐场景 |
|---|---|---|
| **edge-tts** ⭐ | 音质极佳、免费、中文支持好 | 高质量语音需求 |
| **pyttsx3** | 离线可用、音质一般 | 无网络环境 |
| **gTTS** | 简单易用、受网络限制 | 简单快速集成 |

**推荐首选**: edge-tts
- 安装: `pip install edge-tts`
- 语音: zh-CN-XiaoxiaoNeural (晓晓女声)

### 7. browser-use ℹ️
**说明**: OpenClaw 内置 browser 工具已实现相同功能

---

## 今日学习完成！✅

| 技能 | 状态 |
|------|------|
| 四阶段调试法 | ✅ |
| PDF 处理 | ✅ |
| DOCX 处理 | ✅ |
| XLSX 处理 | ✅ |
| PPTX 处理 | ✅ |
| TTS 语音 | ✅ |
| browser-use | ℹ️ OpenClaw内置 |

## 待继续探索
- [ ] 图片识别 MCP 方案
