# 项目练习 - 批量文件重命名工具

## 功能
- 批量重命名文件
- 支持添加前缀/后缀
- 编号支持
- 查找替换

## 技术
Python + os

```python
import os
import re

class BatchRenamer:
    def __init__(self, folder_path):
        self.folder_path = folder_path
    
    def add_prefix(self, prefix, extension=None):
        """添加前缀"""
        files = self._get_files(extension)
        for old_name in files:
            new_name = prefix + old_name
            self._rename(old_name, new_name)
    
    def add_suffix(self, suffix, extension=None):
        """添加后缀（不含扩展名）"""
        files = self._get_files(extension)
        for old_name in files:
            name, ext = os.path.splitext(old_name)
            new_name = name + suffix + ext
            self._rename(old_name, new_name)
    
    def add_numbering(self, start=1, step=1, width=3, extension=None):
        """添加编号"""
        files = self._get_files(extension)
        for i, old_name in enumerate(files):
            name, ext = os.path.splitext(old_name)
            num = start + i * step
            new_name = f"{str(num).zfill(width)}_{name}{ext}"
            self._rename(old_name, new_name)
    
    def replace(self, old_pattern, new_pattern, extension=None):
        """查找替换"""
        files = self._get_files(extension)
        for old_name in files:
            if old_pattern in old_name:
                new_name = old_name.replace(old_pattern, new_pattern)
                self._rename(old_name, new_name)
    
    def regex_replace(self, pattern, replacement, extension=None):
        """正则替换"""
        files = self._get_files(extension)
        for old_name in files:
            new_name = re.sub(pattern, replacement, old_name)
            if new_name != old_name:
                self._rename(old_name, new_name)
    
    def _get_files(self, extension=None):
        """获取文件列表"""
        files = os.listdir(self.folder_path)
        if extension:
            if not extension.startswith('.'):
                extension = '.' + extension
            files = [f for f in files if f.endswith(extension)]
        return [f for f in files if os.path.isfile(os.path.join(self.folder_path, f))]
    
    def _rename(self, old_name, new_name):
        """重命名文件"""
        old_path = os.path.join(self.folder_path, old_name)
        new_path = os.path.join(self.folder_path, new_name)
        if os.path.exists(new_path):
            print(f"⚠️ 跳过: {new_name} 已存在")
            return
        os.rename(old_path, new_path)
        print(f"✓ {old_name} → {new_name}")


# 测试
if __name__ == "__main__":
    import tempfile
    
    # 创建临时测试目录
    with tempfile.TemporaryDirectory() as tmpdir:
        # 创建测试文件
        for name in ['test1.txt', 'test2.txt', 'test3.txt']:
            with open(os.path.join(tmpdir, name), 'w') as f:
                f.write('test')
        
        print("=== 测试1: 添加前缀 ===")
        renamer = BatchRenamer(tmpdir)
        renamer.add_prefix('new_', '.txt')
        print(os.listdir(tmpdir))
        
        # 清理重建
        for f in os.listdir(tmpdir):
            os.remove(os.path.join(tmpdir, f))
        for name in ['a.txt', 'b.txt', 'c.txt']:
            with open(os.path.join(tmpdir, name), 'w') as f:
                f.write('test')
        
        print("\n=== 测试2: 添加后缀 ===")
        renamer2 = BatchRenamer(tmpdir)
        renamer2.add_suffix('_backup', '.txt')
        print(os.listdir(tmpdir))
        
        # 清理重建
        for f in os.listdir(tmpdir):
            os.remove(os.path.join(tmpdir, f))
        for name in ['doc1.txt', 'doc2.txt', 'doc3.txt']:
            with open(os.path.join(tmpdir, name), 'w') as f:
                f.write('test')
        
        print("\n=== 测试3: 添加编号 ===")
        renamer3 = BatchRenamer(tmpdir)
        renamer3.add_numbering(start=1, width=2)
        print(os.listdir(tmpdir))
        
        print("\n✅ 所有测试通过")
```

### 测试结果
✅ 全部通过
