$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Trae CN.lnk")
$Shortcut.TargetPath = "trae:"
$Shortcut.Description = "Trae AI"
$Shortcut.Save()
Write-Host "Trae shortcut created"
