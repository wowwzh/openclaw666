#!/usr/bin/env python3
"""
练习2: FastAPI 入门
功能：创建一个简单的REST API
v1.1 优化:
- 添加详细类型注解
- 统一响应格式
- 添加错误处理
- 添加日志记录
- 更好的配置管理
"""

import logging
from typing import Optional, List, Dict, Any
from enum import Enum

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 如果没有安装fastapi，会提示安装
try:
    from fastapi import FastAPI, HTTPException, status
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel, Field
    import uvicorn
except ImportError:
    print("[Info] 正在安装 FastAPI...")
    import subprocess
    subprocess.run(["pip", "install", "fastapi", "uvicorn", "-q"])
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel, Field
    import uvicorn

# ============== 配置 ==============

class AppConfig:
    APP_NAME = "沈幼楚的测试API"
    VERSION = "1.0.1"
    DESCRIPTION = "一个简单的REST API练习"
    HOST = "0.0.0.0"
    PORT = 8000

# ============== 响应模型 ==============

class ResponseStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"

def success_response(data: Any, message: str = "成功") -> Dict:
    """统一成功响应格式"""
    return {
        "status": ResponseStatus.SUCCESS,
        "message": message,
        "data": data
    }

def error_response(message: str, code: int = 400) -> Dict:
    """统一错误响应格式"""
    return {
        "status": ResponseStatus.ERROR,
        "message": message
    }

# ============== API 定义 ==============

app = FastAPI(
    title="沈幼楚的测试API",
    description="一个简单的REST API练习",
    version="1.0.0"
)

# ============== 数据模型 ==============

class Item(BaseModel):
    """商品数据模型"""
    name: str
    description: Optional[str] = None
    price: float
    tax: Optional[float] = None

class User(BaseModel):
    """用户数据模型"""
    id: int
    name: str
    email: str
    age: Optional[int] = None

# ============== 模拟数据库 ==============

# 内存中的用户列表
users_db = [
    {"id": 1, "name": "小明", "email": "xiaoming@example.com", "age": 25},
    {"id": 2, "name": "小红", "email": "xiaohong@example.com", "age": 23},
]

items_db = {}

# ============== API 路由 ==============

@app.get("/")
def read_root():
    """根路由 - 返回欢迎信息"""
    return {
        "message": "欢迎使用沈幼楚的测试API!",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """健康检查"""
    return {"status": "healthy"}

# --- 用户相关 API ---

@app.get("/users", response_model=List[dict])
def get_users():
    """获取所有用户"""
    return users_db

@app.get("/users/{user_id}")
def get_user(user_id: int):
    """根据ID获取用户"""
    for user in users_db:
        if user["id"] == user_id:
            return success_response(user)
    logger.warning(f"用户不存在: {user_id}")
    raise HTTPException(status_code=404, detail="用户不存在")

@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user: User):
    """创建新用户"""
    user_dict = user.dict()
    user_dict["id"] = len(users_db) + 1
    users_db.append(user_dict)
    logger.info(f"创建用户: {user_dict}")
    return success_response(user_dict, "用户创建成功")

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    """删除用户"""
    for i, user in enumerate(users_db):
        if user["id"] == user_id:
            deleted = users_db.pop(i)
            logger.info(f"删除用户: {deleted}")
            return success_response(None, f"用户 {user_id} 已删除")
    logger.warning(f"删除失败，用户不存在: {user_id}")
    raise HTTPException(status_code=404, detail="用户不存在")

# --- 商品相关 API ---

@app.get("/items", response_model=List[dict])
def get_items():
    """获取所有商品"""
    return [{"id": k, **v} for k, v in items_db.items()]

@app.get("/items/{item_id}")
def get_item(item_id: str):
    """根据ID获取商品"""
    if item_id in items_db:
        return {"id": item_id, **items_db[item_id]}
    return {"error": "商品不存在"}

@app.post("/items")
def create_item(item: Item):
    """创建商品"""
    item_id = f"item_{len(items_db) + 1}"
    items_db[item_id] = item.dict()
    return {"message": "商品创建成功", "id": item_id, "item": item}

# ============== 运行说明 ==============

def main():
    print("=" * 60)
    print("🌐 FastAPI 入门练习")
    print("=" * 60)
    print("""
📖 API 文档: http://localhost:8000/docs
🔌 根地址:   http://localhost:8000
❤️  健康检查: http://localhost:8000/health

📝 可用路由:
  GET    /           - 欢迎信息
  GET    /health    - 健康检查
  GET    /users     - 获取所有用户
  GET    /users/1   - 获取指定用户
  POST   /users     - 创建用户
  DELETE /users/1   - 删除用户
  GET    /items     - 获取所有商品
  POST   /items     - 创建商品

⚠️  如果要启动服务器，请运行:
    uvicorn practice_fastapi:app --reload --port 8000
""")
    print("=" * 60)

if __name__ == "__main__":
    main()
