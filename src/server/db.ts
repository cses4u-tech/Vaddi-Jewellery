import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'vaddi_jewellery.db');

export const DEFAULT_SHOWROOM_SETTINGS: Record<string, string> = {
  shop_name: 'VADDI Jewellery',
  shop_name_te: 'వద్ధి జ్యువెలరీ',
  tagline: 'Prestigious Heritage Jewellery Showroom',
  tagline_te: 'తరతరాల నమ్మకమైన బంగారు & వెండి షోరూమ్',
  address: 'VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta',
  address_te: 'వి.ఎన్.ఆర్ & బ్రదర్స్, వద్ధి కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట',
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

/**
 * Remove any existing SQLite files on disk if corrupt or malformed.
 */
function cleanCorruptedDbFiles() {
  try {
    const existing = (globalThis as any).__vaddi_cached_db;
    if (existing) {
      try { existing.close(); } catch {}
      (globalThis as any).__vaddi_cached_db = null;
    }
    const walPath = `${DB_PATH}-wal`;
    const shmPath = `${DB_PATH}-shm`;
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  } catch (err) {
    console.error('Error removing corrupted DB files:', err);
  }
}

/**
 * Creates and initializes a fresh SQLite database instance.
 */
function createAndInitDb(): DatabaseSync {
  const db = new DatabaseSync(DB_PATH);
  
  // High-reliability SQLite pragmas
  try {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
    db.exec('PRAGMA temp_store = MEMORY;');
    db.exec('PRAGMA busy_timeout = 5000;');
  } catch (e) {
    console.warn('Pragma warning:', e);
  }

  // Verify DB integrity
  try {
    const checkResult = db.prepare('PRAGMA quick_check;').get() as any;
    const checkVal = checkResult ? Object.values(checkResult)[0] : '';
    if (checkVal && checkVal !== 'ok') {
      throw new Error(`Database integrity check failed: ${checkVal}`);
    }
  } catch (checkErr) {
    console.error('Integrity check error, resetting database:', checkErr);
    throw checkErr;
  }

  initSchema(db);
  (globalThis as any).__vaddi_cached_db = db;
  return db;
}

/**
 * Main database accessor with global singleton caching.
 */
export function getDatabase(): DatabaseSync {
  const cached = (globalThis as any).__vaddi_cached_db;
  if (cached) {
    try {
      cached.prepare('SELECT 1').get();
      return cached;
    } catch (e: any) {
      console.warn('Cached DB connection error, re-initializing...', e);
    }
  }

  try {
    return createAndInitDb();
  } catch (err: any) {
    console.error('Failed to open database. Attempting self-healing recovery...', err);
    return resetAndRecoverDatabase();
  }
}

/**
 * Hard-reset and recover the database from scratch.
 */
export function resetAndRecoverDatabase(): DatabaseSync {
  cleanCorruptedDbFiles();
  return createAndInitDb();
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
      show_price INTEGER DEFAULT 1,
      wastage_percent REAL DEFAULT 10.0,
      wastage_cost REAL DEFAULT 0,
      labour_cost REAL DEFAULT 2500,
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
  try { db.exec('ALTER TABLE products ADD COLUMN wastage_percent REAL DEFAULT 10.0;'); } catch {}
  try { db.exec('ALTER TABLE products ADD COLUMN wastage_cost REAL DEFAULT 0;'); } catch {}
  try { db.exec('ALTER TABLE products ADD COLUMN labour_cost REAL DEFAULT 2500;'); } catch {}
  try { db.exec('ALTER TABLE products ADD COLUMN making_charge_per_gram REAL DEFAULT 0;'); } catch {}
  try { db.exec('ALTER TABLE products ADD COLUMN show_price INTEGER DEFAULT 1;'); } catch {}

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

  // Always ensure all default settings keys exist in the database
  const insertSettingDefault = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(DEFAULT_SHOWROOM_SETTINGS)) {
    insertSettingDefault.run(k, v);
  }

  // 6. Admins
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      last_login TEXT
    );
  `);
  db.prepare('INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?, ?)').run('admin', 'VaddiFamily@PDTR');

  // Check if we need to seed
  const catCount = (db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }).count;
  if (catCount === 0) {
    seedInitialData(db);
  } else {
    // Ensure existing products have show_price = 1 and default wastage/labour if missing
    try {
      db.exec(`
        UPDATE products 
        SET 
          show_price = 1,
          wastage_percent = CASE WHEN (wastage_percent IS NULL OR wastage_percent = 0) AND metal = 'Gold' THEN 10.0 WHEN (wastage_percent IS NULL OR wastage_percent = 0) AND metal = 'Silver' THEN 8.0 ELSE wastage_percent END,
          labour_cost = CASE WHEN (labour_cost IS NULL OR labour_cost = 0) AND metal = 'Gold' THEN 2500 WHEN (labour_cost IS NULL OR labour_cost = 0) AND metal = 'Silver' THEN 650 ELSE labour_cost END
        WHERE wastage_percent IS NULL OR wastage_percent = 0 OR labour_cost IS NULL OR labour_cost = 0 OR show_price = 0;
      `);
      syncAllProductPricesWithSettings(db);
    } catch (e) {
      console.warn('Migration sync warning:', e);
    }
  }
}

export function syncAllProductPricesWithSettings(db: DatabaseSync) {
  try {
    const settingsRows = db.prepare('SELECT * FROM settings').all() as Array<{ key: string; value: string }>;
    const settingsMap: Record<string, number> = {};
    for (const s of settingsRows) {
      settingsMap[s.key] = Number(s.value) || 0;
    }

    const rate24k = settingsMap['gold_rate_24k'] || 7650;
    const rate22k = settingsMap['gold_rate_22k'] || 7020;
    const rate18k = settingsMap['gold_rate_18k'] || 5750;
    const rateSilver = settingsMap['silver_rate'] || 98;

    const prods = db.prepare('SELECT * FROM products').all() as any[];
    const updateStmt = db.prepare('UPDATE products SET price = ?, show_price = 1 WHERE id = ?');

    for (const p of prods) {
      const isGold = (p.metal || '').toLowerCase() === 'gold';
      const purity = (p.purity || '').toUpperCase();

      let gramRate = rate22k;
      if (isGold) {
        if (purity.includes('24K') || purity.includes('999')) gramRate = rate24k;
        else if (purity.includes('18K')) gramRate = rate18k;
        else gramRate = rate22k;
      } else {
        gramRate = rateSilver;
      }

      const weight = Math.max(0, Number(p.weight) || 0);
      const metalBase = Math.round(weight * gramRate);

      let wastageAmount = 0;
      if (p.wastage_cost && Number(p.wastage_cost) > 0) {
        wastageAmount = Math.round(Number(p.wastage_cost));
      } else if (p.wastage_percent && Number(p.wastage_percent) > 0) {
        wastageAmount = Math.round((metalBase * Number(p.wastage_percent)) / 100);
      } else {
        wastageAmount = Math.round((metalBase * (isGold ? 10 : 8)) / 100);
      }

      let labourCost = 0;
      if (p.labour_cost !== undefined && p.labour_cost !== null && Number(p.labour_cost) > 0) {
        labourCost = Math.round(Number(p.labour_cost));
      } else if (p.making_charge_per_gram && Number(p.making_charge_per_gram) > 0) {
        labourCost = Math.round(weight * Number(p.making_charge_per_gram));
      } else {
        labourCost = isGold ? 2500 : 650;
      }

      const calculatedPrice = metalBase + wastageAmount + labourCost;
      updateStmt.run(calculatedPrice, p.id);
    }
  } catch (err) {
    console.error('Error syncing all product prices in DB:', err);
  }
}

function seedInitialData(db: DatabaseSync) {
  // Default Settings
  const defaultSettings: Record<string, string> = {
    shop_name: 'VADDI Jewellery',
    shop_name_te: 'వద్ధి జ్యువెలరీ',
    tagline: 'Prestigious Heritage Jewellery Showroom',
    tagline_te: 'తరతరాల నమ్మకమైన బంగారు & వెండి షోరూమ్',
    address: 'VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta',
    address_te: 'వి.ఎన్.ఆర్ & బ్రదర్స్, వద్ధి కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట',
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

  // Admin user
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

  // Seed Products with Wastage & Labour Cost
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
      wastage_percent: 12.0,
      wastage_cost: 0,
      labour_cost: 6500,
      making_charge_per_gram: 0,
      show_price: 1,
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
      wastage_percent: 11.5,
      wastage_cost: 0,
      labour_cost: 5200,
      making_charge_per_gram: 0,
      show_price: 1,
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
      wastage_percent: 10.0,
      wastage_cost: 0,
      labour_cost: 3800,
      making_charge_per_gram: 0,
      show_price: 1,
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
      weight: 18.2,
      size: 'Height: 1.8 inches',
      wastage_percent: 9.5,
      wastage_cost: 0,
      labour_cost: 2200,
      making_charge_per_gram: 0,
      show_price: 1,
      availability: 'In Stock',
      featured: 0,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_g004_gold_jhumkas.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g004_gold_jhumkas.svg'])
    },
    {
      code: 'VD-G005',
      title: 'Traditional Mangalsutra Double Line Chain',
      title_te: 'సాంప్రదాయ తాళి బొట్టు రెండు పేటల మంగళసూత్ర చైన్',
      metal: 'Gold',
      category: 'Mangalsutra & Thali Chains',
      category_te: 'మంగళసూత్రాలు & తాళి చైన్లు',
      product_type: 'Jewellery',
      purity: '22K BIS 916',
      description: 'Sacred Telugu traditional double-line black bead and 22K gold hand-woven Mangalsutra chain with solid gold thali cups and Lakshmi bottu.',
      description_te: 'రెండు పేటల నల్లపూసలు, 22K స్వచ్ఛమైన బంగారు గుండ్లు మరియు లక్ష్మీ బొట్టుతో కూడిన సంప్రదాయ మంగళసూత్రం.',
      weight: 24.6,
      size: 'Length: 26 inches',
      wastage_percent: 8.5,
      wastage_cost: 0,
      labour_cost: 2800,
      making_charge_per_gram: 0,
      show_price: 1,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_g005_mangalsutra_chain.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g005_mangalsutra_chain.svg'])
    },
    {
      code: 'VD-G006',
      title: '24K Pure Gold Coin - Goddess Lakshmi (999.9 Purity)',
      title_te: '24K స్వచ్ఛమైన బంగారు లక్ష్మీదేవి నాణెం (999.9)',
      metal: 'Gold',
      category: '24K Gold Coins',
      category_te: '24K స్వచ్ఛమైన బంగారు నాణేలు',
      product_type: 'Gold Coin',
      purity: '24K Pure Gold (999)',
      description: 'Tamper-proof certified blister card packaged 24 Karat 999.9 fine gold bullion coin featuring embossed Goddess Lakshmi, with assay certificate.',
      description_te: 'అస్సే ల్యాబ్ ధృవీకరణ పత్రంతో కూడిన 999.9 స్వచ్ఛమైన 24 క్యారెట్ లక్ష్మీదేవి బంగారు నాణెం.',
      weight: 10.0,
      size: 'Diameter: 22mm (In Assay Pack)',
      wastage_percent: 3.0,
      wastage_cost: 0,
      labour_cost: 650,
      making_charge_per_gram: 0,
      show_price: 1,
      availability: 'In Stock',
      featured: 0,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_g006_24k_gold_coin_laxmi.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g006_24k_gold_coin_laxmi.svg'])
    },
    {
      code: 'VD-G007',
      title: 'Handmade Peacock Motif 22K Gold Ring',
      title_te: 'చేతితో తీర్చిదిద్దిన నెమలి డిజైన్ 22K బంగారు ఉంగరం',
      metal: 'Gold',
      category: 'Gold Rings & Vankis',
      category_te: 'బంగారు ఉంగరాలు & వంకీలు',
      product_type: 'Jewellery',
      purity: '22K BIS 916',
      description: 'Exquisitely carved statement peacock cocktail ring in 22K gold with ruby eye accents and micro-beaded filigree feathers.',
      description_te: 'అందమైన నెమలి ఆకృతి, కెంపు అమరికతో తయారైన 22 క్యారెట్ల హాల్‌మార్క్ బంగారు ఉంగరం.',
      weight: 8.4,
      size: 'Ring Size: Indian 14 (Adjustable)',
      wastage_percent: 9.0,
      wastage_cost: 0,
      labour_cost: 1400,
      making_charge_per_gram: 0,
      show_price: 1,
      availability: 'In Stock',
      featured: 0,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_g007_gold_peacock_ring.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g007_gold_peacock_ring.svg'])
    },
    {
      code: 'VD-G008',
      title: 'Gopuram Style South Indian 22K Gold Chain',
      title_te: 'గోపురం నగిషీ 22K పురుషుల బంగారు గొలుసు',
      metal: 'Gold',
      category: 'Gold Chains',
      category_te: 'బంగారు గొలుసులు',
      product_type: 'Jewellery',
      purity: '22K BIS 916',
      description: 'Durable and heavy machine-cut Gopuram link 22K gold chain for men with sturdy S-hook clasp and superior polish.',
      description_te: 'దృఢమైన గోపురం నమూనా గొలుసు, రోజువారీ మరియు పండుగలకు అనువైన ఘనమైన 22 క్యారెట్ డిజైన్.',
      weight: 32.0,
      size: 'Length: 24 inches, Width: 4.5mm',
      wastage_percent: 8.0,
      wastage_cost: 0,
      labour_cost: 2600,
      making_charge_per_gram: 0,
      show_price: 1,
      availability: 'In Stock',
      featured: 0,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_g008_gold_gopuram_chain.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_g008_gold_gopuram_chain.svg'])
    },

    // Silver Products
    {
      code: 'VD-S001',
      title: '92.5 Sterling Silver Divine Ganesha Idol',
      title_te: '92.5 స్వచ్ఛమైన వెండి సిద్ధి వినాయక విగ్రహం',
      metal: 'Silver',
      category: 'Silver God Idols',
      category_te: 'వెండి దేవుడి విగ్రహాలు',
      product_type: 'Idol',
      purity: '92.5 Sterling Silver',
      description: 'Solid handcrafted 92.5 sterling silver Lord Ganesha idol seated on lotus pedestal with antique finish and micro-engravings.',
      description_te: 'తామర పీఠంపై కొలువుదీరిన శ్రీ సిద్ధి వినాయక స్వామి 92.5 వెండి విగ్రహం. నిత్య పూజకు మరియు గృహప్రవేశాలకు అత్యంత శ్రేష్టం.',
      weight: 250.0,
      size: 'Height: 4.2 inches, Base: 3.5 inches',
      wastage_percent: 8.0,
      wastage_cost: 0,
      labour_cost: 1500,
      making_charge_per_gram: 0,
      show_price: 1,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_s001_silver_ganesha_idol.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s001_silver_ganesha_idol.svg'])
    },
    {
      code: 'VD-S002',
      title: '92.5 Sterling Silver Goddess Lakshmi Idol',
      title_te: '92.5 స్వచ్ఛమైన వెండి గజలక్ష్మీ విగ్రహం',
      metal: 'Silver',
      category: 'Silver God Idols',
      category_te: 'వెండి దేవుడి విగ్రహాలు',
      product_type: 'Idol',
      purity: '92.5 Sterling Silver',
      description: 'Auspicious Gajalakshmi silver vigraham in 92.5 sterling silver with elephant attendants and divine Abhaya Hastha blessings.',
      description_te: 'ఐశ్వర్యాన్ని మరియు సుఖశాంతులను ప్రసాదించే 92.5 వెండి గజలక్ష్మీ దేవి మూర్తి.',
      weight: 320.0,
      size: 'Height: 5 inches, Base: 4 inches',
      wastage_percent: 8.0,
      wastage_cost: 0,
      labour_cost: 1800,
      making_charge_per_gram: 0,
      show_price: 1,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 0,
      image_path: '/images/jewellery/vd_s002_silver_lakshmi_idol.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s002_silver_lakshmi_idol.svg'])
    },
    {
      code: 'VD-S003',
      title: 'Pure 92.5 Silver Royal Pooja Thali Set (8 Pieces)',
      title_te: '92.5 స్వచ్ఛమైన వెండి రాజస పూజా తాంబూలం సెట్ (8 వస్తువులు)',
      metal: 'Silver',
      category: 'Silver Pooja Thali Sets',
      category_te: 'వెండి పూజా తాంబూలం సెట్లు',
      product_type: 'Pooja Set',
      purity: '92.5 Sterling Silver',
      description: 'Comprehensive 8-piece pure silver pooja set including embossed Plate (11 inch), Kamakshi Diya pair, Kalash, Bell, Chandan cup, and Agarbatti stand.',
      description_te: '11 అంగుళాల వెండి ప్లేట్, కామాక్షి దీపాలు, కలశం, గంట, చందన పాత్రలతో కూడిన సంపూర్ణ పూజా సామగ్రి సెట్.',
      weight: 550.0,
      size: 'Plate Diameter: 11 inches',
      wastage_percent: 8.0,
      wastage_cost: 0,
      labour_cost: 3200,
      making_charge_per_gram: 0,
      show_price: 1,
      availability: 'In Stock',
      featured: 1,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_s003_silver_pooja_thali_set.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s003_silver_pooja_thali_set.svg'])
    },
    {
      code: 'VD-S004',
      title: '92.5 Silver Sacred Kalash with Coconut & Mango Leaves',
      title_te: '92.5 వెండి పూర్ణకుంభ కలశం (కొబ్బరికాయ & ఆకులతో)',
      metal: 'Silver',
      category: 'Silver Kalash & Pooja Articles',
      category_te: 'వెండి కలశాలు & పూజా వస్తువులు',
      product_type: 'Pooja Article',
      purity: '92.5 Sterling Silver',
      description: 'Traditional Purna Kumbha Kalash handcrafted in 92.5 silver with detachable silver Nariyal (coconut) and 5 sacred silver mango leaves.',
      description_te: 'వరలక్ష్మీ వ్రతం, గృహప్రవేశాలకు అనువైన పరిపూర్ణమైన 92.5 వెండి పూర్ణకుంభ కలశం.',
      weight: 280.0,
      size: 'Height: 7 inches with Nariyal',
      wastage_percent: 8.0,
      wastage_cost: 0,
      labour_cost: 1600,
      making_charge_per_gram: 0,
      show_price: 1,
      availability: 'In Stock',
      featured: 0,
      new_arrival: 1,
      image_path: '/images/jewellery/vd_s004_silver_kalash_nariyal.svg',
      image_paths: JSON.stringify(['/images/jewellery/vd_s004_silver_kalash_nariyal.svg'])
    },
    {
      code: 'VD-S005',
      title: 'Traditional Pure Silver Payal / Anklets with Bells (Pair)',
      title_te: 'సాంప్రదాయ స్వచ్ఛమైన వెండి పట్టీలు / గజ్జెలు (జత)',
      metal: 'Silver',
      category: 'Silver Payal & Anklets',
      category_te: 'వెండి పట్టీలు & గజ్జెలు',
      product_type: 'Jewellery',
      purity: '92.5 Sterling Silver',
      description: 'Traditional solid sterling silver payal pair adorned with melodious hanging silver ghungroo bells and secure S-hook locks.',
      description_te: 'మధురమైన గజ్జెల సవ్వడితో, దృఢమైన అల్లికతో కూడిన సంప్రదాయ వెండి పట్టీల జత.',
      weight: 120.0,
      size: 'Length: 10.5 inches (Standard)',
      wastage_percent: 7.5,
      wastage_cost: 0,
      labour_cost: 950,
      making_charge_per_gram: 0,
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
      wastage_percent: 7.5,
      wastage_cost: 0,
      labour_cost: 1200,
      making_charge_per_gram: 0,
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
      wastage_percent: 7.0,
      wastage_cost: 0,
      labour_cost: 650,
      making_charge_per_gram: 0,
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
      wastage_percent: 7.0,
      wastage_cost: 0,
      labour_cost: 750,
      making_charge_per_gram: 0,
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
      wastage_percent: 8.5,
      wastage_cost: 0,
      labour_cost: 1950,
      making_charge_per_gram: 0,
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
      wastage_percent, wastage_cost, labour_cost, making_charge_per_gram,
      availability, featured, new_arrival, image_path, image_paths
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  for (const p of products) {
    // Initial dynamic price calculation
    const rate = (p.metal === 'Gold') 
      ? (p.purity.includes('24K') ? 7650 : (p.purity.includes('18K') ? 5750 : 7020))
      : 98;
    const baseMetal = Math.round(p.weight * rate);
    const wastage = Math.round((baseMetal * p.wastage_percent) / 100);
    const autoPrice = baseMetal + wastage + p.labour_cost;

    insertProd.run(
      p.code, p.title, p.title_te, p.metal, p.category, p.category_te, p.product_type,
      p.purity, p.description, p.description_te, p.weight, p.size, autoPrice, p.show_price,
      p.wastage_percent, p.wastage_cost, p.labour_cost, p.making_charge_per_gram,
      p.availability, p.featured, p.new_arrival, p.image_path, p.image_paths
    );
  }

  // Seed Customer Reviews
  const reviews = [
    {
      name: 'Ramesh Reddy (రమేష్ రెడ్డి)',
      rating: 5,
      review: 'Purchased 22K Lakshmi Kasu Haram for my daughter wedding in Proddatur. Purity, hallmark certification and customer respect at VADDI Jewellery is unmatched!',
      review_te: 'మా అమ్మాయి పెళ్ళికి 22K లక్ష్మీ కాసుల హారం తీసుకున్నాము. ప్రొద్దుటూరులో హాల్‌మార్క్ నమ్మకం, స్వచ్ఛత మరియు మర్యాదలో వద్ధి జ్యువెలరీకి సాటి ఎవరూ లేరు!',
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
