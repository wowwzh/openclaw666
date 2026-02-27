#!/usr/bin/env python3
"""
剪贴板历史工具 v1.0
功能: 自动记录剪贴板历史，支持搜索和快速复制
"""
import pyperclip
import json
import os
from datetime import datetime

HISTORY_FILE = "clipboard_history.json"
MAX_HISTORY = 100

class ClipboardHistory:
    def __init__(self):
        self.history = self.load_history()
    
    def load_history(self):
        """加载历史记录"""
        if os.path.exists(HISTORY_FILE):
            try:
                with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return []
        return []
    
    def save_history(self):
        """保存历史记录"""
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.history, f, ensure_ascii=False, indent=2)
    
    def add(self, text: str):
        """添加新记录"""
        if not text or text.isspace():
            return
        
        # 去重: 如果已存在，移到最前面
        for i, item in enumerate(self.history):
            if item['content'] == text:
                self.history.pop(i)
                break
        
        # 添加新记录
        self.history.insert(0, {
            'content': text[:500],  # 限制长度
            'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'length': len(text)
        })
        
        # 限制数量
        self.history = self.history[:MAX_HISTORY]
        self.save_history()
    
    def search(self, keyword: str) -> list:
        """搜索历史"""
        return [item for item in self.history 
                if keyword.lower() in item['content'].lower()]
    
    def get_recent(self, n: int = 10) -> list:
        """获取最近n条记录"""
        return self.history[:n]
    
    def clear(self):
        """清空历史"""
        self.history = []
        self.save_history()

# 测试
if __name__ == "__main__":
    cb = ClipboardHistory()
    # 测试添加
    cb.add("测试内容1")
    cb.add("测试内容2")
    print("最近记录:", cb.get_recent(5))
    print("搜索结果:", cb.search("测试"))
