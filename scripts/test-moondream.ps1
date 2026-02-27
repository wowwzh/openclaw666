$img = "C:\Users\Administrator.WIN-V62R0KO083O\.openclaw\media\inbound\c01c5c12-6822-4dd0-b710-ab6ddc008649.jpg"
$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($img))
$body = @{
    model = "moondream"
    prompt = "请详细描述这张图片中的所有文字内�?
    images = @($base64)
} | ConvertTo-Json

$r = Invoke-RestMethod "http://localhost:11434/api/generate" -Method Post -Body $body -ContentType "application/json"
Write-Host "=== Moondream Result ==="
Write-Host $r.response
