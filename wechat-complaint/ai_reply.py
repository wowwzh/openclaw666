"""
AI回复生成器
"""

import json
import requests
from typing import Dict, Optional
from .config import Config


class AIReplyGenerator:
    """AI生成投诉回复"""
    
    def __init__(self, config: Config = None):
        self.config = config or Config()
        self.api_url = self.config.AI_API_URL
        self.api_key = self.config.AI_API_KEY
        self.model = self.config.AI_MODEL
        
    def generate_response(self, complaint: Dict) -> str:
        """生成回复内容"""
        # 提取投诉信息
        complaint_id = complaint.get("complaint_id", "")
        complaint_details = complaint.get("complaint_details", "")
        complaint_time = complaint.get("complaint_time", "")
        complaint_amount = complaint.get("complaint_amount", "")
        transaction_id = complaint.get("transaction_id", "")
        
        # 构建prompt
        prompt = self._build_prompt(complaint)
        
        # 调用AI API
        try:
            response = self._call_ai(prompt)
            return response
        except Exception as e:
            print(f"AI生成回复失败: {e}")
            # 返回默认回复
            return self._get_default_response(complaint)
    
    def _call_ai(self, prompt: str) -> str:
        """调用AI API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "你是微信支付商户客服，擅长处理客户投诉，回复专业、友好、简洁。"},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 200
        }
        
        response = requests.post(
            self.api_url,
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            raise Exception(f"AI API调用失败: {response.text}")
    
    def _build_prompt(self, complaint: Dict) -> str:
        """构建AI prompt"""
        complaint_details = complaint.get("complaint_details", "无")
        complaint_amount = complaint.get("complaint_amount", "无")
        
        prompt = f"""请根据以下投诉内容，生成一段微信支付商户客服的回复。

投诉内容：{complaint_details}
投诉金额：{complaint_amount}

要求：
1. 专业、友好、有诚意
2. 简洁明了，不超过80字
3. 表明正在积极处理
4. 感谢客户理解
5. 不要使用特殊格式符号

回复内容："""
        
        return prompt
    
    def _get_default_response(self, complaint: Dict) -> str:
        """获取默认回复（关键词匹配）"""
        complaint_details = complaint.get("complaint_details", "")
        
        # 关键词匹配
        for keyword, response in self.config.KEYWORD_RESPONSES.items():
            if keyword in complaint_details:
                return response
        
        # 默认回复
        return "尊敬的客户您好，关于您反馈的问题我们已经高度重视，正在积极处理中。感谢您的理解与支持！"
    
    def batch_generate(self, complaints: list) -> list:
        """批量生成回复"""
        results = []
        
        for complaint in complaints:
            response = self.generate_response(complaint)
            results.append({
                "complaint_id": complaint.get("complaint_id"),
                "response": response
            })
        
        return results


# 便捷函数
def create_generator() -> AIReplyGenerator:
    """创建AI生成器"""
    return AIReplyGenerator()
