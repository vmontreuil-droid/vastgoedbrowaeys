# Geocode alle pand-adressen via Nominatim (OpenStreetMap).
# Resultaat schrijft naar src/data/listing-coords.json.

$dataPath = "C:\Users\vince\vastgoedbrowaeys\snapshot-zabun\listings-data.json"
$outPath = "C:\Users\vince\vastgoedbrowaeys\src\data\listing-coords.json"

$content = [System.IO.File]::ReadAllText($dataPath).TrimStart([char]0xFEFF)
$data = $content | ConvertFrom-Json

$coords = [ordered]@{}

foreach ($prop in $data.PSObject.Properties) {
    $id = $prop.Name
    $listing = $prop.Value
    $street = $listing.street
    $zip = $listing.zip
    $city = $listing.city

    $query = "$street, $zip $city, Belgium"
    $encoded = [System.Web.HttpUtility]::UrlEncode($query)
    $url = "https://nominatim.openstreetmap.org/search?q=$encoded&format=json&limit=1&countrycodes=be"

    try {
        $headers = @{ "User-Agent" = "vastgoedbrowaeys-geocoder/1.0 (info@vastgoedbrowaeys.be)" }
        $response = Invoke-RestMethod -Uri $url -Headers $headers -TimeoutSec 20
        if ($response -and $response.Count -gt 0) {
            $coords[$id] = [ordered]@{
                lat = [double]$response[0].lat
                lng = [double]$response[0].lon
                resolved = $response[0].display_name
            }
            Write-Output "OK  $id : $query  ->  ($($coords[$id].lat), $($coords[$id].lng))"
        } else {
            # Fallback op enkel gemeente
            $fallbackQuery = "$zip $city, Belgium"
            $fbEncoded = [System.Web.HttpUtility]::UrlEncode($fallbackQuery)
            $fbUrl = "https://nominatim.openstreetmap.org/search?q=$fbEncoded&format=json&limit=1&countrycodes=be"
            $fbResp = Invoke-RestMethod -Uri $fbUrl -Headers $headers -TimeoutSec 20
            if ($fbResp -and $fbResp.Count -gt 0) {
                $coords[$id] = [ordered]@{
                    lat = [double]$fbResp[0].lat
                    lng = [double]$fbResp[0].lon
                    resolved = "$($fbResp[0].display_name) (fallback op gemeente)"
                }
                Write-Output "FB  $id : $query  ->  ($($coords[$id].lat), $($coords[$id].lng))"
            } else {
                Write-Output "FAIL $id : geen geocode voor $query"
            }
        }
    } catch {
        Write-Output "ERR  $id : $($_.Exception.Message)"
    }

    # Nominatim ToS: max 1 query per seconde
    Start-Sleep -Milliseconds 1100
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($outPath, ($coords | ConvertTo-Json -Depth 5), $utf8NoBom)
Write-Output "---"
Write-Output "Saved to listing-coords.json"
