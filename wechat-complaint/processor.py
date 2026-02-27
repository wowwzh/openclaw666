"""
投诉处理器
"""

import os
import json
import time
from datetime import datetime
from typing import Dict, List, Set
from .api import WeChatPayComplaintAPI
from .ai_reply import AIReplyGenerator
from .config import Config


class ComplaintProcessor:
    """投诉处理器"""
    
    def __init__(self, api: WeChatPayComplaintAPI, ai: AIReplyGenerator):
        self.api = api
        self.ai = ai
        self.config = Config()
        self.processed_ids: Set[str] = self._load_processed_ids()
    
    def _load_processed_ids(self) -> Set[str]:
        """加载已处理的投诉ID"""
        file_path = self.config.get_processed_file_path()
        
        # 确保目录存在
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return set(data.get("ids", []))
            except:
                pass
        
        return set()
    
    def _save_processed_ids(self):
        """保存已处理的投诉ID"""
        file_path = self.config.get_processed_file_path()
        
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump({
                    "ids": list(self.processed_ids),
                    "updated": datetime.now().isoformat()
                }, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存已处理ID失败: {e}")
    
    def process(self) -> Dict:
        """处理投诉"""
        result = {
            "time": datetime.now().isoformat(),
            "total": 0,
            "new": 0,
            "processed": 0,
            "failed": 0,
            "details": []
        }
        
        try:
            # 1. 获取投诉列表
            complaints = self.api.get_complaints(limit=100)
            result["total"] = len(complaints)
            
            print(f"发现 {len(complaints)} 条投诉")
            
            for complaint in complaints:
                complaint_id = complaint.get("complaint_id")
                
                # 跳过已处理的
                if complaint_id in self.processed_ids:
                    continue
                
                result["new"] += 1
                
                try:
                    # 2. 获取详情
                    detail = self.api.get_complaint_detail(complaint_id)
                    
                    # 3. AI生成回复
                    response = self.ai.generate_response(detail)
                    
                    # 4. 提交回复
                    success = self.api.response_complaint(complaint_id, response)
                    
                    if success:
                        # 5. 反馈处理结果
                        self.api.feedback_complaint(
                            complaint_id, 
                            "PROCESSED", 
                            "已通过AI自动回复处理"
                        )
                        
                        self.processed_ids.add(complaint_id)
                        result["processed"] += 1
                        
                        print(f"✓ 处理成功: {complaint_id}")
                    else:
                        result["failed"] += 1
                        print(f"✗ 提交回复失败: {complaint_id}")
                        
                except Exception as e:
                    result["failed"] += 1
                    print(f"✗ 处理异常: {complaint_id} - {e}")
            
            # 保存已处理ID
            self._save_processed_ids()
            
        except Exception as e:
            print(f"获取投诉列表失败: {e}")
        
        return result
    
    def process_single(self, complaint_id: str) -> bool:
        """处理单个投诉"""
        if complaint_id in self.processed_ids:
            print(f"投诉 {complaint_id} 已处理过")
            return True
        
        try:
            # 1. 获取详情
            detail = self.api.get_complaint_detail(complaint_id)
            
            # 2. AI生成回复
            response = self.ai.generate_response(detail)
            
            # 3. 提交回复
            success = self.api.response_complaint(complaint_id, response)
            
            if success:
                # 4. 反馈处理结果
                self.api.feedback_complaint(
                    complaint_id,
                    "PROCESSED",
                    "已通过AI自动回复处理"
                )
                
                self.processed_ids.add(complaint_id)
                self._save_processed_ids()
                
                print(f"✓ 处理成功: {complaint_id}")
                return True
            else:
                print(f"✗ 提交回复失败: {complaint_id}")
                return False
                
        except Exception as e:
            print(f"✗ 处理异常: {complaint_id} - {e}")
            return False
    
    def get_status(self) -> Dict:
        """获取处理状态"""
        return {
            "processed_count": len(self.processed_ids),
            "last_updated": datetime.now().isoformat()
        }
    
    def clear_history(self):
        """清除处理历史"""
        self.processed_ids.clear()
        self._save_processed_ids()
        print("已清除处理历史")


def create_processor() -> ComplaintProcessor:
    """创建处理器"""
    from .api import create_api
    from .ai_reply import create_generator
    
    api = create_api()
    ai = create_generator()
    
    return ComplaintProcessor(api, ai)
