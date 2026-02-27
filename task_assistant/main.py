#!/usr/bin/env python3
"""
智能任务助手 - 对话式任务管理
通过对话来创建、查询、完成任务
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from datetime import datetime
from typing import List, Optional

app = FastAPI(title="智能任务助手API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 任务存储文件
TASKS_FILE = "tasks.json"

# ============== 任务管理 ==============

def load_tasks() -> List[dict]:
    """加载任务"""
    if os.path.exists(TASKS_FILE):
        with open(TASKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_tasks(tasks: List[dict]):
    """保存任务"""
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)

# ============== AI 对话理解 ==============

def understand_command(text: str) -> dict:
    """理解用户指令"""
    text = text.lower()
    
    # 创建任务
    if any(kw in text for kw in ['创建', '添加', '新建', '增加', '帮我', '记录']):
        # 提取任务内容
        keywords = ['创建', '添加', '新建', '增加', '帮我', '记录', '一下', '个任务', '任务：', '任务:']
        content = text
        for kw in keywords:
            content = content.replace(kw, '')
        content = content.strip()
        
        # 识别优先级
        priority = "medium"
        if any(kw in text for kw in ['重要', '紧急', '高优先级', '必须', '马上']):
            priority = "high"
        elif any(kw in text for kw in ['不急', '低优先级', '有空']):
            priority = "low"
        
        # 识别分类
        category = "work"
        if any(kw in text for kw in ['生活', '家务', '买菜', '做饭']):
            category = "life"
        elif any(kw in text for kw in ['学习', '读书', '课程', '考试']):
            category = "study"
        elif any(kw in text for kw in ['健康', '运动', '健身', '跑步']):
            category = "health"
        
        return {
            "action": "create",
            "content": content if content else "新任务",
            "priority": priority,
            "category": category
        }
    
    # 查询任务
    if any(kw in text for kw in ['查询', '看看', '有哪些', '有什么', 'list', '显示']):
        # 筛选条件
        filter_type = "all"
        if any(kw in text for kw in ['待办', '未完成', 'pending']):
            filter_type = "pending"
        elif any(kw in text for kw in ['完成', '已完成', 'done']):
            filter_type = "completed"
        
        category = None
        if any(kw in text for kw in ['工作', '上班']):
            category = "work"
        elif any(kw in text for kw in ['生活', '家务']):
            category = "life"
        elif any(kw in text for kw in ['学习', '读书']):
            category = "study"
        
        return {"action": "query", "filter": filter_type, "category": category}
    
    # 完成/标记任务
    if any(kw in text for kw in ['完成', '做完', '搞定', '结束', 'mark', 'done']):
        # 尝试提取任务编号
        import re
        numbers = re.findall(r'\d+', text)
        if numbers:
            return {"action": "complete", "task_id": int(numbers[0])}
        return {"action": "complete", "content": text}
    
    # 删除任务
    if any(kw in text for kw in ['删除', '去掉', '移除', 'delete', '不要']):
        import re
        numbers = re.findall(r'\d+', text)
        if numbers:
            return {"action": "delete", "task_id": int(numbers[0])}
        return {"action": "delete", "content": text}
    
    # 帮助
    if any(kw in text for kw in ['帮助', 'help', '用法', 'commands']):
        return {"action": "help"}
    
    # 不知道干什么
    return {"action": "unknown", "message": text}

# ============== API 路由 ==============

@app.get("/")
def root():
    return {
        "name": "智能任务助手API",
        "version": "1.0.0",
        "description": "通过自然语言管理任务",
        "examples": {
            "创建任务": "帮我创建一个任务：下午3点开会",
            "查询任务": "有哪些待办任务？",
            "完成任务": "把任务1标记完成"
        }
    }

@app.post("/task")
def handle_command(command: dict):
    """处理用户指令"""
    text = command.get("text", "")
    result = understand_command(text)
    
    tasks = load_tasks()
    
    if result["action"] == "create":
        task = {
            "id": len(tasks) + 1,
            "content": result["content"],
            "priority": result.get("priority", "medium"),
            "category": result.get("category", "work"),
            "completed": False,
            "created": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        tasks.append(task)
        save_tasks(tasks)
        
        emoji = {"work": "💼", "life": "🏠", "study": "📚", "health": "❤️"}.get(task["category"], "📌")
        priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(task["priority"], "🟡")
        
        return {
            "success": True,
            "message": f"✅ 任务创建成功！\n\n{emoji} {task['content']}\n优先级: {priority_emoji}",
            "task": task
        }
    
    elif result["action"] == "query":
        filtered = tasks
        
        # 按状态筛选
        if result.get("filter") == "pending":
            filtered = [t for t in filtered if not t["completed"]]
        elif result.get("filter") == "completed":
            filtered = [t for t in filtered if t["completed"]]
        
        # 按分类筛选
        if result.get("category"):
            filtered = [t for t in filtered if t.get("category") == result["category"]]
        
        if not filtered:
            return {"success": True, "message": "没有找到任务"}
        
        # 格式化输出
        pending = [t for t in filtered if not t["completed"]]
        completed = [t for t in filtered if t["completed"]]
        
        msg = "📋 任务列表\n\n"
        
        if pending:
            msg += "⏳ 待办任务：\n"
            for t in pending:
                emoji = {"work": "💼", "life": "🏠", "study": "📚", "health": "❤️"}.get(t.get("category"), "📌")
                msg += f"  {t['id']}. {emoji} {t['content']}\n"
        
        if completed:
            msg += "\n✅ 已完成：\n"
            for t in completed:
                msg += f"  ✅ {t['content']}\n"
        
        return {"success": True, "message": msg, "tasks": filtered}
    
    elif result["action"] == "complete":
        task_id = result.get("task_id")
        if task_id:
            for t in tasks:
                if t["id"] == task_id:
                    t["completed"] = True
                    save_tasks(tasks)
                    return {"success": True, "message": f"✅ 任务 {task_id} 已标记完成！"}
            return {"success": False, "message": f"未找到任务 {task_id}"}
        return {"success": False, "message": "请指定要完成的任务编号"}
    
    elif result["action"] == "delete":
        task_id = result.get("task_id")
        if task_id:
            for i, t in enumerate(tasks):
                if t["id"] == task_id:
                    deleted = tasks.pop(i)
                    save_tasks(tasks)
                    return {"success": True, "message": f"🗑️ 已删除：{deleted['content']}"}
            return {"success": False, "message": f"未找到任务 {task_id}"}
        return {"success": False, "message": "请指定要删除的任务编号"}
    
    elif result["action"] == "help":
        return {
            "success": True,
            "message": """🤖 智能任务助手使用指南

