"""
配置管理
"""

import os
from typing import Optional


class Config:
    """配置类"""
    
    # 微信支付商户信息
    MCH_ID: str = os.getenv("WECHAT_MCH_ID", "your_mch_id")
    MCH_API_KEY: str = os.getenv("WECHAT_API_KEY", "your_api_key")
    MCH_API_V3_KEY: str = os.getenv("WECHAT_API_V3_KEY", "your_api_v3_key")
    MCH_CERT_PATH: str = os.getenv("WECHAT_CERT_PATH", "./certs/apiclient_cert.pem")
    MCH_KEY_PATH: str = os.getenv("WECHAT_KEY_PATH", "./certs/apiclient_key.pem")
    
    # API地址
    API_BASE_URL: str = "https://api.mch.weixin.qq.com"
    API_SANDBOX_URL: str = "https://api.mch.weixin.qq.com/sandboxnew"
    
    # 定时任务间隔（秒）
    POLL_INTERVAL: int = 300  # 5分钟
    POLL_INTERVAL_MIN: int = 60   # 最小1分钟
    POLL_INTERVAL_MAX: int = 3600  # 最大1小时
    
    # AI回复配置
    AI_MODEL: str = os.getenv("AI_MODEL", "minimax-cn/MiniMax-M2.5")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_API_URL: str = os.getenv("AI_API_URL", "https://api.moonshot.cn/v1/chat/completions")
    
    # 回复模板
    DEFAULT_REPLY_TEMPLATE: str = """
尊敬的客户您好，关于您反馈的问题我们已经高度重视。
{issue_description}
我们正在积极核实处理中，预计{processing_time}内完成处理。
感谢您的理解与支持！
    """.strip()
    
    # 关键词映射
    KEYWORD_RESPONSES = {
        "退款": "我们已收到您的退款请求，正在核实处理中。",
        "不到账": "关于资金到账问题，我们正在紧急核查中。",
        "重复扣款": "非常抱歉造成您的困扰，我们已记录并处理。",
        "欺诈": "我们高度重视此类问题，已提交风控部门处理。",
        "物流": "关于物流问题，我们正在联系商家为您解决。",
    }
    
    # 日志配置
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "./logs/complaint.log")
    
    # 存储配置
    DATA_DIR: str = os.getenv("DATA_DIR", "./data")
    PROCESSED_IDS_FILE: str = os.getenv("PROCESSED_IDS_FILE", "processed_ids.json")
    
    @classmethod
    def validate(cls) -> bool:
        """验证配置"""
        if not cls.MCH_ID or cls.MCH_ID == "your_mch_id":
            print("错误: 请设置商户号 MCH_ID")
            return False
        
        if not cls.MCH_API_KEY or cls.MCH_API_KEY == "your_api_key":
            print("错误: 请设置API密钥 MCH_API_KEY")
            return False
        
        return True
    
    @classmethod
    def get_processed_file_path(cls) -> str:
        """获取已处理ID存储路径"""
        return os.path.join(cls.DATA_DIR, cls.PROCESSED_IDS_FILE)


# 环境变量说明
ENV_VARS = """
# 微信支付商户配置
WECHAT_MCH_ID=你的商户号
WECHAT_API_KEY=你的API密钥
WECHAT_API_V3_KEY=你的APIv3密钥
WECHAT_CERT_PATH=证书路径/apiclient_cert.pem
WECHAT_KEY_PATH=私钥路径/apiclient_key.pem

# AI配置
AI_MODEL=moonshot-v1-8k
AI_API_KEY=你的AI API Key

# 其他配置
LOG_LEVEL=INFO
POLL_INTERVAL=300
"""
