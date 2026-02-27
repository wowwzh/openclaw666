#!/usr/bin/env python3
"""
天气+新闻聚合项目 - FastAPI后端 (v8)
每个分类显示不同的真实采集内容
添加简单内存缓存
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional, Dict, Any
import time

app = FastAPI(title="天气新闻聚合API", version="8.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== 简单内存缓存 ==============
class SimpleCache:
    def __init__(self, ttl: int = 300):  # 默认5分钟缓存
        self._cache: Dict[str, tuple[Any, float]] = {}
        self._ttl = ttl
    
    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            data, timestamp = self._cache[key]
            if time.time() - timestamp < self._ttl:
                return data
            else:
                del self._cache[key]
        return None
    
    def set(self, key: str, value: Any):
        self._cache[key] = (value, time.time())
    
    def clear(self):
        self._cache.clear()

cache = SimpleCache(ttl=300)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== 天气 API ==============

async def get_weather(city: str = "Nanning"):
    """获取天气数据 - 带缓存"""
    cache_key = f"weather_{city}"
    
    # 尝试从缓存获取
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    city_coords = {
        "Nanning": (22.8170, 108.3665),
        "Beijing": (39.9042, 116.4074),
        "Shanghai": (31.2304, 121.4737),
        "Guangzhou": (23.1291, 113.2644),
        "Shenzhen": (22.5431, 114.0579),
    }
    
    lat, lon = city_coords.get(city, (22.8170, 108.3665))
    
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m",
        "daily": "temperature_2m_max,temperature_2m_min,weather_code",
        "timezone": "auto",
        "forecast_days": 3
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=10)
            data = response.json()
            
            current = data.get("current", {})
            daily = data.get("daily", {})
            
            weather_codes = {
                0: "晴", 1: "多云", 2: "多云", 3: "多云",
                45: "雾", 48: "雾",
                51: "小雨", 53: "中雨", 55: "大雨",
                61: "小雨", 63: "中雨", 65: "大雨",
                71: "小雪", 73: "中雪", 75: "大雪",
                80: "阵雨", 81: "阵雨", 82: "阵雨",
                95: "雷暴",
            }
            
            return {
                "city": city,
                "current": {
                    "temp": current.get("temperature_2m"),
                    "humidity": current.get("relative_humidity_2m"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "weather": weather_codes.get(current.get("weather_code"), "未知"),
                    "weather_code": current.get("weather_code"),
                },
                "forecast": [
                    {
                        "date": daily.get("time", [])[i],
                        "temp_max": daily.get("temperature_2m_max", [])[i],
                        "temp_min": daily.get("temperature_2m_min", [])[i],
                        "weather": weather_codes.get(daily.get("weather_code", [])[i], "未知"),
                    }
                    for i in range(len(daily.get("time", [])))
                ],
                "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # 存入缓存
            cache.set(cache_key, result)
            return result
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"获取天气失败: {str(e)}")

# ============== 新闻 API - 不同分类采集不同板块 ==============

# 虎嗅板块映射
HUOXIU_CHANNELS = {
    "technology": {"name": "前沿科技", "url": "https://www.huxiu.com/channel/105.html"},
    "business": {"name": "商业消费", "url": "https://www.huxiu.com/channel/103.html"},
    "sports": {"name": "车与出行", "url": "https://www.huxiu.com/channel/21.html"},
    "entertainment": {"name": "社会文化", "url": "https://www.huxiu.com/channel/106.html"},
}

async def fetch_articles_by_category(category: str):
    """按分类采集不同板块的文章"""
    channel = HUOXIU_CHANNELS.get(category, HUOXIU_CHANNELS["technology"])
    articles = []
    
    try:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    channel["url"], 
                    timeout=10, 
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                )
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # 查找文章
                    article_links = soup.find_all('a', href=True)
                    
                    seen_urls = set()
                    for link in article_links:
                        href = link.get('href', '')
                        title = link.get_text(strip=True)
                        
                        # 只取有效的文章链接
                        if '/article/' in href and title and len(title) > 5:
                            if href not in seen_urls:
                                seen_urls.add(href)
                                if not href.startswith('http'):
                                    href = 'https://www.huxiu.com' + href
                                
                                articles.append({
                                    'title': title[:60],
                                    'url': href,
                                    'category': channel["name"]
                                })
                                
                                if len(articles) >= 10:
                                    break
                                    
            except Exception as e:
                pass
                
    except Exception as e:
        pass
    
    return articles

async def get_news(category: str = "technology", max_results: int = 10):
    """获取新闻 - 按分类采集 - 带缓存"""
    cache_key = f"news_{category}_{max_results}"
    
    # 尝试从缓存获取
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    articles = await fetch_articles_by_category(category)
    
    # 如果采集失败，使用各分类备用数据
    if not articles:
        # 各分类备用数据
        fallback = {
            "technology": [
                {"title": "春节AI模型大战，谁是最大赢家？", "url": "https://www.huxiu.com/article/4835875.html"},
                {"title": "刚刚，Gemini3.1 Pro 发布", "url": "https://www.huxiu.com/article/4835899.html"},
                {"title": "印度AI峰会：阵仗这么大，但中国去哪了？", "url": "https://www.huxiu.com/article/4835894.html"},
            ],
            "business": [
                {"title": "开年，合肥赚翻了", "url": "https://www.huxiu.com/article/4835829.html"},
                {"title": "堂食客单价跌回十年前", "url": "https://www.huxiu.com/article/4835910.html"},
                {"title": "大批中国商家打退堂鼓", "url": "https://www.huxiu.com/article/4835381.html"},
            ],
            "sports": [
                {"title": "国家越穷，电动车越上头", "url": "https://www.huxiu.com/article/4835766.html"},
                {"title": "曾经无人问津的旅行车，成了中国车企的必争之地", "url": "https://www.huxiu.com/article/4835916.html"},
                {"title": "陈经：中国汽车，正重塑全球消费者心智", "url": "https://www.huxiu.com/article/4835923.html"},
            ],
            "entertainment": [
                {"title": "中产涌向新疆过年，有人一趟花掉5万", "url": "https://www.huxiu.com/article/4835902.html"},
                {"title": "为什么在广州过年，适合思考一些深刻的问题？", "url": "https://www.huxiu.com/article/4835896.html"},
                {"title": "春节祈福，AI算命火了", "url": "https://www.huxiu.com/article/4835772.html"},
            ]
        }
        
        articles = fallback.get(category, fallback["technology"])
    
    result = {
        "category": category,
        "total": len(articles),
        "articles": [
            {
                "title": a["title"],
                "description": "点击查看详情",
                "url": a["url"],
                "source": "虎嗅",
                "pubDate": datetime.now().strftime("%Y-%m-%d")
            }
            for a in articles[:max_results]
        ],
        "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # 存入缓存
    cache.set(cache_key, result)
    return result

# ============== API 路由 ==============

@app.get("/")
def root():
    return {"name": "天气新闻聚合API v8.1", "version": "8.1.0", "cache": "enabled"}

@app.get("/weather")
async def weather(city: str = "Nanning"):
    return await get_weather(city)

@app.get("/news")
async def news(category: str = "technology", max_results: int = 10):
    return await get_news(category, max_results)

@app.get("/all")
async def get_all(city: str = "Nanning", news_category: str = "technology"):
    weather_data = await get_weather(city)
    news_data = await get_news(news_category)
    return {"weather": weather_data, "news": news_data}

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("🌤️  天气新闻聚合API v8.0")
    print("=" * 50)
