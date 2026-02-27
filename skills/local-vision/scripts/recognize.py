#!/usr/bin/env python3
"""
本地视觉模型识别脚本
使用 Ollama 的 MiniCPM-V 模型识别图片
"""
import base64
import requests
import sys
import os

MODEL_NAME = "openbmb/minicpm-v4.5"
OLLAMA_API = "http://localhost:11434/api/generate"

def recognize_image(image_path, prompt=None):
    """识别图片"""
    if not os.path.exists(image_path):
        return {"error": f"图片文件不存在: {image_path}"}
    
    # 读取图片并转为 base64
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()
    
    # 默认 prompt
    if prompt is None:
        prompt = "详细描述这张图片里的所有内容，包括文字、图标、颜色等"
    
    # 调用 Ollama API
    try:
        response = requests.post(
            OLLAMA_API,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "images": [img_b64],
                "stream": False
            },
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "response": result.get("response", "No response")
            }
        else:
            return {
                "error": f"API error: {response.status_code}",
                "message": response.text
            }
    except Exception as e:
        return {"error": str(e)}

def main():
    if len(sys.argv) < 2:
        print("用法: python recognize.py <图片路径> [prompt]")
        print("示例:")
        print("  python recognize.py ./test.jpg")
        print("  python recognize.py ./test.jpg '这张图片是什么产品？'")
        sys.exit(1)
    
    image_path = sys.argv[1]
    prompt = sys.argv[2] if len(sys.argv) > 2 else None
    
    result = recognize_image(image_path, prompt)
    
    if result.get("success"):
        print(result["response"])
    else:
        print(f"错误: {result.get('error')}")
        if "message" in result:
            print(result["message"])
        sys.exit(1)

if __name__ == "__main__":
    main()
