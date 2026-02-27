# Find large files
$folders = @(
    "C:\Users\Administrator\Downloads",
    "C:\Users\Administrator\Documents", 
    "C:\Users\Administrator\Videos",
    "C:\Users\Administrator\Desktop"
)

Write-Host "=== Scanning large files ===" -ForegroundColor Cyan

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "`n$folder" -ForegroundColor Yellow
        Get-ChildItem $folder -Recurse -File -ErrorAction SilentlyContinue |
            Sort-Object Length -Descending |
            Select-Object -First 10 FullName, Length |
            ForEach-Object {
                $sizeMB = [math]::Round($_.Length/1MB, 2)
                Write-Host "  $sizeMB MB - $($_.FullName)"
            }
    }
}
