"""
电影票代购商 - 微信支付投诉自动处理系统
"""

# ============== 投诉类型和处理策略 ==============

COMPLAINT_TYPES = {
    # 类型1: 个人原因取消
    "personal_cancel": {
        "keywords": ["不想要", "不想去", "没时间", "个人原因", "取消订单", "退票", "退款"],
        "action": "reject_refund",
        "response_template": "抱歉，由于您个人原因无法观影，按照平台规定，票务订单一旦购买成功，不支持退票退款操作。感谢您的理解，欢迎下次光临！"
    },
    
    # 类型2: 取票码问题
    "pickup_code_issue": {
        "keywords": ["取票码", "没收到", "收不到", "取不了", "无法取票", "取票失败", "票码"],
        "action": "query_order",
        "response_template": "非常抱歉给您带来不便，请提供您的订单号，我们马上为您查询取票信息。"
    },
    
    # 类型3: 订单问题
    "order_issue": {
        "keywords": ["订单错误", "订错了", "不是我的", "订单不符"],
        "action": "feedback_to_owner",
        "response_template": "您反馈的订单问题我们已经记录，会尽快核实处理。"
    },
    
    # 类型4: 支付问题
    "payment_issue": {
        "keywords": ["支付失败", "扣款了", "没收到票", "钱扣了"],
        "action": "urgent_process",
        "response_template": "关于您支付后未收到票的问题，我们高度重视，已紧急为您核查处理，稍后给您回复。"
    }
}


