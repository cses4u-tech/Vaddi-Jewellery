import os
import json
import base64
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import get_db_connection, init_db

app = Flask(__name__, static_folder='../dist', static_url_path='/')
CORS(app)

# Ensure uploads folder exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ----------------- Public APIs -----------------

@app.route('/api/settings', methods=['GET'])
def get_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT key, value FROM settings')
    rows = cursor.fetchall()
    conn.close()
    settings_dict = {row['key']: row['value'] for row in rows}
    return jsonify({'success': True, 'settings': settings_dict})

@app.route('/api/categories', methods=['GET'])
def get_categories():
    metal = request.args.get('metal')
    conn = get_db_connection()
    cursor = conn.cursor()
    if metal and metal.lower() in ['gold', 'silver']:
        cursor.execute('SELECT * FROM categories WHERE LOWER(metal) = ? ORDER BY sort_order ASC', (metal.lower(),))
    else:
        cursor.execute('SELECT * FROM categories ORDER BY sort_order ASC')
    categories = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'categories': categories})

@app.route('/api/products', methods=['GET'])
def get_products():
    metal = request.args.get('metal')
    category = request.args.get('category')
    purity = request.args.get('purity')
    availability = request.args.get('availability')
    featured = request.args.get('featured')
    new_arrival = request.args.get('new_arrival')
    search = request.args.get('search')
    sort = request.args.get('sort', 'featured')

    query = 'SELECT * FROM products WHERE 1=1'
    params = []

    if metal and metal != 'all':
        query += ' AND LOWER(metal) = ?'
        params.append(metal.lower())

    if category and category != 'all':
        query += ' AND (category = ? OR category_te = ?)'
        params.extend([category, category])

    if purity and purity != 'all':
        query += ' AND purity = ?'
        params.append(purity)

    if availability and availability != 'all':
        query += ' AND availability = ?'
        params.append(availability)

    if featured in ['true', '1']:
        query += ' AND featured = 1'

    if new_arrival in ['true', '1']:
        query += ' AND new_arrival = 1'

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query += ''' AND (
            LOWER(code) LIKE ? OR
            LOWER(title) LIKE ? OR
            LOWER(title_te) LIKE ? OR
            LOWER(category) LIKE ? OR
            LOWER(purity) LIKE ? OR
            LOWER(description) LIKE ?
        )'''
        params.extend([term, term, term, term, term, term])

    # Sorting
    if sort == 'price_asc':
        query += ' ORDER BY price ASC'
    elif sort == 'price_desc':
        query += ' ORDER BY price DESC'
    elif sort == 'name_asc':
        query += ' ORDER BY title ASC'
    elif sort == 'name_desc':
        query += ' ORDER BY title DESC'
    elif sort == 'weight_asc':
        query += ' ORDER BY weight ASC'
    elif sort == 'weight_desc':
        query += ' ORDER BY weight DESC'
    elif sort == 'newest':
        query += ' ORDER BY new_arrival DESC, id DESC'
    else:
        query += ' ORDER BY featured DESC, new_arrival DESC, id DESC'

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    raw_products = [dict(row) for row in cursor.fetchall()]
    conn.close()

    for p in raw_products:
        try:
            p['image_paths'] = json.loads(p['image_paths'])
        except Exception:
            p['image_paths'] = [p['image_path']]

    return jsonify({'success': True, 'count': len(raw_products), 'products': raw_products})

