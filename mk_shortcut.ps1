$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\test.lnk")
$Shortcut.TargetPath = "F:\douyin\douyin.exe"
$Shortcut.WorkingDirectory = "F:\douyin"
$Shortcut.Save()
Write-Host "Test shortcut created"
