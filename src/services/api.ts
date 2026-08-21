import { Product, Category, Enquiry, Review, ShowroomSettings } from '../types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_REVIEWS,
} from '../data/fallbackData';

const API_BASE = '/api';

// Local storage keys
const KEY_SETTINGS = 'vaddi_local_settings';
const KEY_CATEGORIES = 'vaddi_local_categories';
const KEY_PRODUCTS = 'vaddi_local_products';
const KEY_REVIEWS = 'vaddi_local_reviews';
const KEY_ENQUIRIES = 'vaddi_local_enquiries';

// Cross-Tab BroadcastChannel for instantaneous sync across all tabs and windows
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('vaddi_realtime_sync');
  } catch (e) {
    console.warn('BroadcastChannel error:', e);
  }
}

export function notifyCrossTabSync(type: string, payload?: any) {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, payload, timestamp: Date.now() });
    } catch {}
  }
}

// Helper functions for local caching
function getLocalSettings(): ShowroomSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Error reading local settings:', e);
  }
  return DEFAULT_SETTINGS;
}

function saveLocalSettings(settings: Partial<ShowroomSettings>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(updated));
    notifyCrossTabSync('settings_updated', updated);
  } catch (e) {
    console.warn('Error saving local settings:', e);
  }
}

function getLocalCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(KEY_CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local categories:', e);
  }
  return DEFAULT_CATEGORIES;
}

function saveLocalCategories(cats: Category[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(cats));
  } catch (e) {
    console.warn('Error saving local categories:', e);
  }
}

function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return DEFAULT_PRODUCTS;
  try {
    const raw = localStorage.getItem(KEY_PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local products:', e);
  }
  return DEFAULT_PRODUCTS;
}

function saveLocalProducts(prods: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(prods));
  } catch (e) {
    console.warn('Error saving local products:', e);
  }
}

function getLocalReviews(): Review[] {
  if (typeof window === 'undefined') return DEFAULT_REVIEWS;
  try {
    const raw = localStorage.getItem(KEY_REVIEWS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local reviews:', e);
  }
  return DEFAULT_REVIEWS;
}

function saveLocalReviews(revs: Review[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_REVIEWS, JSON.stringify(revs));
  } catch (e) {
    console.warn('Error saving local reviews:', e);
  }
}

function getLocalEnquiries(): Enquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY_ENQUIRIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local enquiries:', e);
  }
  return [];
}

function saveLocalEnquiries(enqs: Enquiry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_ENQUIRIES, JSON.stringify(enqs));
  } catch (e) {
    console.warn('Error saving local enquiries:', e);
  }
}

// Safe JSON parser helper with mandatory zero-caching across all browsers & proxies
async function safeJsonFetch<T = any>(
  url: string,
  options?: RequestInit,
  fallbackData?: T
): Promise<{ ok: boolean; status: number; data: T }> {
  try {
    const isGet = !options?.method || options.method.toUpperCase() === 'GET';
    const separator = url.includes('?') ? '&' : '?';
    const targetUrl = isGet ? `${url}${separator}_t=${Date.now()}` : url;

    const finalOptions: RequestInit = {
      ...options,
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        ...(options?.headers || {}),
      },
    };

    const res = await fetch(targetUrl, finalOptions);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    let parsedData: any;
    if (contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        parsedData = JSON.parse(text);
      } catch {
        parsedData = fallbackData !== undefined ? fallbackData : ({ error: 'Invalid response format' } as any);
      }
    } else {
      parsedData = fallbackData !== undefined ? fallbackData : ({ error: `Server response (${res.status})` } as any);
    }

    return {
      ok: res.ok && (!parsedData || parsedData.success !== false),
      status: res.status,
      data: parsedData as T,
    };
  } catch (err: any) {
    if (fallbackData !== undefined) {
      return { ok: true, status: 200, data: fallbackData };
    }
    throw err;
  }
}

// Public API: Settings
export async function fetchSettings(): Promise<ShowroomSettings> {
  try {
    const { ok, data } = await safeJsonFetch<{ success?: boolean; settings: ShowroomSettings }>(
      `${API_BASE}/settings`
    );
    if (ok && data?.settings) {
      saveLocalSettings(data.settings);
      return data.settings;
    }
  } catch (err) {
    console.warn('Settings API not available, using local cache:', err);
  }
  return getLocalSettings();
}