📝 创建任务：
- "帮我创建一个任务：下午3点开会"
- "添加一个重要任务：提交报告"

🔍 查询任务：
- "有哪些待办任务？"
- "显示已完成的任务"

✅ 完成任务：
- "把任务1标记完成"

🗑️ 删除任务：
- "删除任务3"

💡 还可以指定：
- 优先级：重要/紧急/不急
- 分类：工作/生活/学习/健康
"""
        }
    
    else:
        return {
            "success": False,
            "message": "🤔 我不太理解你的意思\n\n试试：\n- 帮我创建任务：xxx\n- 有哪些待办？\n- 帮助"
        }

@app.get("/tasks")
def get_tasks(filter: str = "all"):
    """获取任务列表"""
    tasks = load_tasks()
    
    if filter == "pending":
        tasks = [t for t in tasks if not t["completed"]]
    elif filter == "completed":
        tasks = [t for t in tasks if t["completed"]]
    
    return {"tasks": tasks, "total": len(tasks)}

@app.get("/tasks/stats")
def get_stats():
    """获取任务统计信息"""
    tasks = load_tasks()
    
    total = len(tasks)
    completed = len([t for t in tasks if t["completed"]])
    pending = total - completed
    
    # 按分类统计
    categories = {}
    for t in tasks:
        cat = t.get("category", "other")
        categories[cat] = categories.get(cat, 0) + 1
    
    # 按优先级统计
    priorities = {}
    for t in tasks:
        p = t.get("priority", "medium")
        priorities[p] = priorities.get(p, 0) + 1
    
    # 完成率
    completion_rate = round(completed / total * 100, 1) if total > 0 else 0
    
    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "completion_rate": f"{completion_rate}%",
        "by_category": categories,
        "by_priority": priorities
    }

@app.get("/tasks/export")
def export_tasks(format: str = "json"):
    """导出任务数据"""
    tasks = load_tasks()
    
    if format == "csv":
        # 导出为CSV
        csv_lines = ["ID,内容,优先级,分类,完成状态,创建时间"]
        for t in tasks:
            status = "已完成" if t["completed"] else "待办"
            content = t["content"].replace(",", "，")
            csv_lines.append(f"{t['id']},{content},{t.get('priority','medium')},{t.get('category','work')},{status},{t.get('created','')}")
        
        return {
            "format": "csv",
            "data": "\n".join(csv_lines),
            "filename": f"tasks_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    
    return {
        "format": "json",
        "data": tasks,
        "total": len(tasks)
    }

# ============== 飞书集成 ==============

def parse_and_execute(text: str) -> str:
    """解析并执行命令，返回回复消息"""
    result = understand_command(text)
    tasks = load_tasks()
    
    if result["action"] == "create":
        task = {
            "id": len(tasks) + 1,
            "content": result["content"],
            "priority": result.get("priority", "medium"),
            "category": result.get("category", "work"),
            "completed": False,
            "created": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        tasks.append(task)
        save_tasks(tasks)
        
        emoji = {"work": "💼", "life": "🏠", "study": "📚", "health": "❤️"}.get(task["category"], "📌")
        priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(task["priority"], "🟡")
        
        return f"✅ 任务创建成功！\n\n{emoji} {task['content']}\n优先级: {priority_emoji}"
    
    # ... 其他逻辑类似
    
    return "好的，我来帮你处理"

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("🤖 智能任务助手 API")
    print("=" * 50)
    print("启动: uvicorn task_assistant:app --reload --port 8001")
    print("=" * 50)
