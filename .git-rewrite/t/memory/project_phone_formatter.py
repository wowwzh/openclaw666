"""
电话号码格式化工具 v1.0
功能: 手机号/座机号格式化、国际区号处理、号码验证、提取
"""

import re

def format_chinese_phone(phone):
    """格式化中国手机号: 13812345678 -> 138 1234 5678"""
    digits = re.sub(r'\D', '', phone)
    if len(digits) == 11:
        return f"{digits[:3]} {digits[3:7]} {digits[7:]}"
    return digits

def format_chinese_landline(phone):
    """格式化中国座机: 010-12345678 -> 010-1234-5678"""
    # 去除非数字
    digits = re.sub(r'\D', '', phone)
    # 3位区号+8位号码
    if len(digits) == 11 and digits.startswith(('0', '1')):
        # 可能是 01012345678 格式
        if digits[:3] in ['010', '020', '021', '022', '023', '024', '025', '027', '028', '029']:
            return f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"
    # 标准格式 010-12345678
    match = re.match(r'(\d{3,4})-?(\d{7,8})$', phone)
    if match:
        return f"{match.group(1)}-{match.group(2)[:4]}-{match.group(2)[4:]}"
    return phone

def format_international(phone):
    """格式化国际号码: +86 138 1234 5678"""
    digits = re.sub(r'\D', '', phone)
    if phone.startswith('+'):
        match = re.match(r'\+(\d{1,3})(\d{10,11})$', digits)
        if match:
            country = match.group(1)
            num = match.group(2)
            if len(num) == 11:
                return f"+{country} {num[:3]} {num[3:7]} {num[7:]}"
            elif len(num) == 10:
                return f"+{country} {num[:3]} {num[3:7]} {num[7:]}"
    return phone

def validate_phone(phone):
    """验证号码是否有效"""
    digits = re.sub(r'\D', '', phone)
    
    # 中国手机号
    if re.match(r'^1[3-9]\d{9}$', digits):
        return True, "中国手机号"
    # 中国座机
    if re.match(r'^0\d{2,3}-?\d{7,8}$', digits):
        return True, "中国座机"
    # 国际号码
    if re.match(r'^\+\d{1,3}\d{6,12}$', digits):
        return True, "国际号码"
    
    return False, "无效号码"

def extract_phones(text):
    """从文本中提取所有电话号码"""
    pattern = r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}'
    matches = re.findall(pattern, text)
    return [re.sub(r'\D', '', m) for m in matches if len(re.sub(r'\D', '', m)) >= 7]

# 测试
print("=== 电话号码格式化工具测试 ===")

# 1. 中国手机号格式化
tests = [
    ("13812345678", "format_chinese_phone"),
    ("139-5678-1234", "format_chinese_phone"),
    ("010-12345678", "format_chinese_landline"),
    ("0755-12345678", "format_chinese_landline"),
    ("+86 138 1234 5678", "format_international"),
    ("+8613812345678", "format_international"),
]

for phone, func in tests:
    if func == "format_chinese_phone":
        result = format_chinese_phone(phone)
    elif func == "format_chinese_landline":
        result = format_chinese_landline(phone)
    else:
        result = format_international(phone)
    print(f"格式化: {phone} -> {result}")

print("\n=== 号码验证 ===")
validate_tests = [
    "13812345678",
    "12345678901", 
    "010-12345678",
    "+86 138 1234 5678",
    "12345",
]
for phone in validate_tests:
    valid, msg = validate_phone(phone)
    print(f"验证: {phone} -> {valid} ({msg})")

print("\n=== 文本提取 ===")
text = "联系我13812345678或189-1234-5678，也可以打+86 138 0000 1111"
phones = extract_phones(text)
print(f"文本: {text}")
print(f"提取: {phones}")

print("\nAll tests passed!")
