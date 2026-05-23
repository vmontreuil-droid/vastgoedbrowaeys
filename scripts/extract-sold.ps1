# Parse "Verkocht"-cards uit de te-koop.html snapshot.
# Output: listings-sold.json met foto-URL, type, plaats, bedrooms, baths, oppervlaktes, beschrijving.

$srcPath = "C:\Users\vince\vastgoedbrowaeys\snapshot-zabun\te-koop.html"
$outPath = "C:\Users\vince\vastgoedbrowaeys\snapshot-zabun\listings-sold.json"

$html = Get-Content -Path $srcPath -Raw

# Zoek de "Verkocht"-blok (start na <h3 class="estate-list_title">Verkocht</h3>)
$startIdx = $html.IndexOf('estate-list_title">Verkocht</h3>')
if ($startIdx -lt 0) {
    Write-Output "Geen Verkocht-sectie gevonden"
    exit 1
}
$soldHtml = $html.Substring($startIdx)

# Split op card-boundary (cleaner dan greedy-regex bij geneste divs)
$rawCards = $soldHtml -split '<div class="estate-list_item col-md-6">'
$cardMatches = $rawCards | Select-Object -Skip 1 | Where-Object { $_ -match 'estate_image' }

function CleanText {
    param([string]$s)
    if (-not $s) { return "" }
    $clean = [regex]::Replace($s, '<[^>]+>', ' ')
    $clean = [System.Net.WebUtility]::HtmlDecode($clean)
    $clean = ($clean -replace '\s+', ' ').Trim()
    return $clean
}

$results = @()
$i = 0

foreach ($card in $cardMatches) {
    $cardHtml = $card

    # Foto-URL
    $imgMatch = [regex]::Match($cardHtml, 'class="estate_image"\s+src="([^"]+)"')
    $imageUrl = if ($imgMatch.Success) { $imgMatch.Groups[1].Value } else { "" }

    # Type (uit overlay-title "Verkocht: Woning" of estate_type)
    $typeMatch = [regex]::Match($cardHtml, 'estate_overlay-title">\s*Verkocht:\s*([^<]+?)\s*</h5>')
    $zabunType = if ($typeMatch.Success) { CleanText $typeMatch.Groups[1].Value } else { "" }

    # EPC label
    $epcMatch = [regex]::Match($cardHtml, '/img/energy/epc/([a-g])\.svg')
    $epcLabel = if ($epcMatch.Success) { $epcMatch.Groups[1].Value.ToUpper() } else { "" }

    # Areas worden bij Zabun inconsistent gerenderd voor verschillende types —
    # voor portfolio-strook gebruiken we alleen foto + type + plaats + beschrijving.

    # Beschrijving
    $descMatch = [regex]::Match($cardHtml, 'estate_description">\s*([\s\S]*?)\s*</div>')
    $description = if ($descMatch.Success) { CleanText $descMatch.Groups[1].Value } else { "" }

    # Plaats — non-tag tekst tussen </svg> en </span>
    $locMatch = [regex]::Match($cardHtml, 'estate_location">[\s\S]*?</svg>([^<]+)</span>')
    $location = if ($locMatch.Success) { CleanText $locMatch.Groups[1].Value } else { "" }

    if ($imageUrl -or $zabunType) {
        $results += [ordered]@{
            index       = $i
            imageUrl    = $imageUrl
            type        = $zabunType
            epcLabel    = $epcLabel
            description = $description
            city        = $location
        }
        $i++
        Write-Output ("[$i] $zabunType in $location")
    }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($outPath, ($results | ConvertTo-Json -Depth 5), $utf8NoBom)
Write-Output "---"
Write-Output ("Saved $($results.Count) verkochte panden naar listings-sold.json")
