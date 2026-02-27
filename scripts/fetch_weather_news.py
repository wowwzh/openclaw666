#!/usr/bin/env python3
"""
定时获取天气和新闻资讯脚本
每小时执行一次，保存到本地文件供客户端读取
"""

import json
import os
from datetime import datetime
import urllib.request
import urllib.parse

# 配置
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
OUTPUT_FILE = os.path.join(DATA_DIR, 'weather_news.json')

# 确保数据目录存在
os.makedirs(DATA_DIR, exist_ok=True)

def get_weather_nanning():
    """获取南宁天气 - 使用 wttr.in (免费无需API key)"""
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
            "feels_like": current.get('FeelsLikeC', 'N/A') + '°C',
            "uv_index": current.get('uvIndex', 'N/A')
        }
        return weather_data
    except Exception as e:
        return {"error": f"获取天气失败: {str(e)}"}

def search_tech_news():
    """搜索科技新闻 - 返回格式化的新闻列表"""
    # 使用 Tavily API 搜索科技新闻
    from tavily import TavilyClient
    
    api_keys = [
        "sk-cp-DoJjRT4lfaeeRLQT07jwuIHUepp_vfZgPdS10lyFue2U42pJysVSMRkS5SqiNe3If2pqvthJdomtUBCe0pSRDFRTD4em9ZaCIN5AAiSvYX7sH7id6AV45kE",
        "sk-cp-Uss0DeorbVkxH-E1gTe-U9l7quiJl9JeoXnb3EVGIFrmTvJtOx-FGnv5mEdQIwr4wvoiBt-h2AqlEc_xVvLyRnvQERtpYZ1tmbrht_TjPzmJidDArJiPtfA",
        "sk-cp-S4dUJb9VzeVd3opcb0wEoLakBRg3tq7RbqSdKgckMs64xw0c43GZPHXDtRQJAENoTHpZPnIVMk1IQ0t-CtuKcve2ic5NVWzQhKqHBWK0tbinXwkFs2l2aCE"
    ]
    
    # 尝试使用API搜索
    for api_key in api_keys:
        try:
            client = TavilyClient(api_key=api_key)
            results = client.search(
                query="科技新闻 technology news 2026",
                max_results=8
            )
            
            news_list = []
            for item in results.get('results', []):
                news_list.append({
                    "title": item.get('title', ''),
                    "url": item.get('url', ''),
                    "content": item.get('content', '')[:200] + '...' if len(item.get('content', '')) > 200 else item.get('content', '')
                })
            return news_list
        except Exception as e:
            continue
    
    # 如果API失败，返回静态示例数据
    return [
        {"title": "AI技术持续发展 - 2026年科技趋势", "url": "#", "content": "人工智能技术将继续改变我们的生活方式..."},
        {"title": "新能源汽车市场增长迅速", "url": "#", "content": "电动汽车销量持续攀升..."},
        {"title": "5G网络全面覆盖", "url": "#", "content": "5G网络正在全球范围内全面部署..."}
    ]

def main():
    """主函数"""
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 开始获取天气和新闻...")
    
    # 获取天气
    weather = get_weather_nanning()
    print(f"天气: {weather.get('temperature')}°C, {weather.get('condition')}")
    
    # 获取新闻
    news = search_tech_news()
    print(f"新闻: 获取到 {len(news)} 条")
    
    # 组合数据
    data = {
        "update_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "weather": weather,
        "news": news
    }
    
    # 保存到文件
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"数据已保存到: {OUTPUT_FILE}")
    return data

if __name__ == '__main__':
    main()
