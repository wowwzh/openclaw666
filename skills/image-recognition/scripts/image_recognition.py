#!/usr/bin/env python3
"""
百度AI图像识别客户端
用于识别图片中的物体、场景、文字等
"""

import base64
import json
import requests
import os

# 环境变量
API_KEY = os.environ.get('BAIDU_API_KEY', '')
SECRET_KEY = os.environ.get('BAIDU_SECRET_KEY', '')
APP_ID = os.environ.get('BAIDU_APP_ID', '')

# API地址
OCR_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic"
IMAGE_CLASSIFY_URL = "https://aip.baidubce.com/rest/2.0/image-classify/v1/object_detect"


def get_access_token():
    """获取百度API访问令牌"""
    auth_url = "https://aip.baidubce.com/oauth/2.0/token"
    params = {
        "grant_type": "client_credentials",
        "client_id": API_KEY,
        "client_secret": SECRET_KEY
    }
    response = requests.get(auth_url, params=params)
    return response.json().get("access_token")


def recognize_image(image_path_or_url):
    """
    识别图片内容
    
    Args:
        image_path_or_url: 图片路径或URL
    
    Returns:
        dict: 识别结果
    """
    if not API_KEY or not SECRET_KEY:
        return {"error": "请配置 BAIDU_API_KEY 和 BAIDU_SECRET_KEY 环境变量"}
    
    # 获取access_token
    access_token = get_access_token()
    
    # 判断是本地文件还是URL
    if image_path_or_url.startswith('http'):
        # URL图片
        image_url = image_path_or_url
        params = {"url": image_url}
    else:
        # 本地图片转base64
        with open(image_path_or_url, 'rb') as f:
            image_base64 = base64.b64encode(f.read()).decode('utf-8')
        params = {"image": image_base64}
    
    # 调用API
    url = f"{OCR_URL}?access_token={access_token}"
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    
    response = requests.post(url, data=params, headers=headers)
    result = response.json()
    
    return result


def recognize_object(image_path):
    """
    识别图片中的物体和位置
    
    Args:
        image_path: 图片路径
    
    Returns:
        dict: 物体识别结果
    """
    if not API_KEY or not SECRET_KEY:
        return {"error": "请配置 BAIDU_API_KEY 和 BAIDU_SECRET_KEY 环境变量"}
    
    access_token = get_access_token()
    
    with open(image_path, 'rb') as f:
        image_base64 = base64.b64encode(f.read()).decode('utf-8')
    
    params = {"image": image_base64, "with_face": 1}
    url = f"{IMAGE_CLASSIFY_URL}?access_token={access_token}"
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    
    response = requests.post(url, data=params, headers=headers)
    return response.json()


def main():
    """测试入口"""
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python image_recognition.py <图片路径或URL>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    print(f"正在识别图片: {image_path}")
    result = recognize_image(image_path)
    
    print("\n识别结果:")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