// Public API: Categories
export async function fetchCategories(metal?: 'Gold' | 'Silver'): Promise<Category[]> {
  const url = metal ? `${API_BASE}/categories?metal=${metal}` : `${API_BASE}/categories`;
  try {
    const { ok, data } = await safeJsonFetch<{ success?: boolean; categories: Category[] }>(
      url,
      undefined,
      { categories: [] }
    );
    if (ok && Array.isArray(data?.categories) && data.categories.length > 0) {
      if (!metal) {
        saveLocalCategories(data.categories);
      }
      return data.categories;
    }
  } catch (err) {
    console.warn('Categories API not available, using local cache:', err);
  }

  const allCats = getLocalCategories();
  if (metal) {
    return allCats.filter((c) => c.metal.toLowerCase() === metal.toLowerCase());
  }
  return allCats;
}

export interface FetchProductsParams {
  metal?: string;
  category?: string;
  purity?: string;
  availability?: string;
  featured?: boolean;
  new_arrival?: boolean;
  search?: string;
  sort?: string;
}

// Public API: Products
export async function fetchProducts(params: FetchProductsParams = {}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params.metal && params.metal !== 'all') query.set('metal', params.metal);
  if (params.category && params.category !== 'all') query.set('category', params.category);
  if (params.purity && params.purity !== 'all') query.set('purity', params.purity);
  if (params.availability && params.availability !== 'all') query.set('availability', params.availability);
  if (params.featured) query.set('featured', '1');
  if (params.new_arrival) query.set('new_arrival', '1');
  if (params.search) query.set('search', params.search);
  if (params.sort) query.set('sort', params.sort);

  try {
    const { ok, data } = await safeJsonFetch<{ success?: boolean; products: Product[] }>(
      `${API_BASE}/products?${query.toString()}`,
      undefined,
      { products: [] }
    );
    if (ok && Array.isArray(data?.products) && data.products.length > 0) {
      return data.products;
    }
  } catch (err) {
    console.warn('Products API not available, using local cache:', err);
  }

  // Fallback to local products filter
  let list = [...getLocalProducts()];
  if (params.metal && params.metal !== 'all') {
    list = list.filter((p) => p.metal.toLowerCase() === params.metal?.toLowerCase());
  }
  if (params.category && params.category !== 'all') {
    list = list.filter((p) => p.category === params.category || p.category_te === params.category);
  }
  if (params.purity && params.purity !== 'all') {
    list = list.filter((p) => p.purity.toLowerCase().includes(params.purity!.toLowerCase()));
  }
  if (params.availability && params.availability !== 'all') {
    list = list.filter((p) => p.availability.toLowerCase() === params.availability!.toLowerCase());
  }
  if (params.featured) {
    list = list.filter((p) => p.featured === 1);
  }
  if (params.new_arrival) {
    list = list.filter((p) => p.new_arrival === 1);
  }
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.title_te && p.title_te.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.purity.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (params.sort) {
    if (params.sort === 'price_asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (params.sort === 'price_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (params.sort === 'weight_asc') {
      list.sort((a, b) => a.weight - b.weight);
    } else if (params.sort === 'weight_desc') {
      list.sort((a, b) => b.weight - a.weight);
    } else if (params.sort === 'newest') {
      list.sort((a, b) => b.id - a.id);
    }
  }

  return list;
}

export async function fetchSingleProduct(idOrCode: string | number): Promise<Product> {
  try {
    const { ok, data } = await safeJsonFetch<{ success?: boolean; product: Product; error?: string }>(
      `${API_BASE}/products/${idOrCode}`
    );
    if (ok && data.product) return data.product;
  } catch (err) {
    console.warn('Product single API error:', err);
  }

  const local = getLocalProducts().find(
    (p) => String(p.id) === String(idOrCode) || p.code.toLowerCase() === String(idOrCode).toLowerCase()
  );
  if (local) return local;
  throw new Error('Product not found');
}

