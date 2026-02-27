#!/usr/bin/env python3
"""
练习4: 异步编程 asyncio 实战
v1.1 优化:
- 添加类型注解
- 添加异常处理和超时控制
- 添加速率限制
- 添加并发数限制
"""

import asyncio
import aiohttp
import time
from typing import List, Optional
from collections import defaultdict

# ============== 异步基础 ==============

async def hello_async(name: str) -> str:
    """异步 Hello World"""
    print(f"[{name}] 开始...")
    await asyncio.sleep(1)  # 模拟IO操作
    print(f"[{name}] 完成!")
    return f"Hello, {name}!"

async def fetch_data(url: str, session: aiohttp.ClientSession, timeout: int = 10) -> str:
    """异步获取网页 (带超时和异常处理)"""
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=timeout)) as response:
            text = await response.text()
            return f"{url}: {len(text)} bytes"
    except asyncio.TimeoutError:
        return f"{url}: TIMEOUT"
    except Exception as e:
        return f"{url}: ERROR - {e}"

# 速率限制器 (Semaphore)
class RateLimiter:
    def __init__(self, max_concurrent: int = 5):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.counts = defaultdict(int)
    
    async def __aenter__(self):
        await self.semaphore.acquire()
        return self
    
    async def __aexit__(self, *args):
        self.semaphore.release()

async def main():
    """异步主函数"""
    print("=" * 60)
    print("⚡ 异步编程 asyncio 练习")
    print("=" * 60)
    
    # 练习1: 基本异步
    print("\n[1] 基本异步任务:")
    start = time.time()
    # 顺序执行
    results = []
    for name in ["Alice", "Bob", "Charlie"]:
        result = await hello_async(name)
        results.append(result)
    print(f"  顺序执行耗时: {time.time() - start:.2f}s")
    print(f"  结果: {results}")
    
    # 练习2: 并发执行
    print("\n[2] 并发执行:")
    start = time.time()
    tasks = [hello_async(name) for name in ["Alice", "Bob", "Charlie"]]
    results = await asyncio.gather(*tasks)
    print(f"  并发执行耗时: {time.time() - start:.2f}s")
    print(f"  结果: {results}")
    
    # 练习3: 并发请求网页
    print("\n[3] 并发HTTP请求:")
    urls = [
        "https://httpbin.org/get",
        "https://httpbin.org/ip",
        "https://httpbin.org/headers",
    ]
    
    start = time.time()
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_data(url, session) for url in urls]
        results = await asyncio.gather(*tasks)
    print(f"  耗时: {time.time() - start:.2f}s")
    for r in results:
        print(f"    {r}")
    
    # 练习4: 异步生成器
    print("\n[4] 异步生成器:")
    async def async_range(n):
        for i in range(n):
            yield i
            await asyncio.sleep(0.1)
    
    async for num in async_range(5):
        print(f"    生成: {num}")
    
    print("\n" + "=" * 60)
    print("[OK] 异步编程练习完成!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
