$imgPath = "C:\Users\Administrator.WIN-V62R0KO083O\.openclaw\media\inbound\59e63ae0-64c2-47dc-b718-789d19c92f3a.jpg"

if (-not (Test-Path $imgPath)) {
    Write-Host "ERROR: File not found: $imgPath"
    exit 1
}

Write-Host "File exists, size: $((Get-Item $imgPath).Length)"

$base64Img = [Convert]::ToBase64String((Get-Content -Path $imgPath -Encoding Byte))
Write-Host "Base64 length: $($base64Img.Length)"

$body = @{
    model = "moondream"
    prompt = "Describe this image"
    images = @($base64Img)
    stream = $false
} | ConvertTo-Json -Depth 3

Write-Host "Sending request..."

$response = Invoke-WebRequest -Uri "http://localhost:11434/api/generate" -Method POST -Body $body -ContentType "application/json"
$json = $response.Content | ConvertFrom-Json

Write-Host "TEST2 OK"
Write-Host $json.response
