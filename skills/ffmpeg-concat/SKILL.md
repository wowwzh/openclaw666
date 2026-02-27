# FFmpeg视频合并技能

安全合并多个视频片段为一个文件。

## 问题

- 直接concat可能失败
- 中文/特殊字符文件名处理
- 临时文件清理

## 解决方案

### 1. FFmpeg concat demuxer

```bash
# 创建文件列表
echo "file 'video1.mp4'" > concat.txt
echo "file 'video2.mp4'" >> concat.txt

# 合并
ffmpeg -f concat -safe 0 -i concat.txt -c copy output.mp4
```

### 2. Python实现

```python
import subprocess
import os
import glob

def concat_videos(video_files, output_path):
    # 创建临时列表文件
    list_file = 'concat_temp.txt'
    with open(list_file, 'w', encoding='utf-8') as f:
        for video in video_files:
            # 转义特殊字符
            safe_path = video.replace("'", "'\\''")
            f.write(f"file '{safe_path}'\n")
    
    # 执行合并
    cmd = ['ffmpeg', '-f', 'concat', '-safe', '0', '-i', list_file, 
           '-c', 'copy', output_path]
    subprocess.run(cmd, check=True)
    
    # 清理临时文件
    os.remove(list_file)
```

### 3. 代理转码(可选)

```python
# 如果直接copy失败，降级到转码
cmd = ['ffmpeg', '-i', list_file, 
       '-c:v', 'libx264', '-preset', 'fast',
       '-vf', 'scale=-2:360',  # 360p
       output_path]
```

## 注意事项

- 视频编码需一致
- 中文路径用UTF-8
- 特殊字符需转义
