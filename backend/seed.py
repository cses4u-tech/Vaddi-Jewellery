import json
from database import get_db_connection, init_db

def seed_db():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if products already exist
    cursor.execute('SELECT COUNT(*) as cnt FROM products')
    if cursor.fetchone()['cnt'] > 0:
        print("Database already contains data, skipping seed.")
        conn.close()
        return

    # Settings
    default_settings = {
        'shop_name': 'VADDI Jewellery',
        'shop_name_te': 'వడ్డీ జ్యువెలరీ',
        'tagline': 'Prestigious Heritage Jewellery Showroom',
        'tagline_te': 'తరతరాల నమ్మకమైన బంగారు & వెండి షోరూమ్',
        'address': 'VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta',
        'address_te': 'వి.ఎన్.ఆర్ & బ్రదర్స్, వడ్డీ కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట',
        'city_state_pincode': 'Proddatur, Andhra Pradesh 516360, India',
        'city_state_pincode_te': 'ప్రొద్దుటూరు, ఆంధ్రప్రదేశ్ 516360, భారతదేశం',
        'phone': '+91 9650052262',
        'whatsapp': '+919650052262',
        'google_maps_url': 'https://maps.app.goo.gl/LcQVnVkd3HuDWsgi9',
        'opening_hours': 'Monday - Sunday: 10:00 AM - 9:30 PM',
        'opening_hours_te': 'సోమవారం - ఆదివారం: ఉదయం 10:00 - రాత్రి 9:30',
        'gold_rate_24k': '7650',
        'gold_rate_22k': '7020',
        'gold_rate_18k': '5750',
        'silver_rate': '98',
        'hero_title': 'Timeless Gold & Silver Elegance in Proddatur',
        'hero_title_te': 'ప్రొద్దుటూరులో తరతరాల బంగారు, వెండి వైభవం',
        'hero_subtitle': 'Discover authentic 22K BIS Hallmarked gold jewellery, pure 92.5 sterling silver articles, sacred idols, and bespoke heirloom craftsmanship.',
        'hero_subtitle_te': '100% BIS హాల్మార్క్ కలిగిన 22K బంగారు ఆభరణాలు, 92.5 వెండి పూజా సామాగ్రి, దైవ విగ్రహాలు మరియు ప్రత్యేకమైన కస్టమ్ డిజైన్లు.'
    }

    for k, v in default_settings.items():
        cursor.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', (k, v))

    cursor.execute('INSERT OR REPLACE INTO admins (username, password_hash) VALUES (?, ?)', ('admin', 'VaddiFamily@PDTR'))

    categories = [
        ('Gold Harams & Necklaces', 'బంగారు హారాలు & నెక్లెస్‌లు', 'Gold', 'gold-harams-necklaces', 1),
        ('Gold Bangles & Kadas', 'బంగారు గాజులు & కడాలు', 'Gold', 'gold-bangles-kadas', 2),
        ('Mangalsutra & Thali Chains', 'మంగళసూత్రాలు & తాళి చైన్లు', 'Gold', 'mangalsutra-chains', 3),
        ('Gold Jhumkas & Earrings', 'బంగారు బుట్టలు & దిద్దులు', 'Gold', 'gold-jhumkas-earrings', 4),
        ('Gold Rings & Vankis', 'బంగారు ఉంగరాలు & వంకీలు', 'Gold', 'gold-rings-vankis', 5),
        ('Gold Chains', 'బంగారు గొలుసులు', 'Gold', 'gold-chains', 6),
        ('24K Gold Coins', '24K స్వచ్ఛమైన బంగారు నాణేలు', 'Gold', 'gold-coins', 7),
        ('Silver God Idols', 'వెండి దేవుడి విగ్రహాలు', 'Silver', 'silver-god-idols', 8),
        ('Silver Pooja Thali Sets', 'వెండి పూజా తాంబూలం సెట్లు', 'Silver', 'silver-pooja-thali-sets', 9),
        ('Silver Kalash & Pooja Articles', 'వెండి కలశాలు & పూజా వస్తువులు', 'Silver', 'silver-kalash-pooja', 10),
        ('Silver Payal & Anklets', 'వెండి పట్టీలు & గజ్జెలు', 'Silver', 'silver-payal-anklets', 11),
        ('Silver Kamakshi Diyas & Lamps', 'వెండి కామాక్షి దీపాలు', 'Silver', 'silver-diyas-lamps', 12),
        ('Silver Bowls & Tumblers', 'వెండి గిన్నెలు & గ్లాసులు', 'Silver', 'silver-bowls-tumblers', 13),
        ('Silver Gifts & Articles', 'వెండి కానుకలు & వస్తువులు', 'Silver', 'silver-gifts-articles', 14)
    ]

    for cat in categories:
        cursor.execute('''
            INSERT INTO categories (name, name_te, metal, slug, sort_order)
            VALUES (?, ?, ?, ?, ?)
        ''', cat)

    conn.commit()
    conn.close()
    print("Database seeded successfully with categories and showroom settings.")

if __name__ == '__main__':
    seed_db()
