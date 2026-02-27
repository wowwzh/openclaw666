#!/usr/bin/env python3
"""
OpenClaw 技能构建脚本
用于快速创建标准技能项目结构
"""

import os
import sys
import argparse
from datetime import datetime

TEMPLATE_SKILL = '''---
openclaw:
  name: {name}
  description: {description}
  version: 1.0.0
  author: {author}
  tags:
    - {name}
  requires: []
---

# {name}

{description}

## 使用方法

1. 安装技能
2. 配置参数
3. 开始使用

## 示例

```
# 示例命令
```
'''

TEMPLATE_README = '''# {name}

{description}

## 安装

直接复制到 skills 目录即可使用。

## 使用

详见 SKILL.md

## 作者

{author}
'''

TEMPLATE_MAIN = '''#!/usr/bin/env python3
"""
{name} - 主脚本
{description}
"""

def main():
    print("Hello from {name}!")

if __name__ == "__main__":
    main()
'''

def create_skill(name, description="", author="沈幼楚", tags="", skills_dir="."):
    """创建新的技能目录结构"""
    
    if not description:
        description = f"{name} 技能"
    
    if not tags:
        tags = name
    
    skill_path = os.path.join(skills_dir, name)
    
    # 创建目录结构
    os.makedirs(skill_path, exist_ok=True)
    os.makedirs(os.path.join(skill_path, "scripts"), exist_ok=True)
    os.makedirs(os.path.join(skill_path, "references"), exist_ok=True)
    os.makedirs(os.path.join(skill_path, "assets"), exist_ok=True)
    
    # 生成文件
    files = {
        "SKILL.md": TEMPLATE_SKILL.format(
            name=name,
            description=description,
            author=author
        ),
        "README.md": TEMPLATE_README.format(
            name=name,
            description=description,
            author=author
        ),
        "scripts/main.py": TEMPLATE_MAIN.format(
            name=name,
            description=description
        ),
    }
    
    for file_path, content in files.items():
        full_path = os.path.join(skill_path, file_path)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    print(f"✅ 技能 '{name}' 创建成功!")
    print(f"📁 路径: {skill_path}")
    print(f"\n文件结构:")
    for root, dirs, files_list in os.walk(skill_path):
        level = root.replace(skill_path, '').count(os.sep)
        indent = ' ' * 2 * level
        print(f"{indent}📂 {os.path.basename(root)}/")
        sub_indent = ' ' * 2 * (level + 1)
        for file in files_list:
            print(f"{sub_indent}📄 {file}")

def main():
    parser = argparse.ArgumentParser(description="OpenClaw 技能构建器")
    parser.add_argument("name", help="技能名称")
    parser.add_argument("--description", "-d", default="", help="技能描述")
    parser.add_argument("--author", "-a", default="沈幼楚", help="作者名")
    parser.add_argument("--tags", "-t", default="", help="标签(逗号分隔)")
    parser.add_argument("--dir", default=".", help="技能目录路径")
    
    args = parser.parse_args()
    
    create_skill(
        name=args.name,
        description=args.description,
        author=args.author,
        tags=args.tags,
        skills_dir=args.dir
    )

if __name__ == "__main__":
    main()
