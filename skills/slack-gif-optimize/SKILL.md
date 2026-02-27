# Slack GIF优化技能

创建Slack优化的GIF动图。

## Slack要求

| 类型 | 尺寸 | 说明 |
|------|------|------|
| Emoji GIF | 128x128 | 表情符号 |
| Message GIF | 480x480 | 消息配图 |

## 参数优化

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| FPS | 10-30 | 越低文件越小 |
| 颜色 | 48-128 | 越少文件越小 |
| 尺寸 | ≤480px | Slack推荐480 |

## FFmpeg制作

```bash
# 制作Emoji GIF (128x128, 15fps)
ffmpeg -i input.mp4 -vf "fps=15,scale=128:128:force_original_aspect_ratio=decrease,pad=128:128:(ow-iw)/2:(oh-ih)/2" -loop 0 emoji.gif

# 制作消息GIF (480x480, 20fps)
ffmpeg -i input.mp4 -vf "fps=20,scale=480:480:force_original_aspect_ratio=decrease" -loop 0 message.gif
```

## Python实现

```python
from moviepy.editor import VideoFileClip

def create_slack_gif(input_path, output_path, gif_type='message'):
    clip = VideoFileClip(input_path)
    
    if gif_type == 'emoji':
        clip = clip.resize((128, 128))
        fps = 15
    else:
        clip = clip.resize((480, 480))
        fps = 20
    
    clip.write_gif(output_path, fps=fps, colors=64)

# 使用
create_slack_gif('video.mp4', 'emoji.gif', 'emoji')
create_slack_gif('video.mp4', 'message.gif', 'message')
```

## 压缩工具

```bash
# gifsicle 优化
gifsicle -O3 --colors 64 input.gif -o output.gif

# 在线工具
# - EzGIF
# - GIF Brewery
```

## 最佳实践

1. 先缩放再降FPS
2. 颜色不超过128
3. 使用调色板优化
4. 测试不同尺寸
