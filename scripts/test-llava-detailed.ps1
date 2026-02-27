# Test LLaVA with detailed prompt
$imagePath = $args[0]
$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($imagePath))

$body = @{
    model = "llava"
    prompt = "这是一张手机屏幕截图。请详细描述：1. 通知弹窗的内容 2. 屏幕上所有文字 3. 界面元素和app图标"
    images = @($base64)
    stream = $false
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $body -ContentType "application/json"

Write-Host "=== Result ==="
Write-Host $response.response
