// Chess.com対戦相手マップ - Deno版

// 国コードから国旗の絵文字を取得
function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

// 国の座標データ（主要国のみ）
const countryCoordinates = {
    'US': { lat: 39.8283, lng: -98.5795, name: 'アメリカ' },
    'RU': { lat: 61.5240, lng: 105.3188, name: 'ロシア' },
    'IN': { lat: 20.5937, lng: 78.9629, name: 'インド' },
    'BR': { lat: -14.2350, lng: -51.9253, name: 'ブラジル' },
    'CN': { lat: 35.8617, lng: 104.1954, name: '中国' },
    'JP': { lat: 36.2048, lng: 138.2529, name: '日本' },
    'DE': { lat: 51.1657, lng: 10.4515, name: 'ドイツ' },
    'GB': { lat: 55.3781, lng: -3.4360, name: 'イギリス' },
    'FR': { lat: 46.2276, lng: 2.2137, name: 'フランス' },
    'IT': { lat: 41.8719, lng: 12.5674, name: 'イタリア' },
    'CA': { lat: 56.1304, lng: -106.3468, name: 'カナダ' },
    'AU': { lat: -25.2744, lng: 133.7751, name: 'オーストラリア' },
    'ES': { lat: 40.4637, lng: -3.7492, name: 'スペイン' },
    'MX': { lat: 23.6345, lng: -102.5528, name: 'メキシコ' },
    'ID': { lat: -0.7893, lng: 113.9213, name: 'インドネシア' },
    'NL': { lat: 52.1326, lng: 5.2913, name: 'オランダ' },
    'TR': { lat: 38.9637, lng: 35.2433, name: 'トルコ' },
    'SA': { lat: 23.8859, lng: 45.0792, name: 'サウジアラビア' },
    'CH': { lat: 46.8182, lng: 8.2275, name: 'スイス' },
    'AR': { lat: -38.4161, lng: -63.6167, name: 'アルゼンチン' },
    'SE': { lat: 60.1282, lng: 18.6435, name: 'スウェーデン' },
    'PL': { lat: 51.9194, lng: 19.1451, name: 'ポーランド' },
    'BE': { lat: 50.5039, lng: 4.4699, name: 'ベルギー' },
    'NO': { lat: 60.4720, lng: 8.4689, name: 'ノルウェー' },
    'AT': { lat: 47.5162, lng: 14.5501, name: 'オーストリア' },
    'AE': { lat: 23.4241, lng: 53.8478, name: 'アラブ首長国連邦' },
    'DK': { lat: 56.2639, lng: 9.5018, name: 'デンマーク' },
    'SG': { lat: 1.3521, lng: 103.8198, name: 'シンガポール' },
    'MY': { lat: 4.2105, lng: 101.9758, name: 'マレーシア' },
    'IL': { lat: 31.0461, lng: 34.8516, name: 'イスラエル' },
    'HK': { lat: 22.3193, lng: 114.1694, name: '香港' },
    'CZ': { lat: 49.8175, lng: 15.4730, name: 'チェコ' },
    'TH': { lat: 15.8700, lng: 100.9925, name: 'タイ' },
    'IE': { lat: 53.4129, lng: -8.2439, name: 'アイルランド' },
    'ZA': { lat: -30.5595, lng: 22.9375, name: '南アフリカ' },
    'PT': { lat: 39.3999, lng: -8.2245, name: 'ポルトガル' },
    'GR': { lat: 39.0742, lng: 21.8243, name: 'ギリシャ' },
    'FI': { lat: 61.9241, lng: 25.7482, name: 'フィンランド' },
    'RO': { lat: 45.9432, lng: 24.9668, name: 'ルーマニア' },
    'HU': { lat: 47.1625, lng: 19.5033, name: 'ハンガリー' },
    'SK': { lat: 48.6690, lng: 19.6990, name: 'スロバキア' },
    'LU': { lat: 49.8153, lng: 6.1296, name: 'ルクセンブルク' },
    'NZ': { lat: -40.9006, lng: 174.8860, name: 'ニュージーランド' },
    'UA': { lat: 48.3794, lng: 31.1656, name: 'ウクライナ' },
    'KR': { lat: 35.9078, lng: 127.7669, name: '韓国' },
    'TW': { lat: 23.6978, lng: 120.9605, name: '台湾' },
    'VN': { lat: 14.0583, lng: 108.2772, name: 'ベトナム' },
    'PH': { lat: 12.8797, lng: 121.7740, name: 'フィリピン' },
    'EG': { lat: 26.0975, lng: 31.4907, name: 'エジプト' },
    'MA': { lat: 31.7917, lng: -7.0926, name: 'モロッコ' },
    'NG': { lat: 9.0820, lng: 8.6753, name: 'ナイジェリア' },
    'KE': { lat: -0.0236, lng: 37.9062, name: 'ケニア' },
    'GH': { lat: 7.9465, lng: -1.0232, name: 'ガーナ' },
    'PE': { lat: -9.1900, lng: -75.0152, name: 'ペルー' },
    'CO': { lat: 4.5709, lng: -74.2973, name: 'コロンビア' },
    'CL': { lat: -35.6751, lng: -71.5430, name: 'チリ' },
    'UY': { lat: -32.5228, lng: -55.7658, name: 'ウルグアイ' },
    'VE': { lat: 6.4238, lng: -66.5897, name: 'ベネズエラ' },
    'EC': { lat: -1.8312, lng: -78.1834, name: 'エクアドル' },
    'BD': { lat: 23.6850, lng: 90.3563, name: 'バングラデシュ' },
    'LK': { lat: 7.8731, lng: 80.7718, name: 'スリランカ' },
    'PK': { lat: 30.3753, lng: 69.3451, name: 'パキスタン' },
    'AF': { lat: 33.9391, lng: 67.7100, name: 'アフガニスタン' },
    'IR': { lat: 32.4279, lng: 53.6880, name: 'イラン' },
    'IQ': { lat: 33.2232, lng: 43.6793, name: 'イラク' },
    'JO': { lat: 30.5852, lng: 36.2384, name: 'ヨルダン' },
    'LB': { lat: 33.8547, lng: 35.8623, name: 'レバノン' },
    'SY': { lat: 34.8021, lng: 38.9968, name: 'シリア' },
    'KW': { lat: 29.3117, lng: 47.4818, name: 'クウェート' },
    'QA': { lat: 25.3548, lng: 51.1839, name: 'カタール' },
    'BH': { lat: 25.9304, lng: 50.6378, name: 'バーレーン' },
    'OM': { lat: 21.4735, lng: 55.9754, name: 'オマーン' },
    'YE': { lat: 15.5527, lng: 48.5164, name: 'イエメン' },
    'KZ': { lat: 48.0196, lng: 66.9237, name: 'カザフスタン' },
    'UZ': { lat: 41.3775, lng: 64.5853, name: 'ウズベキスタン' },
    'TM': { lat: 38.9697, lng: 59.5563, name: 'トルクメニスタン' },
    'TJ': { lat: 38.8610, lng: 71.2761, name: 'タジキスタン' },
    'KG': { lat: 41.2044, lng: 74.7661, name: 'キルギス' },
    'MN': { lat: 46.8625, lng: 103.8467, name: 'モンゴル' },
    'AM': { lat: 40.0691, lng: 45.0382, name: 'アルメニア' },
    'AZ': { lat: 40.1431, lng: 47.5769, name: 'アゼルバイジャン' },
    'GE': { lat: 42.3154, lng: 43.3569, name: 'ジョージア' },
    'BY': { lat: 53.7098, lng: 27.9534, name: 'ベラルーシ' },
    'MD': { lat: 47.4116, lng: 28.3699, name: 'モルドバ' },
    'LT': { lat: 55.1694, lng: 23.8813, name: 'リトアニア' },
    'LV': { lat: 56.8796, lng: 24.6032, name: 'ラトビア' },
    'EE': { lat: 58.5953, lng: 25.0136, name: 'エストニア' },
    'RS': { lat: 44.0165, lng: 21.0059, name: 'セルビア' },
    'HR': { lat: 45.1000, lng: 15.2000, name: 'クロアチア' },
    'BA': { lat: 43.9159, lng: 17.6791, name: 'ボスニア・ヘルツェゴビナ' },
    'ME': { lat: 42.7087, lng: 19.3744, name: 'モンテネグロ' },
    'AL': { lat: 41.1533, lng: 20.1683, name: 'アルバニア' },
    'MK': { lat: 41.6086, lng: 21.7453, name: '北マケドニア' },
    'BG': { lat: 42.7339, lng: 25.4858, name: 'ブルガリア' },
    'SI': { lat: 46.1512, lng: 14.9955, name: 'スロベニア' },
    'MT': { lat: 35.9375, lng: 14.3754, name: 'マルタ' },
    'CY': { lat: 35.1264, lng: 33.4299, name: 'キプロス' },
    'IS': { lat: 64.9631, lng: -19.0208, name: 'アイスランド' },
    'GBR': { lat: 55.3781, lng: -3.4360, name: 'イギリス' },
    'FRA': { lat: 46.2276, lng: 2.2137, name: 'フランス' },
    'DEU': { lat: 51.1657, lng: 10.4515, name: 'ドイツ' },
    'ITA': { lat: 41.8719, lng: 12.5674, name: 'イタリア' },
    'ESP': { lat: 40.4637, lng: -3.7492, name: 'スペイン' },
    'NLD': { lat: 52.1326, lng: 5.2913, name: 'オランダ' },
    'BEL': { lat: 50.5039, lng: 4.4699, name: 'ベルギー' },
    'CHE': { lat: 46.8182, lng: 8.2275, name: 'スイス' },
    'AUT': { lat: 47.5162, lng: 14.5501, name: 'オーストリア' },
    'PRT': { lat: 39.3999, lng: -8.2245, name: 'ポルトガル' },
    'GRC': { lat: 39.0742, lng: 21.8243, name: 'ギリシャ' },
    'DNK': { lat: 56.2639, lng: 9.5018, name: 'デンマーク' },
    'NOR': { lat: 60.4720, lng: 8.4689, name: 'ノルウェー' },
    'SWE': { lat: 60.1282, lng: 18.6435, name: 'スウェーデン' },
    'FIN': { lat: 61.9241, lng: 25.7482, name: 'フィンランド' },
    'IRL': { lat: 53.4129, lng: -8.2439, name: 'アイルランド' },
    'GF': { lat: 3.9339, lng: -53.1258, name: 'フランス領ギアナ' },
    'KP': { lat: 40.3399, lng: 127.5101, name: '北朝鮮' },
    'PS': { lat: 31.9522, lng: 35.2332, name: 'パレスチナ' },
    'XE': { lat: 52.3555, lng: -1.1743, name: 'イングランド' },
    'XS': { lat: 56.4907, lng: -4.2026, name: 'スコットランド' },
    'XW': { lat: 52.1307, lng: -3.7837, name: 'ウェールズ' },
    'KY': { lat: 19.3133, lng: -81.2546, name: 'ケイマン諸島' },
    'BM': { lat: 32.3078, lng: -64.7505, name: 'バミューダ' },
    'MQ': { lat: 14.6415, lng: -61.0242, name: 'マルティニーク' },
    'AW': { lat: 12.5211, lng: -69.9683, name: 'アルバ' },
    'KN': { lat: 17.357822, lng: -62.782998, name: 'セントクリストファー・ネイビス' },
    'XB': { lat: 52.1326, lng: 5.2913, name: 'ベルギー' },
    'XC': { lat: 56.2639, lng: 9.5018, name: 'デンマーク' },
    'XT': { lat: 49.8153, lng: 6.1296, name: 'ルクセンブルク' },
    'BS': { lat: 25.0343, lng: -77.3963, name: 'バハマ' }
};

