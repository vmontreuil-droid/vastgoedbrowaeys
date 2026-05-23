$dir = "C:\Users\vince\vastgoedbrowaeys\snapshot-zabun\aanbod"
$results = @{}

foreach ($f in Get-ChildItem -Path $dir -Filter "*.html") {
    $id = $f.BaseName
    $content = Get-Content -Path $f.FullName -Raw
    $matches = [regex]::Matches($content, 'https://files\.zabun\.be/upload/\d+/images/[a-f0-9]+\.jpg')
    $urls = @($matches | ForEach-Object { $_.Value } | Select-Object -Unique)
    $results[$id] = $urls
    Write-Output ("$id : $($urls.Count) fotos")
}

$results | ConvertTo-Json -Depth 5 | Out-File "C:\Users\vince\vastgoedbrowaeys\snapshot-zabun\photo-urls.json" -Encoding utf8
Write-Output "---"
Write-Output "Saved to photo-urls.json"
