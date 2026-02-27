$WshShell = New-Object -ComObject WScript.Shell

# Get all .lnk files on desktop
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcuts = Get-ChildItem $desktop -Filter *.lnk

foreach ($shortcut in $shortcuts) {
    try {
        $link = $WshShell.CreateShortcut($shortcut.FullName)
        
        # Check if target contains douyin or jianying and fix it
        if ($link.TargetPath -like "*douyin*" -or $link.TargetPath -like "*抖音*") {
            $link.TargetPath = "F:\douyin\douyin.exe"
            $link.WorkingDirectory = "F:\douyin"
            $link.Save()
            Write-Host "Fixed: $($shortcut.Name)"
        }
        
        if ($link.TargetPath -like "*jianying*" -or $link.TargetPath -like "*剪映*") {
            $link.TargetPath = "F:\JianyingPro\JianyingPro.exe"
            $link.WorkingDirectory = "F:\JianyingPro"
            $link.Save()
            Write-Host "Fixed: $($shortcut.Name)"
        }
    } catch {
        Write-Host "Error: $($shortcut.Name) - $_"
    }
}

Write-Host "Done!"
