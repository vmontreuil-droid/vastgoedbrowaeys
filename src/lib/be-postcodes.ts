/**
 * Belgische postcode + gemeente-lookup met coordinaten.
 * Gefocust op Vlaanderen (waar Stefanie werkt) — voldoende voor radius-search.
 * Voor postcodes buiten deze dataset kan men nog altijd manueel typen
 * in de chip-input.
 */

export type BePostcode = {
  postcode: string
  city: string
  lat: number
  lng: number
}

// Vlaamse Ardennen — Stefanie's kerngebied
const VLAAMSE_ARDENNEN: BePostcode[] = [
  { postcode: '9667', city: 'Horebeke',            lat: 50.834, lng: 3.706 },
  { postcode: '9700', city: 'Oudenaarde',          lat: 50.847, lng: 3.601 },
  { postcode: '9620', city: 'Zottegem',            lat: 50.870, lng: 3.812 },
  { postcode: '9660', city: 'Brakel',              lat: 50.789, lng: 3.766 },
  { postcode: '9680', city: 'Maarkedal',           lat: 50.781, lng: 3.665 },
  { postcode: '9690', city: 'Kluisbergen',         lat: 50.811, lng: 3.554 },
  { postcode: '9600', city: 'Ronse',               lat: 50.745, lng: 3.601 },
  { postcode: '9500', city: 'Geraardsbergen',      lat: 50.770, lng: 3.880 },
  { postcode: '9550', city: 'Herzele',             lat: 50.886, lng: 3.881 },
  { postcode: '9520', city: 'Sint-Lievens-Houtem', lat: 50.926, lng: 3.875 },
  { postcode: '9750', city: 'Zingem',              lat: 50.911, lng: 3.654 },
  { postcode: '9770', city: 'Kruisem',             lat: 50.906, lng: 3.529 },
  { postcode: '9790', city: 'Wortegem-Petegem',    lat: 50.846, lng: 3.502 },
  { postcode: '9870', city: 'Zulte',               lat: 50.928, lng: 3.452 },
  { postcode: '9810', city: 'Nazareth',            lat: 50.971, lng: 3.604 },
  { postcode: '9820', city: 'Merelbeke',           lat: 50.997, lng: 3.748 },
  { postcode: '9890', city: 'Gavere',              lat: 50.929, lng: 3.665 },
  { postcode: '9860', city: 'Oosterzele',          lat: 50.949, lng: 3.792 },
  { postcode: '9881', city: 'Aalter',              lat: 51.083, lng: 3.450 },
]

