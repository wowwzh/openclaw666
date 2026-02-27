"""
数据校验工具 v1.0
支持: 邮箱、手机、身份证、IP、URL、银行卡等验证
"""
import re


class DataValidator:
    """数据校验工具类"""
    
    # 中国手机号正则
    CN_PHONE_PATTERN = r'^1[3-9]\d{9}$'
    
    # 邮箱正则
    EMAIL_PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # 身份证号正则 (18位)
    ID_CARD_PATTERN = r'^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$'
    
    # IP地址正则
    IP_PATTERN = r'^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$'
    
    # URL正则
    URL_PATTERN = r'^https?://[\w\-]+(\.[\w\-]+)+[/#?]?.*$'
    
    # 银行卡号正则 (16-19位)
    BANK_CARD_PATTERN = r'^\d{16,19}$'
    
    @classmethod
    def validate_phone(cls, phone: str) -> bool:
        """验证中国手机号"""
        return bool(re.match(cls.CN_PHONE_PATTERN, phone))
    
    @classmethod
    def validate_email(cls, email: str) -> bool:
        """验证邮箱"""
        return bool(re.match(cls.EMAIL_PATTERN, email))
    
    @classmethod
    def validate_id_card(cls, id_card: str) -> bool:
        """验证身份证号 (18位)"""
        if not re.match(cls.ID_CARD_PATTERN, id_card):
            return False
        # 校验位验证
        factors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
        check_codes = '10X98765432'
        sum_val = sum(int(id_card[i]) * factors[i] for i in range(17))
        expected = check_codes[sum_val % 11]
        return expected.upper() == id_card[-1].upper()
    
    @classmethod
    def validate_ip(cls, ip: str) -> bool:
        """验证IP地址"""
        return bool(re.match(cls.IP_PATTERN, ip))
    
    @classmethod
    def validate_url(cls, url: str) -> bool:
        """验证URL"""
        return bool(re.match(cls.URL_PATTERN, url))
    
    @classmethod
    def validate_bank_card(cls, card: str) -> bool:
        """验证银行卡号 (Luhn算法)"""
        if not re.match(cls.BANK_CARD_PATTERN, card):
            return False
        # Luhn校验
        digits = [int(d) for d in card]
        for i in range(len(digits) - 2, -1, -2):
            digits[i] *= 2
            if digits[i] > 9:
                digits[i] -= 9
        return sum(digits) % 10 == 0
    
    @classmethod
    def validate_all(cls, data: dict) -> dict:
        """批量验证"""
        results = {}
        for key, value in data.items():
            validator_name = f'validate_{key}'
            if hasattr(cls, validator_name):
                results[key] = getattr(cls, validator_name)(value)
            else:
                results[key] = None  # 不支持的类型
        return results


# 测试
if __name__ == '__main__':
    print("=== Project: Data Validator v1.0 ===\n")
    v = DataValidator()
    
    # 测试手机号
    phones = ['13800138000', '12345678901', '19912345678', '12345']
    print("Phone Validation:")
    for p in phones:
        print(f"  {p}: {'PASS' if v.validate_phone(p) else 'FAIL'}")
    
    # 测试邮箱
    emails = ['test@example.com', 'invalid@', 'user.name@domain.co.uk']
    print("\nEmail Validation:")
    for e in emails:
        print(f"  {e}: {'PASS' if v.validate_email(e) else 'FAIL'}")
    
    # 测试身份证 (正确校验位)
    ids = ['11010519491231002X', '110101199003078881', '110105194912310023']
    print("\nID Card Validation:")
    for i in ids:
        print(f"  {i}: {'PASS' if v.validate_id_card(i) else 'FAIL'}")
    
    # 测试IP
    ips = ['192.168.1.1', '256.1.1.1', '10.0.0.1', '1.1.1']
    print("\nIP Validation:")
    for ip in ips:
        print(f"  {ip}: {'PASS' if v.validate_ip(ip) else 'FAIL'}")
    
    # 测试URL
    urls = ['https://example.com', 'http://test.org/path', 'not-a-url', 'ftp://file.com']
    print("\nURL Validation:")
    for url in urls:
        print(f"  {url}: {'PASS' if v.validate_url(url) else 'FAIL'}")
    
    # 测试银行卡 (有效Luhn卡号)
    cards = ['4532015112830366', '622202123456789012', '1234567890123456']
    print("\nBank Card Validation:")
    for c in cards:
        print(f"  {c}: {'PASS' if v.validate_bank_card(c) else 'FAIL'}")
    
    # 批量验证
    print("\nBatch Validation:")
    data = {
        'phone': '13800138000',
        'email': 'user@example.com',
        'ip': '192.168.1.1',
        'url': 'https://example.com'
    }
    results = v.validate_all(data)
    for k, v in results.items():
        print(f"  {k}: {'PASS' if v else 'FAIL'}")
    
    print("\nAll tests completed!")
