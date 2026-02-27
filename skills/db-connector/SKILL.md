# 数据库连接技能

统一管理MySQL/PostgreSQL/SQLite连接。

## MySQL

```python
import pymysql

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='password',
    database='mydb',
    charset='utf8mb4'
)
```

## PostgreSQL

```python
import psycopg2

conn = psycopg2.connect(
    host='localhost',
    user='postgres',
    password='password',
    database='mydb'
)
```

## SQLite

```python
import sqlite3

conn = sqlite3.connect('mydb.db')
```

## 统一接口

```python
from contextlib import contextmanager

@contextmanager
def get_db_connection(db_type, **kwargs):
    """统一数据库连接"""
    if db_type == 'mysql':
        import pymysql
        conn = pymysql.connect(**kwargs)
    elif db_type == 'postgres':
        import psycopg2
        conn = psycopg2.connect(**kwargs)
    elif db_type == 'sqlite':
        import sqlite3
        conn = sqlite3.connect(kwargs.get('database', 'db.sqlite'))
    else:
        raise ValueError(f"Unsupported db_type: {db_type}")
    
    try:
        yield conn
    finally:
        conn.close()

# 使用
with get_db_connection('mysql', host='localhost', user='root', database='test') as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
```

## 连接池

```python
# MySQL连接池
from dbutils.pooled_db import PooledDB
import pymysql

pool = PooledDB(pymysql, 10, host='localhost', user='root', database='test')

# PostgreSQL连接池
from psycopg2 import pool
pg_pool = pool.ThreadedConnectionPool(5, 20, host='localhost', user='user', password='pass', database='test')
```

## 通用查询

```python
def execute_query(conn, sql, params=None, fetch=True):
    cursor = conn.cursor()
    cursor.execute(sql, params or ())
    if fetch:
        result = cursor.fetchall()
    else:
        result = cursor.rowcount
        conn.commit()
    cursor.close()
    return result
```

## 配置模板

```json
{
  "database": {
    "mysql": {
      "host": "localhost",
      "port": 3306,
      "user": "root",
      "password": "${DB_PASSWORD}",
      "database": "app"
    },
    "postgres": {
      "host": "localhost",
      "port": 5432,
      "user": "postgres",
      "password": "${PG_PASSWORD}",
      "database": "app"
    }
  }
}
```
