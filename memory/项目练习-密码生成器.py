# 密码生成器 v1.0
# 功能: 生成随机安全密码

import random
import string

def generate_password(length=16, use_upper=True, use_lower=True, 
                     use_digits=True, use_special=True):
    """
    生成随机密码
    
    参数:
        length: 密码长度
        use_upper: 包含大写字母
        use_lower: 包含小写字母
        use_digits: 包含数字
        use_special: 包含特殊字符
    
    返回: 密码字符串
    """
    chars = ""
    
    if use_upper:
        chars += string.ascii_uppercase
    if use_lower:
        chars += string.ascii_lowercase
    if use_digits:
        chars += string.digits
    if use_special:
        chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    if not chars:
        chars = string.ascii_letters + string.digits
    
    # 确保密码包含每种类型的字符
    password = []
    if use_upper:
        password.append(random.choice(string.ascii_uppercase))
    if use_lower:
        password.append(random.choice(string.ascii_lowercase))
    if use_digits:
        password.append(random.choice(string.digits))
    if use_special:
        password.append(random.choice("!@#$%^&*()_+-=[]{}|;:,.<>?"))
    
    # 填充剩余长度
    while len(password) < length:
        password.append(random.choice(chars))
    
    random.shuffle(password)
    return ''.join(password)


def generate_password_list(count=5, length=16, **kwargs):
    """批量生成密码"""
    return [generate_password(length, **kwargs) for _ in range(count)]


# 测试
if __name__ == "__main__":
    print("=== 密码生成器 v1.0 ===\n")
    
    # 测试1: 默认参数
    pwd = generate_password()
    print(f"默认密码(16位): {pwd}")
    print(f"  长度: {len(pwd)}")
    
    # 测试2: 不同长度
    print("\n不同长度:")
    for l in [8, 12, 20, 32]:
        print(f"  {l}位: {generate_password(l)}")
    
    # 测试3: 批量生成
    print("\n批量生成5个12位密码:")
    for i, p in enumerate(generate_password_list(5, 12), 1):
        print(f"  {i}. {p}")
    
    # 测试4: 纯数字
    print(f"\n纯数字8位: {generate_password(8, use_upper=False, use_lower=False, use_special=False)}")
    
    # 测试5: 只字母
    print(f"只字母12位: {generate_password(12, use_digits=False, use_special=False)}")
    
    print("\n=== 测试通过! ===")
