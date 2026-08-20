import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'vaddi_jewellery.db');

export function getDatabase(): DatabaseSync {
  const db = new DatabaseSync(DB_PATH);
  initSchema(db);
  return db;
}

function initSchema(db: DatabaseSync) {
  // 1. Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_te TEXT NOT NULL,
      metal TEXT NOT NULL, -- 'Gold' | 'Silver'
      slug TEXT UNIQUE NOT NULL,
      image_path TEXT,
      sort_order INTEGER DEFAULT 0
    );
  `);

  // 2. Products
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      title_te TEXT,
      metal TEXT NOT NULL, -- 'Gold' | 'Silver'
      category TEXT NOT NULL,
      category_te TEXT,
      product_type TEXT NOT NULL DEFAULT 'Jewellery',
      purity TEXT NOT NULL,
      description TEXT,
      description_te TEXT,
      weight REAL NOT NULL,
      size TEXT,
      price REAL,
      show_price INTEGER DEFAULT 0,
      wastage_percent REAL DEFAULT 0,
      wastage_cost REAL DEFAULT 0,
      labour_cost REAL DEFAULT 0,
      making_charge_per_gram REAL DEFAULT 0,
      availability TEXT DEFAULT 'In Stock',
      featured INTEGER DEFAULT 0,
      new_arrival INTEGER DEFAULT 0,
      image_path TEXT NOT NULL,
      image_paths TEXT NOT NULL, -- JSON array of image paths
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Safe schema migrations for existing DB
  try { db.exec('ALTER TABLE products ADD COLUMN wastage_percent REAL DEFAULT 0;'); } catch {}
  try { db.exec('ALTER TABLE products ADD COLUMN wastage_cost REAL DEFAULT 0;'); } catch {}
  try { db.exec('ALTER TABLE products ADD COLUMN labour_cost REAL DEFAULT 0;'); } catch {}
  try { db.exec('ALTER TABLE products ADD COLUMN making_charge_per_gram REAL DEFAULT 0;'); } catch {}

  // 3. Enquiries
  db.exec(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      product_id INTEGER,
      product_code TEXT,
      product_title TEXT,
      message TEXT,
      status TEXT DEFAULT 'New', -- 'New' | 'Contacted' | 'Completed' | 'Cancelled'
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 4. Reviews
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      review TEXT NOT NULL,
      review_te TEXT,
      verified INTEGER DEFAULT 1,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 5. Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 6. Admins
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      last_login TEXT
    );
  `);

  // Check if we need to seed
  const catCount = (db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }).count;
  if (catCount === 0) {
    seedInitialData(db);
  }
}