// Grotere steden + omgeving Oost-Vlaanderen
const OOST_VLAANDEREN: BePostcode[] = [
  { postcode: '9000', city: 'Gent',                lat: 51.054, lng: 3.717 },
  { postcode: '9050', city: 'Gentbrugge/Ledeberg', lat: 51.029, lng: 3.749 },
  { postcode: '9051', city: 'Sint-Denijs-Westrem', lat: 51.020, lng: 3.681 },
  { postcode: '9070', city: 'Destelbergen',        lat: 51.057, lng: 3.795 },
  { postcode: '9080', city: 'Lochristi',           lat: 51.103, lng: 3.844 },
  { postcode: '9090', city: 'Melle',               lat: 51.001, lng: 3.798 },
  { postcode: '9100', city: 'Sint-Niklaas',        lat: 51.165, lng: 4.142 },
  { postcode: '9150', city: 'Kruibeke',            lat: 51.171, lng: 4.318 },
  { postcode: '9160', city: 'Lokeren',             lat: 51.103, lng: 3.989 },
  { postcode: '9170', city: 'Sint-Gillis-Waas',    lat: 51.211, lng: 4.130 },
  { postcode: '9200', city: 'Dendermonde',         lat: 51.029, lng: 4.103 },
  { postcode: '9220', city: 'Hamme',               lat: 51.094, lng: 4.137 },
  { postcode: '9240', city: 'Zele',                lat: 51.066, lng: 4.041 },
  { postcode: '9250', city: 'Waasmunster',         lat: 51.109, lng: 4.069 },
  { postcode: '9260', city: 'Wichelen',            lat: 50.997, lng: 4.005 },
  { postcode: '9270', city: 'Laarne',              lat: 51.034, lng: 3.866 },
  { postcode: '9280', city: 'Lebbeke',             lat: 51.000, lng: 4.130 },
  { postcode: '9290', city: 'Berlare',             lat: 51.030, lng: 4.000 },
  { postcode: '9300', city: 'Aalst',               lat: 50.937, lng: 4.040 },
  { postcode: '9320', city: 'Erembodegem',         lat: 50.916, lng: 4.052 },
  { postcode: '9340', city: 'Lede',                lat: 50.973, lng: 3.978 },
  { postcode: '9400', city: 'Ninove',              lat: 50.830, lng: 4.020 },
  { postcode: '9420', city: 'Erpe-Mere',           lat: 50.927, lng: 3.973 },
  { postcode: '9450', city: 'Haaltert',            lat: 50.910, lng: 4.001 },
  { postcode: '9470', city: 'Denderleeuw',         lat: 50.892, lng: 4.077 },
  { postcode: '9700', city: 'Oudenaarde',          lat: 50.847, lng: 3.601 },
  { postcode: '9800', city: 'Deinze',              lat: 50.984, lng: 3.526 },
  { postcode: '9830', city: 'Sint-Martens-Latem',  lat: 51.012, lng: 3.629 },
  { postcode: '9840', city: 'De Pinte',            lat: 51.005, lng: 3.644 },
  { postcode: '9850', city: 'Nevele',              lat: 51.030, lng: 3.580 },
  { postcode: '9880', city: 'Aalter',              lat: 51.083, lng: 3.450 },
  { postcode: '9900', city: 'Eeklo',               lat: 51.184, lng: 3.566 },
  { postcode: '9910', city: 'Knesselare',          lat: 51.143, lng: 3.434 },
  { postcode: '9920', city: 'Lievegem',            lat: 51.118, lng: 3.499 },
  { postcode: '9940', city: 'Evergem',             lat: 51.108, lng: 3.692 },
  { postcode: '9950', city: 'Waarschoot',          lat: 51.157, lng: 3.589 },
  { postcode: '9960', city: 'Assenede',            lat: 51.236, lng: 3.751 },
  { postcode: '9968', city: 'Bassevelde',          lat: 51.245, lng: 3.665 },
  { postcode: '9970', city: 'Kaprijke',            lat: 51.214, lng: 3.594 },
  { postcode: '9990', city: 'Maldegem',            lat: 51.213, lng: 3.448 },
]

