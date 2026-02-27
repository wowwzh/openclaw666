# 微信支付商户投诉 - 对接流程文档

## 一、需要提供的资料

| 资料 | 说明 | 用途 |
|------|------|------|
| 1. 商户号 (mch_id) | 微信支付商户号 | 身份标识 |
| 2. API密钥 (api_key) | API密钥 | 签名用 |
| 3. APIv3密钥 | APIv3密钥 | 解密回调 |
| 4. 商户证书 | apiclient_cert.pem | 身份认证 |
| 5. 商户私钥 | apiclient_key.pem | 生成签名 |
| 6. 证书序列号 | 证书序列号 | 签名参数 |

**获取方式：**
- 登录微信支付商户平台 (pay.weixin.qq.com)
- 进入账户中心 → API安全
- 设置API密钥、下载证书

---

## 二、对接流程

### 步骤1: 配置参数

```python
# config.py 中配置
WECHAT_MCH_ID = "你的商户号"
WECHAT_API_KEY = "你的API密钥"
WECHAT_API_V3_KEY = "你的APIv3密钥"
WECHAT_CERT_PATH = "证书路径/apiclient_cert.pem"
WECHAT_KEY_PATH = "私钥路径/apiclient_key.pem"
```

### 步骤2: 初始化API

```python
from wechat_complaint import WeChatComplaintAPI

api = WeChatComplaintAPI(
    mch_id="商户号",
    cert_path="证书路径",
    key_path="私钥路径"
)
```

### 步骤3: 拉取投诉

```python
# 获取投诉列表
complaints = api.get_complaints(limit=100)

for complaint in complaints:
    # 获取详情
    detail = api.get_complaint_detail(complaint['complaint_id'])
    print(detail['complaint_details'])
```

### 步骤4: 处理投诉

```python
# 回复投诉
api.response_complaint(
    complaint_id="投诉单号",
    response_content="回复内容"
)

# 反馈处理结果
api.feedback_complaint(
    complaint_id="投诉单号",
    feedback_type="PROCESSED"  # 或 "UNPROCESSED"
)
```

### 步骤5: 定时任务（可选）

```bash
# 每5分钟自动拉取处理
python scheduler.py --interval 300
```

---

## 三、完整代码调用示例

```python
from wechat_complaint import WeChatComplaintAPI, ComplaintProcessor

# 1. 初始化
api = WeChatComplaintAPI(
    mch_id="1234567890",
    cert_path="./certs/apiclient_cert.pem",
    key_path="./certs/apiclient_key.pem"
)

# 2. 创建处理器
processor = ComplaintProcessor(api)

# 3. 处理所有投诉
results = processor.process()

print(f"处理完成: {results}")
```

---

## 四、你只需要提供

1. **商户号** (mch_id)
2. **API密钥** (api_key)
3. **APIv3密钥**
4. **证书文件** (2个文件)

---

## 五、代码已就绪

代码已经写好了，只需要填入上面的配置就可以运行！

**项目路径:** `D:\OpenClaw\workspace\wechat-complaint\`

---

## 六、运行命令

```bash
# 进入目录
cd D:\OpenClaw\workspace\wechat-complaint

# 设置环境变量（或者直接改config.py）

# 运行
python scheduler.py
```

---

## 总结

| 你需要做的 | 幼楚做的 |
|------------|----------|
| 提供6个资料 | 写好完整代码 |
| 运行程序 | 对接微信API |
| 查看结果 | 自动处理投诉 |

资料给到就能跑！🚀
