# Parse alle 13 Zabun-detail HTMLs naar gestructureerde JSON.

$dir = "C:\Users\vince\vastgoedbrowaeys\snapshot-zabun\aanbod"
$results = [ordered]@{}

function CleanText {
    param([string]$s)
    if (-not $s) { return "" }
    $clean = [regex]::Replace($s, '<[^>]+>', ' ')
    $clean = [System.Net.WebUtility]::HtmlDecode($clean)
    $clean = ($clean -replace '\s+', ' ').Trim()
    return $clean
}

foreach ($f in Get-ChildItem -Path $dir -Filter "*.html" | Sort-Object Name) {
    $id = $f.BaseName
    $html = Get-Content -Path $f.FullName -Raw

    $titleMatch = [regex]::Match($html, '<h1 class="property-header_title">\s*([\s\S]*?)\s*</h1>')
    $title = if ($titleMatch.Success) { CleanText $titleMatch.Groups[1].Value } else { "" }

    $subMatch = [regex]::Match($html, '<h2 class="property-header_subtitle">([\s\S]*?)</h2>')
    $type = ""
    $price = 0
    $priceLabel = ""
    if ($subMatch.Success) {
        $subClean = CleanText $subMatch.Groups[1].Value
        $sm = [regex]::Match($subClean, '^([A-Za-z\s]+?)\s+(?:voor|te koop|te huur)\s+\S?\s*([\d\.\,]+)')
        if ($sm.Success) {
            $type = $sm.Groups[1].Value.Trim()
            $priceNum = $sm.Groups[2].Value.Trim()
            $priceLabel = $subClean
            $price = [int]($priceNum -replace '[\.,]', '')
        }
    }

    $addrMatch = [regex]::Match($html, 'property-header_address[\s\S]*?</svg>\s*([\s\S]*?)\s*<a class="property-header_link', 'Singleline')
    $street = ""
    $zip = ""
    $city = ""
    if ($addrMatch.Success) {
        $addrText = CleanText $addrMatch.Groups[1].Value
        $am = [regex]::Match($addrText, '^(.*?),?\s*(\d{4})\s+([A-Za-z\-\s]+?)\s*$')
        if ($am.Success) {
            $street = $am.Groups[1].Value.Trim().TrimEnd(',').Trim()
            $zip = $am.Groups[2].Value.Trim()
            $city = $am.Groups[3].Value.Trim()
        }
    }

    $refMatch = [regex]::Match($html, 'Ref:\s*([A-Z0-9]+)')
    $ref = if ($refMatch.Success) { $refMatch.Groups[1].Value } else { "" }

    $descMatch = [regex]::Match($html, 'id="description"[^>]*>([\s\S]*?)</div>\s*</div>\s*</div>')
    $description = ""
    if ($descMatch.Success) {
        $description = CleanText $descMatch.Groups[1].Value
    }

    $fields = @()
    $sectionRegex = [regex]'<div class="property-details[^"]*">\s*<h2 class="property-details_title">[\s\S]*?<button[^>]*>\s*([\s\S]*?)\s*<svg[\s\S]*?<div class="property-details_content[^"]*"[^>]*>([\s\S]*?)(?=<div class="property-details |<aside|<footer)'
    $sectionMatches = $sectionRegex.Matches($html)
    foreach ($sec in $sectionMatches) {
        $secName = CleanText $sec.Groups[1].Value
        $secBody = $sec.Groups[2].Value

        $floorRegex = [regex]'<h2 class="property-details_floor-title">\s*([\s\S]*?)\s*</h2>([\s\S]*?)(?=<h2 class="property-details_floor-title"|$)'
        $floorMatches = $floorRegex.Matches($secBody)

        if ($floorMatches.Count -gt 0) {
            foreach ($fl in $floorMatches) {
                $floorName = CleanText $fl.Groups[1].Value
                $floorBody = $fl.Groups[2].Value
                $sectionLabel = "$secName - $floorName"

                $fieldRegex = [regex]'<td class="property-fields_label">\s*([\s\S]*?)\s*</td>[\s\S]*?<div class="property-fields_value">\s*([\s\S]*?)\s*</div>'
                $fieldMatches = $fieldRegex.Matches($floorBody)
                foreach ($fm in $fieldMatches) {
                    $label = CleanText $fm.Groups[1].Value
                    $value = CleanText $fm.Groups[2].Value
                    if ($label) {
                        $fields += [ordered]@{ section = $sectionLabel; label = $label; value = $value }
                    }
                }
            }
        } else {
            $fieldRegex = [regex]'<td class="property-fields_label">\s*([\s\S]*?)\s*</td>[\s\S]*?<div class="property-fields_value">\s*([\s\S]*?)\s*</div>'
            $fieldMatches = $fieldRegex.Matches($secBody)
            foreach ($fm in $fieldMatches) {
                $label = CleanText $fm.Groups[1].Value
                $value = CleanText $fm.Groups[2].Value
                if ($label) {
                    $fields += [ordered]@{ section = $secName; label = $label; value = $value }
                }
            }
        }
    }

    $results[$id] = [ordered]@{
        id          = $id
        ref         = $ref
        title       = $title
        type        = $type
        price       = $price
        priceLabel  = $priceLabel
        street      = $street
        zip         = $zip
        city        = $city
        description = $description
        fields      = $fields
    }

    Write-Output ("OK  $id : $title  [" + $priceLabel + "]  $street, $zip $city  ($($fields.Count) velden)")
}

$results | ConvertTo-Json -Depth 10 | Out-File "C:\Users\vince\vastgoedbrowaeys\snapshot-zabun\listings-data.json" -Encoding utf8
Write-Output "---"
Write-Output "Saved to listings-data.json"
