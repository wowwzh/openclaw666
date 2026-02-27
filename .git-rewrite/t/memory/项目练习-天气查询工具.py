# -*- coding: utf-8 -*-
# Weather Query Tool v1.0

import urllib.request
import json
import sys

def get_weather(location="", lang="zh"):
    if location:
        url = f"https://wttr.in/{location}?format=j1"
    else:
        url = "https://wttr.in/?format=j1"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
        return data
    except Exception as e:
        return {"error": str(e)}

def format_weather(data):
    if "error" in data:
        return f"Error: {data['error']}"
    
    try:
        current = data['current_condition'][0]
        output = []
        output.append("[Current Weather]")
        output.append(f"Temp: {current['temp_C']}C (feels like {current['FeelsLikeC']}C)")
        output.append(f"Condition: {current['weatherDesc'][0]['value']}")
        output.append(f"Humidity: {current['humidity']}%")
        output.append(f"Wind: {current['windspeedKmph']} km/h")
        
        if 'weather' in data:
            output.append("\n[3-Day Forecast]")
            for day in data['weather'][:3]:
                date = day['date']
                avg = day['avgtempC']
                desc = day['hourly'][4]['weatherDesc'][0]['value']
                output.append(f"{date}: {desc}, {avg}C")
        
        return "\n".join(output)
    except Exception as e:
        return f"Parse error: {e}"

def main():
    location = ""
    if len(sys.argv) > 1:
        location = sys.argv[1]
    
    print(f"Query weather: {location or 'Auto'}...\n")
    data = get_weather(location)
    print(format_weather(data))

if __name__ == "__main__":
    main()