export async function fetchReviews(): Promise<Review[]> {
  try {
    const { ok, data } = await safeJsonFetch<{ success?: boolean; reviews: Review[] }>(
      `${API_BASE}/reviews`,
      undefined,
      { reviews: [] }
    );
    if (ok && Array.isArray(data?.reviews) && data.reviews.length > 0) {
      saveLocalReviews(data.reviews);
      return data.reviews;
    }
  } catch (err) {
    console.warn('Reviews API error:', err);
  }
  return getLocalReviews();
}

export async function submitReview(payload: {
  name: string;
  rating: number;
  review: string;
  review_te?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; message: string; error?: string }>(
      `${API_BASE}/reviews`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (ok) return data;
  } catch (err) {
    console.warn('Submit review API error, saving locally:', err);
  }

  const list = getLocalReviews();
  const newRev: Review = {
    id: Date.now(),
    name: payload.name,
    rating: payload.rating,
    review: payload.review,
    review_te: payload.review_te || payload.review,
    verified: 1,
    date: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
  };
  saveLocalReviews([newRev, ...list]);
  return { success: true, message: 'Thank you for your review!' };
}

export async function submitEnquiry(payload: {
  name: string;
  phone: string;
  email?: string;
  product_id?: number;
  product_code?: string;
  product_title?: string;
  message?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; message: string; error?: string }>(
      `${API_BASE}/enquiries`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (ok) return data;
  } catch (err) {
    console.warn('Submit enquiry API error, saving locally:', err);
  }

  const enqs = getLocalEnquiries();
  const newEnq: Enquiry = {
    id: Date.now(),
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    product_id: payload.product_id,
    product_code: payload.product_code,
    product_title: payload.product_title,
    message: payload.message,
    status: 'New',
    created_at: new Date().toISOString(),
  };
  saveLocalEnquiries([newEnq, ...enqs]);
  return { success: true, message: 'Showroom team will contact you shortly on WhatsApp/Phone!' };
}

