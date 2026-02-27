"""
微信支付投诉API - 简化版
只处理投诉，不需要证书
"""

import os
import time
import hashlib
import json
import requests
from typing import Dict, List, Optional


class WeChatPayComplaintAPI:
    """微信支付投诉API - 简化版"""
    
    def __init__(self, mch_id: str, api_key: str):
        """
        初始化
        
        Args:
            mch_id: 商户号
            api_key: API密钥（不是证书）
        """
        self.mch_id = mch_id
        self.api_key = api_key
        self.base_url = "https://api.mch.weixin.qq.com"
        self.session = requests.Session()
    
    def _generate_nonce(self) -> str:
        """生成随机字符串"""
        return hashlib.md5(str(time.time()).encode()).hexdigest()[:32]
    
    def _sign_v2(self, method: str, url: str, post_data: str = "") -> str:
        """
        V2签名（简单认证方式）
        """
        # 构建签名字符串
        sign_str = f"mch_id={self.mch_id}&nonce_str={self._generate_nonce()}&key={self.api_key}"
        return hashlib.md5(sign_str.encode('utf-8')).hexdigest().upper()
    
    def get_complaints(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """
        获取投诉列表
        
        GET /v3/merchant-service/complaints
        """
        url = f"{self.base_url}/v3/merchant-service/complaints"
        params = {
            "mch_id": self.mch_id,
            "limit": limit,
            "offset": offset,
            "nonce_str": self._generate_nonce()
        }
        
        # 添加签名
        sign = self._sign_v2("GET", url)
        params["sign"] = sign
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        response = self.session.get(url, params=params, headers=headers)
        
        print(f"请求URL: {response.url}")
        print(f"响应: {response.status_code} - {response.text[:200]}")
        
        if response.status_code == 200:
            data = response.json()
            return data.get("data", [])
        else:
            print(f"获取投诉列表失败: {response.text}")
            return []
    
    def get_complaint_detail(self, complaint_id: str) -> Dict:
        """
        获取投诉详情
        
        GET /v3/merchant-service/complaints/{complaint_id}
        """
        url = f"{self.base_url}/v3/merchant-service/complaints/{complaint_id}"
        params = {
            "mch_id": self.mch_id,
            "nonce_str": self._generate_nonce()
        }
        params["sign"] = self._sign_v2("GET", url)
        
        headers = {"Content-Type": "application/json"}
        
        response = self.session.get(url, params=params, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"获取投诉详情失败: {response.text}")
            return {}
    
    def response_complaint(self, complaint_id: str, response_content: str) -> bool:
        """
        回复投诉
        
        POST /v3/merchant-service/complaints/{complaint_id}/response
        """
        url = f"{self.base_url}/v3/merchant-service/complaints/{complaint_id}/response"
        
        data = {
            "mch_id": self.mch_id,
            "response_content": response_content,
            "nonce_str": self._generate_nonce()
        }
        data["sign"] = self._sign_v2("POST", url, json.dumps(data))
        
        headers = {"Content-Type": "application/json"}
        
        response = self.session.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            return result.get("code", 0) == 0
        else:
            print(f"回复投诉失败: {response.text}")
            return False


# 测试
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("用法: python api_simple.py <商户号> <API密钥>")
        sys.exit(1)
    
    mch_id = sys.argv[1]
    api_key = sys.argv[2]
    
    api = WeChatPayComplaintAPI(mch_id, api_key)
    
    print("=== 测试获取投诉列表 ===")
    complaints = api.get_complaints(limit=10)
    
    print(f"获取到 {len(complaints)} 条投诉")
    
    for c in complaints[:3]:
        print(f"- {c.get('complaint_id', 'N/A')}: {c.get('complaint_detail', {}).get('complaint_intro', 'N/A')}")
