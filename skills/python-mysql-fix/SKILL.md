# Python MySQL连接修复技能

解决Python MySQL连接超时和查询慢问题。

## 常见错误

```python
# Error 2006: MySQL server has gone away
pymysql.err.OperationalError: (2006, 'MySQL server has gone away')

# Error 2013: Lost connection during query
pymysql.err.OperationalError: (2013, 'Lost connection during query')

# Query timeout
pymysql.err.OperationalError: (2013, 'Lost connection during query')
```

## 解决方案

### 1. 连接池

```python
from dbutils.pooled_db import PooledDB
import pymysql

pool = PooledDB(
    creator=pymysql,
    maxconnections=10,
    mincached=2,
    maxcached=5,
    blocking=True,
    socket_timeout=30,
    connect_timeout=10
)

# 使用连接
conn = pool.connection()
cursor = conn.cursor()
cursor.execute("SELECT * FROM users")
```

### 2. 自动重试

```python
import pymysql
from pymysql import OperationalError

def execute_with_retry(sql, max_retries=3):
    for attempt in range(max_retries):
        try:
            conn = pymysql.connect(host=..., port=...)
            cursor = conn.cursor()
            cursor.execute(sql)
            return cursor.fetchall()
        except OperationalError as e:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # 指数退避
            else:
                raise
```

### 3. 超时配置

```python
conn = pymysql.connect(
    host='localhost',
    user='user',
    password='pass',
    database='db',
    connect_timeout=10,
    read_timeout=30,
    write_timeout=30,
    autocommit=True
)
```

### 4. 游标配置

```python
cursor = conn.cursor(pymysql.cursors.DictCursor)
# 或
cursor = conn.cursor(pymysql.cursors.SSCursor)  # 服务端游标，省内存
```

## 性能优化

```python
# 批量插入
data = [(i, f'name_{i}') for i in range(1000)]
cursor.executemany("INSERT INTO users (id, name) VALUES (%s, %s)", data)

# 查询优化
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

## 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| connect_timeout | 10 | 连接超时 |
| read_timeout | 30 | 读超时 |
| write_timeout | 30 | 写超时 |
| max_connections | 10 | 最大连接数 |
