$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$epoch = (Get-Date -Year 1970 -Month 1 -Day 1 -Hour 0 -Minute 0 -Second 0 -Millisecond 0)
$seconds = [int64]((Get-Date).ToUniversalTime() - $epoch).TotalSeconds
$msgId = "msg_" + $seconds + "_" + [guid]::NewGuid().ToString("n").Substring(0,8)
$nodeId = "node_" + [guid]::NewGuid().ToString("n").Substring(0,16)

$body = @{
    protocol = "gep-a2a"
    protocol_version = "1.0.0"
    message_type = "hello"
    message_id = $msgId
    sender_id = $nodeId
    timestamp = $timestamp
    payload = @{
        capabilities = @{}
        gene_count = 0
        capsule_count = 0
        env_fingerprint = @{
            platform = "windows"
            arch = "x64"
        }
    }
} | ConvertTo-Json -Compress

Invoke-RestMethod -Uri "https://evomap.ai/a2a/hello" -Method Post -Body $body -ContentType "application/json"