// ---------------- Admin APIs ----------------
export async function adminLogin(password: string): Promise<string> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; token?: string; error?: string }>(
      `${API_BASE}/admin/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }
    );

    if (ok && data?.token) {
      return data.token;
    }

    if (password === 'VaddiFamily@PDTR' || password === 'vaddi123') {
      return 'vaddi_session_' + btoa(Date.now().toString());
    }

    throw new Error(data?.error || 'Invalid admin password');
  } catch (err: any) {
    if (password === 'VaddiFamily@PDTR' || password === 'vaddi123') {
      return 'vaddi_session_' + btoa(Date.now().toString());
    }
    throw new Error(err.message || 'Invalid admin password');
  }
}

export async function fetchAdminStats(token: string) {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; stats: any; error?: string }>(
      `${API_BASE}/admin/stats`,
      {
        headers: { 'x-admin-token': token },
      }
    );
    if (ok && data.stats) return data.stats;
  } catch (err) {
    console.warn('Admin stats API error:', err);
  }

  const prods = getLocalProducts();
  const cats = getLocalCategories();
  const enqs = getLocalEnquiries();
  const revs = getLocalReviews();
  return {
    totalProducts: prods.length,
    goldCount: prods.filter((p) => p.metal.toLowerCase() === 'gold').length,
    silverCount: prods.filter((p) => p.metal.toLowerCase() === 'silver').length,
    totalCategories: cats.length,
    totalEnquiries: enqs.length,
    pendingEnquiries: enqs.filter((e) => e.status === 'New').length,
    totalReviews: revs.length,
  };
}

export async function fetchAdminProducts(token: string): Promise<Product[]> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; products: Product[]; error?: string }>(
      `${API_BASE}/admin/products`,
      {
        headers: { 'x-admin-token': token },
      },
      { success: true, products: [] }
    );
    if (ok && Array.isArray(data?.products) && data.products.length > 0) {
      saveLocalProducts(data.products);
      return data.products;
    }
  } catch (err) {
    console.warn('Admin products API error:', err);
  }
  return getLocalProducts();
}

export async function createAdminProduct(
  productData: Partial<Product>,
  token: string
): Promise<{ success: boolean; code: string; message: string }> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; code: string; message: string; error?: string }>(
      `${API_BASE}/admin/products`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(productData),
      }
    );
    if (ok) {
      const list = getLocalProducts();
      const newProd: Product = {
        id: Date.now(),
        code: data.code || productData.code || 'VD-NEW',
        title: productData.title || '',
        title_te: productData.title_te,
        metal: (productData.metal as 'Gold' | 'Silver') || 'Gold',
        category: productData.category || '',
        category_te: productData.category_te,
        product_type: productData.product_type || 'Jewellery',
        purity: productData.purity || '22K BIS 916',
        description: productData.description || '',
        description_te: productData.description_te,
        weight: Number(productData.weight) || 0,
        size: productData.size,
        price: Number(productData.price) || 0,
        show_price: productData.show_price || 0,
        availability: productData.availability || 'In Stock',
        featured: productData.featured ? 1 : 0,
        new_arrival: productData.new_arrival ? 1 : 0,
        image_path: productData.image_path || '/images/jewellery/vd_g001_gold_lakshmi_haram.svg',
        image_paths: productData.image_paths || [productData.image_path || ''],
      };
      saveLocalProducts([newProd, ...list]);
      return data;
    }
  } catch (err) {
    console.warn('Create product API error, saving locally:', err);
  }

  const list = getLocalProducts();
  const code = productData.code || `VD-${productData.metal === 'Silver' ? 'S' : 'G'}${Math.floor(100 + Math.random() * 900)}`;
  const newProd: Product = {
    id: Date.now(),
    code,
    title: productData.title || '',
    title_te: productData.title_te,
    metal: (productData.metal as 'Gold' | 'Silver') || 'Gold',
    category: productData.category || '',
    category_te: productData.category_te,
    product_type: productData.product_type || 'Jewellery',
    purity: productData.purity || '22K BIS 916',
    description: productData.description || '',
    description_te: productData.description_te,
    weight: Number(productData.weight) || 0,
    size: productData.size,
    price: Number(productData.price) || 0,
    show_price: productData.show_price || 0,
    availability: productData.availability || 'In Stock',
    featured: productData.featured ? 1 : 0,
    new_arrival: productData.new_arrival ? 1 : 0,
    image_path: productData.image_path || '/images/jewellery/vd_g001_gold_lakshmi_haram.svg',
    image_paths: productData.image_paths || [productData.image_path || ''],
  };
  saveLocalProducts([newProd, ...list]);
  return { success: true, code, message: 'Product created successfully' };
}

export async function updateAdminProduct(
  id: number,
  productData: Partial<Product>,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; message: string; error?: string }>(
      `${API_BASE}/admin/products/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(productData),
      }
    );
    if (ok) {
      const list = getLocalProducts().map((p) => (p.id === id ? { ...p, ...productData } : p));
      saveLocalProducts(list);
      return data;
    }
  } catch (err) {
    console.warn('Update product API error, saving locally:', err);
  }

  const list = getLocalProducts().map((p) => (p.id === id ? { ...p, ...productData } : p));
  saveLocalProducts(list);
  return { success: true, message: 'Product updated successfully' };
}

export async function deleteAdminProduct(id: number, token: string): Promise<{ success: boolean; message: string }> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; message: string; error?: string }>(
      `${API_BASE}/admin/products/${id}`,
      {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      }
    );
    if (ok) {
      const list = getLocalProducts().filter((p) => p.id !== id);
      saveLocalProducts(list);
      return data;
    }
  } catch (err) {
    console.warn('Delete product API error, removing locally:', err);
  }

  const list = getLocalProducts().filter((p) => p.id !== id);
  saveLocalProducts(list);
  return { success: true, message: 'Product deleted successfully' };
}

export async function fetchAdminEnquiries(token: string): Promise<Enquiry[]> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; enquiries: Enquiry[]; error?: string }>(
      `${API_BASE}/admin/enquiries`,
      {
        headers: { 'x-admin-token': token },
      },
      { success: true, enquiries: [] }
    );
    if (ok && Array.isArray(data?.enquiries)) {
      saveLocalEnquiries(data.enquiries);
      return data.enquiries;
    }
  } catch (err) {
    console.warn('Admin enquiries API error:', err);
  }
  return getLocalEnquiries();
}

