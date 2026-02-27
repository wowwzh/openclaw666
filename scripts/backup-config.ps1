# OpenClaw Config Backup Script
$ErrorActionPreference = "Continue"
$backupDir = "$env:USERPROFILE\.openclaw\backups"
$configFile = "$env:USERPROFILE\.openclaw\openclaw.json"

# Create backup dir if not exists
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# Create backup filename with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupFile = "$backupDir\openclaw_backup_$timestamp.zip"

# Files to backup
$filesToBackup = @(
    "$env:USERPROFILE\.openclaw\openclaw.json",
    "$env:USERPROFILE\.openclaw\workspace\MEMORY.md"
)

# Add workspace files if exist
$workspaceDir = "$env:USERPROFILE\.openclaw\workspace"
if (Test-Path $workspaceDir) {
    $workspaceFiles = Get-ChildItem $workspaceDir -Filter "*.md" -ErrorAction SilentlyContinue
    foreach ($file in $workspaceFiles) {
        $filesToBackup += $file.FullName
    }
}

# Create temporary staging dir
$stagingDir = "$backupDir\staging_$timestamp"
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null

# Copy files to staging
foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $stagingDir -Force
    }
}

# Create zip
if (Test-Path $stagingDir) {
    Compress-Archive -Path "$stagingDir\*" -DestinationPath $backupFile -Force
    Remove-Item $stagingDir -Recurse -Force
    Write-Host "Backup created: $backupFile"
} else {
    Write-Host "ERROR: Failed to create backup"
}

# Clean old backups (keep last 7)
$oldBackups = Get-ChildItem $backupDir -Filter "openclaw_backup_*.zip" | Sort-Object LastWriteTime -Descending
if ($oldBackups.Count -gt 7) {
    $toDelete = $oldBackups | Select-Object -Skip 7
    foreach ($file in $toDelete) {
        Remove-Item $file.FullName -Force
        Write-Host "Deleted old backup: $($file.Name)"
    }
}

Write-Host "Backup complete!"