// グローバル変数
let map;
let worldCountriesData = null;
let countryLayers = [];
let clickMarkers = [];
let currentUsername = null;

// 世界の国境データを読み込み
async function loadWorldCountriesData() {
    try {
        // より信頼性の高いGeoJSONソースを使用
        const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        worldCountriesData = await response.json();
    } catch (error) {
        // フォールバック：別のソースを試行
        try {
            const response2 = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
            if (response2.ok) {
                worldCountriesData = await response2.json();
            } else {
                worldCountriesData = null;
            }
        } catch (error2) {
            worldCountriesData = null;
        }
    }
}

// 地図の初期化
async function initMap() {
    map = L.map('map').setView([30, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // 世界の国境データを読み込み
    await loadWorldCountriesData();
}

// Deno APIからデータを取得
async function fetchChessData(period = 3) {
    try {
        let apiUrl;
        
        if (period === 'selected') {
            // 選択された期間を取得
            const selectedPeriods = getSelectedPeriods();
            if (selectedPeriods.length === 0) {
                throw new Error('取得する期間が選択されていません');
            }
            
            // 選択された期間をカンマ区切りで送信
            const periodsParam = selectedPeriods.map(p => `${p.year}/${String(p.month).padStart(2, '0')}`).join(',');
            apiUrl = `/api/chess-data?period=selected&periods=${encodeURIComponent(periodsParam)}`;
        } else {
            apiUrl = `/api/chess-data?period=${period}`;
        }
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'APIエラーが発生しました');
        }
        
        const data = await response.json();
        
        // 国データをMapに変換
        const countries = new Map(data.countries);
        
        // ダミーのゲームデータを作成（統計表示用）
        const dummyGames = Array(data.games).fill({});
        
        return { games: dummyGames, countries };
    } catch (error) {
        throw error;
    }
}

