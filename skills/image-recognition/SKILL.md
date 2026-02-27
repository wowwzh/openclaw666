---
openclaw:
  requires: {}
  version: 1.0.0
---

# 图片识别技能 (Image Recognition)

使用百度AI图像识别服务，识别图片中的内容。

## 功能

- ✅ 通用物体和场景识别
- ✅ 文字识别 (OCR)
- ✅ 物体位置检测
- ✅ 菜品、logo识别

## 前置要求

1. 安装百度AI Python SDK：
```bash
pip install baidu-aip requests
```

2. 获取API密钥：
- 访问 https://ai.baidu.com/
- 创建"图像识别"应用
- 获取 API Key 和 Secret Key

## 配置

在 `openclaw.json` 的 skills 区域添加：

```json
{
  "skills": {
    "entries": {
      "image-recognition": {
        "enabled": true,
        "env": {
          "BAIDU_API_KEY": "你的API Key",
          "BAIDU_SECRET_KEY": "你的Secret Key"
        }
      }
    }
  }
}
```

## 使用方法

### 命令行
```bash
python skills/image-recognition/scripts/image_recognition.py <图片路径或URL>
```

### Python调用
```python
from scripts.image_recognition import recognize_image

# 识别图片
result = recognize_image("photo.jpg")
print(result)

# 识别物体
result = recognize_object("photo.jpg")
print(result)
```

## 免费额度

| 服务 | 免费额度 |
|------|---------|
| 通用物体识别 | 1000次/天 |
| 文字识别 | 500次/天 |
| 人脸识别 | 1000次/天 |

## 技能状态

- [x] SKILL.md 文档完成
- [x] Python 脚本完成
- [ ] API Key 配置中
- [ ] 测试中