// West-Vlaanderen
const WEST_VLAANDEREN: BePostcode[] = [
  { postcode: '8000', city: 'Brugge',              lat: 51.209, lng: 3.225 },
  { postcode: '8200', city: 'Sint-Andries/Brugge', lat: 51.189, lng: 3.184 },
  { postcode: '8300', city: 'Knokke-Heist',        lat: 51.349, lng: 3.286 },
  { postcode: '8400', city: 'Oostende',            lat: 51.232, lng: 2.927 },
  { postcode: '8500', city: 'Kortrijk',            lat: 50.828, lng: 3.265 },
  { postcode: '8510', city: 'Marke/Bellegem',      lat: 50.798, lng: 3.236 },
  { postcode: '8520', city: 'Kuurne',              lat: 50.844, lng: 3.293 },
  { postcode: '8530', city: 'Harelbeke',           lat: 50.857, lng: 3.314 },
  { postcode: '8540', city: 'Deerlijk',            lat: 50.852, lng: 3.357 },
  { postcode: '8550', city: 'Zwevegem',            lat: 50.811, lng: 3.336 },
  { postcode: '8560', city: 'Wevelgem',            lat: 50.808, lng: 3.171 },
  { postcode: '8570', city: 'Anzegem',             lat: 50.838, lng: 3.467 },
  { postcode: '8580', city: 'Avelgem',             lat: 50.770, lng: 3.450 },
  { postcode: '8600', city: 'Diksmuide',           lat: 51.033, lng: 2.864 },
  { postcode: '8630', city: 'Veurne',              lat: 51.067, lng: 2.661 },
  { postcode: '8700', city: 'Tielt',               lat: 50.997, lng: 3.327 },
  { postcode: '8710', city: 'Wielsbeke',           lat: 50.913, lng: 3.345 },
  { postcode: '8720', city: 'Dentergem',           lat: 50.961, lng: 3.420 },
  { postcode: '8730', city: 'Beernem',             lat: 51.131, lng: 3.339 },
  { postcode: '8740', city: 'Pittem',              lat: 50.998, lng: 3.260 },
  { postcode: '8750', city: 'Wingene',             lat: 51.038, lng: 3.272 },
  { postcode: '8760', city: 'Meulebeke',           lat: 50.946, lng: 3.288 },
  { postcode: '8770', city: 'Ingelmunster',        lat: 50.917, lng: 3.252 },
  { postcode: '8780', city: 'Oostrozebeke',        lat: 50.911, lng: 3.337 },
  { postcode: '8790', city: 'Waregem',             lat: 50.890, lng: 3.422 },
  { postcode: '8800', city: 'Roeselare',           lat: 50.946, lng: 3.124 },
  { postcode: '8820', city: 'Torhout',             lat: 51.067, lng: 3.103 },
  { postcode: '8830', city: 'Hooglede',            lat: 50.984, lng: 3.080 },
  { postcode: '8840', city: 'Staden',              lat: 50.978, lng: 3.014 },
  { postcode: '8850', city: 'Ardooie',             lat: 50.984, lng: 3.207 },
  { postcode: '8860', city: 'Lendelede',           lat: 50.892, lng: 3.224 },
  { postcode: '8870', city: 'Izegem',              lat: 50.918, lng: 3.213 },
  { postcode: '8880', city: 'Ledegem',             lat: 50.860, lng: 3.122 },
  { postcode: '8890', city: 'Moorslede',           lat: 50.901, lng: 3.073 },
  { postcode: '8900', city: 'Ieper',               lat: 50.852, lng: 2.886 },
  { postcode: '8920', city: 'Langemark-Poelkapelle', lat: 50.917, lng: 2.917 },
  { postcode: '8930', city: 'Menen',               lat: 50.795, lng: 3.124 },
  { postcode: '8940', city: 'Wervik',              lat: 50.778, lng: 3.043 },
  { postcode: '8970', city: 'Poperinge',           lat: 50.855, lng: 2.728 },
]

