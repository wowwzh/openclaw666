# Gateway 健康检查脚本
$ErrorActionPreference = "Continue"
Write-Host "=== Gateway Health Check ===" -ForegroundColor Cyan
Write-Host ""

# Check Gateway config
Write-Host "[1] Checking Gateway config..." -ForegroundColor Yellow
$configPath = "$env:USERPROFILE\.openclaw\openclaw.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    $lastTouched = $config.meta.lastTouchedAt
    Write-Host "  OK - Last modified: $lastTouched" -ForegroundColor Green
} else {
    Write-Host "  FAIL - Config not found" -ForegroundColor Red
}

# Check backups
Write-Host ""
Write-Host "[2] Checking backups..." -ForegroundColor Yellow
$backupDir = "$env:USERPROFILE\.openclaw\backups"
if (Test-Path $backupDir) {
    $backups = Get-ChildItem $backupDir -Filter "*.zip" -ErrorAction SilentlyContinue
    if ($backups) {
        $latest = $backups | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        Write-Host "  OK - Found $($backups.Count) backups, latest: $($latest.Name)" -ForegroundColor Green
    } else {
        Write-Host "  WARN - No .zip backup files found" -ForegroundColor Yellow
    }
} else {
    Write-Host "  WARN - Backup dir does not exist" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
