"""
文件Hash计算器 v1.0
支持: MD5, SHA1, SHA256, SHA512
功能: 计算文件/文本Hash, 批量处理, 验证文件完整性
"""

import hashlib
import os
from typing import Optional


class HashCalculator:
    """文件Hash计算器"""
    
    ALGORITHMS = ['md5', 'sha1', 'sha256', 'sha512']
    
    def __init__(self, algorithm: str = 'sha256'):
        if algorithm not in self.ALGORITHMS:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
        self.algorithm = algorithm
    
    def _get_hasher(self):
        """获取Hash对象"""
        return hashlib.new(self.algorithm)
    
    def hash_string(self, text: str) -> str:
        """计算字符串Hash"""
        hasher = self._get_hasher()
        hasher.update(text.encode('utf-8'))
        return hasher.hexdigest()
    
    def hash_file(self, file_path: str, chunk_size: int = 8192) -> str:
        """计算文件Hash (流式读取,适合大文件)"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        hasher = self._get_hasher()
        with open(file_path, 'rb') as f:
            while chunk := f.read(chunk_size):
                hasher.update(chunk)
        return hasher.hexdigest()
    
    @staticmethod
    def verify_file(file_path: str, expected_hash: str, algorithm: str = 'sha256') -> bool:
        """验证文件完整性"""
        calc = HashCalculator(algorithm)
        actual = calc.hash_file(file_path)
        return actual.lower() == expected_hash.lower()
    
    @staticmethod
    def hash_file_all(file_path: str) -> dict:
        """计算文件所有算法的Hash"""
        results = {}
        for algo in HashCalculator.ALGORITHMS:
            calc = HashCalculator(algo)
            results[algo] = calc.hash_file(file_path)
        return results


def main():
    """测试和演示"""
    print("=== 文件Hash计算器 v1.0 ===\n")
    
    # 测试字符串Hash
    print("--- 字符串Hash测试 ---")
    calc = HashCalculator('sha256')
    test_strings = [
        "hello world",
        "Hello World",
        "123456",
        "沈幼楚"
    ]
    for s in test_strings:
        h = calc.hash_string(s)
        print(f"SHA256('{s}') = {h}")
    
    print("\n--- 多算法测试 ---")
    calc = HashCalculator('md5')
    text = "test message"
    for algo in HashCalculator.ALGORITHMS:
        calc = HashCalculator(algo)
        h = calc.hash_string(text)
        print(f"{algo.upper()}: {h}")
    
    print("\n--- 文件Hash测试 ---")
    # 测试当前文件
    current_file = __file__
    results = HashCalculator.hash_file_all(current_file)
    for algo, h in results.items():
        print(f"{algo}: {h[:16]}...")
    
    print("\n--- 验证功能测试 ---")
    # 模拟验证
    test_hash = HashCalculator('sha256').hash_string("verify me")
    is_valid = HashCalculator.verify_file(__file__, test_hash, 'sha256')
    print(f"Self-verification: {is_valid}")


if __name__ == "__main__":
    main()
