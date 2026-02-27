# 微信支付商户投诉API完整文档

## 接口基础信息

- **基础URL**: `https://api.mch.weixin.qq.com`
- **协议**: HTTPS JSON
- **认证方式**: APIv3 RSA签名 + 商户证书

---

## API接口列表

### 1. 获取投诉列表

```
GET /v3/merchant-service/complaints
```

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | int | 否 | 默认100，最大500 |
| offset | int | 否 | 偏移量 |
| begin_date | string | 否 | 开始日期 (YYYY-MM-DD) |
| end_date | string | 否 | 结束日期 (YYYY-MM-DD) |
| complainted_mchid | string | 否 | 被投诉商户号 |

**返回示例**:
```json
{
  "data": [
    {
      "complaint_id": "2002019202202106152300000001",
      "complaint_details": "客户投诉内容",
      "complaint_time": "2022-06-15T10:00:00+08:00",
      "complaint_type": "交易",
      "complaint_state": "PENDING",
      "amount": 1000,
      "payer_mobile": "138****8888",
      "payer_email": "test@example.com",
      "transaction_id": "4200002022061520234567890",
      "out_trade_no": "ORDER123456789"
    }
  ],
  "total_count": 100,
  "offset": 0,
  "limit": 100
}
```

---

### 2. 获取投诉详情

```
GET /v3/merchant-service/complaints/{complaint_id}
```

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| complaint_id | string | 是 | 投诉单号 |

**返回示例**:
```json
{
  "complaint_id": "2002019202202106152300000001",
  "complaint_details": "客户投诉内容",
  "complaint_time": "2022-06-15T10:00:00+08:00",
  "complaint_type": "交易",
  "complaint_state": "PROCESSING",
  "amount": 1000,
  "payer_info": {
    "payer_phone": "138****8888",
    "payer_email": "test@example.com"
  },
  "transaction_info": {
    "transaction_id": "4200002022061520234567890",
    "out_trade_no": "ORDER123456789",
    "trade_state": "SUCCESS",
    "trade_type": "JSAPI",
    "trade_time": "2022-06-15T09:55:00+08:00",
    "amount": 1000,
    "product_info": "电影票"
  },
  "respondent_info": {
    "mchid": "1234567890",
    "mch_name": "商户名称"
  },
  "proof_media_list": [
    {
      "media_type": "image",
      "media_url": "https://example.com/proof1.jpg"
    }
  ],
  "linked_order_list": [],
  "merchant_extra_info": {}
}
```

---

### 3. 回复投诉

```
POST /v3/merchant-service/complaints/{complaint_id}/response
```

**请求参数**:
```json
{
  "response_content": "回复内容"
}
```

**返回**: HTTP 200 表示成功

---

### 4. 反馈处理结果

```
POST /v3/merchant-service/complaints/{complaint_id}/feedback
```

**请求参数**:
```json
{
  "feedback_type": "PROCESSED",  // PROCESSED: 已处理完成 | UNPROCESSED: 未处理
  "feedback_content": "处理说明"
}
```

**返回**: HTTP 200 表示成功

---

### 5. 查询投诉关联订单

```
GET /v3/merchant-service/complaints/{complaint_id}/transactions
```

**返回示例**:
```json
{
  "data": [
    {
      "transaction_id": "4200002022061520234567890",
      "out_trade_no": "ORDER123456789",
      "trade_state": "SUCCESS",
      "trade_type": "JSAPI",
      "trade_time": "2022-06-15T09:55:00+08:00",
      "amount": 1000,
      "payer_total": 1000,
      "product_detail": {
        "product_id": "123456",
        "product_name": "电影票",
        "quantity": 2,
        "price": 500
      }
    }
  ]
}
```

---

### 6. 通知回调

**回调通知URL**: 需要在商户平台配置

**回调事件**:
- `COMPLAINT_NOTIFY`: 新的投诉通知

