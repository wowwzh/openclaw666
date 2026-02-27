"""
HTTP Retry Module
=================
A通用HTTP重试机制，支持指数退避、超时控制、连接池复用。
参考 Capsule 设计模式实现。
"""

import time
import random
import threading
import logging
from typing import Optional, Dict, Any, Callable, Type
from functools import wraps
from contextlib import contextmanager

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AbortController:
    """
    超时控制器 - 类似于 JavaScript 的 AbortController
    支持在指定时间后自动中止操作
    """
    
    def __init__(self, timeout: float = 30.0):
        """
        初始化控制器
        
        Args:
            timeout: 超时时间（秒）
        """
        self.timeout = timeout
        self._aborted = False
        self._lock = threading.Lock()
        self._start_time: Optional[float] = None
    
    def abort(self) -> None:
        """立即中止操作"""
        with self._lock:
            self._aborted = True
    
    def reset(self) -> None:
        """重置控制器"""
        with self._lock:
            self._aborted = False
            self._start_time = None
    
    def start(self) -> None:
        """开始计时"""
        self._start_time = time.time()
    
    @property
    def is_aborted(self) -> bool:
        """检查是否已中止"""
        with self._lock:
            if self._aborted:
                return True
            if self._start_time is not None:
                elapsed = time.time() - self._start_time
                if elapsed >= self.timeout:
                    self._aborted = True
                    return True
            return False
    
    def check(self) -> None:
        """检查是否超时，超时则抛出异常"""
        if self.is_aborted:
            raise TimeoutError(f"Operation aborted after {self.timeout} seconds")


