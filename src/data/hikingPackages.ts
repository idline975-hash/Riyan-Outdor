import type { HikingPackage } from '../types.ts';

export const HIKING_PACKAGES: HikingPackage[] = [
  {
    id: 'pkg-solo',
    code: 'PKT-SOLO',
    name: 'Paket Solo Ultralight (1 Pendaki)',
    categoryType: 'Solo / Ultralight',
    tier: 'hemat',
    targetPerson: '1 Orang',
    description: 'Solusi pendakian solo atau tektok hemat & ringan. Perlengkapan dipangkas seringkas mungkin tanpa mengorbankan keamanan dan kenyamanan tidur di gunung.',
    badge: 'Hemat & Ringan',
    badgeColor: 'emerald',
    pricePerDay: 75000,
    originalPricePerDay: 110000,
    discountPercent: 32,
    recommendedFor: 'Gn. Prau, Gn. Andong, Gn. Bismo, Gn. Penanggungan, Gn. Manglayang',
    highlightFeatures: [
      'Total bobot sangat ringan (<4.8 kg)',
      'Tenda silnylon waterproof frame aluminium',
      'Set masak solo praktis + gas burner mini',
      'Matras alumunium anti dingin tanah'
    ],
    includedGear: [
      { gearCode: 'TD-03', name: 'Tenda Naturehike Cloud Up 2 Ultralight', quantity: 1, itemCategory: 'Tenda' },
      { gearCode: 'CR-03', name: 'Carrier Eiger 45 Liter Ultralight', quantity: 1, itemCategory: 'Carrier' },
      { gearCode: 'SB-02', name: 'Sleeping Bag Polar Dacron Hangat', quantity: 1, itemCategory: 'SB/Matras' },
      { gearCode: 'MT-01', name: 'Matras Alumunium Double Foil 200x100', quantity: 1, itemCategory: 'SB/Matras' },
      { gearCode: 'KP-02', name: 'Kompor Mini Portable Camping Ultralight', quantity: 1, itemCategory: 'Alat Masak' },
      { gearCode: 'CS-02', name: 'Cooking Set Nesting DS-101 Solo', quantity: 1, itemCategory: 'Alat Masak' },
      { gearCode: 'LP-01', name: 'Headlamp LED 300 Lumens Waterproof', quantity: 1, itemCategory: 'Lampu' }
    ]
  },
  {
    id: 'pkg-duo',
    code: 'PKT-DUO',
    name: 'Paket Duo / Romantic Summit (2 Pendaki)',
    categoryType: 'Duo / Couple (2P)',
    tier: 'standar',
    targetPerson: '2 Orang',
    description: 'Pilihan favorit pendaki berdua atau pasangan! Tenda double layer nyaman anti-embun, 2 sleeping bag hangat, kompor windproof, dan lentera tenda malam hari.',
    badge: 'Paling Populer',
    badgeColor: 'blue',
    pricePerDay: 120000,
    originalPricePerDay: 165000,
    discountPercent: 27,
    recommendedFor: 'Gn. Merbabu, Gn. Lawu, Gn. Papandayan, Gn. Gede Pangrango, Gn. Ijen',
    highlightFeatures: [
      'Tenda Arei Eliot 2-3P dengan vestibule luas',
      '2x Sleeping bag polar bulu ekstra tebal',
      'Kompor camping mawar tahan hembusan angin',
      'Lentera tenda gantung hangat temaram'
    ],
    includedGear: [
      { gearCode: 'TD-05', name: 'Tenda Dome Arei Eliot 2-3 Person Double Layer', quantity: 1, itemCategory: 'Tenda' },
      { gearCode: 'CR-02', name: 'Carrier Arei 60 Liter Ergonomic', quantity: 1, itemCategory: 'Carrier' },
      { gearCode: 'CR-04', name: 'Daypack Consina 35 Liter Trekker', quantity: 1, itemCategory: 'Carrier' },
      { gearCode: 'SB-01', name: 'Sleeping Bag Polar Bulu Hangat', quantity: 2, itemCategory: 'SB/Matras' },
      { gearCode: 'MT-01', name: 'Matras Alumunium Double Foil', quantity: 2, itemCategory: 'SB/Matras' },
      { gearCode: 'KP-01', name: 'Kompor Windproof Mawar Camping', quantity: 1, itemCategory: 'Alat Masak' },
      { gearCode: 'CS-01', name: 'Cooking Set Nesting DS-200 Duo', quantity: 1, itemCategory: 'Alat Masak' },
      { gearCode: 'LP-01', name: 'Headlamp LED Waterproof', quantity: 2, itemCategory: 'Lampu' },
      { gearCode: 'LP-02', name: 'Lampu Tenda Lentera LED Camping', quantity: 1, itemCategory: 'Lampu' }
    ]
  },
  {
    id: 'pkg-squad',
    code: 'PKT-SQUAD',
    name: 'Paket Squad Reguler (4-5 Pendaki)',
    categoryType: 'Squad / Rombongan (4P)',
    tier: 'standar',
    targetPerson: '4-5 Orang',
    description: 'Pilihan terlaris komunitas & grup sahabat! Tenda kapasitas 4-5 orang kokoh, flysheet pelindung badai, 2 kompor untuk masak cepat, dan nesting komplit dengan teko.',
    badge: 'Best Value Group',
    badgeColor: 'amber',
    pricePerDay: 195000,
    originalPricePerDay: 270000,
    discountPercent: 28,
    recommendedFor: 'Gn. Sindoro, Gn. Sumbing, Gn. Slamet, Gn. Ciremai, Gn. Argopuro',
    highlightFeatures: [
      'Tenda Eiger Dome 4P teruji di berbagai gunung',
      'Flysheet pelindung 3x4 meter + pasak & tali',
      'Dual Kompor agar masak mie & seduh kopi bersamaan',
      'Nesting DS-308 komplit dengan wajan & teko'
    ],
    includedGear: [
      { gearCode: 'TD-01', name: 'Tenda Dome Eiger 4P Double Layer', quantity: 1, itemCategory: 'Tenda' },
      { gearCode: 'FS-01', name: 'Flysheet 3x4 Meter Waterproof 19 Lubang', quantity: 1, itemCategory: 'Tenda' },
      { gearCode: 'CR-01', name: 'Carrier Eiger 65L Expedition', quantity: 2, itemCategory: 'Carrier' },
      { gearCode: 'SB-01', name: 'Sleeping Bag Polar Dacron Tebal', quantity: 4, itemCategory: 'SB/Matras' },
      { gearCode: 'MT-01', name: 'Matras Alumunium Foil Tebal', quantity: 4, itemCategory: 'SB/Matras' },
      { gearCode: 'KP-01', name: 'Kompor Windproof Mawar Camping', quantity: 2, itemCategory: 'Alat Masak' },
      { gearCode: 'CS-03', name: 'Cooking Set DS-308 Komplit + Teko Air', quantity: 1, itemCategory: 'Alat Masak' },
      { gearCode: 'LP-02', name: 'Lampu Lentera Tenda Camping', quantity: 2, itemCategory: 'Lampu' },
      { gearCode: 'LP-01', name: 'Headlamp LED Waterproof', quantity: 2, itemCategory: 'Lampu' }
    ]
  },
  {
    id: 'pkg-extreme',
    code: 'PKT-EXTREME',
    name: 'Paket Ekspedisi Extreme & Safety (4-6 Pendaki)',
    categoryType: 'Ekspedisi / Safety (Extreme)',
    tier: 'premium',
    targetPerson: '4-6 Orang',
    description: 'Standar keselamatan tertinggi untuk pendakian jalur terjal, gunung di atas 3.000 mdpl, atau musim hujan badai. Dilengkapi HT komunikasi tim, sleeping bag bulu angsa, dan P3K lengkap.',
    badge: 'Extreme Summit & Safety',
    badgeColor: 'rose',
    pricePerDay: 295000,
    originalPricePerDay: 425000,
    discountPercent: 31,
    recommendedFor: 'Gn. Rinjani, Gn. Semeru, Gn. Kerinci, Gn. Raung, Cartenz Pyramid',
    highlightFeatures: [
      'Tenda badai Consina Magnum 4P frame alloy ekstra kuat',
      'HT Baofeng UV-5R dual band untuk keselamatan rombongan',
      'Sleeping bag Bulu Angsa tahan suhu hingga -5°C',
      'First Aid Kit Gunung lengkap & Trekking Pole 2 pasang'
    ],
    includedGear: [
      { gearCode: 'TD-02', name: 'Tenda Consina Magnum 4 Person Badai Proof', quantity: 1, itemCategory: 'Tenda' },
      { gearCode: 'FS-02', name: 'Flysheet Jumbo 4x6 Meter Heavy Duty', quantity: 1, itemCategory: 'Tenda' },
      { gearCode: 'CR-05', name: 'Carrier Deuter Aircontact 70+10L', quantity: 2, itemCategory: 'Carrier' },
      { gearCode: 'SB-03', name: 'Sleeping Bag Extreme Cold Bulu Angsa (-5°C)', quantity: 4, itemCategory: 'SB/Matras' },
      { gearCode: 'MT-02', name: 'Matras Spons Tebal + Alumunium Foil', quantity: 4, itemCategory: 'SB/Matras' },
      { gearCode: 'KP-01', name: 'Kompor Windproof Heavy Duty Anti Badai', quantity: 2, itemCategory: 'Alat Masak' },
      { gearCode: 'CS-03', name: 'Cooking Set DS-308 Teko & Pan Komplit', quantity: 1, itemCategory: 'Alat Masak' },
      { gearCode: 'HT-01', name: 'HT Walkie-Talkie Baofeng UV-5R (Radio Tim)', quantity: 2, itemCategory: 'Komunikasi' },
      { gearCode: 'TP-01', name: 'Trekking Pole Duralumin Antishock (Pasang)', quantity: 2, itemCategory: 'Aksesoris' },
      { gearCode: 'PK-01', name: 'Medical Kit P3K Emergency Gunung Komplit', quantity: 1, itemCategory: 'Safety' },
      { gearCode: 'RC-01', name: 'Raincoat Jas Hujan Poncho Arei Waterproof', quantity: 4, itemCategory: 'Aksesoris' }
    ]
  },
  {
    id: 'pkg-family',
    code: 'PKT-FAMILY',
    name: 'Paket Family & Glamping Camp (5-6 Orang)',
    categoryType: 'Family / Glamping',
    tier: 'family',
    targetPerson: '5-6 Orang (Keluarga)',
    description: 'Camping ceria keluarga atau gathering sahabat tanpa ribet. Tenda jumbo berdiri dengan ruang tengah, set meja & kursi lipat outdoor santai, kompor grill BBQ, dan lentera retro.',
    badge: 'Paling Nyaman & Lega',
    badgeColor: 'purple',
    pricePerDay: 245000,
    originalPricePerDay: 350000,
    discountPercent: 30,
    recommendedFor: 'Camp Ranca Upas, Sukamantri, Cibodas, Danau Buyan Bali, Batur Camp',
    highlightFeatures: [
      'Tenda keluarga 6 orang tinggi bisa berdiri leluasa',
      'Meja aluminium lipat + 4 kursi camping dengan sandaran',
      'Kompor koper praktis + grill pan untuk bakar sosis/daging',
      'Lentera camping vintage warm light yang estetik'
    ],
    includedGear: [
      { gearCode: 'TD-04', name: 'Tenda Great Outdoor Camp 6P Family Cabin', quantity: 1, itemCategory: 'Tenda' },
      { gearCode: 'FS-02', name: 'Flysheet Jumbo 4x6 Meter Pelindung Teras', quantity: 1, itemCategory: 'Tenda' },
      { gearCode: 'MJ-01', name: 'Meja Lipat Camping Aluminium Portable', quantity: 1, itemCategory: 'Camp Furniture' },
      { gearCode: 'KR-01', name: 'Kursi Lipat Camping Sandaran Outdoor', quantity: 4, itemCategory: 'Camp Furniture' },
      { gearCode: 'SB-04', name: 'Sleeping Bag Selimut Lembut Tebal', quantity: 4, itemCategory: 'SB/Matras' },
      { gearCode: 'KP-03', name: 'Kompor Koper Portable + Grill BBQ Pan', quantity: 1, itemCategory: 'Alat Masak' },
      { gearCode: 'LP-03', name: 'Lentera Camping Retro Vintage 500 Lumens', quantity: 2, itemCategory: 'Lampu' },
      { gearCode: 'TM-01', name: 'Termos Air Panas Stainless Steel 2L', quantity: 1, itemCategory: 'Alat Masak' }
    ]
  },
  {
    id: 'pkg-tektok',
    code: 'PKT-TEKTOK',
    name: 'Paket Tektok / Fast Summit Attack (1-2 Pendaki)',
    categoryType: 'Fast Hike / Tektok',
    tier: 'hemat',
    targetPerson: '1-2 Orang',
    description: 'Khusus pendaki tektok / trail run yang ingin naik dan turun gunung dalam 1 hari tanpa membawa tenda. Sangat ringan, gesit, dan mengutamakan peralatan wajib safety puncak.',
    badge: 'Ultra Cepat & Ringan',
    badgeColor: 'cyan',
    pricePerDay: 45000,
    originalPricePerDay: 70000,
    discountPercent: 35,
    recommendedFor: 'Tektok Gn. Merbabu via Suwanting/Selo, Gn. Gede 1 hari, Gn. Ungaran, Gn. Kawi',
    highlightFeatures: [
      'Daypack 25-30L ringan dengan sirkulasi punggung empuk',
      'Trekking pole duralumin antishock penopang lutut',
      'Headlamp super terang 1000 lumens untuk jalan malam/subuh',
      'Water bladder 2L & jas hujan poncho darurat'
    ],
    includedGear: [
      { gearCode: 'CR-04', name: 'Daypack Consina Ultralight 25-30 Liter', quantity: 1, itemCategory: 'Carrier' },
      { gearCode: 'TP-01', name: 'Trekking Pole Duralumin Antishock (Pasang)', quantity: 1, itemCategory: 'Aksesoris' },
      { gearCode: 'LP-01', name: 'Headlamp Super Terang 1000 Lumens High-Beam', quantity: 1, itemCategory: 'Lampu' },
      { gearCode: 'WB-01', name: 'Water Bladder Kantong Air Minum 2 Liter', quantity: 1, itemCategory: 'Aksesoris' },
      { gearCode: 'RC-01', name: 'Raincoat Jas Hujan Poncho Ultralight', quantity: 1, itemCategory: 'Aksesoris' },
      { gearCode: 'PK-02', name: 'Mini Emergency Survival First Aid Kit', quantity: 1, itemCategory: 'Safety' }
    ]
  }
];
