import sys

# 修复 Windows 控制台编码问题
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
import os
import re
from datetime import datetime
from typing import List, Dict
import urllib.request
import urllib.parse
import json

# 配置
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
OUTPUT_FILE = os.path.join(DATA_DIR, 'morning_brief.json')

os.makedirs(DATA_DIR, exist_ok=True)

# ============ 天气模块 ============

def get_weather_nanning():
    """获取南宁天气 - 使用 wttr.in"""
    try:
        url = "https://wttr.in/Nanning?format=j1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        current = data.get('current_condition', [{}])[0]
        weather_data = {
            "location": "南宁",
            "temperature": current.get('temp_C', 'N/A'),
            "condition": current.get('weatherDesc', [{}])[0].get('value', 'N/A'),
            "humidity": current.get('humidity', 'N/A'),
            "wind": current.get('windspeedKmph', 'N/A') + ' km/h',
            "feels_like": current.get('FeelsLikeC', 'N/A') + '°C'
        }
        
        # 获取天气预报
        forecast = data.get('weather', [{}])[:3]
        forecast_list = []
        for day in forecast:
            date = day.get('date', '')
            avg = day.get('avgtempC', '')
            max_t = day.get('maxtempC', '')
            min_t = day.get('mintempC', '')
            cond = day.get('weatherDesc', [{}])[0].get('value', '')
            forecast_list.append({
                "date": date,
                "avg": avg,
                "high": max_t,
                "low": min_t,
                "condition": cond
            })
        weather_data['forecast'] = forecast_list
        
        return weather_data
    except Exception as e:
        return {"error": f"获取天气失败: {str(e)}"}

# ============ 新闻模块 ============

def search_tavily_news(query: str, max_results: int = 5) -> List[Dict]:
    """使用 Tavily API 搜索新闻"""
    from tavily import TavilyClient
    
    api_keys = [
        "sk-cp-DoJjRT4lfaeeRLQT07jwuIHUepp_vfZgPdS10lyFue2U42pJysVSMRkS5SqiNe3If2pqvthJdomtUBCe0pSRDFRTD4em9ZaCIN5AAiSvYX7sH7id6AV45kE",
        "sk-cp-Uss0DeorbVkxH-E1gTe-U9l7quiJl9JeoXnb3EVGIFrmTvJtOx-FGnv5mEdQIwr4wvoiBt-h2AqlEc_xVvLyRnvQERtpYZ1tmbrht_TjPzmJidDArJiPtfA",
        "sk-cp-S4dUJb9VzeVd3opcb0wEoLakBRg3tq7RbqSdKgckMs64xw0c43GZPHXDtRQJAENoTHpZPnIVMk1IQ0t-CtuKcve2ic5NVWzQhKqHBWK0tbinXwkFs2l2aCE"
    ]
    
    for api_key in api_keys:
        try:
            client = TavilyClient(api_key=api_key)
            results = client.search(query=query, max_results=max_results)
            
            news_list = []
            for item in results.get('results', []):
                content = item.get('content', '')
                news_list.append({
                    "title": item.get('title', ''),
                    "url": item.get('url', ''),
                    "content": content[:150] + '...' if len(content) > 150 else content,
                    "source": "Tavily"
                })
            return news_list
        except Exception as e:
            print(f"Tavily API error: {e}")
            continue
    
    return []

def fetch_chinese_tech_news() -> List[Dict]:
    """获取中文科技新闻 - 模拟（实际可用 RSS 或 API）"""
    # 尝试获取一些中文科技 RSS 源
    chinese_news = []
    
    # 36Kr 科技新闻
    try:
        url = "https://36kr.com/newsflashes"
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        # 这里简化处理，实际需要解析 HTML
    except:
        pass
    
    # 返回预设的科技新闻（可以后续接入真实 API）
    return [
        {
            "title": "AI Agent 成为 2026 年科技焦点",
            "url": "https://tech.36kr.com",
            "content": "各大科技公司纷纷推出 AI Agent 产品，",
            "source": "科技趋势"
        },
        {
            "title": "OpenClaw 社区活跃度创新高",
            "url": "https://github.com/openclaw/openclaw",
            "content": "开源 AI 助手 OpenClaw 用户增长迅速，",
            "source": "开源动态"
        },
        {
            "title": "中国 AI 芯片产能持续提升",
            "url": "https://tech.sina.com.cn",
            "content": "国产 AI 芯片传来好消息，",
            "source": "硬件"
        }
    ]

def search_english_tech_news() -> List[Dict]:
    """获取英文科技新闻"""
    return search_tavily_news("AI technology news 2026", max_results=5)

def get_tech_news() -> Dict:
    """获取综合科技新闻"""
    chinese = fetch_chinese_tech_news()
    english = search_english_tech_news()
    
    return {
        "chinese": chinese,
        "english": english,
        "total": len(chinese) + len(english)
    }

# ============ 主函数 ============

def main():
    """主函数"""
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🌅 开始获取早晨简报数据...")
    
    # 1. 获取天气
    print("📡 获取天气中...")
    weather = get_weather_nanning()
    print(f"   天气: {weather.get('temperature')}°C, {weather.get('condition')}")
    
    # 2. 获取新闻
    print("📰 获取科技新闻中...")
    news = get_tech_news()
    print(f"   中文: {len(news.get('chinese', []))} 条")
    print(f"   英文: {len(news.get('english', []))} 条")
    
    # 3. 组装数据
    data = {
        "update_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "brief_date": datetime.now().strftime('%Y年%m月%d日'),
        "weather": weather,
        "news": news,
        "greeting": get_greeting()
    }
    
    # 4. 保存到文件
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 数据已保存到: {OUTPUT_FILE}")
    return data

def get_greeting() -> str:
    """根据时间获取问候语"""
    hour = datetime.now().hour
    if 5 <= hour < 9:
        return "早上好！☀️"
    elif 9 <= hour < 12:
        return "上午好！🌤️"
    elif 12 <= hour < 14:
        return "中午好！🌙"
    elif 14 <= hour < 18:
        return "下午好！🌥️"
    elif 18 <= hour < 22:
        return "晚上好！🌙"
    else:
        return "夜深了，注意休息！🌙"

if __name__ == '__main__':
    main()
