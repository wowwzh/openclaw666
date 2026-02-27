# Test LLaVA with image
$imagePath = $args[0]
if (-not $imagePath) {
    Write-Host "Usage: .\test-llava.ps1 <image-path>"
    exit 1
}

# Convert image to base64
$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($imagePath))

# Create JSON body
$body = @{
    model = "llava"
    prompt = "请详细描述这张图片中的所有内容，包括文字、界面元素等"
    images = @($base64)
    stream = $false
} | ConvertTo-Json -Depth 10

# Call Ollama API
$response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $body -ContentType "application/json"

# Output result
Write-Host "=== LLaVA 识别结果 ==="
Write-Host $response.response