**回调示例**:
```json
{
  "id": "EV-202206151040000501",
  "create_time": "2022-06-15T10:40:00+08:00",
  "resource_type": "encrypt_resource",
  "event_type": "COMPLAINT_NOTIFY",
  "resource": {
    "algorithm": "AEAD_AES_256_GCM",
    "ciphertext": "...",
    "nonce": "...",
    "associated_data": ""
  }
}
```

---

## 投诉状态

| 状态 | 说明 |
|------|------|
| PENDING | 待处理 |
| PROCESSING | 处理中 |
| RESOLVED | 已解决 |
| CLOSED | 已关闭 |

---

## 投诉类型

| 类型 | 说明 |
|------|------|
| 交易 | 支付相关投诉 |
| 服务 | 售后服务投诉 |
| 其他 | 其他类型投诉 |

---

## 认证方式

### 签名步骤

1. 准备签名参数 (method, url, timestamp, nonce, body)
2. 构造签名消息
3. 使用商户私钥签名
4. 生成Authorization头

### 示例代码 (Python)

```python
import time
import json
import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
import requests

class WeChatPayComplaintAPI:
    def __init__(self, mch_id, private_key_path, cert_serial_no):
        self.mch_id = mch_id
        self.private_key_path = private_key_path
        self.cert_serial_no = cert_serial_no
        self.base_url = "https://api.mch.weixin.qq.com"
    
    def _get_private_key(self):
        with open(self.private_key_path, 'rb') as f:
            return serialization.load_pem_private_key(
                f.read(), 
                password=None, 
                backend=default_backend()
            )
    
    def _sign(self, method, url, timestamp, nonce, body):
        message = f"{method}\n{url}\n{timestamp}\n{nonce}\n{body}\n"
        private_key = self._get_private_key()
        signature = private_key.sign(
            message.encode('utf-8'),
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        return base64.b64encode(signature).decode('utf-8')
    
    def _build_headers(self, method, url, body=""):
        timestamp = str(int(time.time()))
        nonce = "your_nonce_string"  # 随机字符串
        signature = self._sign(method, url, timestamp, nonce, body)
        
        return {
            "Authorization": f'WECHATPAY2-SHA256-RSA2048 mchid="{self.mch_id}",nonce_str="{nonce}",timestamp="{timestamp}",signature="{signature}",serial_no="{self.cert_serial_no}"',
            "Content-Type": "application/json"
        }
    
    def get_complaints(self, limit=100, offset=0):
        url = f"{self.base_url}/v3/merchant-service/complaints"
        params = {"limit": limit, "offset": offset}
        
        headers = self._build_headers("GET", url)
        
        response = requests.get(url, params=params, headers=headers)
        return response.json()
    
    def get_complaint_detail(self, complaint_id):
        url = f"{self.base_url}/v3/merchant-service/complaints/{complaint_id}"
        headers = self._build_headers("GET", url)
        response = requests.get(url, headers=headers)
        return response.json()
    
    def response_complaint(self, complaint_id, content):
        url = f"{self.base_url}/v3/merchant-service/complaints/{complaint_id}/response"
        body = json.dumps({"response_content": content})
        headers = self._build_headers("POST", url, body)
        response = requests.post(url, data=body.encode('utf-8'), headers=headers)
        return response.status_code == 200
    
    def feedback_complaint(self, complaint_id, feedback_type, content):
        url = f"{self.base_url}/v3/merchant-service/complaints/{complaint_id}/feedback"
        body = json.dumps({
            "feedback_type": feedback_type,
            "feedback_content": content
        })
        headers = self._build_headers("POST", url, body)
        response = requests.post(url, data=body.encode('utf-8'), headers=headers)
        return response.status_code == 200
```

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 401 | 签名验证失败 |
| 403 | 权限不足 |
| 404 | 投诉不存在 |
| 429 | 请求频率超限 |
| 500 | 服务端错误 |

---

## 相关链接

- [微信支付商户文档](https://pay.weixin.qq.com/)
- [微信支付APIv3文档](https://wechatpay-api-v3.readthedocs.io/)
