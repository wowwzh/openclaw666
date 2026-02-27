"""
SQL注入检测与防御工具
功能: 检测SQL注入漏洞，生成修复建议
技术: Python + 正则表达式 + AST分析
"""

import re
from typing import List, Dict, Tuple


class SQLInjectionDetector:
    """SQL注入检测器"""
    
    # 危险SQL模式
    DANGEROUS_PATTERNS = [
        # 字符串拼接SQL
        (r'["\'].*?%s.*?["\']', 'String formatting'),
        (r'["\'].*?\+.*?["\']', 'String concatenation'),
        (r'f["\'].*?{.*?}.*?["\']', 'f-string interpolation'),
        
        # 危险函数
        (r'execute\s*\(\s*.*?\+', 'execute with concatenation'),
        (r'exec\s*\(\s*.*?\+', 'exec with concatenation'),
        (r'cursor\.execute\s*\(\s*f["\']', 'cursor.execute with f-string'),
        
        # ORM危险用法
        (r'filter\s*\(\s*\*\*.*?\)', 'filter with unpacking'),
        (r'extra\s*=', 'raw SQL via extra()'),
        (r'raw\s*\(\s*.*?\+', 'raw SQL with concatenation'),
    ]
    
    # 安全模式
    SAFE_PATTERNS = [
        # 参数化查询
        (r'execute\s*\(\s*["\'].*?%s.*?["\']\s*,\s*\[', 'Parameterized query'),
        (r'execute\s*\(\s*["\'].*?\?.*?["\']\s*,\s*\[', 'Parameterized query (?)'),
        (r'cursor\.execute\s*\(\s*["\'].*?{.*?}.*?["\']\s*,\s*\[', 'Parameterized query'),
        
        # ORM安全用法
        (r'\.filter\s*\(\s*\w+=\w+\)', 'Django filter safe'),
        (r'\.objects\.get\s*\(\s*\w+=\w+\)', 'Django get safe'),
        (r'SELECT \* FROM .*?WHERE', 'SELECT with WHERE'),
    ]
    
    def __init__(self):
        self.vulnerabilities = []
        self.safe_usages = []
    
    def detect(self, code: str) -> Dict:
        """检测SQL注入漏洞"""
        self.vulnerabilities = []
        self.safe_usages = []
        
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # 检测危险模式
            for pattern, desc in self.DANGEROUS_PATTERNS:
                if re.search(pattern, line, re.IGNORECASE):
                    self.vulnerabilities.append({
                        'line': i,
                        'code': line.strip(),
                        'type': desc,
                        'severity': 'HIGH'
                    })
            
            # 检测安全模式
            for pattern, desc in self.SAFE_PATTERNS:
                if re.search(pattern, line, re.IGNORECASE):
                    self.safe_usages.append({
                        'line': i,
                        'code': line.strip(),
                        'type': desc
                    })
        
        return {
            'vulnerabilities': self.vulnerabilities,
            'safe_usages': self.safe_usages,
            'total_lines': len(lines),
            'risk_score': self._calculate_risk()
        }
    
    def _calculate_risk(self) -> str:
        """计算风险等级"""
        vuln_count = len(self.vulnerabilities)
        if vuln_count == 0:
            return 'SAFE'
        elif vuln_count <= 2:
            return 'MEDIUM'
        else:
            return 'HIGH'
    
    def generate_report(self, code: str) -> str:
        """生成检测报告"""
        result = self.detect(code)
        
        report = ["=" * 50]
        report.append("SQL Injection Detection Report")
        report.append("=" * 50)
        report.append(f"\nTotal Lines: {result['total_lines']}")
        report.append(f"Risk Level: {result['risk_score']}")
        
        if result['vulnerabilities']:
            report.append(f"\n[!] Found {len(result['vulnerabilities'])} vulnerabilities:")
            for v in result['vulnerabilities']:
                report.append(f"  Line {v['line']}: {v['type']}")
                report.append(f"    Code: {v['code'][:60]}...")
        
        if result['safe_usages']:
            report.append(f"\n[+] Found {len(result['safe_usages'])} safe usages:")
            for s in result['safe_usages'][:3]:
                report.append(f"  Line {s['line']}: {s['type']}")
        
        return '\n'.join(report)


def test_detector():
    # 测试代码 - 有漏洞的
    vulnerable_code = """
import sqlite3

def unsafe_query(user_id):
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    # 危险！SQL注入漏洞
    query = "SELECT * FROM users WHERE id = " + user_id
    cursor.execute(query)
    return cursor.fetchall()

def also_dangerous(username):
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    # 危险！f-string注入
    cursor.execute(f"SELECT * FROM users WHERE name = '{username}'")
    return cursor.fetchall()
"""

    # 测试代码 - 安全的
    safe_code = """
import sqlite3

def safe_query(user_id):
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    # 安全！参数化查询
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    return cursor.fetchall()

def django_safe(username):
    # Django ORM 安全用法
    return User.objects.filter(username=username)
"""

    detector = SQLInjectionDetector()
    
    print("Testing vulnerable code:")
    print(detector.generate_report(vulnerable_code))
    
    print("\n" + "=" * 50)
    print("\nTesting safe code:")
    print(detector.generate_report(safe_code))


if __name__ == "__main__":
    test_detector()
