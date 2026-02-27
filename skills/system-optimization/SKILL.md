# Windows 系统优化技能 (全面版)

## 1. 磁盘清理

### 系统自带工具
```powershell
# 磁盘清理
cleanmgr /d C

# 清理系统文件
Dism.exe /Online /Cleanup-Image /ScanHealth
Dism.exe /Online /Cleanup-Image /RestoreHealth

# 清理WinSxs（需要管理员）
Dism.exe /Online /Cleanup-Image /StartComponentCleanup
```

### 第三方大文件清理
```powershell
# 查找大文件（>100MB）
Get-ChildItem C:\ -Recurse -File -ErrorAction SilentlyContinue | 
    Where-Object { $_.Length -gt 100MB } | 
    Sort-Object Length -Descending | Select-Object -First 20 FullName, @{N='SizeMB';E={[math]::Round($_.Length/1MB,2)}}
```

### 清理位置
| 路径 | 说明 | 潜在清理大小 |
|------|------|--------------|
| C:\Windows\SoftwareDistribution\Download | Windows更新缓存 | 1-10GB |
| C:\Windows\Temp | 临时文件 | 100MB-1GB |
| %TEMP% | 用户临时文件 | 100MB-2GB |
| $Recycle.Bin | 回收站 | 视删除文件 |
| C:\Windows\Prefetch | 预读取文件 | 可清空 |

## 2. 内存优化

### 关闭不必要的后台服务
```powershell
# 查看服务状态
Get-Service | Where-Object {$_.Status -eq 'Running'}

# 关闭不需要的服务（谨慎）
Stop-Service -Name "WSearch" -Force  # Windows Search
Stop-Service -Name "SysMain" -Force  # Superfetch
Stop-Service -Name "DiagTrack" -Force # 诊断跟踪
```

### 内存诊断
```powershell
# 查看内存使用
Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -Top 15 Name, @{N='内存MB';E={[math]::Round($_.WorkingSet64/1MB,2)}}

# 查看内存详细信息
Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory
```

### 页面文件优化
```powershell
# 调整虚拟内存（建议设为内存的1.5倍）
# 控制面板 -> 系统 -> 高级 -> 性能设置 -> 高级 -> 虚拟内存
```

## 3. 开机启动优化

### 查看启动项
```powershell
# 查看所有启动项
Get-CimInstance Win32_StartupCommand

# 查看计划任务中的启动项
Get-ScheduledTask | Where-Object {$_.State -eq 'Ready'}
```

### 禁用启动项
```powershell
# 禁用指定启动项
Disable-CimInstance Win32_StartupCommand -Filter "Name='某软件'"

# 或使用系统配置
msconfig
```

### 建议保留/禁用的启动项
| 软件 | 建议 | 原因 |
|------|------|------|
| 杀毒软件 | 保留 | 安全必需 |
| 向日葵 | 保留 | 远程必需 |
| Steam++ | 保留 | 加速必需 |
| OneDrive | 可禁用 | 不常用 |
| 360 | 禁用 | 资源占用大 |
| QQ/微信 | 可禁用 | 手动启动 |

## 4. 网络优化

### 清理DNS缓存
```powershell
ipconfig /flushdns
```

### 重置网络
```powershell
netsh winsock reset
netsh int ip reset
ipconfig /release
ipconfig /renew
ipconfig /flushdns
```

### 网络测速
```powershell
Test-NetConnection baidu.com
```

## 5. 显卡/性能优化

### 显卡设置
```powershell
# 打开NVIDIA控制面板
nvidia-settings

# 打开AMD设置
amd-settings

# 打开Intel设置
control /name IntelGraphicsSettings
```

### 电源选项
```powershell
# 查看电源计划
powercfg /list

# 设置高性能
powercfg /setactive SCHEME_MIN

# 调整处理器电源管理
powercfg /change standby-timeout-ac 0
```

## 6. 注册表清理（谨慎）

### 清理右键菜单
```powershell
# 查看右键菜单项
Get-ItemProperty "HKCU:\Software\Classes\*\shell"

# 删除无用右键菜单（谨慎）
Remove-Item "HKCU:\Software\Classes\某项" -Recurse
```

### 清理自动启动项
```powershell
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
```

## 7. 浏览器优化

### Chrome
```powershell
# 清理缓存
Remove-Item "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache\*" -Recurse -Force

# 清理Cookie（可选）
# 清理扩展缓存
```

### Edge
```powershell
Remove-Item "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache\*" -Recurse -Force
```

## 8. 性能监视

### 实时监控
```powershell
# 打开资源监视器
resmon

# 打开性能监视器
perfmon

# 打开任务管理器
taskmgr
```

### 性能报告
```powershell
# 生成可靠性报告
Get-CimInstance Win32_ReliabilityRecords | Select-Object SourceName, Message, TimeGenerated

# 查看系统稳定性
Get-CimInstance Win32_SystemReliability
```

## 9. 一键优化脚本

```powershell
# Windows 一键优化脚本（谨慎使用）

# 1. 清理临时文件
Remove-Item $env:TEMP\* -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item C:\Windows\Temp\* -Recurse -Force -ErrorAction SilentlyContinue

# 2. 关闭不必要的服务（根据需要取消注释）
# Stop-Service WSearch -Force -ErrorAction SilentlyContinue
# Stop-Service SysMain -Force -ErrorAction SilentlyContinue
# Set-Service WSearch -StartupType Disabled -ErrorAction SilentlyContinue

# 3. 清理回收站
Clear-RecycleBin -Force -ErrorAction SilentlyContinue

# 4. 清理Windows更新缓存
# Dism.exe /Online /Cleanup-Image /StartComponentCleanup /ResetBase -ErrorAction SilentlyContinue

# 5. 清理Prefetch
Remove-Item C:\Windows\Prefetch\* -Recurse -Force -ErrorAction SilentlyContinue

# 6. 刷新内存
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()

Write-Host "优化完成！"
```

## 10. 高级优化

### 关闭视觉特效
```powershell
# 系统属性 -> 高级 -> 性能 -> 设置 -> 调整为最佳性能
SystemPropertiesPerformance
```

### 关闭自动维护
```powershell
# 打开任务计划程序
taskschd.msc

# 禁用以下任务：
# - \Microsoft\Windows\TaskScheduler\Maintenance Configurator
# - \Microsoft\Windows\碎片整理\ScheduledDefrag
```

### 关闭休眠
```powershell
# 关闭休眠（节省C盘空间=内存大小）
powercfg /hibernate off
```

## 注意事项

⚠️ **警告**：
- 修改注册表前先备份
- 不确定的服务不要乱停
- 某些优化可能需要重启生效
- 重要数据先备份
