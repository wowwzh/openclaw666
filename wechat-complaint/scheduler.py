"""
定时任务调度器
"""

import time
import threading
from datetime import datetime
from typing import Callable, Optional
from .processor import ComplaintProcessor
from .config import Config


class Scheduler:
    """定时任务调度器"""
    
    def __init__(self, processor: ComplaintProcessor, interval: int = None):
        self.processor = processor
        self.interval = interval or Config.POLL_INTERVAL
        self.running = False
        self.thread: Optional[threading.Thread] = None
        self.callback: Optional[Callable] = None
    
    def start(self):
        """启动调度器"""
        if self.running:
            print("调度器已在运行中")
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        
        print(f"调度器已启动，间隔: {self.interval}秒")
    
    def stop(self):
        """停止调度器"""
        self.running = False
        
        if self.thread:
            self.thread.join(timeout=5)
        
        print("调度器已停止")
    
    def _run(self):
        """运行循环"""
        while self.running:
            try:
                self._process_once()
            except Exception as e:
                print(f"处理异常: {e}")
            
            # 等待下次执行
            time.sleep(self.interval)
    
    def _process_once(self):
        """执行一次处理"""
        print(f"\n{'='*50}")
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 开始处理投诉...")
        
        result = self.processor.process()
        
        print(f"处理完成:")
        print(f"  - 总数: {result['total']}")
        print(f"  - 新投诉: {result['new']}")
        print(f"  - 处理成功: {result['processed']}")
        print(f"  - 处理失败: {result['failed']}")
        
        # 回调
        if self.callback:
            self.callback(result)
    
    def set_callback(self, callback: Callable):
        """设置回调函数"""
        self.callback = callback
    
    def run_now(self):
        """立即执行一次"""
        self._process_once()


class DaemonRunner:
    """守护进程运行器"""
    
    def __init__(self, processor: ComplaintProcessor):
        self.processor = processor
        self.scheduler = Scheduler(processor)
    
    def run(self, interval: int = None, once: bool = False):
        """运行
        
        Args:
            interval: 运行间隔（秒）
            once: 是否只运行一次
        """
        if once:
            # 只运行一次
            print("=" * 50)
            print("微信支付投诉自动处理系统 - 单次运行模式")
            print("=" * 50)
            self.processor.process()
        else:
            # 守护进程模式
            print("=" * 50)
            print("微信支付投诉自动处理系统 - 守护进程模式")
            print("=" * 50)
            self.scheduler.start()
            
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n收到退出信号，正在停止...")
                self.scheduler.stop()
                print("已退出")


# 便捷函数
def create_runner() -> DaemonRunner:
    """创建运行器"""
    from .processor import create_processor
    processor = create_processor()
    return DaemonRunner(processor)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="微信支付投诉自动处理")
    parser.add_argument("--once", action="store_true", help="只运行一次")
    parser.add_argument("--interval", type=int, default=300, help="运行间隔（秒）")
    args = parser.parse_args()
    
    runner = create_runner()
    runner.run(interval=args.interval, once=args.once)


if __name__ == "__main__":
    main()
