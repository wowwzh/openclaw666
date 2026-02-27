#!/usr/bin/env python3
"""
FastAPI WebSocket 实时通信练习
==============================
在基础FastAPI练习上添加WebSocket支持，实现实时聊天功能。

功能:
- WebSocket 连接管理
- 实时消息广播
- 消息历史记录
- 连接状态追踪
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Set, Optional
from collections import defaultdict

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
    from fastapi.responses import HTMLResponse
    from pydantic import BaseModel, Field
    import uvicorn
except ImportError:
    print("[Info] 正在安装 FastAPI...")
    import subprocess
    subprocess.run(["pip", "install", "fastapi", "uvicorn", "websockets", "-q"])
    from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
    from fastapi.responses import HTMLResponse
    from pydantic import BaseModel
    import uvicorn

# ============== 配置 ==============

class AppConfig:
    APP_NAME = "沈幼楚的实时聊天API"
    VERSION = "2.0.0"
    HOST = "0.0.0.0"
    PORT = 8000
    MAX_MESSAGE_HISTORY = 100

# ============== 连接管理器 ==============

class ConnectionManager:
    """WebSocket 连接管理器"""
    
    def __init__(self):
        # 活跃连接: websocket -> username
        self.active_connections: Dict[WebSocket, str] = {}
        # 消息历史
        self.message_history: list = []
        # 房间管理 (支持多房间)
        self.rooms: Dict[str, Set[WebSocket]] = defaultdict(set)
    
    async def connect(self, websocket: WebSocket, username: str, room: str = "default"):
        """建立连接"""
        await websocket.accept()
        self.active_connections[websocket] = username
        self.rooms[room].add(websocket)
        logger.info(f"✅ 用户 [{username}] 加入房间 [{room}]")
        
        # 发送欢迎消息
        await self.send_personal(websocket, {
            "type": "system",
            "message": f"欢迎 {username}！当前房间有 {len(self.rooms[room]) - 1} 人",
            "timestamp": datetime.now().isoformat()
        })
        
        # 广播用户加入
        await self.broadcast({
            "type": "system",
            "message": f"{username} 加入了聊天",
            "timestamp": datetime.now().isoformat()
        }, room, exclude=websocket)
    
    def disconnect(self, websocket: WebSocket, room: str = "default"):
        """断开连接"""
        username = self.active_connections.pop(websocket, "未知用户")
        self.rooms[room].discard(websocket)
        logger.info(f"❌ 用户 [{username}] 离开房间 [{room}]")
        return username
    
    async def send_personal(self, websocket: WebSocket, message: dict):
        """发送个人消息"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"发送消息失败: {e}")
    
    async def broadcast(self, message: dict, room: str = "default", exclude: Optional[WebSocket] = None):
        """广播消息到房间所有人"""
        # 保存到历史
        if message.get("type") == "chat":
            self.message_history.append(message)
            if len(self.message_history) > AppConfig.MAX_MESSAGE_HISTORY:
                self.message_history.pop(0)
        
        # 发送消息
        disconnected = []
        for connection in self.rooms[room]:
            if connection != exclude:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.append(connection)
        
        # 清理断开的连接
        for ws in disconnected:
            self.disconnect(ws, room)
    
    async def get_room_users(self, room: str = "default") -> list:
        """获取房间用户列表"""
        users = []
        for ws, username in self.active_connections.items():
            if ws in self.rooms[room]:
                users.append(username)
        return users


# ============== API 定义 ==============

app = FastAPI(
    title="沈幼楚的实时聊天API",
    description="支持WebSocket实时通信",
    version="2.0.0"
)

manager = ConnectionManager()

# ============== 页面路由 ==============