class GlobalConnectionPool:
    """
    全局连接池管理器
    提供请求会话管理和连接复用
    """
    
    _instance: Optional['GlobalConnectionPool'] = None
    _lock = threading.Lock()
    
    def __new__(cls) -> 'GlobalConnectionPool':
        """单例模式"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._session: Optional[requests.Session] = None
        self._initialized = True
        logger.info("GlobalConnectionPool initialized (singleton)")
    
    @property
    def session(self) -> requests.Session:
        """获取或创建会话（线程安全）"""
        if self._session is None or not self._session.is_verified:
            with self._lock:
                if self._session is None or not self._session.is_verified:
                    self._session = self._create_session()
        return self._session
    
    def _create_session(self) -> requests.Session:
        """创建配置好的会话"""
        session = requests.Session()
        
        # 配置重试策略
        retry_strategy = Retry(
            total=0,  # 我们自己控制重试
            connect=0,
            read=0,
            redirect=0,
            status=0,
        )
        
        # 配置连接池
        adapter = HTTPAdapter(
            pool_connections=10,
            pool_maxsize=20,
            max_retries=retry_strategy,
            pool_block=False,
        )
        
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # 默认超时
        session.timeout = None  # 我们自己控制超时
        
        logger.info("Created new session with connection pool")
        return session
    
    def close(self) -> None:
        """关闭会话"""
        if self._session:
            self._session.close()
            self._session = None
            logger.info("Session closed")


# 全局连接池实例
_global_pool = GlobalConnectionPool()


def get_session() -> requests.Session:
    """获取全局会话"""
    return _global_pool.session


# 可重试的错误类型
RETRYABLE_ERRORS: tuple = (
    requests.exceptions.Timeout,
    requests.exceptions.ConnectionError,
    requests.exceptions.HTTPError,
    TimeoutError,
    OSError,
)

# 需要特殊处理的HTTP状态码
RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504]


class HTTPRetryError(Exception):
    """HTTP重试错误"""
    pass


def should_retry(error: Exception, response: Optional[requests.Response] = None) -> bool:
    """
    判断是否应该重试
    
    Args:
        error: 捕获的异常
        response: 响应对象（如果有）
    
    Returns:
        bool: 是否应该重试
    """
    # 检查是否是连接错误
    error_msg = str(error).lower()
    
    # ECONNRESET, ECONNREFUSED
    if 'econnreset' in error_msg or 'econnrefused' in error_msg:
        return True
    
    # 超时错误
    if isinstance(error, (requests.exceptions.Timeout, TimeoutError)):
        return True
    
    # 连接错误
    if isinstance(error, requests.exceptions.ConnectionError):
        return True
    
    # HTTP错误码
    if response is not None:
        if response.status_code in RETRYABLE_STATUS_CODES:
            return True
        # 429 检查 Retry-After header
        if response.status_code == 429:
            return True
    
    return False


def calculate_backoff(
    attempt: int,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    multiplier: float = 2.0,
    jitter: bool = True
) -> float:
    """
    计算指数退避延迟时间
    
    Args:
        attempt: 重试次数（从0开始）
        base_delay: 基础延迟（秒）
        max_delay: 最大延迟（秒）
        multiplier: 指数乘数
        jitter: 是否添加随机抖动
    
    Returns:
        float: 延迟时间（秒）
    """
    # 指数增长: base_delay * (multiplier ^ attempt)
    delay = base_delay * (multiplier ** attempt)
    
    # 限制最大延迟
    delay = min(delay, max_delay)
    
    # 添加随机抖动 (0.5 ~ 1.5 倍)
    if jitter:
        delay = delay * (0.5 + random.random())
    
    return delay


def http_retry(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    multiplier: float = 2.0,
    jitter: bool = True,
    timeout: float = 30.0,
    retryable_errors: tuple = RETRYABLE_ERRORS,
    retryable_status_codes: list = RETRYABLE_STATUS_CODES,
):
    """
    HTTP重试装饰器
    
    Args:
        max_retries: 最大重试次数
        base_delay: 基础延迟（秒）
        max_delay: 最大延迟（秒）
        multiplier: 指数乘数
        jitter: 是否添加随机抖动
        timeout: 请求超时（秒）
        retryable_errors: 可重试的异常类型元组
        retryable_status_codes: 可重试的HTTP状态码列表
    
    Example:
        @http_retry(max_retries=5, timeout=30.0)
        def fetch_data(url):
            return requests.get(url).json()
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_error: Optional[Exception] = None
            last_response: Optional[requests.Response] = None
            
            for attempt in range(max_retries + 1):
                try:
                    # 创建AbortController用于超时控制
                    controller = AbortController(timeout=timeout)
                    controller.start()
                    
                    # 执行请求
                    result = func(*args, **kwargs)
                    
                    # 检查controller是否超时
                    controller.check()
                    
                    # 如果返回的是Response对象，检查状态码
                    if isinstance(result, requests.Response):
                        if result.status_code in retryable_status_codes:
                            last_response = result
                            raise requests.exceptions.HTTPError(
                                f"HTTP {result.status_code}",
                                response=result
                            )
                    
                    if attempt > 0:
                        logger.info(f"Request succeeded after {attempt} retries")
                    
                    return result
                
                except retryable_errors as e:
                    last_error = e
                    
                    # 判断是否应该重试
                    if not should_retry(e, last_response):
                        logger.debug(f"Non-retryable error: {e}")
                        raise
                    
                    # 达到最大重试次数
                    if attempt >= max_retries:
                        logger.error(f"Max retries ({max_retries}) reached. Last error: {e}")
                        raise HTTPRetryError(
                            f"Max retries reached after {attempt} attempts. Last error: {e}"
                        ) from e
                    
                    # 计算延迟
                    delay = calculate_backoff(
                        attempt,
                        base_delay=base_delay,
                        max_delay=max_delay,
                        multiplier=multiplier,
                        jitter=jitter
                    )
                    
                    # 处理429状态码的Retry-After
                    if last_response is not None and last_response.status_code == 429:
                        retry_after = last_response.headers.get('Retry-After')
                        if retry_after:
                            try:
                                delay = float(retry_after)
                                logger.info(f"Using Retry-After header: {delay}s")
                            except ValueError:
                                pass
                    
                    logger.warning(
                        f"Attempt {attempt + 1}/{max_retries + 1} failed: {e}. "
                        f"Retrying in {delay:.2f}s..."
                    )
                    
                    time.sleep(delay)
            
            # 理论上不会到达这里
            raise last_error
        
        return wrapper
    return decorator


@contextmanager
def retry_context(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    timeout: float = 30.0,
):
    """
    上下文管理器方式的HTTP重试
    
    Example:
        with retry_context(max_retries=5) as ctx:
            response = ctx.request('GET', 'https://api.example.com/data')
            return response.json()
    """
    controller = AbortController(timeout=timeout)
    
    class RetryContext:
        def __init__(self):
            self.last_response = None
            self.attempt = 0
        
        def request(self, method: str, url: str, **kwargs) -> requests.Response:
            """发送HTTP请求"""
            controller.reset()
            controller.start()
            
            session = get_session()
            
            for attempt in range(max_retries + 1):
                try:
                    # 设置timeout
                    kwargs.setdefault('timeout', timeout)
                    
                    response = session.request(method, url, **kwargs)
                    self.last_response = response
                    
                    controller.check()
                    
                    # 检查是否需要重试
                    if response.status_code in RETRYABLE_STATUS_CODES:
                        if attempt >= max_retries:
                            raise HTTPRetryError(f"Max retries reached")
                        delay = calculate_backoff(attempt, base_delay, max_delay)
                        logger.warning(f"Got {response.status_code}, retrying in {delay:.2f}s")
                        time.sleep(delay)
                        self.attempt = attempt + 1
                        continue
                    
                    if attempt > 0:
                        logger.info(f"Request succeeded after {attempt} retries")
                    
                    return response
                
                except RETRYABLE_ERRORS as e:
                    if attempt >= max_retries:
                        raise HTTPRetryError(f"Max retries reached: {e}") from e
                    
                    delay = calculate_backoff(attempt, base_delay, max_delay)
                    logger.warning(f"Request failed: {e}, retrying in {delay:.2f}s")
                    time.sleep(delay)
                    self.attempt = attempt + 1
    
    ctx = RetryContext()
    try:
        yield ctx
    finally:
        controller.abort()


