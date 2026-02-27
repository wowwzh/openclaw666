#!/usr/bin/env python3
"""
练习6: 命令行工具 - 待办事项管理器
功能：增删改查待办事项
v1.1 优化:
- 添加类型注解
- 添加配置选项
- 改进错误处理
"""

import os
import json
import sys
from datetime import datetime
from typing import List, Dict, Optional

TODO_FILE = "practice/todos.json"

class TodoApp:
    """待办事项管理器"""
    
    def __init__(self, todo_file: str = TODO_FILE):
        self.todo_file = todo_file
        self.todos: List[Dict] = self.load_todos()
    
    def load_todos(self) -> List[Dict]:
        """加载待办事项"""
        if os.path.exists(self.todo_file):
            try:
                with open(self.todo_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                return []
        return []
    
    def save_todos(self) -> None:
        """保存待办事项"""
        try:
            os.makedirs(os.path.dirname(self.todo_file), exist_ok=True)
            with open(self.todo_file, 'w', encoding='utf-8') as f:
                json.dump(self.todos, f, ensure_ascii=False, indent=2)
        except IOError as e:
            print(f"[Error] 保存失败: {e}")
    
    def add(self, content: str, priority: str = "中") -> None:
        """添加待办"""
        todo = {
            "id": len(self.todos) + 1,
            "content": content,
            "priority": priority,
            "done": False,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        self.todos.append(todo)
        self.save_todos()
        print(f"[OK] 添加成功: {content}")
    
    def list_todos(self, show_done: bool = True) -> None:
        """列出待办"""
        if not self.todos:
            print("暂无待办事项")
            return
        
        pending = [t for t in self.todos if not t['done']]
        done = [t for t in self.todos if t['done']]
        
        if not show_done:
            pending = pending
        
        # 显示进行中
        print("\n📋 待办事项列表:")
        print("-" * 50)
        
        for i, todo in enumerate(pending, 1):
            priority_icon = {"高": "🔴", "中": "🟡", "低": "🟢"}.get(todo['priority'], "⚪")
            print(f"{i}. {priority_icon} [{todo['priority']}] {todo['content']}")
        
        # 显示已完成
        if done and show_done:
            print("\n✅ 已完成:")
            for todo in done:
                print(f"   ✓ {todo['content']}")
        
        print("-" * 50)
        print(f"总计: {len(pending)} 项进行中, {len(done)} 项已完成")
    
    def done(self, todo_id: int) -> None:
        """标记完成"""
        for todo in self.todos:
            if todo['id'] == todo_id:
                todo['done'] = True
                self.save_todos()
                print(f"[OK] 已标记完成: {todo['content']}")
                return
        print(f"[Error] 未找到 ID: {todo_id}")
    
    def delete(self, todo_id: int) -> None:
        """删除待办"""
        for i, todo in enumerate(self.todos):
            if todo['id'] == todo_id:
                deleted = self.todos.pop(i)
                self.save_todos()
                print(f"[OK] 已删除: {deleted['content']}")
                return
        print(f"[Error] 未找到 ID: {todo_id}")
    
    def clear(self) -> None:
        """清空已完成"""
        self.todos = [t for t in self.todos if not t['done']]
        self.save_todos()
        print("[OK] 已清空所有已完成事项")


def main():
    """命令行入口"""
    app = TodoApp()
    
    commands = {
        "list": ("列出待办", lambda: app.list_todos()),
        "add": ("添加待办", lambda: app.add(input("内容: "), input("优先级(高/中/低): ") or "中")),
        "done": ("标记完成", lambda: app.done(int(input("ID: ")))),
        "delete": ("删除待办", lambda: app.delete(int(input("ID: ")))),
        "clear": ("清空已完成", lambda: app.clear()),
    }
    
    if len(sys.argv) < 2:
        app.list_todos()
        return
    
    cmd = sys.argv[1]
    if cmd == "help":
        print("""
📝 待办事项管理器

用法: python todo.py <命令>

命令:
  list     - 列出所有待办
  add      - 添加新待办
  done     - 标记待办完成
  delete   - 删除待办
  clear    - 清空已完成
  help     - 显示帮助
""")
    elif cmd in commands:
        commands[cmd][1]()
    else:
        print(f"[Error] 未知命令: {cmd}")
        print("使用 'python todo.py help' 查看帮助")


if __name__ == "__main__":
    main()
