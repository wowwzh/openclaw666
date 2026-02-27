$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Trae CN.lnk")
$Shortcut.TargetPath = "E:\douyin\Trae CN\Trae CN.exe"
$Shortcut.WorkingDirectory = "E:\douyin\Trae CN"
$Shortcut.Description = "Trae AI"
$Shortcut.Save()
Write-Host "Trae shortcut created on desktop"
