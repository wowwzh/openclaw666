# OpenClaw API Key 健康检测与自动切换脚本
# 检测当前 Key 是否可用，如不可用则自动切换到下一个 Key

$CONFIG_FILE = "$env:USERPROFILE\.openclaw\openclaw.json"
$BACKUP_DIR = "$env:USERPROFILE\.openclaw\backups"

# Key 列表（按优先级排序）
$KEYS = @(
    @{
        name = "Key 1"
        key = "sk-cp-DoJjRT4lfaeeRLQT07jwuIHUepp_vfZgPdS10lyFue2U42pJysVSMRkS5SqiNe3If2pqvthJdomtUBCe0pSRDFRTD4em9ZaCIN5AAiSvYX7sH7id6AV45kE"
    },
    @{
        name = "Key 2"
        key = "sk-cp-Uss0DeorbVkxH-E1gTe-U9l7quiJl9JeoXnb3EVGIFrmTvJtOx-FGnv5mEdQIwr4wvoiBt-h2AqlEc_xVvLyRnvQERtpYZ1tmbrht_TjPzmJidDArJiPtfA"
    },
    @{
        name = "Key 3"
        key = "sk-cp-S4dUJb9VzeVd3opcb0wEoLakBRg3tq7RbqSdKgckMs64xw0c43GZPHXDtRQJAENoTHpZPnIVMk1IQ0t-CtuKcve2ic5NVWzQhKqHBWK0tbinXwkFs2l2aCE"
    }
)

function Test-ApiKey {
    param([string]$apiKey)
    
    try {
        $body = @{
            model = "MiniMax-M2.1"
            messages = @(@{role = "user"; content = "hi"})
            max_tokens = 10
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "https://api.minimax.chat/v1/chat/completions" `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $apiKey"
                "Content-Type" = "application/json"
            } `
            -Body $body `
            -TimeoutSec 10 `
            -ErrorAction Stop
        
        return $true, "OK"
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "401|authentication_error|invalid api key") {
            return $false, "AUTH_ERROR"
        }
        elseif ($errorMsg -match "500|rate_limit|quota") {
            return $false, "QUOTA_ERROR"
        }
        else {
            return $false, "OTHER_ERROR"
        }
    }
}

function Get-CurrentKeyIndex {
    $config = Get-Content $CONFIG_FILE -Raw | ConvertFrom-Json
    $currentKey = $config.models.providers.minimax.apiKey
    
    for ($i = 0; $i -lt $KEYS.Count; $i++) {
        if ($KEYS[$i].key -eq $currentKey) {
            return $i
        }
    }
    return 0
}

function Set-ApiKey {
    param([int]$keyIndex)
    
    $newKey = $KEYS[$keyIndex].key
    $keyName = $KEYS[$keyIndex].name
    
    # 备份当前配置
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupFile = "$BACKUP_DIR\openclaw-before-switch-$timestamp.json"
    Copy-Item $CONFIG_FILE $backupFile -Force
    
    # 读取并修改配置
    $config = Get-Content $CONFIG_FILE -Raw | ConvertFrom-Json
    $config.models.providers.minimax.apiKey = $newKey
    
    # 保存
    $config | ConvertTo-Json -Depth 10 | Set-Content $CONFIG_FILE -Encoding UTF8
    
    Write-Host "[SWITCH] Changed to $keyName"
    return $keyName
}

# 主程序
Write-Host "=== API Key Health Check ==="
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

$currentIndex = Get-CurrentKeyIndex
$currentKeyName = $KEYS[$currentIndex].name
Write-Host "[CHECK] Current key: $currentKeyName"

$isValid, $errorType = Test-ApiKey -apiKey $KEYS[$currentIndex].key

if ($isValid) {
    Write-Host "[OK] Key is working"
    exit 0
}
else {
    Write-Host "[ERROR] Key failed: $errorType"
    
    # 尝试切换到下一个 Key
    for ($i = 1; $i -le $KEYS.Count; $i++) {
        $nextIndex = ($currentIndex + $i) % $KEYS.Count
        $nextKeyName = $KEYS[$nextIndex].name
        
        Write-Host "[TRY] Testing $nextKeyName..."
        $isValid, $errorType = Test-ApiKey -apiKey $KEYS[$nextIndex].key
        
        if ($isValid) {
            $switchedTo = Set-ApiKey -keyIndex $nextIndex
            Write-Host "[SUCCESS] Switched to $switchedTo"
            Write-Host "[INFO] Please restart OpenClaw Gateway to apply new key"
            exit 0
        }
        else {
            Write-Host "[FAIL] $nextKeyName failed: $errorType"
        }
    }
    
    Write-Host "[FATAL] All keys failed!"
    exit 1
}