@app.route('/api/products/<id_or_code>', methods=['GET'])
def get_single_product(id_or_code):
    conn = get_db_connection()
    cursor = conn.cursor()
    if id_or_code.isdigit():
        cursor.execute('SELECT * FROM products WHERE id = ?', (int(id_or_code),))
    else:
        cursor.execute('SELECT * FROM products WHERE UPPER(code) = ?', (id_or_code.upper(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({'success': False, 'error': 'Product not found'}), 404

    prod = dict(row)
    try:
        prod['image_paths'] = json.loads(prod['image_paths'])
    except Exception:
        prod['image_paths'] = [prod['image_path']]

    return jsonify({'success': True, 'product': prod})

@app.route('/api/reviews', methods=['GET', 'POST'])
def handle_reviews():
    conn = get_db_connection()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute('SELECT * FROM reviews WHERE verified = 1 ORDER BY id DESC')
        reviews = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({'success': True, 'reviews': reviews})

    if request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name')
        review = data.get('review')
        rating = data.get('rating', 5)
        review_te = data.get('review_te', review)

        if not name or not review:
            conn.close()
            return jsonify({'success': False, 'error': 'Name and review are required'}), 400

        date_str = datetime.now().strftime('%d %b %Y')
        cursor.execute('''
            INSERT INTO reviews (name, rating, review, review_te, verified, date)
            VALUES (?, ?, ?, ?, 1, ?)
        ''', (name, int(rating), review, review_te, date_str))
        conn.commit()
        review_id = cursor.lastrowid
        conn.close()
        return jsonify({'success': True, 'id': review_id, 'message': 'Review submitted successfully'}), 201

@app.route('/api/enquiries', methods=['POST'])
def create_enquiry():
    data = request.get_json() or {}
    name = data.get('name')
    phone = data.get('phone')
    if not name or not phone:
        return jsonify({'success': False, 'error': 'Name and phone are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO enquiries (name, phone, email, product_id, product_code, product_title, message, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'New', ?)
    ''', (
        name,
        phone,
        data.get('email'),
        data.get('product_id'),
        data.get('product_code'),
        data.get('product_title'),
        data.get('message', ''),
        data.get('notes', '')
    ))
    conn.commit()
    enquiry_id = cursor.lastrowid
    conn.close()
    return jsonify({'success': True, 'enquiryId': enquiry_id, 'message': 'Enquiry received successfully'}), 201

# ----------------- Admin APIs -----------------

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    password = data.get('password')
    if password == 'VaddiFamily@PDTR':
        token = 'vaddi_session_' + base64.b64encode(str(datetime.now().timestamp()).encode()).decode()
        return jsonify({'success': True, 'token': token, 'message': 'Admin login successful'})
    return jsonify({'success': False, 'error': 'Invalid admin password'}), 401

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) as cnt FROM products')
    total_products = cursor.fetchone()['cnt']
    cursor.execute("SELECT COUNT(*) as cnt FROM products WHERE LOWER(metal) = 'gold'")
    gold_count = cursor.fetchone()['cnt']
    cursor.execute("SELECT COUNT(*) as cnt FROM products WHERE LOWER(metal) = 'silver'")
    silver_count = cursor.fetchone()['cnt']
    cursor.execute("SELECT COUNT(*) as cnt FROM enquiries WHERE status = 'New'")
    new_enquiries = cursor.fetchone()['cnt']
    cursor.execute("SELECT COUNT(*) as cnt FROM enquiries")
    total_enquiries = cursor.fetchone()['cnt']
    cursor.execute("SELECT COUNT(*) as cnt FROM products WHERE availability = 'Out of Stock'")
    out_of_stock = cursor.fetchone()['cnt']
    cursor.execute("SELECT COUNT(*) as cnt FROM products WHERE featured = 1")
    featured_count = cursor.fetchone()['cnt']
    cursor.execute("SELECT COUNT(*) as cnt FROM products WHERE new_arrival = 1")
    new_arrivals = cursor.fetchone()['cnt']
    conn.close()

    return jsonify({
        'success': True,
        'stats': {
            'totalProducts': total_products,
            'goldCount': gold_count,
            'silverCount': silver_count,
            'newEnquiries': new_enquiries,
            'totalEnquiries': total_enquiries,
            'outOfStockCount': out_of_stock,
            'featuredCount': featured_count,
            'newArrivalsCount': new_arrivals
        }
    })

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
