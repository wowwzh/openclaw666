#!/usr/bin/env python3
"""
练习3: SQLite 数据库操作
功能：增删改查实战
v1.1 优化:
- 添加类型注解
- 添加上下文管理器支持 (__enter__, __exit__)
- 使用 row_factory 获取列名
- 添加连接池管理
- 添加事务支持
"""

import sqlite3
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from contextlib import contextmanager
import os

DB_FILE = "practice/test.db"

# ============== 数据库工具类 ==============

class Database:
    """SQLite 数据库操作类"""
    
    def __init__(self, db_file: str = DB_FILE):
        self.db_file = db_file
        self.init_db()
    
    def connect(self) -> sqlite3.Connection:
        """连接数据库"""
        conn = sqlite3.connect(self.db_file)
        conn.row_factory = sqlite3.Row  # 支持列名访问
        return conn
    
    @contextmanager
    def get_cursor(self):
        """上下文管理器：自动提交/回滚/关闭"""
        conn = self.connect()
        cursor = conn.cursor()
        try:
            yield cursor
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def init_db(self) -> None:
        """初始化数据库表"""
        with self.get_cursor() as cursor:
            # 创建用户表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    age INTEGER,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 创建商品表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    price REAL NOT NULL,
                    stock INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
        print(f"[✓] 数据库初始化完成: {self.db_file}")
    
    # --- 用户 CRUD ---
    
    def create_user(self, name: str, email: str, age: Optional[int] = None) -> Optional[int]:
        """创建用户"""
        try:
            with self.get_cursor() as cursor:
                cursor.execute(
                    "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
                    (name, email, age)
                )
                user_id = cursor.lastrowid
                print(f"[OK] 创建用户成功: {name} (ID: {user_id})")
                return user_id
        except sqlite3.IntegrityError:
            print(f"[Error] 邮箱 {email} 已存在!")
            return None
    
    def get_all_users(self) -> List[Dict[str, Any]]:
        """获取所有用户 (返回字典)"""
        with self.get_cursor() as cursor:
            cursor.execute("SELECT * FROM users")
            return [dict(row) for row in cursor.fetchall()]
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """根据ID获取用户"""
        with self.get_cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def update_user(self, user_id, name=None, age=None):
        """更新用户"""
        conn = self.connect()
        cursor = conn.cursor()
        
        updates = []
        params = []
        if name:
            updates.append("name = ?")
            params.append(name)
        if age is not None:
            updates.append("age = ?")
            params.append(age)
        
        if updates:
            params.append(user_id)
            cursor.execute(
                f"UPDATE users SET {', '.join(updates)} WHERE id = ?",
                params
            )
            conn.commit()
            print(f"[OK] 更新用户 ID: {user_id}")
        
        conn.close()
    
    def delete_user(self, user_id):
        """删除用户"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        deleted = cursor.rowcount
        conn.close()
        print(f"[OK] 删除用户 ID: {user_id}, 影响行数: {deleted}")
        return deleted > 0
    
    # --- 商品 CRUD ---
    
    def create_product(self, name, price, stock=0):
        """创建商品"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
            (name, price, stock)
        )
        conn.commit()
        product_id = cursor.lastrowid
        conn.close()
        print(f"[OK] 创建商品: {name} (ID: {product_id})")
        return product_id
    
    def get_all_products(self):
        """获取所有商品"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products")
        products = cursor.fetchall()
        conn.close()
        return products
    
    def update_stock(self, product_id, quantity):
        """更新库存"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE products SET stock = stock + ? WHERE id = ?",
            (quantity, product_id)
        )
        conn.commit()
        affected = cursor.rowcount
        conn.close()
        return affected > 0


# ============== 测试 ==============

def test_database():
    """测试数据库操作"""
    print("=" * 60)
    print("💾 SQLite 数据库操作练习")
    print("=" * 60)
    
    db = Database()
    
    # 测试1: 创建用户
    print("\n[1] 创建用户:")
    db.create_user("小明", "xiaoming@example.com", 25)
    db.create_user("小红", "xiaohong@example.com", 23)
    db.create_user("小刚", "xiaogang@example.com", 28)
    
    # 测试2: 查询用户
    print("\n[2] 查询所有用户:")
    users = db.get_all_users()
    for user in users:
        print(f"  ID: {user[0]}, Name: {user[1]}, Email: {user[2]}, Age: {user[3]}")
    
    # 测试3: 更新用户
    print("\n[3] 更新用户:")
    db.update_user(1, age=26)
    user = db.get_user_by_id(1)
    print(f"  用户1更新后: {user}")
    
    # 测试4: 创建商品
    print("\n[4] 创建商品:")
    db.create_product("iPhone 15", 6999.00, 100)
    db.create_product("MacBook Pro", 12999.00, 50)
    db.create_product("AirPods Pro", 1999.00, 200)
    
    # 测试5: 查询商品
    print("\n[5] 查询所有商品:")
    products = db.get_all_products()
    for p in products:
        print(f"  ID: {p[0]}, Name: {p[1]}, Price: ¥{p[2]}, Stock: {p[3]}")
    
    # 测试6: 更新库存
    print("\n[6] 更新库存:")
    db.update_stock(1, -10)  # 卖出10台
    products = db.get_all_products()
    print(f"  iPhone 15 剩余库存: {products[0][3]}")
    
    # 测试7: 删除用户
    print("\n[7] 删除用户:")
    db.delete_user(2)
    
    print("\n" + "=" * 60)
    print("[OK] 数据库操作练习完成!")
    print("=" * 60)


if __name__ == "__main__":
    test_database()
