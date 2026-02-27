#!/usr/bin/env python3
"""
URL短链接生成器 v1.0
功能: 将长URL转换为短链接（模拟实现）
技术: Python + hashlib + base62编码
"""

import hashlib
import base64
import re
from urllib.parse import urlparse

class URLShortener:
    """URL短链接生成器"""
    
    # 62个字符的映射表 (0-9, a-z, A-Z)
    CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    def __init__(self):
        self.url_db = {}  # 短链接 -> 原始URL
        self.counter = 1  # 自增计数器
    
    def _to_base62(self, num):
        """将数字转换为base62字符串"""
        if num == 0:
            return self.CHARS[0]
        
        arr = []
        base = len(self.CHARS)
        while num > 0:
            arr.append(self.CHARS[num % base])
            num //= base
        return ''.join(reversed(arr))
    
    def _hash_url(self, url):
        """对URL进行哈希处理"""
        # 使用MD5哈希
        hash_obj = hashlib.md5(url.encode())
        hash_hex = hash_obj.hexdigest()
        # 取前8位并转换为数字
        return int(hash_hex[:8], 16)
    
    def shorten(self, url):
        """生成短链接"""
        # 验证URL格式
        if not self._is_valid_url(url):
            raise ValueError(f"无效的URL: {url}")
        
        # 检查是否已存在
        for short, original in self.url_db.items():
            if original == url:
                return short
        
        # 生成新的短链接
        short_code = self._to_base62(self.counter)
        self.counter += 1
        
        short_url = f"https://sho.rt/{short_code}"
        self.url_db[short_url] = url
        
        return short_url
    
    def expand(self, short_url):
        """还原原始URL"""
        return self.url_db.get(short_url, None)
    
    def _is_valid_url(self, url):
        """验证URL格式"""
        regex = re.compile(
            r'^(?:http|ftp)s?://'  # http:// 或 https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
            r'localhost|'
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
            r'(?::\d+)?'
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        return re.match(regex, url) is not None
    
    def get_stats(self):
        """获取统计信息"""
        return {
            "total_urls": len(self.url_db),
            "counter": self.counter
        }


# 测试代码
if __name__ == "__main__":
    shortener = URLShortener()
    
    # 测试 URLs
    test_urls = [
        "https://www.google.com/search?q=python+programming",
        "https://github.com/openclaw/openclaw/issues/100",
        "https://stackoverflow.com/questions/12345678/python-example",
    ]
    
    print("[URL短链接生成器测试]\n")
    
    for url in test_urls:
        short = shortener.shorten(url)
        original = shortener.expand(short)
        print(f"原始: {url[:50]}...")
        print(f"短链: {short}")
        print(f"还原: {original}")
        print()
    
    print("[统计]: {}".format(shortener.get_stats()))
