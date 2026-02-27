# URL验证工具 v1.0
# 功能: 验证URL格式、解析URL成分、检测URL类型

from urllib.parse import urlparse

def validate_url(url):
    """验证URL格式是否合法"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def parse_url(url):
    """解析URL各组成部分"""
    parsed = urlparse(url)
    return {
        'scheme': parsed.scheme,      # http, https, ftp
        'netloc': parsed.netloc,      # domain.com:8080
        'domain': parsed.netloc.split(':')[0] if parsed.netloc else '',
        'port': parsed.port,
        'path': parsed.path,
        'params': parsed.params,
        'query': parsed.query,
        'fragment': parsed.fragment
    }

def get_url_type(url):
    """判断URL类型"""
    parsed = urlparse(url)
    scheme = parsed.scheme.lower()
    
    types = []
    if scheme in ('http', 'https'):
        types.append('Web')
    if scheme == 'ftp':
        types.append('FTP')
    if scheme == 'mailto':
        types.append('Email')
    if ':' in parsed.netloc:
        types.append('Custom Port')
    if parsed.query:
        types.append('Has Query')
    if parsed.fragment:
        types.append('Has Fragment')
    
    return types if types else ['Unknown']

def is_secure(url):
    """检查URL是否安全(https)"""
    return urlparse(url).scheme.lower() == 'https'

# 测试
tests = [
    'https://www.example.com',
    'http://localhost:8080/path',
    'https://api.github.com/users?page=1',
    'ftp://files.server.com/doc.pdf',
    'invalid-url',
    'https://user:pass@example.com:443/login'
]

print('=== URL验证工具测试 ===\n')
all_passed = True

for url in tests:
    print(f'URL: {url}')
    print(f'  Valid: {validate_url(url)}')
    if validate_url(url):
        parsed = parse_url(url)
        print(f'  Scheme: {parsed["scheme"]}')
        print(f'  Domain: {parsed["domain"]}')
        print(f'  Port: {parsed["port"]}')
        print(f'  Path: {parsed["path"]}')
        print(f'  Type: {get_url_type(url)}')
        print(f'  Secure: {is_secure(url)}')
    print()

print('URL验证工具 v1.0 测试完成!')
