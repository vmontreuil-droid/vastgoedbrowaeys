$jsonPath = "C:\Users\vince\vastgoedbrowaeys\snapshot-zabun\listings-sold.json"
$publicDir = "C:\Users\vince\vastgoedbrowaeys\public\sold"

$content = [System.IO.File]::ReadAllText($jsonPath).TrimStart([char]0xFEFF)
$data = $content | ConvertFrom-Json

New-Item -ItemType Directory -Path $publicDir -Force | Out-Null

$ok = 0
$fail = 0

foreach ($item in $data) {
    if (-not $item.imageUrl) { continue }
    $outFile = Join-Path $publicDir "$($item.index).jpg"
    try {
        Invoke-WebRequest -Uri $item.imageUrl -OutFile $outFile -UseBasicParsing -TimeoutSec 30
        $ok++
    } catch {
        Write-Output "FAIL [$($item.index)] : $($_.Exception.Message)"
        $fail++
    }
}

Write-Output "---"
Write-Output "Gelukt: $ok · gefaald: $fail"