// Vlaams-Brabant
const VLAAMS_BRABANT: BePostcode[] = [
  { postcode: '1500', city: 'Halle',               lat: 50.733, lng: 4.236 },
  { postcode: '1540', city: 'Herne',               lat: 50.733, lng: 4.027 },
  { postcode: '1560', city: 'Hoeilaart',           lat: 50.769, lng: 4.467 },
  { postcode: '1570', city: 'Galmaarden',          lat: 50.755, lng: 3.973 },
  { postcode: '1600', city: 'Sint-Pieters-Leeuw',  lat: 50.781, lng: 4.247 },
  { postcode: '1670', city: 'Pepingen',            lat: 50.756, lng: 4.140 },
  { postcode: '1700', city: 'Dilbeek',             lat: 50.853, lng: 4.262 },
  { postcode: '1730', city: 'Asse',                lat: 50.911, lng: 4.205 },
  { postcode: '1740', city: 'Ternat',              lat: 50.878, lng: 4.176 },
  { postcode: '1745', city: 'Opwijk',              lat: 50.974, lng: 4.184 },
  { postcode: '1750', city: 'Lennik',              lat: 50.804, lng: 4.155 },
  { postcode: '1755', city: 'Gooik',               lat: 50.778, lng: 4.094 },
  { postcode: '1760', city: 'Roosdaal',            lat: 50.851, lng: 4.062 },
  { postcode: '1770', city: 'Liedekerke',          lat: 50.875, lng: 4.075 },
  { postcode: '1780', city: 'Wemmel',              lat: 50.910, lng: 4.317 },
  { postcode: '1790', city: 'Affligem',            lat: 50.909, lng: 4.124 },
  { postcode: '1800', city: 'Vilvoorde',           lat: 50.928, lng: 4.426 },
  { postcode: '1820', city: 'Steenokkerzeel',      lat: 50.910, lng: 4.499 },
  { postcode: '1830', city: 'Machelen',            lat: 50.909, lng: 4.434 },
  { postcode: '1840', city: 'Londerzeel',          lat: 51.001, lng: 4.295 },
  { postcode: '1850', city: 'Grimbergen',          lat: 50.935, lng: 4.358 },
  { postcode: '1860', city: 'Meise',               lat: 50.929, lng: 4.323 },
  { postcode: '1880', city: 'Kapelle-op-den-Bos',  lat: 51.004, lng: 4.366 },
  { postcode: '1910', city: 'Kampenhout',          lat: 50.926, lng: 4.553 },
  { postcode: '1930', city: 'Zaventem',            lat: 50.886, lng: 4.471 },
  { postcode: '1980', city: 'Zemst',               lat: 50.987, lng: 4.471 },
  { postcode: '3000', city: 'Leuven',              lat: 50.879, lng: 4.700 },
  { postcode: '3070', city: 'Kortenberg',          lat: 50.886, lng: 4.547 },
  { postcode: '3080', city: 'Tervuren',            lat: 50.823, lng: 4.515 },
  { postcode: '3090', city: 'Overijse',            lat: 50.770, lng: 4.530 },
  { postcode: '3110', city: 'Rotselaar',           lat: 50.945, lng: 4.706 },
  { postcode: '3120', city: 'Tremelo',             lat: 51.018, lng: 4.700 },
  { postcode: '3130', city: 'Begijnendijk',        lat: 51.024, lng: 4.762 },
  { postcode: '3140', city: 'Keerbergen',          lat: 51.003, lng: 4.638 },
  { postcode: '3150', city: 'Haacht',              lat: 50.978, lng: 4.638 },
  { postcode: '3200', city: 'Aarschot',            lat: 50.987, lng: 4.836 },
  { postcode: '3270', city: 'Scherpenheuvel-Zichem', lat: 51.000, lng: 4.978 },
  { postcode: '3300', city: 'Tienen',              lat: 50.806, lng: 4.940 },
  { postcode: '3320', city: 'Hoegaarden',          lat: 50.774, lng: 4.890 },
]

