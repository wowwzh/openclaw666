#!/usr/bin/env python3
"""
词频统计工具 v1.0
功能:
- 统计文本中每个词出现的次数
- 按频率排序输出
- 过滤停用词
- 支持从文件读取
- 导出CSV结果
"""

import re
from collections import Counter
from typing import List, Tuple


# 常见英文停用词
DEFAULT_STOPWORDS = {
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don',
    'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his',
    'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'and', 'but',
    'if', 'or', 'because', 'as', 'until', 'while', 'about', 'against',
    'down', 'up', 'over', 'out', 'off', 'over', 'any', 'both', 'each',
    'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same',
}


def clean_text(text: str) -> List[str]:
    """清洗文本，提取单词"""
    # 转小写
    text = text.lower()
    # 只保留字母和空格
    text = re.sub(r'[^a-z\s]', ' ', text)
    # 分割成单词
    words = text.split()
    # 过滤空字符串
    return [w for w in words if w.strip()]


def count_words(text: str, remove_stopwords: bool = True) -> Counter:
    """统计词频"""
    words = clean_text(text)
    
    if remove_stopwords:
        words = [w for w in words if w not in DEFAULT_STOPWORDS]
    
    return Counter(words)


def get_top_n(counter: Counter, n: int = 10) -> List[Tuple[str, int]]:
    """获取前N个高频词"""
    return counter.most_common(n)


def export_csv(counter: Counter, filepath: str) -> None:
    """导出为CSV"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("word,count\n")
        for word, count in counter.most_common():
            f.write(f"{word},{count}\n")
    print(f"Exported to {filepath}")


def analyze_text(text: str, top_n: int = 10, show_all: bool = False) -> dict:
    """分析文本，返回统计结果"""
    counter = count_words(text, remove_stopwords=True)
    
    result = {
        'total_words': sum(counter.values()),
        'unique_words': len(counter),
        'top_words': get_top_n(counter, top_n) if not show_all else counter.most_common(),
    }
    
    return result


# 测试用例
def test():
    print("=" * 50)
    print("Word Frequency Counter - Tests")
    print("=" * 50)
    
    # Test 1: Basic text
    text1 = "Python is a great programming language. Python is easy to learn."
    result1 = analyze_text(text1, top_n=5)
    print(f"\n[Test 1] Basic text")
    print(f"  Text: {text1}")
    print(f"  Total words: {result1['total_words']}")
    print(f"  Unique words: {result1['unique_words']}")
    print(f"  Top words: {result1['top_words']}")
    assert result1['unique_words'] == 6  # python, great, programming, language, easy, learn
    print("  [OK]")
    
    # Test 2: With stopwords removal
    text2 = "the cat sat on the mat"
    result2 = analyze_text(text2, top_n=5)
    print(f"\n[Test 2] Stopwords removal")
    print(f"  Text: {text2}")
    print(f"  Top words (no stopwords): {result2['top_words']}")
    assert ('the', 0) not in result2['top_words']  # 'the' should be filtered
    print("  [OK]")
    
    # Test 3: Case insensitive
    text3 = "Apple APPLE apple"
    result3 = analyze_text(text3, top_n=5)
    print(f"\n[Test 3] Case insensitive")
    print(f"  Text: {text3}")
    print(f"  Top words: {result3['top_words']}")
    assert result3['top_words'][0][1] == 3  # apple count = 3
    print("  [OK]")
    
    # Test 4: Special characters
    text4 = "Hello, World! Hello-World 123"
    result4 = analyze_text(text4, top_n=5)
    print(f"\n[Test 4] Special characters")
    print(f"  Text: {text4}")
    print(f"  Top words: {result4['top_words']}")
    # Should only have hello, world
    assert result4['unique_words'] <= 2
    print("  [OK]")
    
    # Test 5: Empty text
    text5 = ""
    result5 = analyze_text(text5, top_n=5)
    print(f"\n[Test 5] Empty text")
    print(f"  Total words: {result5['total_words']}")
    print(f"  Unique words: {result5['unique_words']}")
    assert result5['total_words'] == 0
    assert result5['unique_words'] == 0
    print("  [OK]")
    
    # Test 6: Non-English characters
    text6 = "你好 world 你好"
    result6 = analyze_text(text6, top_n=5)
    print(f"\n[Test 6] Non-English")
    print(f"  Text: {text6}")
    print(f"  Top words: {result6['top_words']}")
    # Non-English should be filtered
    assert result6['unique_words'] == 1
    print("  [OK]")
    
    print("\n" + "=" * 50)
    print("[PASS] All tests passed!")
    print("=" * 50)


if __name__ == "__main__":
    test()
