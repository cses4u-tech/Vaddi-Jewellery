import sqlite3
import os
import json

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'vaddi_jewellery.db')

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Categories
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            name_te TEXT NOT NULL,
            metal TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            image_path TEXT,
            sort_order INTEGER DEFAULT 0
        )
    ''')

    # 2. Products
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            title_te TEXT,
            metal TEXT NOT NULL,
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
            availability TEXT DEFAULT 'In Stock',
            featured INTEGER DEFAULT 0,
            new_arrival INTEGER DEFAULT 0,
            image_path TEXT NOT NULL,
            image_paths TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    ''')

    # 3. Enquiries
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            product_id INTEGER,
            product_code TEXT,
            product_title TEXT,
            message TEXT,
            status TEXT DEFAULT 'New',
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    ''')

    # 4. Reviews
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            review TEXT NOT NULL,
            review_te TEXT,
            verified INTEGER DEFAULT 1,
            date TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    ''')

    # 5. Settings
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    ''')

    # 6. Admins
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            last_login TEXT
        )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully at:", DB_FILE)
