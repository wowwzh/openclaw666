$imgPath = "C:\Users\Administrator.WIN-V62R0KO083O\.openclaw\media\inbound\3d522fb2-dd53-42f7-a06f-6e88f8d224d4.jpg"
$base64Img = [Convert]::ToBase64String((Get-Content -Path $imgPath -Encoding Byte))

$body = @{
    model = "moondream"
    prompt = "Describe this image in detail"
    images = @($base64Img)
    stream = $false
} | ConvertTo-Json -Depth 3

$response = Invoke-WebRequest -Uri "http://localhost:11434/api/generate" -Method POST -Body $body -ContentType "application/json"
$json = $response.Content | ConvertFrom-Json
Write-Host $json.response