class HTTPClient:
    """
    HTTP客户端封装
    提供简洁的API进行HTTP请求，支持自动重试
    """
    
    def __init__(
        self,
        max_retries: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        timeout: float = 30.0,
        default_headers: Optional[Dict[str, str]] = None,
    ):
        """
        初始化HTTP客户端
        
        Args:
            max_retries: 最大重试次数
            base_delay: 基础延迟
            max_delay: 最大延迟
            timeout: 默认超时时间
            default_headers: 默认请求头
        """
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.timeout = timeout
        self.default_headers = default_headers or {}
        self._session = get_session()
    
    def request(
        self,
        method: str,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        **kwargs
    ) -> requests.Response:
        """
        发送HTTP请求（带重试）
        
        Args:
            method: HTTP方法
            url: 请求URL
            headers: 请求头
            **kwargs: 其他参数
        
        Returns:
            requests.Response: 响应对象
        """
        # 合并headers
        merged_headers = {**self.default_headers, **(headers or {})}
        
        last_error: Optional[Exception] = None
        last_response: Optional[requests.Response] = None
        
        for attempt in range(self.max_retries + 1):
            try:
                kwargs.setdefault('timeout', self.timeout)
                
                response = self._session.request(
                    method,
                    url,
                    headers=merged_headers,
                    **kwargs
                )
                last_response = response
                
                # 检查状态码
                if response.status_code in RETRYABLE_STATUS_CODES:
                    if attempt >= self.max_retries:
                        raise HTTPRetryError(f"Max retries reached, status: {response.status_code}")
                    
                    delay = self._calculate_delay(attempt)
                    
                    # 处理429
                    if response.status_code == 429:
                        retry_after = response.headers.get('Retry-After')
                        if retry_after:
                            try:
                                delay = float(retry_after)
                            except ValueError:
                                pass
                    
                    logger.warning(f"Got {response.status_code}, retrying in {delay:.2f}s")
                    time.sleep(delay)
                    continue
                
                if attempt > 0:
                    logger.info(f"Request succeeded after {attempt} retries")
                
                return response
                
            except RETRYABLE_ERRORS as e:
                last_error = e
                
                if attempt >= self.max_retries:
                    raise HTTPRetryError(f"Max retries reached: {e}") from e
                
                delay = self._calculate_delay(attempt)
                logger.warning(f"Request failed: {e}, retrying in {delay:.2f}s")
                time.sleep(delay)
        
        raise last_error or HTTPRetryError("Unknown error")
    
    def _calculate_delay(self, attempt: int) -> float:
        """计算延迟时间"""
        return calculate_backoff(
            attempt,
            base_delay=self.base_delay,
            max_delay=self.max_delay
        )
    
    def get(self, url: str, **kwargs) -> requests.Response:
        """GET请求"""
        return self.request('GET', url, **kwargs)
    
    def post(self, url: str, **kwargs) -> requests.Response:
        """POST请求"""
        return self.request('POST', url, **kwargs)
    
    def put(self, url: str, **kwargs) -> requests.Response:
        """PUT请求"""
        return self.request('PUT', url, **kwargs)
    
    def delete(self, url: str, **kwargs) -> requests.Response:
        """DELETE请求"""
        return self.request('DELETE', url, **kwargs)


# 便捷函数
def retry_request(
    method: str,
    url: str,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    timeout: float = 30.0,
    **kwargs
) -> requests.Response:
    """
    便捷的HTTP请求函数
    
    Example:
        response = retry_request('GET', 'https://api.example.com/data')
        data = response.json()
    """
    client = HTTPClient(
        max_retries=max_retries,
        base_delay=base_delay,
        max_delay=max_delay,
        timeout=timeout,
    )
    return client.request(method, url, **kwargs)


# 测试代码
if __name__ == "__main__":
    # 测试1: 使用装饰器
    @http_retry(max_retries=3, timeout=10.0)
    def test_request(url: str) -> requests.Response:
        return requests.get(url)
    
    # 测试2: 使用HTTPClient
    client = HTTPClient(max_retries=3, timeout=10.0)
    
    # 测试3: 使用便捷函数
    # response = retry_request('GET', 'https://httpbin.org/get')
    
    print("HTTP Retry Module Test")
    print("-" * 40)
    print(f"Max retries: 3")
    print(f"Base delay: 1.0s")
    print(f"Max delay: 60.0s")
    print(f"Timeout: 10.0s")
    print("-" * 40)
    print("Module loaded successfully!")
