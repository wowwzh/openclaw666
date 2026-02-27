#!/usr/bin/env python3
"""
MiniMax Coding Plan API 封装
用于查询余额和调用 API
"""
import requests
import json
import sys

API_KEYS = [
    "sk-cp-DoJjRT4lfaeeRLQT07jwuIHUepp_vfZgPdS10lyFue2U42pJysVSMRkS5SqiNe3If2pqvthJdomtUBCe0pSRDFRTD4em9ZaCIN5AAiSvYX7sH7id6AV45kE",
    "sk-cp-Uss0DeorbVkxH-E1gTe-U9l7quiJl9JeoXnb3EVGIFrmTvJtOx-FGnv5mEdQIwr4wvoiBt-h2AqlEc_xVvLyRnvQERtpYZ1tmbrht_TjPzmJidDArJiPtfA",
    "sk-cp-S4dUJb9VzeVd3opcb0wEoLakBRg3tq7RbqSdKgckMs64xw0c43GZPHXDtRQJAENoTHpZPnIVMk1IQ0t-CtuKcve2ic5NVWzQhKqHBWK0tbinXwkFs2l2aCE"
]

def check_balance(api_key):
    """查询 API 余额"""
    url = "https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            return {"error": f"HTTP {response.status_code}", "message": response.text}
    except Exception as e:
        return {"error": str(e)}

def main():
    if len(sys.argv) < 2:
        print("Usage: python minimax_coding.py <command> [args]")
        print("Commands:")
        print("  balance [key_index] - Check balance of API key (0-2)")
        print("  all - Check all API keys")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "balance":
        idx = int(sys.argv[2]) if len(sys.argv) > 2 else 0
        if idx < 0 or idx >= len(API_KEYS):
            print(f"Invalid key index: {idx}. Use 0-{len(API_KEYS)-1}")
            sys.exit(1)
        result = check_balance(API_KEYS[idx])
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    elif command == "all":
        results = []
        for i, key in enumerate(API_KEYS):
            result = check_balance(key)
            results.append({
                "key_index": i,
                "result": result
            })
        print(json.dumps(results, indent=2, ensure_ascii=False))
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
