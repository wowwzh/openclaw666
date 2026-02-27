# 安全清理C盘
Write-Host "=== C盘清理开始 ===" -ForegroundColor Green

# 1. 清理用户临时文件
Write-Host "`n[1/4] 清理用户临时文件..." -ForegroundColor Yellow
$tempPath = "$env:TEMP"
$tempFiles = Get-ChildItem -Path $tempPath -Recurse -ErrorAction SilentlyContinue
$tempSize = ($tempFiles | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  临时文件大小: $([math]::Round($tempSize, 2)) MB"

# 删除7天前的临时文件
$oldFiles = $tempFiles | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) }
Write-Host "  将删除 $(@($oldFiles).Count) 个旧文件..."
$oldFiles | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "  完成!" -ForegroundColor Green

# 2. 清理系统临时文件
Write-Host "`n[2/4] 清理系统临时文件..." -ForegroundColor Yellow
$sysTemp = "C:\Windows\Temp"
$sysTempFiles = Get-ChildItem -Path $sysTemp -Recurse -ErrorAction SilentlyContinue
$sysTempSize = ($sysTempFiles | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  系统临时文件大小: $([math]::Round($sysTempSize, 2)) MB"

# 删除7天前的系统临时文件
$oldSysFiles = $sysTempFiles | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) }
Write-Host "  将删除 $(@($oldSysFiles).Count) 个旧文件..."
$oldSysFiles | Remove-Item -Force -ErrorAction SilentlyContinue -Recurse
Write-Host "  完成!" -ForegroundColor Green

# 3. 清理Windows更新缓存
Write-Host "`n[3/4] 清理Windows更新缓存..." -ForegroundColor Yellow
$updateCache = "C:\Windows\SoftwareDistribution\Download"
if (Test-Path $updateCache) {
    $updateSize = (Get-ChildItem -Path $updateCache -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  更新缓存大小: $([math]::Round($updateSize, 2)) MB"
    # 需要管理员权限，这里只是检查大小
    Write-Host "  如需清理，请在管理员模式下运行: Stop-Service wuauserv; Remove-Item $updateCache -Recurse; Start-Service wuauserv"
} else {
    Write-Host "  无更新缓存"
}
Write-Host "  完成!" -ForegroundColor Green

# 4. 清空回收站
Write-Host "`n[4/4] 清空回收站..." -ForegroundColor Yellow
$shell = New-Object -ComObject Shell.Application
$recycleBin = $shell.Namespace(0xA)
$recycleBinItems = $recycleBin.Items()
$recycleSize = ($recycleBinItems | Measure-Object -Property Size -Sum).Sum / 1MB
Write-Host "  回收站大小: $([math]::Round($recycleSize, 2)) MB"
Clear-RecycleBin -Force -ErrorAction SilentlyContinue
Write-Host "  完成!" -ForegroundColor Green

Write-Host "`n=== 清理完成 ===" -ForegroundColor Green
Write-Host "注意：如需更多空间，可考虑:"
Write-Host "  1. 移动大文件到D盘"
Write-Host "  2. 禁用开机启动项"
Write-Host "  3. 卸载不用的程序"
