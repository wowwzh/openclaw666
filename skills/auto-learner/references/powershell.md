# PowerShell 学习笔记

> 来源：菜鸟教程 https://www.runoob.com/powershell/powershell-tutorial.html

## 什么是 PowerShell？

- 微软开发的跨平台命令行工具和脚本语言
- 基于 .NET 框架
- **面向对象** - 处理的是 .NET 对象而非纯文本

## 核心特性

| 特性 | 说明 |
|------|------|
| 面向对象 | 命令输出的是对象 |
| 管道 (Pipeline) | 支持对象传递，链式处理 |
| 动词-名词 | 统一命名规范 (如 Get-Process) |
| 跨平台 | Windows、Linux、macOS |
| 模块化 | 功能以模块形式扩展 |

---

## 基础语法

### 变量

```powershell
# 定义变量 (以 $ 开头)
$name = "Tom"
$age = 25

# 字符串
$greeting = "Hello"

# 数组
$arr = 1, 2, 3, 4, 5

# 哈希表
$hashtable = @{Name="Tom"; Age=30}

# 输出
Write-Output $name
```

### 特殊变量

| 变量 | 说明 |
|------|------|
| $_ | 管道中当前处理的对象 |
| $? | 上一个命令是否成功 |
| $LASTEXITCODE | 上一个外部程序的退出码 |
| $PSVersionTable | PowerShell 版本信息 |
| $env:PATH | 环境变量 PATH |

### 作用域

```powershell
$global:name = "Tom"  # 全局作用域
$script:dbName = "MyDatabase"  # 脚本作用域
$env:MY_VAR = "value"  # 环境变量
```

---

## 常用命令

### 文件操作

```powershell
Get-ChildItem        # 查看当前目录 (类似 ls)
Get-ChildItem -Path C:\  # 查看指定目录
Set-Location C:\       # 切换目录 (类似 cd)
New-Item -Path test.txt -ItemType File  # 创建文件
Remove-Item test.txt  # 删除文件
```

### 进程管理

```powershell
Get-Process          # 获取所有进程
Get-Process -Name notepad  # 获取特定进程
Stop-Process -Name notepad -Force  # 强制停止进程
```

### 网络

```powershell
Test-Connection google.com  # Ping 测试
Invoke-WebRequest -Uri https://example.com  # 发起请求 (类似 curl)
```

### 系统信息

```powershell
Get-Date              # 获取当前时间
Get-Service           # 获取服务列表
Get-EventLog -LogName System -Newest 10  # 查看系统日志
```

---

## 条件与循环

### If 语句

```powershell
if ($age -gt 18) {
    Write-Output "成年人"
} elseif ($age -ge 6) {
    Write-Output "未成年人"
} else {
    Write-Output "儿童"
}
```

### 循环

```powershell
# ForEach
foreach ($item in $arr) {
    Write-Output $item
}

# For
for ($i = 0; $i -lt 10; $i++) {
    Write-Output $i
}

# While
while ($true) {
    # 循环体
}
```

---

## 函数

```powershell
function Say-Hello {
    param (
        [string]$Name = "World"
    )
    Write-Output "Hello, $Name!"
}

# 调用
Say-Hello -Name "Tom"
```

---

## 管道 (Pipeline)

```powershell
# 链式处理
Get-Process | Where-Object {$_.CPU -gt 10} | Sort-Object CPU -Descending

# Select-Object 选择属性
Get-Process | Select-Object Name, CPU, WorkingSet

# Where-Object 过滤
Get-Service | Where-Object {$_.Status -eq "Running"}

# ForEach-Object 遍历
1..5 | ForEach-Object {$_ * 2}
```

---

## 比较运算符

| PowerShell | 含义 |
|------------|------|
| -eq | 等于 |
| -ne | 不等于 |
| -gt | 大于 |
| -ge | 大于等于 |
| -lt | 小于 |
| -le | 小于等于 |
| -like | 模糊匹配 |
| -match | 正则匹配 |

---

## 常用 cmdlets

```powershell
# 帮助
Get-Help Get-Process
Get-Help -Name Get-Process -Examples

# 别名
Get-Alias  # 查看所有别名
Set-Alias -Name ll -Value Get-ChildItem  # 创建别名
```

---

## 练习任务

1. 定义变量并输出
2. 创建函数使用局部/全局变量
3. 使用管道过滤数据
4. 编写脚本自动执行任务
