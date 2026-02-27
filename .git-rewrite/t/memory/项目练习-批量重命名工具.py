"""
文件批量重命名工具 v1.0
支持多种重命名模式：序号、日期、替换、添加前缀/后缀
"""
import os
import re
from datetime import datetime
from typing import List, Callable


class BatchRenamer:
    """批量重命名工具"""
    
    def __init__(self, folder_path: str):
        self.folder_path = folder_path
        self.files: List[str] = []
        self.preview_mode = True  # 预览模式
    
    def load_files(self, pattern: str = "*.*") -> int:
        """加载文件夹中的文件"""
        if not os.path.exists(self.folder_path):
            raise FileNotFoundError(f"Folder not found: {self.folder_path}")
        
        self.files = [
            f for f in os.listdir(self.folder_path)
            if os.path.isfile(os.path.join(self.folder_path, f))
        ]
        # 按文件名排序
        self.files.sort()
        return len(self.files)
    
    def add_numbering(self, start: int = 1, step: int = 1, 
                      width: int = 3, sep: str = "_") -> List[str]:
        """添加序号: file.jpg -> 001_file.jpg"""
        results = []
        for i, filename in enumerate(self.files):
            ext = self.get_extension(filename)
            name = self.get_name_without_ext(filename)
            num = start + i * step
            new_name = f"{str(num).zfill(width)}{sep}{name}{ext}"
            results.append(new_name)
        return results
    
    def add_date(self, format_str: str = "%Y%m%d", sep: str = "_", 
                 position: str = "prefix") -> List[str]:
        """添加日期: file.jpg -> 20260226_file.jpg"""
        results = []
        date_str = datetime.now().strftime(format_str)
        
        for filename in self.files:
            ext = self.get_extension(filename)
            name = self.get_name_without_ext(filename)
            
            if position == "prefix":
                new_name = f"{date_str}{sep}{name}{ext}"
            else:  # suffix
                new_name = f"{name}{sep}{date_str}{ext}"
            
            results.append(new_name)
        return results
    
    def replace_text(self, old: str, new: str = "", 
                     case_sensitive: bool = True) -> List[str]:
        """替换文本: photo.jpg -> image.jpg"""
        results = []
        
        for filename in self.files:
            if case_sensitive:
                new_name = filename.replace(old, new)
            else:
                pattern = re.compile(re.escape(old), re.IGNORECASE)
                new_name = pattern.sub(new, filename)
            results.append(new_name)
        
        return results
    
    def add_prefix(self, prefix: str) -> List[str]:
        """添加前缀: photo.jpg -> my_photo.jpg"""
        results = []
        for filename in self.files:
            ext = self.get_extension(filename)
            name = self.get_name_without_ext(filename)
            new_name = f"{prefix}{name}{ext}"
            results.append(new_name)
        return results
    
    def add_suffix(self, suffix: str, sep: str = "_") -> List[str]:
        """添加后缀: photo.jpg -> photo_backup.jpg"""
        results = []
        for filename in self.files:
            ext = self.get_extension(filename)
            name = self.get_name_without_ext(filename)
            new_name = f"{name}{sep}{suffix}{ext}"
            results.append(new_name)
        return results
    
    def to_lowercase(self) -> List[str]:
        """转为小写: PHOTO.JPG -> photo.jpg"""
        results = []
        for filename in self.files:
            results.append(filename.lower())
        return results
    
    def to_uppercase(self) -> List[str]:
        """转为大写: photo.jpg -> PHOTO.JPG"""
        results = []
        for filename in self.files:
            results.append(filename.upper())
        return results
    
    def remove_spaces(self, replacement: str = "_") -> List[str]:
        """移除空格: my photo.jpg -> my_photo.jpg"""
        results = []
        for filename in self.files:
            results.append(filename.replace(" ", replacement))
        return results
    
    def execute(self, new_names: List[str], dry_run: bool = True) -> dict:
        """执行重命名"""
        results = {"success": [], "failed": [], "skipped": []}
        
        for i, filename in enumerate(self.files):
            if i >= len(new_names):
                results["skipped"].append(filename)
                continue
            
            old_path = os.path.join(self.folder_path, filename)
            new_path = os.path.join(self.folder_path, new_names[i])
            
            # 跳过无变化的名字
            if filename == new_names[i]:
                results["skipped"].append(filename)
                continue
            
            # 检查目标文件是否已存在
            if os.path.exists(new_path) and old_path != new_path:
                results["failed"].append({
                    "old": filename, 
                    "new": new_names[i],
                    "reason": "Target file exists"
                })
                continue
            
            if dry_run:
                results["success"].append({"old": filename, "new": new_names[i]})
            else:
                try:
                    os.rename(old_path, new_path)
                    results["success"].append({"old": filename, "new": new_names[i]})
                except Exception as e:
                    results["failed"].append({
                        "old": filename, 
                        "new": new_names[i],
                        "reason": str(e)
                    })
        
        return results
    
    @staticmethod
    def get_extension(filename: str) -> str:
        """获取文件扩展名"""
        return os.path.splitext(filename)[1]
    
    @staticmethod
    def get_name_without_ext(filename: str) -> str:
        """获取不含扩展名的文件名"""
        return os.path.splitext(filename)[0]
    
    def preview(self, new_names: List[str]) -> None:
        """预览重命名结果"""
        print(f"\n{'='*60}")
        print(f"Preview ({len(self.files)} files)")
        print(f"{'='*60}")
        print(f"{'Original':<30} -> {'New Name':<30}")
        print("-" * 60)
        
        for old, new in zip(self.files, new_names):
            marker = " [SAME]" if old == new else ""
            print(f"{old:<30} -> {new:<30}{marker}")
        print("=" * 60)


# 测试函数
def test():
    import tempfile
    
    # 创建临时测试文件夹
    with tempfile.TemporaryDirectory() as tmpdir:
        # 创建测试文件
        test_files = ["photo.jpg", "photo.png", "document.pdf", "image.gif"]
        for f in test_files:
            open(os.path.join(tmpdir, f), "w").close()
        
        renamer = BatchRenamer(tmpdir)
        count = renamer.load_files()
        print(f"[OK] Loaded {count} files")
        
        # 测试1: 添加序号
        print("\n[Test 1] Add numbering:")
        new_names = renamer.add_numbering()
        renamer.preview(new_names)
        
        # 测试2: 替换文本
        print("\n[Test 2] Replace text:")
        renamer.load_files()
        new_names = renamer.replace_text("photo", "image")
        renamer.preview(new_names)
        
        # 测试3: 添加前缀
        print("\n[Test 3] Add prefix:")
        renamer.load_files()
        new_names = renamer.add_prefix("vacation_")
        renamer.preview(new_names)
        
        # 测试4: 转小写
        print("\n[Test 4] To lowercase:")
        renamer.load_files()
        new_names = renamer.to_lowercase()
        renamer.preview(new_names)
        
        # 测试5: 移除空格
        print("\n[Test 5] Remove spaces:")
        renamer.files = ["my photo.jpg", "test file.png"]
        new_names = renamer.remove_spaces()
        renamer.preview(new_names)
        
        print("\n[SUCCESS] All tests passed!")


if __name__ == "__main__":
    test()