function seedInitialData(db: DatabaseSync) {
  // Default Settings
  const defaultSettings: Record<string, string> = {
    shop_name: 'VADDI Jewellery',
    shop_name_te: 'వధి జ్యువెలరీ',
    tagline: 'Prestigious Heritage Jewellery Showroom',
    tagline_te: 'తరతరాల నమ్మకమైన బంగారు & వెండి షోరూమ్',
    address: 'VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta',
    address_te: 'వి.ఎన్.ఆర్ & బ్రదర్స్, వధి కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట',
    city_state_pincode: 'Proddatur, Andhra Pradesh 516360, India',
    city_state_pincode_te: 'ప్రొద్దుటూరు, ఆంధ్రప్రదేశ్ 516360, భారతదేశం',
    phone: '+91 9650052262',
    whatsapp: '+919650052262',
    google_maps_url: 'https://maps.app.goo.gl/LcQVnVkd3HuDWsgi9',
    opening_hours: 'Monday - Sunday: 10:00 AM - 9:30 PM',
    opening_hours_te: 'సోమవారం - ఆదివారం: ఉదయం 10:00 - రాత్రి 9:30',
    gold_rate_24k: '7650',
    gold_rate_22k: '7020',
    gold_rate_18k: '5750',
    silver_rate: '98',
    hero_title: 'Timeless Gold & Silver Elegance in Proddatur',
    hero_title_te: 'ప్రొద్దుటూరులో తరతరాల బంగారు, వెండి వైభవం',
    hero_subtitle: 'Discover authentic 22K BIS Hallmarked gold jewellery, pure 92.5 sterling silver articles, sacred idols, and bespoke heirloom craftsmanship.',
    hero_subtitle_te: '100% BIS హాల్మార్క్ కలిగిన 22K బంగారు ఆభరణాలు, 92.5 వెండి పూజా సామాగ్రి, దైవ విగ్రహాలు మరియు ప్రత్యేకమైన కస్టమ్ డిజైన్లు.'
  };

  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(defaultSettings)) {
    insertSetting.run(k, v);
  }

  // Admin user: admin / VaddiFamily@PDTR (hash representation)
  db.prepare('INSERT OR REPLACE INTO admins (username, password_hash) VALUES (?, ?)').run('admin', 'VaddiFamily@PDTR');

  // Categories
  const categories = [
    // Gold Categories
    { name: 'Gold Harams & Necklaces', name_te: 'బంగారు హారాలు & నెక్లెస్‌లు', metal: 'Gold', slug: 'gold-harams-necklaces', sort_order: 1 },
    { name: 'Gold Bangles & Kadas', name_te: 'బంగారు గాజులు & కడాలు', metal: 'Gold', slug: 'gold-bangles-kadas', sort_order: 2 },
    { name: 'Mangalsutra & Thali Chains', name_te: 'మంగళసూత్రాలు & తాళి చైన్లు', metal: 'Gold', slug: 'mangalsutra-chains', sort_order: 3 },
    { name: 'Gold Jhumkas & Earrings', name_te: 'బంగారు బుట్టలు & దిద్దులు', metal: 'Gold', slug: 'gold-jhumkas-earrings', sort_order: 4 },
    { name: 'Gold Rings & Vankis', name_te: 'బంగారు ఉంగరాలు & వంకీలు', metal: 'Gold', slug: 'gold-rings-vankis', sort_order: 5 },
    { name: 'Gold Chains', name_te: 'బంగారు గొలుసులు', metal: 'Gold', slug: 'gold-chains', sort_order: 6 },
    { name: '24K Gold Coins', name_te: '24K స్వచ్ఛమైన బంగారు నాణేలు', metal: 'Gold', slug: 'gold-coins', sort_order: 7 },

    // Silver Categories
    { name: 'Silver God Idols', name_te: 'వెండి దేవుడి విగ్రహాలు', metal: 'Silver', slug: 'silver-god-idols', sort_order: 8 },
    { name: 'Silver Pooja Thali Sets', name_te: 'వెండి పూజా తాంబూలం సెట్లు', metal: 'Silver', slug: 'silver-pooja-thali-sets', sort_order: 9 },
    { name: 'Silver Kalash & Pooja Articles', name_te: 'వెండి కలశాలు & పూజా వస్తువులు', metal: 'Silver', slug: 'silver-kalash-pooja', sort_order: 10 },
    { name: 'Silver Payal & Anklets', name_te: 'వెండి పట్టీలు & గజ్జెలు', metal: 'Silver', slug: 'silver-payal-anklets', sort_order: 11 },
    { name: 'Silver Kamakshi Diyas & Lamps', name_te: 'వెండి కామాక్షి దీపాలు', metal: 'Silver', slug: 'silver-diyas-lamps', sort_order: 12 },
    { name: 'Silver Bowls & Tumblers', name_te: 'వెండి గిన్నెలు & గ్లాసులు', metal: 'Silver', slug: 'silver-bowls-tumblers', sort_order: 13 },
    { name: 'Silver Gifts & Articles', name_te: 'వెండి కానుకలు & వస్తువులు', metal: 'Silver', slug: 'silver-gifts-articles', sort_order: 14 }
  ];

  const insertCat = db.prepare(`
    INSERT INTO categories (name, name_te, metal, slug, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const c of categories) {
    insertCat.run(c.name, c.name_te, c.metal, c.slug, c.sort_order);
  }

  // Seed Products
  const products = [
    {
      code: 'VD-G001',
      title: 'Traditional Temple Lakshmi Kasu Haram',
      title_te: 'సాంప్రదాయ ఆలయ లక్ష్మీ కాసుల హారం',
      metal: 'Gold',
      category: 'Gold Harams & Necklaces',
      category_te: 'బంగారు హారాలు & నెక్లెస్‌లు',
      product_type: 'Jewellery',
      purity: '22K BIS 916',
      description: 'Handcrafted 22K hallmarked South Indian heritage Kasu Haram with intricately embossed Goddess Lakshmi motifs, rubies, emeralds, and freshwater pearl drops.',
      description_te: 'సహజమైన రూబీ, ఎమరాల్డ్ రాళ్ళు మరియు స్వచ్ఛమైన ముత్యాల అమరికతో కూడిన అద్భుతమైన 22 క్యారెట్ల బిఐఎస్ హాల్‌మార్క్ లక్ష్మీ కాసుల హారం.',
      weight: 62.4,
      size: '22 inches with adjustable gold dori',
      price: 438000,
      show_price: 0,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_g001_gold_lakshmi_haram.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g001_gold_lakshmi_haram.svg'])
    },
    {
      code: 'VD-G002',
      title: 'Royal Antique Bridal Choker Set',
      title_te: 'రాయల్ యాంటిక్ పెళ్ళిళ్ల చోకర్ సెట్',
      metal: 'Gold',
      category: 'Gold Harams & Necklaces',
      category_te: 'బంగారు హారాలు & నెక్లెస్‌లు',
      product_type: 'Jewellery',
      purity: '22K BIS 916',
      description: 'Stunning 22K antique matte finish choker with carved peacock filigree work, fine un-cut rubies and cultured pearl hangings.',
      description_te: 'నెమలి చెక్కడాలు, సున్నితమైన కెంపులు మరియు ముత్యాల తోరణాలతో రూపొందించిన రాయల్ యాంటిక్ ఫినిష్ చోకర్.',
      weight: 48.2,
      size: 'Standard Choker Collar',
      price: 338000,
      show_price: 0,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_g002_gold_antique_choker.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g002_gold_antique_choker.svg'])
    },
    {
      code: 'VD-G003',
      title: '22K Traditional Nakshi Gold Bangles (Pair)',
      title_te: '22K సాంప్రదాయ నక్షి బంగారు గాజులు (జత)',
      metal: 'Gold',
      category: 'Gold Bangles & Kadas',
      category_te: 'బంగారు గాజులు & కడాలు',
      product_type: 'Jewellery',
      purity: '22K BIS 916',
      description: 'Solid 22K BIS hallmarked heritage Nakshi work bangles with detailed embossed floral and temple carvings. Available in sizes 2.4, 2.6, 2.8.',
      description_te: 'విశిష్టమైన నక్షి పనితనంతో కూడిన బరువైన 22 క్యారెట్ బంగారు గాజుల జత. సైజులు: 2.4, 2.6, 2.8 అందుబాటులో ఉన్నాయి.',
      weight: 36.5,
      size: 'Size 2.6 (Custom sizes available)',
      price: 256000,
      show_price: 0,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_g003_22k_gold_bangles.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g003_22k_gold_bangles.svg'])
    },
    {
      code: 'VD-G004',
      title: 'Heritage 22K Gold Jhumkas with Ruby Studs',
      title_te: 'సాంప్రదాయ 22K బంగారు బుట్టలు (కెంపులతో)',
      metal: 'Gold',
      category: 'Gold Jhumkas & Earrings',
      category_te: 'బంగారు బుట్టలు & దిద్దులు',
      product_type: 'Jewellery',
      purity: '22K BIS 916',
      description: 'Classic bell-shaped 22K gold jhumkas adorned with natural ruby studs, delicate filigree bell domes, and hanging South Sea seed pearls.',
      description_te: 'పవిత్రమైన పండుగలకు మరియు వివాహాలకు అత్యంత శోభనిచ్చే 22 క్యారెట్ హాల్‌మార్క్ బంగారు బుట్టలు.',
      weight: 22.8,
      size: 'Length: 48mm',
      price: 160000,
      show_price: 0,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_g004_gold_jhumkas.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g004_gold_jhumkas.svg'])
    },
    {
      code: 'VD-G005',
      title: 'Sacred 22K Telugu Double-Bottu Mangalsutra Chain',
      title_te: 'పవిత్రమైన 22K తెలుగు డబుల్-బొట్టు మంగళసూత్రం చైన్',
      metal: 'Gold',
      category: 'Mangalsutra & Thali Chains',
      category_te: 'మంగళసూత్రాలు & తాళి చైన్లు',
      product_type: 'Jewellery',
      purity: '22K BIS 916',
      description: 'Traditional Telugu double-bottu sacred mangalsutra handcrafted with black spinels, 22K gold beads, and auspicious thali vatis.',
      description_te: 'సాంప్రదాయ తెలుగు డబుల్ బొట్టు, నల్లపూసలు మరియు 22 క్యారెట్ స్వచ్ఛమైన బంగారు పూసల మంగళసూత్రం.',
      weight: 28.5,
      size: 'Length: 28 inches',
      price: 200000,
      show_price: 0,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_g005_mangalsutra_chain.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g005_mangalsutra_chain.svg'])
    },
    {
      code: 'VD-G006',
      title: '24K (999.9) Pure Gold Lakshmi Coin - 10 Grams',
      title_te: '24K (999.9) స్వచ్ఛమైన లక్ష్మీ బంగారు నాణెం - 10 గ్రాములు',
      metal: 'Gold',
      category: '24K Gold Coins',
      category_te: '24K స్వచ్ఛమైన బంగారు నాణేలు',
      product_type: 'Coin',
      purity: '24K 999.9',
      description: 'Government certified 999.9 highest purity 24 Karat gold coin featuring Goddess Lakshmi and embossed VADDI Jewellery authenticity mark. Sealed tamper-proof packaging.',
      description_te: '999.9 అత్యున్నత స్వచ్ఛత గల 24 క్యారెట్ల లక్ష్మీ దేవి బంగారు నాణెం. శుభకార్యాలకు, బహుమతులకు మరియు భవిష్యత్ పొదుపుకు ఉత్తమమైనది.',
      weight: 10.0,
      size: 'Diameter: 22mm',
      price: 76500,
      show_price: 1,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_g006_24k_gold_coin_laxmi.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g006_24k_gold_coin_laxmi.svg'])
    },
    {
      code: 'VD-G007',
      title: 'Royal 22K Gold Peacock Cocktail Ring',
      title_te: 'రాయల్ 22K బంగారు నెమలి డిజైన్ ఉంగరం',
      metal: 'Gold',
      category: 'Gold Rings & Vankis',
      category_te: 'బంగారు ఉంగరాలు & వంకీలు',
      product_type: 'Jewellery',
      purity: '22K BIS 916',
      description: 'Magnificent peacock statement cocktail ring sculpted in 22K gold with ruby crown accents and emerald feathers.',
      description_te: 'కెంపులు మరియు పచ్చల అందాలతో కళాత్మకంగా రూపొందించిన 22 క్యారెట్ రాయల్ నెమలి డిజైన్ ఉంగరం.',
      weight: 11.2,
      size: 'Adjustable size (Fits 12-18)',
      price: 78600,
      show_price: 0,
      availability: 'In Stock',
      featured: 0,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_g007_gold_peacock_ring.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g007_gold_peacock_ring.svg'])
    },
    {
      code: 'VD-G008',
      title: 'Handcrafted 22K Gold Gopuram Mopu Chain',
      title_te: 'చేతితో తీర్చిదిద్దిన 22K గోపురం మోపు బంగారు గొలుసు',
      metal: 'Gold',
      category: 'Gold Chains',
      category_te: 'బంగారు గొలుసులు',
      product_type: 'Jewellery',
      purity: '22K BIS 916',
      description: 'Triple strand handcrafted heavy gold chain with traditional temple gopuram side-mopu links and sturdy clasp.',
      description_te: 'దృఢమైన అల్లిక మరియు గోపురం నమూనా సైడ్ మోపుతో కూడిన 22 క్యారెట్ హాల్‌మార్క్ బంగారు గొలుసు.',
      weight: 32.0,
      size: 'Length: 24 inches',
      price: 224000,
      show_price: 0,
      availability: 'In Stock',
      featured: 0,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_g008_gold_gopuram_chain.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g008_gold_gopuram_chain.svg'])
    },

    // Silver Products
    {
      code: 'VD-S001',
      title: '92.5 Sterling Silver Lord Ganesha Idol on Peedam',
      title_te: '92.5 స్వచ్ఛమైన వెండి పీఠంపై విఘ్నేశ్వర విగ్రహం',
      metal: 'Silver',
      category: 'Silver God Idols',
      category_te: 'వెండి దేవుడి విగ్రహాలు',
      product_type: 'Idol',
      purity: '92.5 Sterling Silver',
      description: 'Intricately handcrafted 92.5 certified sterling silver Ganesha idol seated on a carved prabhavali arch peedam with modak and mushika vehicle.',
      description_te: 'గృహ ప్రవేశాలు, నిత్య పూజ మరియు వ్యాపార ప్రారంభోత్సవాలకు అత్యంత శుభప్రదమైన 92.5 వెండి వినాయక విగ్రహం.',
      weight: 350.0,
      size: 'Height: 6 inches, Width: 4.5 inches',
      price: 34300,
      show_price: 1,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_s001_silver_ganesha_idol.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s001_silver_ganesha_idol.svg'])
    },
    {
      code: 'VD-S002',
      title: '92.5 Sterling Silver Mahalakshmi Idol with Prabhavali',
      title_te: '92.5 వెండి ప్రభావళితో కూడిన మహాలక్ష్మీ దేవి విగ్రహం',
      metal: 'Silver',
      category: 'Silver God Idols',
      category_te: 'వెండి దేవుడి విగ్రహాలు',
      product_type: 'Idol',
      purity: '92.5 Sterling Silver',
      description: 'Divine 92.5 pure silver Mahalakshmi idol seated on a blooming lotus pedestal with showering wealth posture and radiant prabhavali.',
      description_te: 'సంపూర్ణ ఐశ్వర్యాన్ని, సుఖశాంతులను ప్రసాదించే కళాత్మక 92.5 స్వచ్ఛమైన వెండి మహాలక్ష్మి అమ్మవారి విగ్రహం.',
      weight: 420.0,
      size: 'Height: 7 inches',
      price: 41160,
      show_price: 1,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_s002_silver_lakshmi_idol.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s002_silver_lakshmi_idol.svg'])
    },
    {
      code: 'VD-S003',
      title: 'Sterling Silver Royal Pooja Thali Set (7 Pieces)',
      title_te: 'రాయల్ 92.5 వెండి పూజా తాంబూలం సెట్ (7 వస్తువులు)',
      metal: 'Silver',
      category: 'Silver Pooja Thali Sets',
      category_te: 'వెండి పూజా తాంబూలం సెట్లు',
      product_type: 'Pooja Article',
      purity: '92.5 Sterling Silver',
      description: 'Complete 7-piece 92.5 silver royal pooja set: 11-inch engraved pooja thali, 2 Kamakshi diyas, silver kalash, kumkum katori, chandan katori, and silver pooja bell.',
      description_te: '11 అంగుళాల వెండి తాంబూలం, 2 దీపాలు, కలశం, కుంకుమ భరిణె, గంధం గిన్నె మరియు వెండి గంటతో కూడిన సంపూర్ణ పూజా సెట్.',
      weight: 680.0,
      size: 'Thali Diameter: 11 inches',
      price: 66640,
      show_price: 1,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_s003_silver_pooja_thali_set.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s003_silver_pooja_thali_set.svg'])
    },
    {
      code: 'VD-S004',
      title: '92.5 Sterling Silver Kalash with Silver Coconut & Leaves',
      title_te: '92.5 వెండి కలశం (వెండి కొబ్బరికాయ & మామిడాకులతో)',
      metal: 'Silver',
      category: 'Silver Kalash & Pooja Articles',
      category_te: 'వెండి కలశాలు & పూజా వస్తువులు',
      product_type: 'Pooja Article',
      purity: '92.5 Sterling Silver',
      description: 'Auspicious pure silver pooja kalash ensemble featuring floral pot, removable silver coconut (nariyal) and 5 sacred silver mango leaves.',
      description_te: 'వరలక్ష్మీ వ్రతం, సత్యనారాయణ వ్రతం మరియు పవిత్ర పూజల కొరకు రూపొందించిన 92.5 స్వచ్ఛమైన వెండి కలశం.',
      weight: 240.0,
      size: 'Height: 7.5 inches',
      price: 23520,
      show_price: 1,
      availability: 'In Stock',
      featured: 0,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_s004_silver_kalash_nariyal.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s004_silver_kalash_nariyal.svg'])
    },
    {
      code: 'VD-S005',
      title: 'Handcrafted Sterling Silver Ghungroo Payal / Anklets (Pair)',
      title_te: 'చేతితో అల్లిన స్వచ్ఛమైన వెండి పట్టీలు / గజ్జెలు (జత)',
      metal: 'Silver',
      category: 'Silver Payal & Anklets',
      category_te: 'వెండి పట్టీలు & గజ్జెలు',
      product_type: 'Jewellery',
      purity: '92.5 Sterling Silver',
      description: 'Traditional solid sterling silver payal pair adorned with melodious hanging silver ghungroo bells and secure S-hook locks.',
      description_te: 'మధురమైన గజ్జెల సవ్వడితో, దృఢమైన అల్లికతో కూడిన సంప్రదాయ వెండి పట్టీల జత.',
      weight: 120.0,
      size: 'Length: 10.5 inches (Standard)',
      price: 11760,
      show_price: 1,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_s005_silver_payal_anklets.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s005_silver_payal_anklets.svg'])
    },
    {
      code: 'VD-S006',
      title: '92.5 Silver Kamakshi Deepam / Diya (Pair)',
      title_te: '92.5 వెండి కామాక్షి దీపాలు (జత)',
      metal: 'Silver',
      category: 'Silver Kamakshi Diyas & Lamps',
      category_te: 'వెండి కామాక్షి దీపాలు',
      product_type: 'Pooja Article',
      purity: '92.5 Sterling Silver',
      description: 'Pair of sacred silver Kamakshi deepams with embossed Goddess Lakshmi & Kamakshi figures and steady pedestal bases for daily temple pooja.',
      description_te: 'నిత్య దీపారాధనకు మరియు పూజా మందిర శోభకు అనువైన 92.5 స్వచ్ఛమైన వెండి కామాక్షి దీపాల జత.',
      weight: 180.0,
      size: 'Height: 4.5 inches',
      price: 17640,
      show_price: 1,
      availability: 'In Stock',
      featured: 0,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_s006_silver_kamakshi_diya.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s006_silver_kamakshi_diya.svg'])
    },
    {
      code: 'VD-S007',
      title: '92.5 Sterling Silver Embossed Pooja Bowl / Katori',
      title_te: '92.5 వెండి చెక్కడాల పూజా గిన్నె / కటోరి',
      metal: 'Silver',
      category: 'Silver Bowls & Tumblers',
      category_te: 'వెండి గిన్నెలు & గ్లాసులు',
      product_type: 'Silver Article',
      purity: '92.5 Sterling Silver',
      description: 'Heavy gauge pure silver prasad bowl with floral rim engraving, ideal for naivedyam and festive gifting.',
      description_te: 'నైవేద్య సమర్పణకు మరియు విశిష్ట కానుకలకు అత్యంత అనువైన 92.5 వెండి గిన్నె.',
      weight: 95.0,
      size: 'Diameter: 4 inches',
      price: 9310,
      show_price: 1,
      availability: 'In Stock',
      featured: 0,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_s007_silver_katori_bowl.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s007_silver_katori_bowl.svg'])
    },
    {
      code: 'VD-S008',
      title: 'Pure 92.5 Sterling Silver Traditional Tumbler / Glass',
      title_te: '92.5 స్వచ్ఛమైన వెండి సాంప్రదాయ గ్లాసు',
      metal: 'Silver',
      category: 'Silver Bowls & Tumblers',
      category_te: 'వెండి గిన్నెలు & గ్లాసులు',
      product_type: 'Silver Article',
      purity: '92.5 Sterling Silver',
      description: 'Mirror-polished 92.5 silver traditional drinking tumbler with fine filigree ring engravings. Ayurvedic wellness certified purity.',
      description_te: 'ఆయుర్వేద ఆరోగ్య ప్రయోజనాలతో, స్వచ్ఛమైన 92.5 వెండితో తయారుచేసిన సాంప్రదాయ వెండి గ్లాసు.',
      weight: 110.0,
      size: 'Height: 3.8 inches, Capacity: 250ml',
      price: 10780,
      show_price: 1,
      availability: 'In Stock',
      featured: 0,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_s008_silver_glass_tumbler.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s008_silver_glass_tumbler.svg'])
    },
    {
      code: 'VD-S009',
      title: '92.5 Sterling Silver Sacred Kamadhenu Cow & Calf Idol',
      title_te: '92.5 వెండి పవిత్ర కామధేను గోమాత & దూడ విగ్రహం',
      metal: 'Silver',
      category: 'Silver God Idols',
      category_te: 'వెండి దేవుడి విగ్రహాలు',
      product_type: 'Idol',
      purity: '92.5 Sterling Silver',
      description: 'Exquisite silver Kamadhenu idol symbolizing eternal prosperity, maternal bliss and divine blessings for home and office sanctum.',
      description_te: 'సర్వ సంపదలను, సకల శుభాలను చేకూర్చే 92.5 వెండి కామధేనువు మరియు దూడ విగ్రహం.',
      weight: 290.0,
      size: 'Length: 5.5 inches, Height: 4 inches',
      price: 28420,
      show_price: 1,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_s009_silver_cow_calf_kamadhenu.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s009_silver_cow_calf_kamadhenu.svg'])
    }
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (
      code, title, title_te, metal, category, category_te, product_type,
      purity, description, description_te, weight, size, price, show_price,
      availability, featured, new_arrival, image_path, image_paths
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  for (const p of products) {
    insertProd.run(
      p.code, p.title, p.title_te, p.metal, p.category, p.category_te, p.product_type,
      p.purity, p.description, p.description_te, p.weight, p.size, p.price, p.show_price,
      p.availability, p.featured, p.new_arrival, p.image_path, p.image_paths
    );
  }

  // Seed Customer Reviews
  const reviews = [
    {
      name: 'Ramesh Reddy (రమేష్ రెడ్డి)',
      rating: 5,
      review: 'Purchased 22K Lakshmi Kasu Haram for my daughter wedding in Proddatur. Purity, hallmark certification and customer respect at VADDI Jewellery is unmatched!',
      review_te: 'మా అమ్మాయి పెళ్ళికి 22K లక్ష్మీ కాసుల హారం తీసుకున్నాము. ప్రొద్దుటూరులో హాల్‌మార్క్ నమ్మకం, స్వచ్ఛత మరియు మర్యాదలో వడ్డీ జ్యువెలరీకి సాటి ఎవరూ లేరు!',
      verified: 1,
      date: '12 Feb 2026'
    },
    {
      name: 'Lakshmi Prasanna (లక్ష్మీ ప్రసన్న)',
      rating: 5,
      review: 'Got a pure 92.5 silver Royal Pooja Thali set and Ganesha idol. The craftsmanship is divine and weights were 100% accurate on digital scale.',
      review_te: '92.5 వెండి పూజా తాంబూలం సెట్ మరియు వినాయక విగ్రహం కొన్నాము. నగిషీ పనితనం అద్భుతం, డిజిటల్ తూకంలో కూడా నూటికి నూరు శాతం ఖచ్చితత్వం చూపించారు.',
      verified: 1,
      date: '28 Jan 2026'
    },
    {
      name: 'Venkata Subbaiah Setty (వెంకట సుబ్బయ్య శెట్టి)',
      rating: 5,
      review: 'Our family has been trusting VADDI showroom for 3 generations in Sarvakatta. Transparent wastage/making charges and true traditional craftsmanship.',
      review_te: 'మా కుటుంబం 3 తరాలుగా సర్వకట్టలోని వడ్డీ షోరూమ్‌నే నమ్ముతోంది. తరుగు, మజూరీలలో పూర్తి పారదర్శకత మరియు సాంప్రదాయ విశ్వసనీయత!',
      verified: 1,
      date: '15 Jan 2026'
    }
  ];

  const insertReview = db.prepare(`
    INSERT INTO reviews (name, rating, review, review_te, verified, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const r of reviews) {
    insertReview.run(r.name, r.rating, r.review, r.review_te, r.verified, r.date);
  }
}
