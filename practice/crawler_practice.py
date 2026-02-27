#!/usr/bin/env python3
"""
爬虫练习 - 爬取稀土掘金热门文章
v1.1 优化:
- 添加类型注解
- 添加速率限制
- 统一请求配置
- 添加重试机制
- 更好的错误处理
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from typing import Optional, Dict, List, Any
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ============== 配置 ==============

DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
REQUEST_TIMEOUT = 10
MAX_RETRIES = 3

# ============== 请求会话 ==============

def create_session() -> requests.Session:
    """创建带重试的会话"""
    session = requests.Session()
    retry = Retry(
        total=MAX_RETRIES,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

# 共享会话
_http_session = None

def get_session() -> requests.Session:
    """获取共享会话"""
    global _http_session
    if _http_session is None:
        _http_session = create_session()
    return _http_session

# ============== 爬虫基础 ==============

def get_html(url: str, headers: Optional[Dict] = None, timeout: int = REQUEST_TIMEOUT) -> Optional[str]:
    """获取网页内容 (带重试)"""
    req_headers = {**DEFAULT_HEADERS, **(headers or {})}
    
    try:
        session = get_session()
        response = session.get(url, headers=req_headers, timeout=timeout)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"[Error] 获取网页失败: {e}")
        return None

# ============== 爬取稀土掘金 ==============

def crawl_juejin():
    """爬取稀土掘金热门文章"""
    print("=" * 50)
    print("爬虫练习：稀土掘金热门文章")
    print("=" * 50)
    
    url = "https://api.juejin.cn/content_api/v1/article/listbytag?tag_id=1&cursor=0&limit=10"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://juejin.cn/'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        
        if data.get('err_msg') == 'success':
            articles = data.get('data', [])
            print(f"\n共爬取 {len(articles)} 篇文章：\n")
            
            for i, article in enumerate(articles, 1):
                info = article.get('article_info', {})
                title = info.get('title', '无标题')
                view_count = info.get('view_count', 0)
                collect_count = info.get('collect_count', 0)
                digg_count = info.get('digg_count', 0)
                tags = info.get('tags', [])
                tag_names = [t.get('tag_name', '') for t in tags]
                
                print(f"{i}. {title}")
                print(f"   👁️ {view_count} | ❤️ {digg_count} | ⭐ {collect_count}")
                if tag_names:
                    print(f"   🏷️ {' '.join(tag_names)}")
                print()
        else:
            print(f"[Error] API返回错误: {data}")
            
    except Exception as e:
        print(f"[Error] 爬取失败: {e}")

# ============== 爬取博客园 ==============

def crawl_cnblogs():
    """爬取博客园首页文章"""
    print("=" * 50)
    print("爬虫练习：博客园首页")
    print("=" * 50)
    
    url = "https://www.cnblogs.com/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    html = get_html(url, headers)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    posts = soup.select('.post-item')
    
    print(f"\n共爬取 {len(posts)} 篇文章：\n")
    
    for i, post in enumerate(posts[:10], 1):
        title = post.select_one('.post-title a')
        if title:
            title_text = title.get_text(strip=True)
            link = title.get('href', '')
            print(f"{i}. {title_text}")
            print(f"   🔗 {link}")
            print()

# ============== 爬取天气 ==============

def crawl_weather():
    """爬取天气数据"""
    print("=" * 50)
    print("爬虫练习：南宁天气")
    print("=" * 50)
    
    url = "https://wttr.in/Nanning?format=j1"
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        
        current = data.get('current_condition', [{}])[0]
        
        print(f"\n🌤️  南宁今日天气")
        print(f"   温度: {current.get('temp_C')}°C")
        print(f"   体感: {current.get('FeelsLikeC')}°C")
        print(f"   天气: {current.get('weatherDesc', [{}])[0].get('value')}")
        print(f"   湿度: {current.get('humidity')}%")
        print(f"   风速: {current.get('windspeedKmph')} km/h")
        print(f"   气压: {current.get('pressure')} hPa")
        print()
        
    except Exception as e:
        print(f"[Error] 爬取天气失败: {e}")

# ============== 爬取GitHub trending ==============

def crawl_github_trending():
    """爬取GitHub trending"""
    print("=" * 50)
    print("爬虫练习：GitHub Trending (Python)")
    print("=" * 50)
    
    url = "https://github.com/trending/python?since=weekly"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    html = get_html(url, headers)
    if not html:
        return
    
    soup = BeautifulSoup(html, 'html.parser')
    repos = soup.select('article.box-shadow')
    
    print(f"\n共爬取 {len(repos)} 个项目：\n")
    
    for i, repo in enumerate(repos[:10], 1):
        title = repo.select_one('h2 a')
        if title:
            repo_name = title.get_text(strip=True).replace(' ', '')
            repo_link = 'https://github.com' + title.get('href', '')
            desc = repo.select_one('p')
            desc_text = desc.get_text(strip=True) if desc else '无描述'
            stars = repo.select_one('span.d-inline-block')
            stars_text = stars.get_text(strip=True) if stars else '0'
            
            print(f"{i}. {repo_name}")
            print(f"   ⭐ {stars_text}")
            print(f"   📝 {desc_text[:60]}...")
            print(f"   🔗 {repo_link}")
            print()

# ============== 主程序 ==============

if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🕷️  爬虫练习开始")
    print("=" * 50 + "\n")
    
    # 练习1: 天气
    crawl_weather()
    time.sleep(1)
    
    # 练习2: 稀土掘金
    crawl_juejin()
    time.sleep(1)
    
    # 练习3: 博客园
    crawl_cnblogs()
    time.sleep(1)
    
    # 练习4: GitHub
    crawl_github_trending()
    
    print("\n" + "=" * 50)
    print("[OK] 爬虫练习完成！")
    print("=" * 50)
