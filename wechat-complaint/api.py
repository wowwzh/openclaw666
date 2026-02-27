"""
微信支付API封装
"""

import os
import time
import hashlib
import json
import requests
from typing import Dict, List, Optional
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
import base64


class WeChatPayComplaintAPI:
    """微信支付投诉API"""
    
    def __init__(self, mch_id: str, api_key: str, api_v3_key: str, 
                 cert_path: str = None, key_path: str = None):
        self.mch_id = mch_id
        self.api_key = api_key
        self.api_v3_key = api_v3_key
        self.cert_path = cert_path
        self.key_path = key_path
        self.base_url = "https://api.mch.weixin.qq.com"
        self.session = requests.Session()
    
    def _generate_nonce(self) -> str:
        """生成随机字符串"""
        return hashlib.md5(str(time.time()).encode()).hexdigest()[:32]
    
    def _get_serial_no(self) -> str:
        """获取证书序列号"""
        # TODO: 从证书中提取序列号
        return "CERT_SERIAL_NO"
    
    def _sign(self, method: str, url: str, timestamp: str, nonce_str: str, 
              body: str = "") -> str:
        """RSA签名"""
        if not self.key_path or not os.path.exists(self.key_path):
            return ""
        
        # 读取私钥
        with open(self.key_path, 'rb') as f:
            private_key = serialization.load_pem_private_key(
                f.read(), 
                password=None, 
                backend=default_backend()
            )
        
        # 构建签名消息
        message = f"{method}\n{url}\n{timestamp}\n{nonce_str}\n{body}\n"
        
        # RSA签名
        signature = private_key.sign(
            message.encode('utf-8'),
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        
        return base64.b64encode(signature).decode('utf-8')
    
    def _build_auth_headers(self, method: str, url: str, body: str = "") -> Dict:
        """构建授权头"""
        timestamp = str(int(time.time()))
        nonce_str = self._generate_nonce()
        serial_no = self._get_serial_no()
        signature = self._sign(method, url, timestamp, nonce_str, body)
        
        auth = f'WECHATPAY2-SHA256-RSA2048 mchid="{self.mch_id}",nonce_str="{nonce_str}",timestamp="{timestamp}",signature="{signature}",serial_no="{serial_no}"'
        
        return {
            "Authorization": auth,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    def get_complaints(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """
        获取投诉列表
        
        GET /v3/merchant-service/complaints
        """
        url = f"{self.base_url}/v3/merchant-service/complaints"
        params = {
            "limit": limit,
            "offset": offset
        }
        
        headers = self._build_auth_headers("GET", url)
        
        response = self.session.get(url, params=params, headers=headers)
        
        if response.status_code == 200:
            return response.json().get("data", [])
        else:
            print(f"获取投诉列表失败: {response.text}")
            return []
    
    def get_complaint_detail(self, complaint_id: str) -> Dict:
        """
        获取投诉详情
        
        GET /v3/merchant-service/complaints/{complaint_id}
        """
        url = f"{self.base_url}/v3/merchant-service/complaints/{complaint_id}"
        headers = self._build_auth_headers("GET", url)
        
        response = self.session.get(url, headers=headers)
        
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
            "response_content": response_content
        }
        
        body = json.dumps(data, ensure_ascii=False)
        headers = self._build_auth_headers("POST", url, body)
        
        response = self.session.post(url, data=body.encode('utf-8'), headers=headers)
        
        return response.status_code == 200
    
    def feedback_complaint(self, complaint_id: str, 
                         feedback_type: str = "PROCESSED",
                         feedback_content: str = "") -> bool:
        """
        反馈处理结果
        
        POST /v3/merchant-service/complaints/{complaint_id}/feedback
        """
        url = f"{self.base_url}/v3/merchant-service/complaints/{complaint_id}/feedback"
        
        data = {
            "feedback_type": feedback_type,  # PROCESSED / UNPROCESSED
            "feedback_content": feedback_content
        }
        
        body = json.dumps(data, ensure_ascii=False)
        headers = self._build_auth_headers("POST", url, body)
        
        response = self.session.post(url, data=body.encode('utf-8'), headers=headers)
        
        return response.status_code == 200
    
    def upload_media(self, file_path: str, media_type: str = "file") -> Optional[str]:
        """
        上传图片材料
        
        POST /v3/merchant-service/media/upload
        """
        url = f"{self.base_url}/v3/merchant-service/media/upload"
        
        files = {
            "file": open(file_path, "rb")
        }
        
        # TODO: 添加签名
        headers = {
            "Accept": "application/json"
        }
        
        response = self.session.post(url, files=files, headers=headers)
        
        if response.status_code == 200:
            return response.json().get("media_id")
        return None


# 便捷函数
def create_api():
    """创建API实例"""
    from .config import Config
    config = Config()
    return WeChatPayComplaintAPI(
        mch_id=config.MCH_ID,
        api_key=config.MCH_API_KEY,
        api_v3_key=config.MCH_API_V3_KEY,
        cert_path=config.MCH_CERT_PATH,
        key_path=config.MCH_KEY_PATH
    )