html_page = """
<!DOCTYPE html>
<html>
<head>
    <title>🟢 实时聊天</title>
    <style>
        body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
        #messages { height: 400px; overflow-y: scroll; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
        .message { padding: 5px 10px; margin: 5px 0; border-radius: 5px; }
        .system { background: #f0f0f0; color: #666; }
        .chat { background: #e3f2fd; }
        .my-message { background: #c8e6c9; margin-left: 50px; }
        .other-message { background: #e3f2fd; margin-right: 50px; }
        input, button { padding: 10px; margin: 5px 0; }
        input { width: 70%; }
        button { width: 25%; background: #4CAF50; color: white; border: none; cursor: pointer; }
        button:hover { background: #45a049; }
        #status { padding: 5px; text-align: center; }
        .online { color: green; }
        .offline { color: red; }
    </style>
</head>
<body>
    <h1>🟢 实时聊天</h1>
    <div id="status"><span class="offline">● 未连接</span></div>
    <div id="messages"></div>
    <input type="text" id="username" placeholder="输入你的名字" />
    <br/>
    <input type="text" id="message" placeholder="输入消息..." disabled />
    <button onclick="sendMessage()" id="sendBtn" disabled>发送</button>
    
    <script>
        let ws = null;
        let myUsername = "";
        
        function connect() {
            const username = document.getElementById('username').value.trim();
            if (!username) { alert("请输入名字"); return; }
            myUsername = username;
            
            ws = new WebSocket(`ws://${window.location.host}/ws/${encodeURIComponent(username)}`);
            
            ws.onopen = () => {
                document.getElementById('status').innerHTML = '<span class="online">● 已连接</span>';
                document.getElementById('message').disabled = false;
                document.getElementById('sendBtn').disabled = false;
                document.getElementById('username').disabled = true;
            };
            
            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                const div = document.createElement('div');
                div.className = `message ${msg.type}`;
                
                if (msg.type === 'chat') {
                    const isMe = msg.username === myUsername;
                    div.className += isMe ? ' my-message' : ' other-message';
                    div.innerHTML = `<b>${msg.username}</b>: ${msg.message}`;
                } else {
                    div.innerHTML = msg.message;
                }
                
                document.getElementById('messages').appendChild(div);
                document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
            };
            
            ws.onclose = () => {
                document.getElementById('status').innerHTML = '<span class="offline">● 已断开</span>';
                document.getElementById('message').disabled = true;
                document.getElementById('sendBtn').disabled = true;
            };
        }
        
        function sendMessage() {
            const input = document.getElementById('message');
            const message = input.value.trim();
            if (message && ws) {
                ws.send(JSON.stringify({ type: 'chat', message: message, username: myUsername }));
                input.value = '';
            }
        }
        
        document.getElementById('message').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') connect();
        });
    </script>
</body>
</html>
"""

@app.get("/")
async def get_chat_page():
    """获取聊天页面"""
    return HTMLResponse(html_page)

# ============== WebSocket 路由 ==============

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    """WebSocket 端点"""
    room = "default"  # 默认房间
    await manager.connect(websocket, username, room)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 处理消息
            if message.get("type") == "chat":
                await manager.broadcast({
                    "type": "chat",
                    "username": username,
                    "message": message.get("message", ""),
                    "timestamp": datetime.now().isoformat()
                }, room)
            
            elif message.get("type") == "ping":
                await manager.send_personal(websocket, {"type": "pong"})
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, room)
        await manager.broadcast({
            "type": "system",
            "message": f"{username} 离开了聊天",
            "timestamp": datetime.now().isoformat()
        }, room)

# ============== REST API ==============

@app.get("/history")
async def get_history(limit: int = 50):
    """获取消息历史"""
    return {
        "messages": manager.message_history[-limit:],
        "total": len(manager.message_history)
    }

@app.get("/users")
async def get_online_users():
    """获取在线用户列表"""
    return {
        "users": await manager.get_room_users(),
        "total": len(manager.active_connections)
    }

# ============== 运行说明 ==============

def main():
    print("=" * 60)
    print("🌐 FastAPI WebSocket 实时通信练习")
    print("=" * 60)
    print(f"""
📖 API 文档: http://localhost:{AppConfig.PORT}/docs
🌐 聊天页面: http://localhost:{AppConfig.PORT}/
📡 WebSocket: ws://localhost:{AppConfig.PORT}/ws/{{username}}

📝 可用路由:
  GET  /           - 聊天页面
  GET  /ws/{{name}} - WebSocket 连接
  GET  /history    - 消息历史
  GET  /users      - 在线用户

⚡ 启动服务器:
    uvicorn practice_fastapi_ws:app --reload --port {AppConfig.PORT}
""")
    print("=" * 60)

if __name__ == "__main__":
    main()
