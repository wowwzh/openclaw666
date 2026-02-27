$WshShell = New-Object -ComObject WScript.Shell
$shortcut = $WshShell.CreateShortcut("C:\Users\Administrator.WIN-V62R0KO083O\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Trae CN\Trae CN.lnk")
Write-Host "TargetPath:" $shortcut.TargetPath
Write-Host "WorkingDirectory:" $shortcut.WorkingDirectory