// ISO2からISO3への変換マップ（GeoJSONで使用される国コード）
const iso2ToIso3 = {
    'AD': 'AND', 'AE': 'ARE', 'AF': 'AFG', 'AG': 'ATG', 'AI': 'AIA', 'AL': 'ALB',
    'AM': 'ARM', 'AO': 'AGO', 'AQ': 'ATA', 'AR': 'ARG', 'AS': 'ASM', 'AT': 'AUT',
    'AU': 'AUS', 'AW': 'ABW', 'AX': 'ALA', 'AZ': 'AZE', 'BA': 'BIH', 'BB': 'BRB',
    'BD': 'BGD', 'BE': 'BEL', 'BF': 'BFA', 'BG': 'BGR', 'BH': 'BHR', 'BI': 'BDI',
    'BJ': 'BEN', 'BL': 'BLM', 'BM': 'BMU', 'BN': 'BRN', 'BO': 'BOL', 'BQ': 'BES',
    'BR': 'BRA', 'BS': 'BHS', 'BT': 'BTN', 'BV': 'BVT', 'BW': 'BWA', 'BY': 'BLR',
    'BZ': 'BLZ', 'CA': 'CAN', 'CC': 'CCK', 'CD': 'COD', 'CF': 'CAF', 'CG': 'COG',
    'CH': 'CHE', 'CI': 'CIV', 'CK': 'COK', 'CL': 'CHL', 'CM': 'CMR', 'CN': 'CHN',
    'CO': 'COL', 'CR': 'CRI', 'CU': 'CUB', 'CV': 'CPV', 'CW': 'CUW', 'CX': 'CXR',
    'CY': 'CYP', 'CZ': 'CZE', 'DE': 'DEU', 'DJ': 'DJI', 'DK': 'DNK', 'DM': 'DMA',
    'DO': 'DOM', 'DZ': 'DZA', 'EC': 'ECU', 'EE': 'EST', 'EG': 'EGY', 'EH': 'ESH',
    'ER': 'ERI', 'ES': 'ESP', 'ET': 'ETH', 'FI': 'FIN', 'FJ': 'FJI', 'FK': 'FLK',
    'FM': 'FSM', 'FO': 'FRO', 'FR': 'FRA', 'GA': 'GAB', 'GB': 'GBR', 'GD': 'GRD',
    'GE': 'GEO', 'GF': 'GUF', 'GG': 'GGY', 'GH': 'GHA', 'GI': 'GIB', 'GL': 'GRL',
    'GM': 'GMB', 'GN': 'GIN', 'GP': 'GLP', 'GQ': 'GNQ', 'GR': 'GRC', 'GS': 'SGS',
    'GT': 'GTM', 'GU': 'GUM', 'GW': 'GNB', 'GY': 'GUY', 'HK': 'HKG', 'HM': 'HMD',
    'HN': 'HND', 'HR': 'HRV', 'HT': 'HTI', 'HU': 'HUN', 'ID': 'IDN', 'IE': 'IRL',
    'IL': 'ISR', 'IM': 'IMN', 'IN': 'IND', 'IO': 'IOT', 'IQ': 'IRQ', 'IR': 'IRN',
    'IS': 'ISL', 'IT': 'ITA', 'JE': 'JEY', 'JM': 'JAM', 'JO': 'JOR', 'JP': 'JPN',
    'KE': 'KEN', 'KG': 'KGZ', 'KH': 'KHM', 'KI': 'KIR', 'KM': 'COM', 'KN': 'KNA',
    'KP': 'PRK', 'KR': 'KOR', 'KW': 'KWT', 'KY': 'CYM', 'KZ': 'KAZ', 'LA': 'LAO',
    'LB': 'LBN', 'LC': 'LCA', 'LI': 'LIE', 'LK': 'LKA', 'LR': 'LBR', 'LS': 'LSO',
    'LT': 'LTU', 'LU': 'LUX', 'LV': 'LVA', 'LY': 'LBY', 'MA': 'MAR', 'MC': 'MCO',
    'MD': 'MDA', 'ME': 'MNE', 'MF': 'MAF', 'MG': 'MDG', 'MH': 'MHL', 'MK': 'MKD',
    'ML': 'MLI', 'MM': 'MMR', 'MN': 'MNG', 'MO': 'MAC', 'MP': 'MNP', 'MQ': 'MTQ',
    'MR': 'MRT', 'MS': 'MSR', 'MT': 'MLT', 'MU': 'MUS', 'MV': 'MDV', 'MW': 'MWI',
    'MX': 'MEX', 'MY': 'MYS', 'MZ': 'MOZ', 'NA': 'NAM', 'NC': 'NCL', 'NE': 'NER',
    'NF': 'NFK', 'NG': 'NGA', 'NI': 'NIC', 'NL': 'NLD', 'NO': 'NOR', 'NP': 'NPL',
    'NR': 'NRU', 'NU': 'NIU', 'NZ': 'NZL', 'OM': 'OMN', 'PA': 'PAN', 'PE': 'PER',
    'PF': 'PYF', 'PG': 'PNG', 'PH': 'PHL', 'PK': 'PAK', 'PL': 'POL', 'PM': 'SPM',
    'PN': 'PCN', 'PR': 'PRI', 'PS': 'PSE', 'PT': 'PRT', 'PW': 'PLW', 'PY': 'PRY',
    'QA': 'QAT', 'RE': 'REU', 'RO': 'ROU', 'RS': 'SRB', 'RU': 'RUS', 'RW': 'RWA',
    'SA': 'SAU', 'SB': 'SLB', 'SC': 'SYC', 'SD': 'SDN', 'SE': 'SWE', 'SG': 'SGP',
    'SH': 'SHN', 'SI': 'SVN', 'SJ': 'SJM', 'SK': 'SVK', 'SL': 'SLE', 'SM': 'SMR',
    'SN': 'SEN', 'SO': 'SOM', 'SR': 'SUR', 'SS': 'SSD', 'ST': 'STP', 'SV': 'SLV',
    'SX': 'SXM', 'SY': 'SYR', 'SZ': 'SWZ', 'TC': 'TCA', 'TD': 'TCD', 'TF': 'ATF',
    'TG': 'TGO', 'TH': 'THA', 'TJ': 'TJK', 'TK': 'TKL', 'TL': 'TLS', 'TM': 'TKM',
    'TN': 'TUN', 'TO': 'TON', 'TR': 'TUR', 'TT': 'TTO', 'TV': 'TUV', 'TW': 'TWN',
    'TZ': 'TZA', 'UA': 'UKR', 'UG': 'UGA', 'UM': 'UMI', 'US': 'USA', 'UY': 'URY',
    'UZ': 'UZB', 'VA': 'VAT', 'VC': 'VCT', 'VE': 'VEN', 'VG': 'VGB', 'VI': 'VIR',
    'VN': 'VNM', 'VU': 'VUT', 'WF': 'WLF', 'WS': 'WSM', 'YE': 'YEM', 'YT': 'MYT',
    'ZA': 'ZAF', 'ZM': 'ZMB', 'ZW': 'ZWE',
    'XE': 'GBR', 'XS': 'GBR', 'XW': 'GBR'
};