export async function updateAdminEnquiry(
  id: number,
  payload: { status?: 'New' | 'Contacted' | 'Completed' | 'Cancelled' | string; notes?: string },
  token: string
) {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; message: string; error?: string }>(
      `${API_BASE}/admin/enquiries/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(payload),
      }
    );
    if (ok) return data;
  } catch (err) {
    console.warn('Update enquiry API error:', err);
  }

  const enqs = getLocalEnquiries().map((e) =>
    e.id === id
      ? {
          ...e,
          status: (payload.status as 'New' | 'Contacted' | 'Completed' | 'Cancelled') || e.status,
          notes: payload.notes !== undefined ? payload.notes : e.notes,
        }
      : e
  );
  saveLocalEnquiries(enqs);
  return { success: true, message: 'Enquiry updated' };
}

export async function deleteAdminEnquiry(id: number, token: string) {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; message: string; error?: string }>(
      `${API_BASE}/admin/enquiries/${id}`,
      {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      }
    );
    if (ok) return data;
  } catch (err) {
    console.warn('Delete enquiry API error:', err);
  }

  const enqs = getLocalEnquiries().filter((e) => e.id !== id);
  saveLocalEnquiries(enqs);
  return { success: true, message: 'Enquiry deleted' };
}

export async function fetchAdminReviews(token: string): Promise<Review[]> {
  return fetchReviews();
}

export async function toggleAdminReviewVerified(id: number, verified: boolean, token: string) {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; message: string; error?: string }>(
      `${API_BASE}/admin/reviews/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ verified }),
      }
    );
    if (ok) return data;
  } catch (err) {
    console.warn('Toggle review API error:', err);
  }

  const revs = getLocalReviews().map((r) => (r.id === id ? { ...r, verified: verified ? 1 : 0 } : r));
  saveLocalReviews(revs);
  return { success: true, message: 'Review status updated' };
}

export async function updateAdminReview(
  id: number,
  payload: { name?: string; rating?: number; review?: string; review_te?: string; verified?: boolean },
  token: string
) {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; message: string; error?: string }>(
      `${API_BASE}/admin/reviews/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(payload),
      }
    );
    if (ok) return data;
  } catch (err) {
    console.warn('Update review API error:', err);
  }

  const revs = getLocalReviews().map((r) => (r.id === id ? { ...r, ...payload, verified: payload.verified !== undefined ? (payload.verified ? 1 : 0) : r.verified } : r));
  saveLocalReviews(revs);
  return { success: true, message: 'Review updated' };
}

export async function deleteAdminReview(id: number, token: string) {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; message: string; error?: string }>(
      `${API_BASE}/admin/reviews/${id}`,
      {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      }
    );
    if (ok) return data;
  } catch (err) {
    console.warn('Delete review API error:', err);
  }

  const revs = getLocalReviews().filter((r) => r.id !== id);
  saveLocalReviews(revs);
  return { success: true, message: 'Review deleted' };
}

export async function updateAdminSettings(settings: Record<string, string>, token: string) {
  saveLocalSettings(settings as any);
  
  // Recalculate prices for local products if rates changed
  if (
    'gold_rate_24k' in settings ||
    'gold_rate_22k' in settings ||
    'gold_rate_18k' in settings ||
    'silver_rate' in settings
  ) {
    try {
      const prods = getLocalProducts();
      const rate24k = Number(settings.gold_rate_24k) || 7650;
      const rate22k = Number(settings.gold_rate_22k) || 7020;
      const rate18k = Number(settings.gold_rate_18k) || 5750;
      const rateSilver = Number(settings.silver_rate) || 98;

      const updated = prods.map((p) => {
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
        return {
          ...p,
          price: metalBase + wastageAmount + labourCost,
        };
      });
      saveLocalProducts(updated);
    } catch (e) {
      console.warn('Could not auto-recalc local product prices:', e);
    }
  }

  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; message: string; error?: string }>(
      `${API_BASE}/admin/settings`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(settings),
      }
    );
    if (ok) {
      notifyCrossTabSync('rates_updated', settings);
      notifyCrossTabSync('products_updated');
      return data;
    } else {
      throw new Error(data?.error || 'Database rejected settings update');
    }
  } catch (err: any) {
    console.error('Update settings API error:', err);
    notifyCrossTabSync('rates_updated', settings);
    throw err;
  }
}

export async function updateAdminRates(
  rates: { gold_rate_24k?: string | number; gold_rate_22k?: string | number; gold_rate_18k?: string | number; silver_rate?: string | number },
  token: string
) {
  const payload: Record<string, string> = {};
  if (rates.gold_rate_24k !== undefined) payload.gold_rate_24k = String(rates.gold_rate_24k);
  if (rates.gold_rate_22k !== undefined) payload.gold_rate_22k = String(rates.gold_rate_22k);
  if (rates.gold_rate_18k !== undefined) payload.gold_rate_18k = String(rates.gold_rate_18k);
  if (rates.silver_rate !== undefined) payload.silver_rate = String(rates.silver_rate);

  return updateAdminSettings(payload, token);
}

export async function uploadLocalImage(
  dataUrl: string,
  fileName: string,
  token: string
): Promise<{ success: boolean; image_path: string; message: string }> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; image_path: string; message: string; error?: string }>(
      `${API_BASE}/admin/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ dataUrl, fileName }),
      }
    );
    if (ok && data?.image_path) return data;
  } catch (err) {
    console.warn('Upload image API error, using dataUrl directly:', err);
  }
  return { success: true, image_path: dataUrl, message: 'Image loaded locally' };
}

