# Download alle foto's uit photo-urls.json naar /public/listings/{id}/{i}.jpg
# Hash-filenames worden vervangen door simpele nummering (0 = hoofdfoto).

$jsonPath = "C:\Users\vince\vastgoedbrowaeys\snapshot-zabun\photo-urls.json"
$publicDir = "C:\Users\vince\vastgoedbrowaeys\public\listings"

$photos = Get-Content $jsonPath -Raw | ConvertFrom-Json
$total = 0
$ok = 0
$failed = 0

foreach ($prop in $photos.PSObject.Properties) {
    $id = $prop.Name
    $urls = $prop.Value
    $idDir = Join-Path $publicDir $id
    New-Item -ItemType Directory -Path $idDir -Force | Out-Null

    $i = 0
    foreach ($url in $urls) {
        $total++
        $outFile = Join-Path $idDir "$i.jpg"
        try {
            Invoke-WebRequest -Uri $url -OutFile $outFile -UseBasicParsing -TimeoutSec 30
            $ok++
        } catch {
            Write-Output "FAIL $id/$i.jpg : $($_.Exception.Message)"
            $failed++
        }
        $i++
    }
    Write-Output "OK  $id ($i fotos)"
}

Write-Output "---"
Write-Output "Totaal: $total · gelukt: $ok · gefaald: $failed"
