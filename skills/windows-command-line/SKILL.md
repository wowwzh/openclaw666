# Windows 终端命令行指南

## PowerShell vs CMD vs Bash

| 特性 | PowerShell | CMD | Bash |
|------|------------|-----|------|
| 变量 | `$var = "value"` | `set var=value` | `var="value"` |
| 输出 | `Write-Host` | `echo` | `echo` |
| 管道 | `|` | `|` | `|` |
| 对象 | 支持 | 不支持 | 不支持 |
| 跨平台 | Win/Linux/Mac | 仅 Windows | Win/Linux/Mac |

## PowerShell 常用命令

### 文件操作
```powershell
# 列出文件
Get-ChildItem

# 复制
Copy-Item src dest

# 删除
Remove-Item path -Force

# 创建目录
New-Item -ItemType Directory -Path folder
```

### 进程管理
```powershell
# 查看进程
Get-Process

# 杀死进程
Stop-Process -Id 1234 -Force

# 查找进程
Get-Process | Where-Object { $_.Name -match "node" }
```

### 网络
```powershell
# 测试连接
Test-NetConnection google.com

# 下载文件
Invoke-WebRequest -Url "https://..." -OutFile "file"

# HTTP 请求
Invoke-RestMethod -Uri "api-url"
```

### 字符串处理
```powershell
# 替换
"hello world" -replace "world", "PowerShell"

# 分割
"a,b,c" -split ","

# 格式化
"{0:N2}" -f 3.14159
```

## CMD 常用命令

### 文件操作
```cmd
dir                    # 列出文件
cd path                # 切换目录
copy src dest          # 复制
del file               # 删除
mkdir folder           # 创建目录
```

### 进程管理
```cmd
tasklist               # 列出进程
taskkill /F /PID 123  # 杀死进程
```

### 批处理脚本 (.bat)
```bat
@echo off
set NAME=World
echo Hello %NAME%!

if exist file.txt (
    echo File exists
) else (
    echo File not found
)

for %%i in (*.txt) do (
    echo Processing %%i
)
```

## Node.js 子进程

### spawn vs exec vs execFile

```javascript
const { spawn, exec, execFile } = require('child_process');

// spawn - 流式处理，适合大输出
const child = spawn('node', ['script.js'], { stdio: 'inherit' });

// exec - 一次性执行，适合小命令
exec('node script.js', (err, stdout, stderr) => {
  console.log(stdout);
});

// execFile - 直接执行文件
execFile('node', ['script.js']);
```

### Windows 隐藏窗口

```javascript
// 方法1: PowerShell Start-Process
spawn('powershell', [
  '-Command',
  'Start-Process -FilePath "node" -ArgumentList "app.js" -WindowStyle Hidden'
], { detached: true, stdio: 'ignore' });

// 方法2: cmd /c start /b
spawn('cmd', ['/c', 'start', '/b', 'node', 'app.js'], {
  detached: true,
  stdio: 'ignore',
  windowsHide: true
});

// 方法3: 使用 WSH (VBScript)
spawn('wscript', ['hide.vbs', 'app.js'], {
  detached: true,
  stdio: 'ignore'
});
```

## 跨平台脚本

### package.json scripts
```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest"
  }
}
```

### 使用 rimraf 跨平台删除
```javascript
const rimraf = require('rimraf');
rimraf.sync('./dist');
```

## Windows 特有

### 环境变量
```powershell
# 查看
$env:PATH

# 设置
$env:MY_VAR = "value"

# 永久
[System.Environment]::SetEnvironmentVariable("MY_VAR", "value", "User")
```

### 注册表
```powershell
# 读取
Get-ItemProperty HKCU:\Software\MyApp

# 写入
Set-ItemProperty HKCU:\Software\MyApp -Name "Version" -Value "1.0"
```

### Windows 服务
```powershell
# 创建服务
New-Service -Name "MyService" -BinaryPathName "C:\my.exe"

# 启动/停止
Start-Service MyService
Stop-Service MyService
```

## 常用快捷命令

```powershell
# 快速导航
cd ~              # 用户目录
cd -              # 上一个目录
cd ..             # 上一级

# 历史
Get-History
!!

# 别名
New-Alias -Name "ll" -Value Get-ChildItem
```

## 参考

- PowerShell 文档: https://docs.microsoft.com/powershell/
- Node.js child_process: https://nodejs.org/api/child_process.html
