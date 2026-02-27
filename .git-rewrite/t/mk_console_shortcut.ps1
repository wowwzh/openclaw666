$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\OpenClaw Console.lnk")
$Shortcut.TargetPath = "D:\OpenClaw\workspace\openclaw-console\node_modules\electron\dist\electron.exe"
$Shortcut.Arguments = "D:\OpenClaw\workspace\openclaw-console\electron.js"
$Shortcut.WorkingDirectory = "D:\OpenClaw\workspace\openclaw-console"
$Shortcut.Description = "OpenClaw Console"
$Shortcut.Save()
Write-Host "OpenClaw shortcut created"