// 地図に国を塗る
function addCountriesToMap(countries) {
    // 既存のレイヤーをクリア
    countryLayers.forEach(layer => map.removeLayer(layer));
    countryLayers = [];
    
    if (!worldCountriesData || !worldCountriesData.features) {
        // GeoJSONデータがない場合はマーカーを使用せず、何も表示しない
        return;
    }
    
    countries.forEach((count, countryCode) => {
        // 不明（XX）と欧州連合（EU）は地図上に表示しない
        if (countryCode === 'XX' || countryCode === 'EU') {
            return;
        }
        
        const countryInfo = countryCoordinates[countryCode];
        const iso3Code = iso2ToIso3[countryCode];
        
        if (countryInfo) {
            // 複数の方法で国を検索
            let countryFeature = null;
            
            // 1. ISO3コードで検索
            if (iso3Code) {
                countryFeature = worldCountriesData.features.find(feature => {
                    const props = feature.properties;
                    return props.ISO_A3 === iso3Code || 
                           props.ADM0_A3 === iso3Code ||
                           props.WB_A3 === iso3Code;
                });
            }
            
            // 2. ISO2コードで検索
            if (!countryFeature) {
                countryFeature = worldCountriesData.features.find(feature => {
                    const props = feature.properties;
                    return props.ISO_A2 === countryCode || 
                           props.WB_A2 === countryCode ||
                           props.ADM0_A2 === countryCode;
                });
            }
            
            // 3. 国名で検索
            if (!countryFeature) {
                const countryName = countryInfo.name;
                countryFeature = worldCountriesData.features.find(feature => {
                    const props = feature.properties;
                    return props.NAME === countryName ||
                           props.NAME_EN === countryName ||
                           props.ADMIN === countryName ||
                           props.NAME_LONG === countryName;
                });
            }
            
            if (countryFeature) {
                const layer = L.geoJSON(countryFeature, {
                    style: {
                        fillColor: '#ff0000',
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.7
                    }
                }).bindPopup(`
                    <div class="leaflet-popup-content">
                        <div class="popup-flag">${getFlagEmoji(countryCode)}</div>
                        <div class="popup-country">${countryInfo.name}</div>
                        <div class="popup-games">${count} ゲーム</div>
                    </div>
                `).on('click', () => {
                    // 地図上の国をクリックした時にマーカーを表示
                    addPinToCountry(countryCode, count, countryInfo);
                }).addTo(map);
                
                countryLayers.push(layer);
            }
            // マーカーでのフォールバック表示は削除
        }
    });
}