// Antwerpen + Limburg (samenvattend — grootste gemeenten)
const ANTWERPEN: BePostcode[] = [
  { postcode: '2000', city: 'Antwerpen',           lat: 51.221, lng: 4.399 },
  { postcode: '2018', city: 'Antwerpen-Berchem',   lat: 51.196, lng: 4.422 },
  { postcode: '2020', city: 'Antwerpen-Kiel',      lat: 51.201, lng: 4.387 },
  { postcode: '2030', city: 'Antwerpen-Luchtbal',  lat: 51.251, lng: 4.408 },
  { postcode: '2040', city: 'Antwerpen-Berendrecht', lat: 51.351, lng: 4.297 },
  { postcode: '2050', city: 'Antwerpen-Linkeroever', lat: 51.222, lng: 4.380 },
  { postcode: '2060', city: 'Antwerpen-Centrum',   lat: 51.220, lng: 4.401 },
  { postcode: '2100', city: 'Deurne',              lat: 51.222, lng: 4.464 },
  { postcode: '2140', city: 'Borgerhout',          lat: 51.215, lng: 4.432 },
  { postcode: '2150', city: 'Borsbeek',            lat: 51.198, lng: 4.475 },
  { postcode: '2160', city: 'Wommelgem',           lat: 51.207, lng: 4.514 },
  { postcode: '2170', city: 'Merksem',             lat: 51.247, lng: 4.443 },
  { postcode: '2180', city: 'Ekeren',              lat: 51.282, lng: 4.422 },
  { postcode: '2200', city: 'Herentals',           lat: 51.181, lng: 4.838 },
  { postcode: '2220', city: 'Heist-op-den-Berg',   lat: 51.078, lng: 4.722 },
  { postcode: '2230', city: 'Herselt',             lat: 51.061, lng: 4.879 },
  { postcode: '2240', city: 'Zandhoven',           lat: 51.218, lng: 4.671 },
  { postcode: '2260', city: 'Westerlo',            lat: 51.087, lng: 4.910 },
  { postcode: '2300', city: 'Turnhout',            lat: 51.323, lng: 4.948 },
  { postcode: '2400', city: 'Mol',                 lat: 51.190, lng: 5.114 },
  { postcode: '2500', city: 'Lier',                lat: 51.131, lng: 4.561 },
  { postcode: '2570', city: 'Duffel',              lat: 51.099, lng: 4.495 },
  { postcode: '2600', city: 'Berchem',             lat: 51.196, lng: 4.422 },
  { postcode: '2610', city: 'Wilrijk',             lat: 51.175, lng: 4.389 },
  { postcode: '2630', city: 'Aartselaar',          lat: 51.131, lng: 4.382 },
  { postcode: '2640', city: 'Mortsel',             lat: 51.166, lng: 4.451 },
  { postcode: '2650', city: 'Edegem',              lat: 51.156, lng: 4.434 },
  { postcode: '2660', city: 'Hoboken',             lat: 51.180, lng: 4.351 },
  { postcode: '2800', city: 'Mechelen',            lat: 51.028, lng: 4.480 },
  { postcode: '2820', city: 'Bonheiden',           lat: 51.025, lng: 4.541 },
  { postcode: '2830', city: 'Willebroek',          lat: 51.057, lng: 4.362 },
  { postcode: '2840', city: 'Rumst',               lat: 51.085, lng: 4.421 },
  { postcode: '2850', city: 'Boom',                lat: 51.087, lng: 4.367 },
  { postcode: '2870', city: 'Puurs-Sint-Amands',   lat: 51.077, lng: 4.286 },
  { postcode: '2880', city: 'Bornem',              lat: 51.099, lng: 4.244 },
  { postcode: '2890', city: 'Sint-Amands',         lat: 51.058, lng: 4.207 },
  { postcode: '2910', city: 'Essen',               lat: 51.466, lng: 4.466 },
  { postcode: '2920', city: 'Kalmthout',           lat: 51.394, lng: 4.470 },
  { postcode: '2930', city: 'Brasschaat',          lat: 51.293, lng: 4.490 },
  { postcode: '2960', city: 'Brecht',              lat: 51.351, lng: 4.633 },
  { postcode: '2980', city: 'Zoersel',             lat: 51.260, lng: 4.704 },
  { postcode: '2990', city: 'Wuustwezel',          lat: 51.398, lng: 4.595 },
]

const LIMBURG: BePostcode[] = [
  { postcode: '3500', city: 'Hasselt',             lat: 50.931, lng: 5.338 },
  { postcode: '3600', city: 'Genk',                lat: 50.965, lng: 5.500 },
  { postcode: '3700', city: 'Tongeren',            lat: 50.781, lng: 5.464 },
  { postcode: '3800', city: 'Sint-Truiden',        lat: 50.811, lng: 5.187 },
  { postcode: '3900', city: 'Pelt',                lat: 51.225, lng: 5.418 },
  { postcode: '3920', city: 'Lommel',              lat: 51.231, lng: 5.314 },
  { postcode: '3950', city: 'Bocholt',             lat: 51.181, lng: 5.583 },
  { postcode: '3960', city: 'Bree',                lat: 51.143, lng: 5.598 },
  { postcode: '3990', city: 'Peer',                lat: 51.135, lng: 5.473 },
]

export const BE_POSTCODES: BePostcode[] = [
  ...VLAAMSE_ARDENNEN,
  ...OOST_VLAANDEREN,
  ...WEST_VLAANDEREN,
  ...VLAAMS_BRABANT,
  ...ANTWERPEN,
  ...LIMBURG,
]
  // Dedup op postcode (sommige overlappen tussen lijsten)
  .filter((entry, idx, arr) => arr.findIndex((e) => e.postcode === entry.postcode) === idx)

/**
 * Haversine distance in km tussen twee punten op de wereld.
 */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function findPostcodesWithinRadius(
  center: { lat: number; lng: number },
  radiusKm: number,
): BePostcode[] {
  return BE_POSTCODES
    .map((p) => ({ p, d: haversineKm(center, p) }))
    .filter(({ d }) => d <= radiusKm)
    .sort((a, b) => a.d - b.d)
    .map(({ p }) => p)
}
