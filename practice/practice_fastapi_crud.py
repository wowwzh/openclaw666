"""
RESTful API 服务 - 用户管理接口
功能: 增删改查用户
技术: Python + FastAPI + 内存存储
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

app = FastAPI(title="用户管理API", version="1.0.0")

# 内存存储
users_db = {}


# 数据模型
class User(BaseModel):
    name: str
    email: str
    age: Optional[int] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    age: Optional[int]
    created_at: str


# 工具函数
def generate_id():
    return str(uuid.uuid4())[:8]


# API 端点

@app.get("/")
def root():
    """根路径"""
    return {
        "message": "用户管理API",
        "version": "1.0.0",
        "endpoints": ["/users", "/users/{user_id}"]
    }


@app.get("/users", response_model=List[UserResponse])
def get_users(skip: int = 0, limit: int = 10):
    """获取用户列表"""
    users = list(users_db.values())
    return users[skip:skip + limit]


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: str):
    """获取单个用户"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    return users_db[user_id]


@app.post("/users", response_model=UserResponse, status_code=201)
def create_user(user: User):
    """创建用户"""
    # 检查邮箱是否已存在
    for existing_user in users_db.values():
        if existing_user["email"] == user.email:
            raise HTTPException(status_code=400, detail="邮箱已被使用")
    
    user_id = generate_id()
    new_user = UserResponse(
        id=user_id,
        name=user.name,
        email=user.email,
        age=user.age,
        created_at=datetime.now().isoformat()
    )
    users_db[user_id] = new_user.model_dump()
    return new_user


@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user: User):
    """更新用户"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 检查邮箱是否被其他用户使用
    for uid, existing_user in users_db.items():
        if uid != user_id and existing_user["email"] == user.email:
            raise HTTPException(status_code=400, detail="邮箱已被其他用户使用")
    
    users_db[user_id].update({
        "name": user.name,
        "email": user.email,
        "age": user.age
    })
    return users_db[user_id]


@app.delete("/users/{user_id}")
def delete_user(user_id: str):
    """删除用户"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    del users_db[user_id]
    return {"message": "用户删除成功", "user_id": user_id}


@app.get("/users/{user_id}/exists")
def check_user_exists(user_id: str):
    """检查用户是否存在"""
    return {
        "user_id": user_id,
        "exists": user_id in users_db
    }


@app.get("/stats")
def get_stats():
    """获取统计信息"""
    ages = [u["age"] for u in users_db.values() if u.get("age") is not None]
    return {
        "total_users": len(users_db),
        "users_with_age": len(ages),
        "average_age": sum(ages) / len(ages) if ages else None
    }


if __name__ == "__main__":
    import uvicorn
    print("🚀 启动用户管理API服务...")
    print("📍 访问 http://127.0.0.1:8000 查看API文档")
    uvicorn.run(app, host="127.0.0.1", port=8000)