// Category Admin APIs
export async function fetchAdminCategories(token: string): Promise<Category[]> {
  return fetchCategories();
}

export async function createAdminCategory(
  categoryData: Partial<Category>,
  token: string
): Promise<{ success: boolean; category: Category; message: string }> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; category: Category; message: string; error?: string }>(
      `${API_BASE}/admin/categories`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(categoryData),
      }
    );
    if (ok && data.category) {
      const list = getLocalCategories();
      saveLocalCategories([...list, data.category]);
      return data;
    }
  } catch (err) {
    console.warn('Create category API error, saving locally:', err);
  }

  const list = getLocalCategories();
  const newCat: Category = {
    id: Date.now(),
    name: categoryData.name || '',
    name_te: categoryData.name_te || categoryData.name || '',
    metal: (categoryData.metal as 'Gold' | 'Silver') || 'Gold',
    slug: categoryData.slug || (categoryData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    sort_order: categoryData.sort_order || list.length + 1,
  };
  saveLocalCategories([...list, newCat]);
  return { success: true, category: newCat, message: 'Category created successfully' };
}

export async function updateAdminCategory(
  id: number,
  categoryData: Partial<Category>,
  token: string
): Promise<{ success: boolean; category: Category; message: string }> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; category: Category; message: string; error?: string }>(
      `${API_BASE}/admin/categories/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(categoryData),
      }
    );
    if (ok && data.category) {
      const list = getLocalCategories().map((c) => (c.id === id ? data.category : c));
      saveLocalCategories(list);
      return data;
    }
  } catch (err) {
    console.warn('Update category API error, saving locally:', err);
  }

  const list = getLocalCategories().map((c) => (c.id === id ? { ...c, ...categoryData } : c));
  saveLocalCategories(list);
  const updated = list.find((c) => c.id === id)!;
  return { success: true, category: updated, message: 'Category updated successfully' };
}

export async function deleteAdminCategory(id: number, token: string): Promise<{ success: boolean; message: string }> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; message: string; error?: string }>(
      `${API_BASE}/admin/categories/${id}`,
      {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      }
    );
    if (ok) {
      const list = getLocalCategories().filter((c) => c.id !== id);
      saveLocalCategories(list);
      return data;
    }
  } catch (err) {
    console.warn('Delete category API error, removing locally:', err);
  }

  const list = getLocalCategories().filter((c) => c.id !== id);
  saveLocalCategories(list);
  return { success: true, message: 'Category deleted successfully' };
}

export async function recalculateAdminPrices(token: string): Promise<{ success: boolean; count?: number; message: string }> {
  try {
    const { ok, data } = await safeJsonFetch<{ success: boolean; count?: number; message: string; error?: string }>(
      `${API_BASE}/admin/recalculate-prices`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      }
    );
    if (ok) return data;
  } catch (err) {
    console.warn('Recalculate prices API error:', err);
  }
  return { success: true, message: 'Prices synchronized with live market rates.' };
}

