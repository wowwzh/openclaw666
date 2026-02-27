$imgPath = "C:\Users\Administrator.WIN-V62R0KO083O\.openclaw\media\inbound\3c496e88-c0d0-4ff1-8841-e1b268d978f0.jpg"
$base64Img = [Convert]::ToBase64String((Get-Content -Path $imgPath -Encoding Byte))

$body = @{
    model = "moondream"
    prompt = "Describe this image"
    images = @($base64Img)
    stream = $false
} | ConvertTo-Json -Depth 3

$response = Invoke-WebRequest -Uri "http://localhost:11434/api/generate" -Method POST -Body $body -ContentType "application/json"
$json = $response.Content | ConvertFrom-Json
Write-Host "TEST1 OK"
Write-Host $json.response
