"""
剪贴板历史工具 v1.1
功能: 记录、搜索、快速复制剪贴板历史
新增: GUI界面 (tkinter)
"""
import pyperclip
import threading
import time
from collections import deque
from tkinter import *
from tkinter import ttk

class ClipboardManager:
    def __init__(self, max_items=100):
        self.history = deque(maxlen=max_items)
        self.last_content = ""
        
    def check_clipboard(self):
        """监控剪贴板变化"""
        try:
            current = pyperclip.paste()
            if current and current != self.last_content:
                self.last_content = current
                if current not in self.history:
                    self.history.appendleft(current)
                    return True
        except:
            pass
        return False
    
    def search(self, keyword):
        """搜索历史记录"""
        return [item for item in self.history if keyword.lower() in item.lower()]
    
    def copy_to_clipboard(self, text):
        """复制到剪贴板"""
        pyperclip.copy(text)
        self.last_content = text

class ClipboardGUI:
    def __init__(self):
        self.manager = ClipboardManager()
        
        self.root = Tk()
        self.root.title("剪贴板历史工具 v1.1")
        self.root.geometry("600x500")
        
        # 搜索框
        self.search_var = StringVar()
        self.search_entry = Entry(self.root, textvariable=self.search_var, font=("Arial", 12))
        self.search_entry.pack(fill=X, padx=10, pady=5)
        self.search_var.trace("w", self.on_search)
        
        # 历史列表
        self.listbox = Listbox(self.root, font=("Consolas", 10))
        self.listbox.pack(fill=BOTH, expand=True, padx=10, pady=5)
        self.listbox.bind('<Double-Button-1>', self.on_double_click)
        
        # 状态栏
        self.status_label = Label(self.root, text="监控中...", fg="gray")
        self.status_label.pack(fill=X, padx=10, pady=2)
        
        # 启动监控线程
        self.running = True
        self.monitor_thread = threading.Thread(target=self.monitor_clipboard, daemon=True)
        self.monitor_thread.start()
        
        self.update_list()
        self.root.mainloop()
    
    def monitor_clipboard(self):
        """后台监控剪贴板"""
        while self.running:
            if self.manager.check_clipboard():
                self.root.after(0, self.update_list)
            time.sleep(0.5)
    
    def update_list(self, items=None):
        """更新列表显示"""
        self.listbox.delete(0, END)
        display_items = items if items is not None else list(self.manager.history)
        
        for i, item in enumerate(display_items):
            # 截断显示
            preview = item[:80].replace('\n', ' ') + ('...' if len(item) > 80 else '')
            self.listbox.insert(END, f"{i+1}. {preview}")
        
        count = len(display_items)
        self.status_label.config(text=f"共 {count} 条记录 | 监控中...")
    
    def on_search(self, *args):
        """搜索功能"""
        keyword = self.search_var.get()
        if keyword:
            results = self.manager.search(keyword)
            self.update_list(results)
        else:
            self.update_list()
    
    def on_double_click(self, event):
        """双击复制"""
        selection = self.listbox.curselection()
        if selection:
            index = selection[0]
            # 获取当前显示的内容对应的原始数据
            keyword = self.search_var.get()
            if keyword:
                items = self.manager.search(keyword)
            else:
                items = list(self.manager.history)
            
            if index < len(items):
                self.manager.copy_to_clipboard(items[index])
                self.status_label.config(text="已复制到剪贴板!", fg="green")
                self.root.after(1500, lambda: self.status_label.config(text="监控中...", fg="gray"))
    
    def on_close(self):
        """关闭程序"""
        self.running = False
        self.root.destroy()

if __name__ == "__main__":
    ClipboardGUI()
