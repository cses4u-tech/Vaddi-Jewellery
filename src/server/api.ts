import { getDatabase, syncAllProductPricesWithSettings, resetAndRecoverDatabase } from './db';
import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// Active Server-Sent Events (SSE) connections for Real-Time Sync across all users
const sseClients = new Set<ServerResponse>();

export function broadcastRealtimeEvent(type: string, payload: any = {}) {
  const message = `data: ${JSON.stringify({ type, payload, timestamp: Date.now() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Periodic heartbeat so SSE connection never times out
setInterval(() => {
  const ping = `event: ping\ndata: ${Date.now()}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(ping);
    } catch {
      sseClients.delete(client);
    }
  }
}, 20000);

// Helper to parse JSON body
async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) {
        // 20MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        if (!body.trim()) return resolve({});
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');
  res.end(JSON.stringify(data));
}

function sendError(res: ServerResponse, statusCode: number, message: string) {
  sendJson(res, statusCode, { success: false, error: message });
}

export function calculateProductPrice(product: any, settingsMap: Record<string, number>): number {
  const isGold = (product.metal || '').toLowerCase() === 'gold';
  const purity = (product.purity || '').toUpperCase();

  const rate24k = settingsMap['gold_rate_24k'] || 7650;
  const rate22k = settingsMap['gold_rate_22k'] || 7020;
  const rate18k = settingsMap['gold_rate_18k'] || 5750;
  const rateSilver = settingsMap['silver_rate'] || 98;

  let gramRate = rate22k;
  if (isGold) {
    if (purity.includes('24K') || purity.includes('999')) gramRate = rate24k;
    else if (purity.includes('18K')) gramRate = rate18k;
    else gramRate = rate22k;
  } else {
    gramRate = rateSilver;
  }

  const weight = Math.max(0, Number(product.weight) || 0);
  const metalBasePrice = Math.round(weight * gramRate);

  let wastageAmount = 0;
  if (product.wastage_cost && Number(product.wastage_cost) > 0) {
    wastageAmount = Math.round(Number(product.wastage_cost));
  } else if (product.wastage_percent !== undefined && product.wastage_percent !== null && Number(product.wastage_percent) > 0) {
    wastageAmount = Math.round((metalBasePrice * Number(product.wastage_percent)) / 100);
  } else {
    // Default standard heritage wastage: 10% for gold, 8% for silver
    wastageAmount = Math.round((metalBasePrice * (isGold ? 10 : 8)) / 100);
  }

  let labourCost = 0;
  if (product.labour_cost !== undefined && product.labour_cost !== null && Number(product.labour_cost) > 0) {
    labourCost = Math.round(Number(product.labour_cost));
  } else if (product.making_charge_per_gram && Number(product.making_charge_per_gram) > 0) {
    labourCost = Math.round(weight * Number(product.making_charge_per_gram));
  } else {
    labourCost = isGold ? 2500 : 650;
  }

  return metalBasePrice + wastageAmount + labourCost;
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const rawUrl = (req as any).originalUrl || req.url || '/';
  const url = new URL(rawUrl, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const method = req.method?.toUpperCase() || 'GET';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');
    res.end();
    return true;
  }

  // Real-Time SSE Stream for Instant Push to all active website visitors
  if ((pathname === '/api/events' || pathname === '/api/realtime/stream') && method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

    sseClients.add(res);
    req.on('close', () => {
      sseClients.delete(res);
    });
    return true;
  }

  // Only handle /api routes
  if (!pathname.startsWith('/api')) {
    return false;
  }

  const db = getDatabase();

  try {
    // ----------------------------------------------------
    // Public Settings: GET /api/settings
    // ----------------------------------------------------
    if (pathname === '/api/settings' && method === 'GET') {
      const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
      const settingsMap: Record<string, string> = {};
      for (const row of rows) {
        settingsMap[row.key] = row.value;
      }
      sendJson(res, 200, { success: true, settings: settingsMap });
      return true;
    }

    // ----------------------------------------------------
    // Public Categories: GET /api/categories
    // ----------------------------------------------------
    if (pathname === '/api/categories' && method === 'GET') {
      const metal = url.searchParams.get('metal');
      let query = 'SELECT * FROM categories';
      const params: any[] = [];

      if (metal && (metal.toLowerCase() === 'gold' || metal.toLowerCase() === 'silver')) {
        query += ' WHERE LOWER(metal) = ?';
        params.push(metal.toLowerCase());
      }
      query += ' ORDER BY sort_order ASC';

      const categories = db.prepare(query).all(...params);
      sendJson(res, 200, { success: true, categories });
      return true;
    }

    // ----------------------------------------------------
    // Public Products: GET /api/products
    // ----------------------------------------------------
    if (pathname === '/api/products' && method === 'GET') {
      const metal = url.searchParams.get('metal');
      const category = url.searchParams.get('category');
      const purity = url.searchParams.get('purity');
      const availability = url.searchParams.get('availability');
      const featured = url.searchParams.get('featured');
      const newArrival = url.searchParams.get('new_arrival');
      const search = url.searchParams.get('search');
      const sort = url.searchParams.get('sort') || 'featured';

      const settingsRows = db.prepare('SELECT * FROM settings').all() as Array<{ key: string; value: string }>;
      const settingsMap: Record<string, number> = {};
      for (const s of settingsRows) {
        settingsMap[s.key] = Number(s.value) || 0;
      }

      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];

      if (metal && metal !== 'all') {
        query += ' AND LOWER(metal) = ?';
        params.push(metal.toLowerCase());
      }

      if (category && category !== 'all') {
        query += ' AND (category = ? OR category_te = ?)';
        params.push(category, category);
      }

      if (purity && purity !== 'all') {
        query += ' AND purity = ?';
        params.push(purity);
      }

      if (availability && availability !== 'all') {
        query += ' AND availability = ?';
        params.push(availability);
      }

      if (featured === 'true' || featured === '1') {
        query += ' AND featured = 1';
      }

      if (newArrival === 'true' || newArrival === '1') {
        query += ' AND new_arrival = 1';
      }

      if (search && search.trim()) {
        const term = `%${search.trim().toLowerCase()}%`;
        query += ` AND (
          LOWER(code) LIKE ? OR
          LOWER(title) LIKE ? OR
          LOWER(title_te) LIKE ? OR
          LOWER(category) LIKE ? OR
          LOWER(purity) LIKE ? OR
          LOWER(description) LIKE ?
        )`;
        params.push(term, term, term, term, term, term);
      }

      // Initial SQL sorting for non-price sorts
      switch (sort) {
        case 'name_asc':
          query += ' ORDER BY title ASC';
          break;
        case 'name_desc':
          query += ' ORDER BY title DESC';
          break;
        case 'weight_asc':
          query += ' ORDER BY weight ASC';
          break;
        case 'weight_desc':
          query += ' ORDER BY weight DESC';
          break;
        case 'newest':
          query += ' ORDER BY new_arrival DESC, id DESC';
          break;
        case 'featured':
        default:
          query += ' ORDER BY featured DESC, new_arrival DESC, id DESC';
          break;
      }

      const rawProducts = db.prepare(query).all(...params) as any[];
      let products = rawProducts.map((p) => {
        let imageList: string[] = [];
        try {
          imageList = JSON.parse(p.image_paths);
        } catch {
          imageList = [p.image_path];
        }

        // Dynamically compute real-time price based on current Gold / Silver rates
        const dynamicCalculatedPrice = calculateProductPrice(p, settingsMap);

        return {
          ...p,
          price: dynamicCalculatedPrice,
          show_price: p.show_price !== undefined ? p.show_price : 1,
          wastage_percent: p.wastage_percent !== undefined ? p.wastage_percent : 10,
          labour_cost: p.labour_cost !== undefined ? p.labour_cost : 2500,
          image_paths: imageList,
        };
      });

      // If sorted by price, sort accurately using the dynamically calculated live rate prices
      if (sort === 'price_asc') {
        products.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (sort === 'price_desc') {
        products.sort((a, b) => (b.price || 0) - (a.price || 0));
      }

      sendJson(res, 200, { success: true, count: products.length, products });
      return true;
    }

    // ----------------------------------------------------
    // Single Product: GET /api/products/:idOrCode
    // ----------------------------------------------------
    if (pathname.startsWith('/api/products/') && method === 'GET') {
      const idOrCode = pathname.replace('/api/products/', '');
      let product: any;

      if (!isNaN(Number(idOrCode))) {
        product = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(idOrCode));
      } else {
        product = db.prepare('SELECT * FROM products WHERE UPPER(code) = ?').get(idOrCode.toUpperCase());
      }

      if (!product) {
        sendError(res, 404, 'Product not found');
        return true;
      }

      try {
        product.image_paths = JSON.parse(product.image_paths);
      } catch {
        product.image_paths = [product.image_path];
      }

      const settingsRows = db.prepare('SELECT * FROM settings').all() as Array<{ key: string; value: string }>;
      const settingsMap: Record<string, number> = {};
      for (const s of settingsRows) {
        settingsMap[s.key] = Number(s.value) || 0;
      }
      product.price = calculateProductPrice(product, settingsMap);

      sendJson(res, 200, { success: true, product });
      return true;
    }

    // ----------------------------------------------------
    // Public Reviews: GET & POST /api/reviews
    // ----------------------------------------------------
    if (pathname === '/api/reviews') {
      if (method === 'GET') {
        const reviews = db.prepare('SELECT * FROM reviews WHERE verified = 1 ORDER BY id DESC').all();
        sendJson(res, 200, { success: true, reviews });
        return true;
      }

      if (method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.name || !body.review || !body.rating) {
          sendError(res, 400, 'Name, rating and review text are required');
          return true;
        }

        const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const stmt = db.prepare(`
          INSERT INTO reviews (name, rating, review, review_te, verified, date)
          VALUES (?, ?, ?, ?, 1, ?)
        `);
        const result = stmt.run(body.name, rating, body.review, body.review_te || body.review, dateStr);

        broadcastRealtimeEvent('reviews_updated');
        sendJson(res, 201, { success: true, id: result.lastInsertRowid, message: 'Review submitted successfully' });
        return true;
      }
    }

    // ----------------------------------------------------
    // Public Enquiry: POST /api/enquiries
    // ----------------------------------------------------
    if (pathname === '/api/enquiries' && method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.name || !body.phone) {
        sendError(res, 400, 'Name and phone number are required');
        return true;
      }

      const stmt = db.prepare(`
        INSERT INTO enquiries (name, phone, email, product_id, product_code, product_title, message, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'New', ?)
      `);
      const result = stmt.run(
        body.name,
        body.phone,
        body.email || null,
        body.product_id || null,
        body.product_code || null,
        body.product_title || null,
        body.message || '',
        body.notes || ''
      );

      broadcastRealtimeEvent('enquiries_updated');
      sendJson(res, 201, {
        success: true,
        enquiryId: result.lastInsertRowid,
        message: 'Enquiry received. Our team will contact you shortly.',
      });
      return true;
    }

    // ----------------------------------------------------
    // Admin Auth: POST /api/admin/login
    // ----------------------------------------------------
    if (pathname === '/api/admin/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const password = body.password;

      if (password === 'VaddiFamily@PDTR' || password === 'vaddi123') {
        const token = 'vaddi_session_' + Buffer.from(Date.now().toString()).toString('base64');
        sendJson(res, 200, { success: true, token, message: 'Admin login successful' });
      } else {
        sendError(res, 401, 'Invalid admin password');
      }
      return true;
    }

    // ----------------------------------------------------
    // Admin Stats: GET /api/admin/stats
    // ----------------------------------------------------
    if (pathname === '/api/admin/stats' && method === 'GET') {
      const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
      const goldCount = (db.prepare("SELECT COUNT(*) as count FROM products WHERE LOWER(metal) = 'gold'").get() as any).count;
      const silverCount = (db.prepare("SELECT COUNT(*) as count FROM products WHERE LOWER(metal) = 'silver'").get() as any).count;
      const enquiriesCount = (db.prepare("SELECT COUNT(*) as count FROM enquiries WHERE status = 'New'").get() as any).count;
      const totalEnquiries = (db.prepare('SELECT COUNT(*) as count FROM enquiries').get() as any).count;
      const outOfStockCount = (db.prepare("SELECT COUNT(*) as count FROM products WHERE availability = 'Out of Stock'").get() as any).count;
      const featuredCount = (db.prepare('SELECT COUNT(*) as count FROM products WHERE featured = 1').get() as any).count;
      const newArrivalsCount = (db.prepare('SELECT COUNT(*) as count FROM products WHERE new_arrival = 1').get() as any).count;

      sendJson(res, 200, {
        success: true,
        stats: {
          totalProducts,
          goldCount,
          silverCount,
          newEnquiries: enquiriesCount,
          totalEnquiries,
          outOfStockCount,
          featuredCount,
          newArrivalsCount,
        },
      });
      return true;
    }

    // ----------------------------------------------------
    // Admin Products CRUD: /api/admin/products
    // ----------------------------------------------------
    if (pathname === '/api/admin/products') {
      if (method === 'GET') {
        const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all() as any[];
        const formatted = products.map((p) => {
          try {
            p.image_paths = JSON.parse(p.image_paths);
          } catch {
            p.image_paths = [p.image_path];
          }
          return {
            ...p,
            show_price: p.show_price !== undefined ? p.show_price : 1,
            wastage_percent: p.wastage_percent !== undefined ? p.wastage_percent : 10,
            labour_cost: p.labour_cost !== undefined ? p.labour_cost : 2500,
          };
        });
        sendJson(res, 200, { success: true, products: formatted });
        return true;
      }

      if (method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.title || !body.metal || !body.category || body.weight === undefined) {
          sendError(res, 400, 'Title, metal, category, and weight are required');
          return true;
        }

        // Auto-generate next sequential code if not provided
        let code = body.code;
        if (!code || !code.trim()) {
          const prefix = body.metal.toLowerCase() === 'silver' ? 'VD-S' : 'VD-G';
          const maxRow = db
            .prepare(`SELECT code FROM products WHERE code LIKE '${prefix}%' ORDER BY id DESC LIMIT 1`)
            .get() as { code: string } | undefined;
          let nextNum = 1;
          if (maxRow && maxRow.code) {
            const numPart = maxRow.code.replace(prefix, '');
            const parsed = parseInt(numPart, 10);
            if (!isNaN(parsed)) nextNum = parsed + 1;
          }
          code = `${prefix}${String(nextNum).padStart(3, '0')}`;
        }

        const imagePath = body.image_path || (body.metal.toLowerCase() === 'silver' ? '/images/jewellery/vd_s001_silver_ganesha_idol.svg' : '/images/jewellery/vd_g001_gold_lakshmi_haram.svg');
        const imagePaths = Array.isArray(body.image_paths) && body.image_paths.length > 0 ? JSON.stringify(body.image_paths) : JSON.stringify([imagePath]);

        // Fetch current rates to auto-calculate accurate price
        const settingsRows = db.prepare('SELECT * FROM settings').all() as Array<{ key: string; value: string }>;
        const settingsMap: Record<string, number> = {};
        for (const s of settingsRows) {
          settingsMap[s.key] = Number(s.value) || 0;
        }

        const calculatedPrice = calculateProductPrice(body, settingsMap);
        const finalPrice = Number(body.price) > 0 ? Number(body.price) : calculatedPrice;

        const stmt = db.prepare(`
          INSERT INTO products (
            code, title, title_te, metal, category, category_te, product_type,
            purity, description, description_te, weight, size, price, show_price,
            wastage_percent, wastage_cost, labour_cost, making_charge_per_gram,
            availability, featured, new_arrival, image_path, image_paths
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
          code.toUpperCase(),
          body.title,
          body.title_te || body.title,
          body.metal,
          body.category,
          body.category_te || body.category,
          body.product_type || 'Jewellery',
          body.purity || (body.metal === 'Silver' ? '92.5 Sterling Silver' : '22K BIS 916'),
          body.description || '',
          body.description_te || body.description || '',
          Number(body.weight) || 0,
          body.size || '',
          finalPrice,
          body.show_price !== undefined ? (body.show_price ? 1 : 0) : 1,
          Number(body.wastage_percent) || 0,
          Number(body.wastage_cost) || 0,
          Number(body.labour_cost) || 0,
          Number(body.making_charge_per_gram) || 0,
          body.availability || 'In Stock',
          body.featured ? 1 : 0,
          body.new_arrival ? 1 : 0,
          imagePath,
          imagePaths
        );

        // Real-Time Push to all active website users
        broadcastRealtimeEvent('products_updated', { id: result.lastInsertRowid, code });

        sendJson(res, 201, { success: true, id: result.lastInsertRowid, code, price: finalPrice, message: 'Product added successfully' });
        return true;
      }
    }

    // Single Product edit / delete: /api/admin/products/:id
    if (pathname.startsWith('/api/admin/products/')) {
      const id = Number(pathname.replace('/api/admin/products/', ''));
      if (isNaN(id)) {
        sendError(res, 400, 'Invalid product ID');
        return true;
      }

      if (method === 'PUT') {
        const body = await parseJsonBody(req);
        const imagePath = body.image_path || '/images/jewellery/vd_g001_gold_lakshmi_haram.svg';
        const imagePaths = Array.isArray(body.image_paths) ? JSON.stringify(body.image_paths) : JSON.stringify([imagePath]);

        // Recalculate price using current rates
        const settingsRows = db.prepare('SELECT * FROM settings').all() as Array<{ key: string; value: string }>;
        const settingsMap: Record<string, number> = {};
        for (const s of settingsRows) {
          settingsMap[s.key] = Number(s.value) || 0;
        }
        const calculatedPrice = calculateProductPrice(body, settingsMap);
        const finalPrice = (body.auto_calculate !== false || !body.price) ? calculatedPrice : (Number(body.price) || calculatedPrice);

        const stmt = db.prepare(`
          UPDATE products SET
            code = ?, title = ?, title_te = ?, metal = ?, category = ?, category_te = ?,
            product_type = ?, purity = ?, description = ?, description_te = ?,
            weight = ?, size = ?, price = ?, show_price = ?,
            wastage_percent = ?, wastage_cost = ?, labour_cost = ?, making_charge_per_gram = ?,
            availability = ?, featured = ?, new_arrival = ?, image_path = ?, image_paths = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `);

        stmt.run(
          body.code,
          body.title,
          body.title_te || body.title,
          body.metal,
          body.category,
          body.category_te || body.category,
          body.product_type || 'Jewellery',
          body.purity,
          body.description,
          body.description_te,
          Number(body.weight) || 0,
          body.size,
          finalPrice,
          body.show_price !== undefined ? (body.show_price ? 1 : 0) : 1,
          Number(body.wastage_percent) || 0,
          Number(body.wastage_cost) || 0,
          Number(body.labour_cost) || 0,
          Number(body.making_charge_per_gram) || 0,
          body.availability || 'In Stock',
          body.featured ? 1 : 0,
          body.new_arrival ? 1 : 0,
          imagePath,
          imagePaths,
          id
        );

        broadcastRealtimeEvent('products_updated', { id, code: body.code });
        sendJson(res, 200, { success: true, price: finalPrice, message: 'Product updated successfully' });
        return true;
      }

      if (method === 'DELETE') {
        db.prepare('DELETE FROM products WHERE id = ?').run(id);
        broadcastRealtimeEvent('products_updated', { id, deleted: true });
        sendJson(res, 200, { success: true, message: 'Product deleted successfully' });
        return true;
      }
    }

    // ----------------------------------------------------
    // Admin Enquiries Management: /api/admin/enquiries
    // ----------------------------------------------------
    if (pathname === '/api/admin/enquiries' && method === 'GET') {
      const enquiries = db.prepare('SELECT * FROM enquiries ORDER BY id DESC').all();
      sendJson(res, 200, { success: true, enquiries });
      return true;
    }

    if (pathname.startsWith('/api/admin/enquiries/') && method === 'PUT') {
      const id = Number(pathname.replace('/api/admin/enquiries/', ''));
      const body = await parseJsonBody(req);
      const stmt = db.prepare('UPDATE enquiries SET status = ?, notes = ? WHERE id = ?');
      stmt.run(body.status || 'New', body.notes || '', id);
      broadcastRealtimeEvent('enquiries_updated', { id });
      sendJson(res, 200, { success: true, message: 'Enquiry updated' });
      return true;
    }

    if (pathname.startsWith('/api/admin/enquiries/') && method === 'DELETE') {
      const id = Number(pathname.replace('/api/admin/enquiries/', ''));
      db.prepare('DELETE FROM enquiries WHERE id = ?').run(id);
      broadcastRealtimeEvent('enquiries_updated', { id });
      sendJson(res, 200, { success: true, message: 'Enquiry deleted' });
      return true;
    }

    // ----------------------------------------------------
    // Admin Reviews Management: /api/admin/reviews
    // ----------------------------------------------------
    if (pathname === '/api/admin/reviews' && method === 'GET') {
      const reviews = db.prepare('SELECT * FROM reviews ORDER BY id DESC').all();
      sendJson(res, 200, { success: true, reviews });
      return true;
    }

    if (pathname.startsWith('/api/admin/reviews/') && method === 'PUT') {
      const id = Number(pathname.replace('/api/admin/reviews/', ''));
      const body = await parseJsonBody(req);
      db.prepare('UPDATE reviews SET verified = ? WHERE id = ?').run(body.verified ? 1 : 0, id);
      broadcastRealtimeEvent('reviews_updated', { id });
      sendJson(res, 200, { success: true, message: 'Review status updated' });
      return true;
    }

    if (pathname.startsWith('/api/admin/reviews/') && method === 'DELETE') {
      const id = Number(pathname.replace('/api/admin/reviews/', ''));
      db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
      broadcastRealtimeEvent('reviews_updated', { id });
      sendJson(res, 200, { success: true, message: 'Review deleted' });
      return true;
    }

    // ----------------------------------------------------
    // Admin Categories Management: /api/admin/categories
    // ----------------------------------------------------
    if (pathname === '/api/admin/categories' && method === 'GET') {
      const rows = db.prepare(`
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON (p.category = c.name OR p.category_te = c.name_te)
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.id ASC
      `).all();
      sendJson(res, 200, { success: true, categories: rows });
      return true;
    }

    if (pathname === '/api/admin/categories' && method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.name || !body.metal) {
        sendError(res, 400, 'Category name and metal (Gold/Silver) are required');
        return true;
      }

      const name = String(body.name).trim();
      const nameTe = String(body.name_te || name).trim();
      const metal = body.metal === 'Silver' ? 'Silver' : 'Gold';
      let slug = body.slug ? String(body.slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (!slug) slug = `cat-${Date.now()}`;

      // Check if slug already exists
      const existingSlug = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      let sortOrder = Number(body.sort_order);
      if (isNaN(sortOrder) || sortOrder <= 0) {
        const maxSort = db.prepare('SELECT MAX(sort_order) as max_sort FROM categories').get() as { max_sort: number | null };
        sortOrder = (maxSort?.max_sort || 0) + 1;
      }

      const stmt = db.prepare(`
        INSERT INTO categories (name, name_te, metal, slug, image_path, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(name, nameTe, metal, slug, body.image_path || null, sortOrder);
      const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(info.lastInsertRowid));

      broadcastRealtimeEvent('categories_updated');
      sendJson(res, 201, { success: true, message: 'Category added successfully', category: newCategory });
      return true;
    }

    if (pathname.startsWith('/api/admin/categories/') && (method === 'PUT' || method === 'DELETE')) {
      const id = Number(pathname.replace('/api/admin/categories/', ''));
      if (isNaN(id)) {
        sendError(res, 400, 'Invalid category ID');
        return true;
      }

      const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
      if (!existing) {
        sendError(res, 404, 'Category not found');
        return true;
      }

      if (method === 'PUT') {
        const body = await parseJsonBody(req);
        const name = body.name ? String(body.name).trim() : existing.name;
        const nameTe = body.name_te ? String(body.name_te).trim() : existing.name_te;
        const metal = body.metal ? (body.metal === 'Silver' ? 'Silver' : 'Gold') : existing.metal;
        let slug = body.slug ? String(body.slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : existing.slug;
        const sortOrder = !isNaN(Number(body.sort_order)) ? Number(body.sort_order) : existing.sort_order;
        const imagePath = body.image_path !== undefined ? body.image_path : existing.image_path;

        if (slug !== existing.slug) {
          const duplicate = db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(slug, id);
          if (duplicate) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
          }
        }

        db.prepare(`
          UPDATE categories SET
            name = ?, name_te = ?, metal = ?, slug = ?, image_path = ?, sort_order = ?
          WHERE id = ?
        `).run(name, nameTe, metal, slug, imagePath, sortOrder, id);

        if (existing.name !== name || existing.name_te !== nameTe) {
          db.prepare(`
            UPDATE products SET
              category = CASE WHEN category = ? THEN ? ELSE category END,
              category_te = CASE WHEN category_te = ? THEN ? ELSE category_te END
            WHERE category = ? OR category_te = ?
          `).run(existing.name, name, existing.name_te, nameTe, existing.name, existing.name_te);
        }

        const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
        broadcastRealtimeEvent('categories_updated');
        sendJson(res, 200, { success: true, message: 'Category updated successfully', category: updated });
        return true;
      }

      if (method === 'DELETE') {
        db.prepare('DELETE FROM categories WHERE id = ?').run(id);
        broadcastRealtimeEvent('categories_updated');
        sendJson(res, 200, { success: true, message: 'Category deleted successfully' });
        return true;
      }
    }

    // ----------------------------------------------------
    // Admin Settings Update: PUT /api/admin/settings & PUT /api/admin/rates
    // ----------------------------------------------------
    if ((pathname === '/api/admin/settings' || pathname === '/api/admin/rates') && (method === 'PUT' || method === 'POST')) {
      const body = await parseJsonBody(req);
      const insertOrUpdate = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      for (const [key, value] of Object.entries(body)) {
        insertOrUpdate.run(key, String(value));
      }

      // If gold/silver rates were updated, automatically recalculate prices for ALL products in DB
      if (
        'gold_rate_24k' in body ||
        'gold_rate_22k' in body ||
        'gold_rate_18k' in body ||
        'silver_rate' in body ||
        'silver_rate_1g' in body
      ) {
        try {
          syncAllProductPricesWithSettings(db);
        } catch (recalcErr) {
          console.error('Error auto-recalculating product prices in DB:', recalcErr);
        }
      }

      // Broadcast Real-Time Rate & Product sync event to all open browsers/clients!
      broadcastRealtimeEvent('rates_updated', { settings: body });
      broadcastRealtimeEvent('products_updated');
      broadcastRealtimeEvent('settings_updated');

      sendJson(res, 200, { success: true, message: 'Settings saved and product prices recalculated in real time' });
      return true;
    }

    // ----------------------------------------------------
    // Admin Trigger Product Price Recalculation: POST /api/admin/recalculate-prices
    // ----------------------------------------------------
    if (pathname === '/api/admin/recalculate-prices' && method === 'POST') {
      try {
        syncAllProductPricesWithSettings(db);
        const count = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any)?.count || 0;
        broadcastRealtimeEvent('products_updated');
        sendJson(res, 200, { success: true, count, message: `Successfully auto-recalculated prices for all ${count} products based on today's market rates.` });
      } catch (err: any) {
        sendError(res, 500, err.message || 'Failed to recalculate prices');
      }
      return true;
    }

    // ----------------------------------------------------
    // Image Upload: POST /api/admin/upload
    // ----------------------------------------------------
    if (pathname === '/api/admin/upload' && method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.dataUrl || !body.fileName) {
        sendError(res, 400, 'Image dataUrl and fileName are required');
        return true;
      }

      const matches = body.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        sendError(res, 400, 'Invalid base64 image data URL');
        return true;
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // 10MB limit
      if (buffer.length > 10 * 1024 * 1024) {
        sendError(res, 400, 'File size exceeds 10MB limit');
        return true;
      }

      let ext = '.png';
      if (mimeType === 'image/jpeg') ext = '.jpg';
      else if (mimeType === 'image/webp') ext = '.webp';
      else if (mimeType === 'image/svg+xml') ext = '.svg';

      const sanitizedName = (body.fileName || 'upload')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);
      const uniqueFileName = `${sanitizedName}_${Date.now()}${ext}`;
      const uploadDir = path.resolve(process.cwd(), 'public/uploads');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const targetPath = path.join(uploadDir, uniqueFileName);
      fs.writeFileSync(targetPath, buffer);

      const publicPath = `/uploads/${uniqueFileName}`;
      sendJson(res, 200, {
        success: true,
        image_path: publicPath,
        fileName: uniqueFileName,
        fileSize: buffer.length,
        message: 'Image uploaded successfully',
      });
      return true;
    }

    // 404 for unhandled API routes
    sendError(res, 404, `API route not found: ${pathname}`);
    return true;
  } catch (err: any) {
    console.error('API Error:', err);
    const errMsg = String(err?.message || '');
    if (errMsg.includes('malformed') || errMsg.includes('corrupt')) {
      try {
        console.warn('Auto-recovering database after malformed error...');
        resetAndRecoverDatabase();
      } catch (recoverErr) {
        console.error('Recovery error:', recoverErr);
      }
    }
    sendError(res, 500, err.message || 'Internal server error');
    return true;
  }
}
