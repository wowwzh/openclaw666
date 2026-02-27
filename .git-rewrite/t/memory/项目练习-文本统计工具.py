# Text Statistics Tool v1.0
# 文本统计工具

import re
from collections import Counter

def analyze_text(text):
    """Analyze text and return statistics"""
    lines = text.split('\n')
    
    stats = {
        'characters': len(text),
        'characters_no_spaces': len(text.replace(' ', '')),
        'words': len(text.split()),
        'lines': len(lines),
        'non_empty_lines': len([l for l in lines if l.strip()]),
        'blank_lines': len([l for l in lines if not l.strip()]),
        'paragraphs': len([p for p in text.split('\n\n') if p.strip()]),
    }
    
    # Word frequency
    words = re.findall(r'\b\w+\b', text.lower())
    stats['word_frequency'] = Counter(words).most_common(10)
    
    # Average line length
    non_empty = [l for l in lines if l.strip()]
    if non_empty:
        stats['avg_line_length'] = sum(len(l) for l in non_empty) / len(non_empty)
    else:
        stats['avg_line_length'] = 0
    
    return stats

def format_stats(stats):
    """Format statistics for display"""
    output = []
    output.append("=" * 40)
    output.append("         TEXT STATISTICS REPORT")
    output.append("=" * 40)
    output.append(f"  Characters (with spaces):    {stats['characters']:>8}")
    output.append(f"  Characters (no spaces):      {stats['characters_no_spaces']:>8}")
    output.append(f"  Total Words:                 {stats['words']:>8}")
    output.append(f"  Total Lines:                 {stats['lines']:>8}")
    output.append(f"  Non-empty Lines:             {stats['non_empty_lines']:>8}")
    output.append(f"  Blank Lines:                 {stats['blank_lines']:>8}")
    output.append(f"  Paragraphs:                  {stats['paragraphs']:>8}")
    output.append(f"  Avg Line Length:             {stats['avg_line_length']:>8.1f}")
    output.append("-" * 40)
    output.append("  Top 10 Words:")
    for word, count in stats['word_frequency']:
        output.append(f"    {word:<15} {count:>5}")
    output.append("=" * 40)
    return '\n'.join(output)

# Test
test_text = """
Hello world
This is a test
Hello again world
Python is great
Hello Python world
"""

print(format_stats(analyze_text(test_text)))