// 不要になったマーカー関連の関数を削除

// 国にピンを立てる（青いマーカー）
function addPinToCountry(countryCode, count, countryInfo) {
    // 既存のクリックマーカーをクリア（1つの国のマーカーのみ表示）
    clearClickMarkers();
    
    const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    
    const marker = L.marker([countryInfo.lat, countryInfo.lng], {icon: blueIcon})
        .addTo(map)
        .bindPopup(`
            <div class="leaflet-popup-content">
                <div class="popup-flag">${getFlagEmoji(countryCode)}</div>
                <div class="popup-country">${countryInfo.name}</div>
                <div class="popup-games">${count} ゲーム</div>
            </div>
        `)
        .openPopup(); // 自動的にポップアップを開く
    
    clickMarkers.push(marker);
    
    // 地図の要素までスクロール
    const mapElement = document.getElementById('map');
    mapElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

// クリックマーカーをクリア
function clearClickMarkers() {
    clickMarkers.forEach(marker => map.removeLayer(marker));
    clickMarkers = [];
}

// 国リストを表示
function displayCountryList(countries) {
    const countriesList = document.getElementById('countries');
    
    countriesList.innerHTML = '';
    
    // 国を対戦数でソート
    const sortedCountries = Array.from(countries.entries()).sort((a, b) => b[1] - a[1]);
    
    sortedCountries.forEach(([countryCode, count]) => {
        const countryInfo = countryCoordinates[countryCode];
        if (!countryInfo) return;
        
        // リスト表示用
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="country-flag">${getFlagEmoji(countryCode)}</div>
            <div class="country-info">
                <div class="country-name">${countryInfo.name}</div>
                <div class="game-count">${count} ゲーム</div>
            </div>
        `;
        
        // クリックイベントを追加
        li.addEventListener('click', () => {
            addPinToCountry(countryCode, count, countryInfo);
        });
        
        countriesList.appendChild(li);
    });
}

// ローディング状態を更新する関数
function updateLoadingStatus(message) {
    const loadingStatus = document.getElementById('loadingStatus');
    const loadingDetails = document.getElementById('loadingDetails');
    const loadingProgress = document.getElementById('loadingProgress');
    
    if (loadingStatus) loadingStatus.textContent = message;
    if (loadingDetails) loadingDetails.textContent = '';
    if (loadingProgress) loadingProgress.textContent = '';
}

// 選択された期間を取得する関数
function getSelectedPeriods() {
    const selectedPeriods = [];
    const checkboxes = document.querySelectorAll('#periodsList input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        selectedPeriods.push({
            year: parseInt(checkbox.dataset.year),
            month: parseInt(checkbox.dataset.month)
        });
    });
    
    return selectedPeriods;
}

// 現在のユーザー名を取得して表示
async function loadCurrentUsername() {
    try {
        const response = await fetch('/api/current-user');
        const data = await response.json();
        if (data.username) {
            currentUsername = data.username;
            document.getElementById('currentUsername').textContent = currentUsername;
            return currentUsername;
        }
    } catch (error) {
        console.error('Failed to load current username:', error);
    }
    return null;
}

// メイン処理
document.getElementById('fetchButton').addEventListener('click', async () => {
    if (!currentUsername) {
        alert('ユーザー名が設定されていません');
        return;
    }
    
    // 選択された期間をチェック
    const selectedPeriods = getSelectedPeriods();
    if (selectedPeriods.length === 0) {
        alert('取得する期間を選択してください');
        return;
    }
    
    const button = document.getElementById('fetchButton');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const stats = document.getElementById('stats');
    const countryList = document.getElementById('countryList');
    
    // UIリセット
    button.disabled = true;
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    // stats と countryList は表示したままにする
    
    // 既存のクリックマーカーをクリア（データ取得開始時）
    clearClickMarkers();
    
    try {
        
        // ローディング状態の更新
        const periodText = selectedPeriods.map(p => `${p.year}年${String(p.month).padStart(2, '0')}月`).join(', ');
        updateLoadingStatus(`Chess.comからデータを取得中... 対象期間: ${periodText} (${selectedPeriods.length}期間)`);
        
        // データ取得（選択された期間）
        const result = await fetchChessData('selected');
        const games = result.games;
        const countries = result.countries;
        
        if (countries.size === 0) {
            throw new Error('対戦相手の国情報が見つかりませんでした');
        }
        
        // 地図処理中のローディング状態更新
        updateLoadingStatus(`地図データを処理中... 対戦国数: ${countries.size}カ国, 総対戦数: ${games.length}ゲーム`);
        
        // 新規データ取得後、既存データと合わせて地図を更新
        updateLoadingStatus(`既存データと合併中... 新規取得データ: ${countries.size}カ国, 全データを地図に反映中...`);
        
        // 既存データを再読み込みして最新状態で地図を更新
        await updateMapWithAllData();
        
        // 期間選択の表示を更新
        await displayPeriodSelection();
        
        // 最終処理中のローディング状態更新
        updateLoadingStatus('処理完了 - データ取得が完了しました');
        
    } catch (err) {
        error.textContent = `エラー: ${err.message}`;
        error.classList.remove('hidden');
    } finally {
        button.disabled = false;
        loading.classList.add('hidden');
    }
});

// 全期間をチェックボックス付きで表示する関数
async function displayPeriodSelection() {
    if (!currentUsername) {
        document.getElementById('periodSelection').classList.add('hidden');
        return;
    }
    
    try {
        const response = await fetch('/api/all-periods');
        const data = await response.json();
        
        if (response.ok && data.allPeriods && data.allPeriods.length > 0) {
            const periodsList = document.getElementById('periodsList');
            const totalPeriods = document.getElementById('totalPeriods');
            
            totalPeriods.textContent = data.allPeriods.length;
            
            // 既存期間をセットに変換
            const existingPeriodsSet = new Set(data.existingPeriods || []);
            
            // 現在のチェック状態を保存（更新時に維持するため）
            const currentCheckedStates = new Map();
            const existingCheckboxes = document.querySelectorAll('#periodsList input[type="checkbox"]');
            existingCheckboxes.forEach(checkbox => {
                const key = `${checkbox.dataset.year}-${checkbox.dataset.month}`;
                currentCheckedStates.set(key, checkbox.checked);
            });
            
            periodsList.innerHTML = data.allPeriods.map(periodObj => {
                const exists = existingPeriodsSet.has(periodObj.period);
                const key = `${periodObj.year}-${periodObj.month}`;
                
                // 更新時は現在のチェック状態を維持、初回は未取得期間をチェック
                let checked;
                if (currentCheckedStates.has(key)) {
                    checked = currentCheckedStates.get(key);
                } else {
                    checked = !exists; // データがない期間はデフォルトでチェック
                }
                
                const statusClass = exists ? 'status-exists' : 'status-missing';
                const statusText = exists ? '取得済み' : '未取得';
                
                return `
                    <div class="period-item">
                        <input type="checkbox" 
                               id="period-${periodObj.year}-${periodObj.month}" 
                               data-year="${periodObj.year}" 
                               data-month="${periodObj.month}"
                               ${checked ? 'checked' : ''}>
                        <label for="period-${periodObj.year}-${periodObj.month}" class="period-label">
                            ${periodObj.period}
                        </label>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                `;
            }).join('');
            
            document.getElementById('periodSelection').classList.remove('hidden');
            
            // 全選択/解除機能
            setupSelectAllFunctionality();
        } else {
            document.getElementById('periodSelection').classList.add('hidden');
        }
    } catch (error) {
        document.getElementById('periodSelection').classList.add('hidden');
    }
}

// 全選択/解除機能の設定
function setupSelectAllFunctionality() {
    const selectAllCheckbox = document.getElementById('selectAllPeriods');
    const periodCheckboxes = document.querySelectorAll('#periodsList input[type="checkbox"]');
    
    selectAllCheckbox.addEventListener('change', (e) => {
        periodCheckboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });
    
    // 個別チェックボックスの状態に応じて全選択チェックボックスを更新
    periodCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const checkedCount = document.querySelectorAll('#periodsList input[type="checkbox"]:checked').length;
            selectAllCheckbox.checked = checkedCount === periodCheckboxes.length;
            selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < periodCheckboxes.length;
        });
    });
}


// 既存データを読み込んで地図に表示
async function loadExistingDataAndDisplay() {
    try {
        const response = await fetch('/api/existing-data');
        const data = await response.json();
        
        if (data.countries && data.countries.length > 0) {
            const countries = new Map(data.countries);
            
            // 統計を更新
            updateStats(countries);
            
            // 地図に表示
            addCountriesToMap(countries);
            
            // 国リストを表示
            displayCountryList(countries);
            document.getElementById('countryList').classList.remove('hidden');
            
            console.log(`既存データを読み込みました: ${countries.size}カ国, ${Array.from(countries.values()).reduce((a, b) => a + b, 0)}ゲーム`);
        }
    } catch (error) {
        console.log('既存データの読み込みに失敗しました:', error);
    }
}

// 全データで地図とUIを更新する関数
async function updateMapWithAllData() {
    try {
        // 既存の地図レイヤーをクリア
        countryLayers.forEach(layer => map.removeLayer(layer));
        countryLayers = [];
        
        // 既存データを再読み込み
        const response = await fetch('/api/existing-data');
        const data = await response.json();
        
        if (data.countries && data.countries.length > 0) {
            const countries = new Map(data.countries);
            
            // 統計を更新
            updateStats(countries);
            
            // 地図に表示
            addCountriesToMap(countries);
            
            // 国リストを表示
            displayCountryList(countries);
            document.getElementById('countryList').classList.remove('hidden');
            
            console.log(`全データを更新しました: ${countries.size}カ国, ${Array.from(countries.values()).reduce((a, b) => a + b, 0)}ゲーム`);
        }
    } catch (error) {
        console.error('全データの更新に失敗しました:', error);
    }
}

// 統計情報を更新する関数
function updateStats(countries) {
    const totalGames = Array.from(countries.values()).reduce((a, b) => a + b, 0);
    document.getElementById('countryCount').textContent = countries.size;
    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('stats').classList.remove('hidden');
}

// 初期化
initMap().then(async () => {
    // 地図初期化後にユーザー名と既存データを読み込み
    await loadCurrentUsername();
    await loadExistingDataAndDisplay();
    
    // ユーザー名が読み込まれた場合、期間選択を表示
    if (currentUsername) {
        await displayPeriodSelection();
    }
}).catch(error => {
    console.error('Map initialization failed:', error);
});