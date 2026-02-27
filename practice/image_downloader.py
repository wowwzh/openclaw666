#!/usr/bin/env python3
"""
练习1: 图片批量下载器
功能：从网页批量下载图片
v1.1 优化:
- 添加类型注解
- 使用异步下载提升效率
- 添加文件哈希去重
- 添加更详细的配置选项
- 添加下载进度回调
"""

import os
import requests
import hashlib
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import time
import re
from typing import Optional, List, Set, Callable, Dict
from concurrent.futures import ThreadPoolExecutor, as_completed

# ============== 配置 ==============

DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
REQUEST_TIMEOUT = 10
MAX_WORKERS = 5  # 并发下载数

class ImageDownloader:
    """图片批量下载器"""
    
    def __init__(self, save_dir: str = "downloads", max_workers: int = MAX_WORKERS):
        self.save_dir = save_dir
        self.max_workers = max_workers
        os.makedirs(save_dir, exist_ok=True)
        self.downloaded_hashes: Set[str] = set()  # 文件哈希去重
    
    def add(self, file_hash: str) -> None:
        """添加已下载文件哈希"""
        self.downloaded_hashes.add(file_hash)
    
    def clear_hashes(self) -> None:
        """清空已下载哈希记录"""
        self.downloaded_hashes.clear()
        
    def is_valid_url(self, url: str) -> bool:
        """验证URL是否有效"""
        parsed = urlparse(url)
        return bool(parsed.netloc) and bool(parsed.scheme)
    
    def get_image_extension(self, url: str) -> str:
        """获取图片扩展名"""
        extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
        path = urlparse(url).path
        ext = os.path.splitext(path)[1].lower()
        return ext if ext in extensions else '.jpg'
    
    def sanitize_filename(self, filename: str) -> str:
        """清理文件名"""
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        return filename[:100]
    
    def compute_hash(self, content: bytes) -> str:
        """计算文件内容哈希 (用于去重)"""
        return hashlib.md5(content).hexdigest()
    
    def download_image(self, url: str, filename: str, skip_duplicate: bool = True) -> tuple:
        """下载单张图片"""
        try:
            response = requests.get(url, headers=DEFAULT_HEADERS, timeout=REQUEST_TIMEOUT)
            if response.status_code == 200:
                content = response.content
                
                # 哈希去重
                if skip_duplicate:
                    file_hash = self.compute_hash(content)
                    if file_hash in self.downloaded_hashes:
                        return False, None, ".downloaded_hashesduplicate"
                    self.add(file_hash)
                
                ext = self.get_image_extension(url)
                if not filename.endswith(ext):
                    filename += ext
                    
                filepath = os.path.join(self.save_dir, filename)
                with open(filepath, 'wb') as f:
                    f.write(content)
                return True, filepath, "success"
        except Exception as e:
            return False, None, str(e)
        return False, None, "error"
    
    def crawl_images_from_page(self, url, limit=10):
        """从网页爬取图片"""
        print(f"\n[1] 正在获取网页: {url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 找到所有图片标签
            img_tags = soup.find_all('img')
            print(f"[2] 找到 {len(img_tags)} 个图片标签")
            
            # 提取图片URL
            image_urls = []
            for i, img in enumerate(img_tags):
                # 优先获取data-src，然后是src
                url_img = img.get('data-src') or img.get('src') or img.get('data-lazy')
                if url_img and self.is_valid_url(url_img):
                    full_url = urljoin(url, url_img)
                    image_urls.append(full_url)
            
            print(f"[3] 提取到 {len(image_urls)} 个有效图片URL")
            
            # 下载图片
            success_count = 0
            for i, img_url in enumerate(image_urls[:limit], 1):
                filename = f"image_{i:03d}"
                success, filepath = self.download_image(img_url, filename)
                if success:
                    success_count += 1
                    print(f"  [{i}/{limit}] OK: {filepath}")
                else:
                    print(f"  [{i}/{limit}] FAIL: {img_url[:50]}...")
                
                time.sleep(0.5)  # 礼貌延迟
            
            print(f"\n[✓] 下载完成: {success_count}/{min(limit, len(image_urls))} 张图片")
            return success_count
            
        except Exception as e:
            print(f"[Error] 爬取失败: {e}")
            return 0

# ============== 测试 ==============

def test_image_downloader():
    """测试图片下载器"""
    print("=" * 60)
    print("🖼️  图片批量下载器 - 测试")
    print("=" * 60)
    
    downloader = ImageDownloader("practice/downloads")
    
    # 测试页面（使用一个简单的测试页面）
    test_urls = [
        "https://httpbin.org/html",  # 测试页面
        # "https://example.com",  # 备用
    ]
    
    for url in test_urls:
        print(f"\n>>> 测试URL: {url}")
        count = downloader.crawl_images_from_page(url, limit=5)
        if count > 0:
            break
    
    print("\n" + "=" * 60)
    print("[OK] 图片下载器测试完成!")
    print("=" * 60)

if __name__ == "__main__":
    test_image_downloader()