class MovieTicketComplaintProcessor:
    """电影票投诉处理器"""
    
    def __init__(self, api, ai_generator, order_api=None):
        self.api = api
        self.ai = ai_generator
        self.order_api = order_api  # 订单查询API
    
    def analyze_complaint(self, complaint: dict) -> dict:
        """分析投诉类型"""
        complaint_details = complaint.get("complaint_details", "")
        
        # 匹配投诉类型
        for complaint_type, config in COMPLAINT_TYPES.items():
            for keyword in config["keywords"]:
                if keyword in complaint_details:
                    return {
                        "type": complaint_type,
                        "action": config["action"],
                        "template": config["response_template"],
                        "matched_keyword": keyword
                    }
        
        # 未匹配到任何类型，返回unknown
        return {
            "type": "unknown",
            "action": "manual_review",
            "template": "您的问题我们已经记录，会有专人尽快联系您处理。",
            "matched_keyword": None
        }
    
    def process_complaint(self, complaint: dict) -> dict:
        """处理投诉"""
        complaint_id = complaint.get("complaint_id")
        complaint_details = complaint.get("complaint_details", "")
        
        # 1. 分析投诉类型
        analysis = self.analyze_complaint(complaint)
        
        result = {
            "complaint_id": complaint_id,
            "type": analysis["type"],
            "action": analysis["action"],
            "response": None,
            "status": "pending"
        }
        
        # 2. 根据类型执行不同处理
        if analysis["action"] == "reject_refund":
            # 个人原因拒绝退款 - 直接回复
            result["response"] = analysis["template"]
            result["status"] = "auto_processed"
            
        elif analysis["action"] == "query_order":
            # 取票问题 - 需要查询订单
            # 尝试从投诉中提取订单号
            order_no = self._extract_order_no(complaint_details)
            
            if order_no and self.order_api:
                # 查询订单
                order_info = self.order_api.query(order_no)
                
                if order_info:
                    if self._is_order_valid(order_info):
                        # 订单无误 - 拒绝退款
                        result["response"] = "经查询，您的订单状态正常，取票码为：【{pickup_code}】。按照平台规定，订单正常情况下不支持退票退款。感谢您的理解！"
                        result["response"] = result["response"].format(
                            pickup_code=order_info.get("pickup_code", "请咨询客服")
                        )
                        result["status"] = "auto_processed"
                    else:
                        # 订单有误 - 反馈给老板
                        result["response"] = "您反馈的问题我们已经记录，经查询发现订单存在异常，已提交给专人处理，稍后会有工作人员联系您。"
                        result["status"] = "feedback_to_owner"
                        result["order_issue"] = True
                else:
                    # 查不到订单 - 询问订单号
                    result["response"] = "您好，请提供您的订单号，以便我们为您查询取票信息。"
                    result["status"] = "need_order_no"
            else:
                # 没有订单号 - 要求提供
                result["response"] = "您好，请提供您的订单号，以便我们为您查询取票信息。"
                result["status"] = "need_order_no"
        
        elif analysis["action"] == "feedback_to_owner":
            # 订单问题 - 反馈给老板
            result["response"] = analysis["template"]
            result["status"] = "feedback_to_owner"
            result["order_issue"] = True
        
        elif analysis["action"] == "urgent_process":
            # 支付问题 - 紧急处理
            result["response"] = analysis["template"]
            result["status"] = "urgent"
        
        else:
            # 未知类型 - 人工处理
            result["response"] = "您的问题我们已经记录，会有专人尽快联系您处理。"
            result["status"] = "manual_review"
        
        return result
    
    def _extract_order_no(self, text: str) -> str:
        """从文本中提取订单号"""
        import re
        
        # 常见的订单号格式
        patterns = [
            r"订单[号#:]?\s*([A-Z0-9]{8,})",
            r"order[_\s]?(no|id)?\s*[:=]?\s*([A-Z0-9]{8,})",
            r"([0-9]{10,})",  # 10位以上数字
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def _is_order_valid(self, order_info: dict) -> bool:
        """检查订单是否有效"""
        # 根据业务逻辑判断
        # 比如：订单状态为已出票、已完成等
        valid_status = ["已出票", "已完成", "CONFIRMED", "COMPLETED"]
        
        status = order_info.get("status", "")
        return status in valid_status
    
    def process_with_ai_fallback(self, complaint: dict) -> dict:
        """使用AI辅助处理（当规则匹配失败时）"""
        # 先用规则处理
        result = self.process_complaint(complaint)
        
        # 如果是未知类型，用AI生成回复
        if result["status"] == "manual_review":
            # 用AI分析并生成回复
            result["response"] = self.ai.generate_response(complaint)
            result["status"] = "ai_generated"
        
        return result


# ============== 订单查询API接口 ==============

class OrderAPI:
    """订单查询API - 需要对接实际的订单系统"""
    
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url
        self.api_key = api_key
    
    def query(self, order_no: str) -> dict:
        """查询订单信息
        
        返回格式：
        {
            "order_no": "订单号",
            "status": "订单状态",
            "movie_name": "电影名称",
            "show_time": "放映时间",
            "pickup_code": "取票码",
            "quantity": "数量",
            "amount": "金额",
            ...
        }
        """
        # TODO: 实现实际的订单查询逻辑
        # 示例返回
        return {
            "order_no": order_no,
            "status": "已出票",
            "movie_name": "示例电影",
            "show_time": "2026-02-25 19:00",
            "pickup_code": "123456",
            "quantity": 2,
            "amount": 60.0
        }


# ============== 处理结果反馈 ==============

def generate_feedback_report(results: list) -> str:
    """生成反馈给老板的报告"""
    report = ["=== 投诉处理报告 ===", ""]
    
    status_counts = {}
    feedback_items = []
    
    for result in results:
        status = result.get("status", "unknown")
        status_counts[status] = status_counts.get(status, 0) + 1
        
        if result.get("order_issue"):
            feedback_items.append({
                "complaint_id": result["complaint_id"],
                "issue": result.get("type"),
                "response": result.get("response")
            })
    
    report.append(f"总处理数: {len(results)}")
    report.append("")
    report.append("处理结果统计:")
    for status, count in status_counts.items():
        report.append(f"  - {status}: {count}")
    
    if feedback_items:
        report.append("")
        report.append("需要人工处理的订单问题:")
        for item in feedback_items:
            report.append(f"  - 投诉单: {item['complaint_id']}")
            report.append(f"    类型: {item['issue']}")
            report.append(f"    描述: {item['response'][:50]}...")
            report.append("")
    
    return "\n".join(report)
