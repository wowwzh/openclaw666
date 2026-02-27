$imgPath = "C:\Users\Administrator.WIN-V62R0KO083O\.openclaw\media\inbound\710815dc-6744-455d-9da4-24a67555c03d.jpg"

$base64Img = [Convert]::ToBase64String((Get-Content -Path $imgPath -Encoding Byte))

$body = @{
    model = "moondream"
    prompt = "请详细描述这张图片的内容，用中文"
    images = @($base64Img)
    stream = $false
} | ConvertTo-Json -Depth 3

$response = Invoke-WebRequest -Uri "http://localhost:11434/api/generate" -Method POST -Body $body -ContentType "application/json"
$json = $response.Content | ConvertFrom-Json
Write-Host $json.response
