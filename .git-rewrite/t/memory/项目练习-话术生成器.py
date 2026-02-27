#!/usr/bin/env python3
"""
话术生成器 - 常用回复模板工具
用于快速生成各种场景的回复话术
"""

import json
import random
from datetime import datetime

# 话术模板库
TEMPLATES = {
    "感谢": [
        "非常感谢您的支持！🙏",
        "谢谢您的认可，我们会继续努力！",
        "感谢您的信任，祝您生活愉快！",
        "太感谢了！有您的支持是我们的荣幸～",
    ],
    "道歉": [
        "非常抱歉给您带来不便！",
        "对不起，我们会立即改进。",
        "抱歉让您失望了，我们会吸取教训。",
        "真的很抱歉，请您原谅🙏",
    ],
    "确认": [
        "好的，我已经确认收到！",
        "没问题，确认完毕✅",
        "已收到，我会跟进处理！",
        "明白，我会尽快安排！",
    ],
    "拒绝": {
        "委婉": [
            "感谢您的邀请，但近期日程较满，暂时无法参加。",
            "很抱歉，这个方案目前不太适合我们。",
            "理解您的好意，不过我需要再考虑一下。",
        ],
        "直接": [
            "抱歉，这个暂时不行。",
            "不符合我们的需求，抱歉无法合作。",
            "感谢邀请，但这次无法参与。",
        ]
    },
    "催办": [
        "您好，请尽快确认一下~",
        "期待您的回复，请帮忙催办一下",
        "请问有什么需要补充的吗？",
    ],
    "自我介绍": [
        "大家好，我是{name}，负责{role}，很高兴认识大家！",
        "各位好，我是{name}，有什么可以帮到大家的请随时说~",
    ],
}

def get_template(category: str, subcategory: str = None) -> str:
    """获取话术模板"""
    if subcategory:
        templates = TEMPLATES.get(category, {}).get(subcategory, [])
    else:
        templates = TEMPLATES.get(category, [])
    
    if not templates:
        return "未找到相关话术"
    
    return random.choice(templates)

def format_template(template: str, **kwargs) -> str:
    """填充模板参数"""
    return template.format(**kwargs)

def list_categories():
    """列出所有可用分类"""
    print("\n📂 可用话术分类：")
    for cat in TEMPLATES.keys():
        subcats = TEMPLATES[cat]
        if isinstance(subcats, dict):
            print(f"  • {cat}: {', '.join(subcats.keys())}")
        else:
            print(f"  • {cat}")

def main():
    print("=" * 40)
    print("🎯 话术生成器 v1.0")
    print("=" * 40)
    
    while True:
        print("\n请选择操作：")
        print("1. 生成话术")
        print("2. 查看分类")
        print("3. 退出")
        
        choice = input("\n> ").strip()
        
        if choice == "1":
            list_categories()
            category = input("\n输入分类: ").strip()
            subcategory = None
            
            # 检查是否有子分类
            if isinstance(TEMPLATES.get(category), dict):
                subcats = list(TEMPLATES[category].keys())
                print(f"子分类: {', '.join(subcats)}")
                subcategory = input("输入子分类: ").strip()
            
            result = get_template(category, subcategory)
            print(f"\n📝 生成结果：\n{result}")
            
        elif choice == "2":
            list_categories()
            
        elif choice == "3":
            print("再见！👋")
            break
        else:
            print("无效选择，请重试")

if __name__ == "__main__":
    main()
