from pathlib import Path
import sqlite3, uuid, os
from datetime import datetime
from functools import wraps
import json
from flask import Flask, jsonify, render_template, request, session, send_from_directory
from werkzeug.utils import secure_filename

# Optional local AI background removal. The app still starts if rembg is not installed.
try:
    from rembg import remove as rembg_remove
    REMBG_AVAILABLE = True
except Exception:
    rembg_remove = None
    REMBG_AVAILABLE = False

BASE=Path(__file__).resolve().parent
DB=BASE/"data"/"vaddi.db"
UPLOADS=BASE/"static"/"uploads"
UPLOADS.mkdir(parents=True,exist_ok=True)
app=Flask(__name__,template_folder="templates",static_folder="static")
app.secret_key=os.environ.get("VADDI_SECRET_KEY","vaddi-local-secret-change-me")
app.config["MAX_CONTENT_LENGTH"]=8*1024*1024
ALLOWED={"jpg","jpeg","png","webp","gif"}

CATS=[("Gold Harams & Chokers","Gold"),("Bangles & Kadas","Gold"),("Mangalsutra Chains","Gold"),("Gold Jhumkas","Gold"),("24K Gold Coins","Gold"),("Silver God Idols","Silver"),("Silver Pooja Thali Sets","Silver"),("Silver Kalash & Diyas","Silver"),("Silver Payal & Anklets","Silver"),("Other Silver Articles","Silver")]
PRODUCTS=[
("Classic Lakshmi Haram","VD-GH101","Gold","Gold Harams & Chokers","22K BIS 916",48.6,"24 in",1,1),
("Antique Peacock Choker","VD-GH102","Gold","Gold Harams & Chokers","22K BIS 916",36.25,"18 in",1,0),
("Temple Design Kada Pair","VD-GB201","Gold","Bangles & Kadas","22K BIS 916",32.8,"2.6",0,1),
("Ruby Stone Bangles","VD-GB202","Gold","Bangles & Kadas","22K BIS 916",28.4,"2.4",1,0),
("Classic Mangalsutra Chain","VD-GM301","Gold","Mangalsutra Chains","22K BIS 916",18.9,"22 in",0,1),
("Designer Gold Jhumka","VD-GJ401","Gold","Gold Jhumkas","22K BIS 916",12.75,"Medium",1,1),
("24K Lakshmi Gold Coin 10g","VD-GC501","Gold","24K Gold Coins","24K 999",10,"10 g",1,0),
("Silver Ganesha Idol","VD-SG601","Silver","Silver God Idols","92.5 Silver",185,"4.5 in",1,1),
("Silver Lakshmi Idol","VD-SG602","Silver","Silver God Idols","92.5 Silver",210,"5 in",1,0),
("Silver Pooja Thali Set","VD-SP701","Silver","Silver Pooja Thali Sets","92.5 Silver",320,"12 in",1,0),
("Silver Kalash with Diya Set","VD-SK801","Silver","Silver Kalash & Diyas","92.5 Silver",275,"Set",0,1),
("Bridal Silver Payal Pair","VD-SA901","Silver","Silver Payal & Anklets","92.5 Silver",165,"10 in",1,1)]

def conn():
    c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c

def init_db():
    c=conn()
    c.executescript("""CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL,metal TEXT NOT NULL,sort_order INTEGER DEFAULT 0,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,code TEXT UNIQUE NOT NULL,metal TEXT NOT NULL,category TEXT NOT NULL,purity TEXT NOT NULL,description TEXT,weight REAL,size TEXT,price REAL DEFAULT 0,show_price INTEGER DEFAULT 0,availability TEXT DEFAULT 'In Stock',featured INTEGER DEFAULT 0,new_arrival INTEGER DEFAULT 0,image_path TEXT,created_at TEXT,updated_at TEXT);
    CREATE TABLE IF NOT EXISTS enquiries(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER,product_code TEXT,product_title TEXT,customer_name TEXT NOT NULL,phone TEXT NOT NULL,email TEXT,message TEXT,status TEXT DEFAULT 'New',created_at TEXT);
    CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);""")
    # Lightweight migration for existing installations.
    cols = {r["name"] for r in c.execute("PRAGMA table_info(products)")}
    if "image_paths" not in cols:
        c.execute("ALTER TABLE products ADD COLUMN image_paths TEXT DEFAULT '[]'")
        rows = c.execute("SELECT id,image_path FROM products").fetchall()
        for row in rows:
            c.execute("UPDATE products SET image_paths=? WHERE id=?", (json.dumps([row["image_path"]] if row["image_path"] else []), row["id"]))
    if "product_type" not in cols:
        c.execute("ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'Jewellery'")
    c.commit()

    if c.execute("SELECT COUNT(*) FROM categories").fetchone()[0]==0:
        now=datetime.now().isoformat(timespec="seconds")
        for i,(n,m) in enumerate(CATS): c.execute("INSERT INTO categories(name,metal,sort_order,created_at) VALUES(?,?,?,?)",(n,m,i,now))
    if c.execute("SELECT COUNT(*) FROM products").fetchone()[0]==0:
        now=datetime.now().isoformat(timespec="seconds")
        for x in PRODUCTS:
            t,code,m,cat,p,w,s,f,n=x
            c.execute("""INSERT INTO products(title,code,metal,category,purity,description,weight,size,price,show_price,availability,featured,new_arrival,image_path,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",(t,code,m,cat,p,f"Beautiful {p} VADDI Jewellery creation.",w,s,0,0,"In Stock",f,n,"",now,now))
            pid=c.execute("SELECT last_insert_rowid()").fetchone()[0]
            c.execute("UPDATE products SET image_paths=?,product_type=? WHERE id=?", (json.dumps([]), "Jewellery", pid))
    settings={"store_name":"VADDI Jewellery","tagline":"Timeless Gold & Silver Elegance in Proddatur","phone":"+91 9650052262","whatsapp":"919650052262","address":"VNR &brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta, Proddatur, Andhra Pradesh 516360, India","map_url":"https://maps.app.goo.gl/LcQVnVkd3HuDWsgi9","hours":"Monday to Sunday · 10:00 AM – 9:30 PM"}
    for k,v in settings.items(): c.execute("INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)",(k,v))
    c.commit(); c.close()

def auth(fn):
    @wraps(fn)
    def w(*a,**k):
        return fn(*a,**k) if session.get("admin") else (jsonify(error="Unauthorized"),401)
    return w

def ext_ok(n): return "." in n and n.rsplit(".",1)[1].lower() in ALLOWED

@app.get("/")
def home(): return render_template("index.html")
@app.get("/admin")
def admin(): return render_template("admin.html")
@app.get("/uploads/<path:name>")
def uploads(name): return send_from_directory(UPLOADS,name)

@app.get("/api/products")
def products():
    q=request.args.get("q",""); metal=request.args.get("metal","All"); cat=request.args.get("category","All"); av=request.args.get("availability","All"); sort=request.args.get("sort","featured")
    sql="SELECT * FROM products WHERE 1=1"; p=[]
    if q: sql+=" AND (title LIKE ? OR code LIKE ? OR metal LIKE ? OR category LIKE ? OR purity LIKE ?)"; p += [f"%{q}%"]*5
    if metal in ("Gold","Silver"): sql+=" AND metal=?"; p.append(metal)
    if cat!="All": sql+=" AND category=?"; p.append(cat)
    if av!="All": sql+=" AND availability=?"; p.append(av)
    order={"featured":"featured DESC,new_arrival DESC,id DESC","new":"new_arrival DESC,id DESC","low":"price ASC,id DESC","high":"price DESC,id DESC"}.get(sort,"featured DESC,id DESC")
    sql+=" ORDER BY "+order
    c=conn(); out=[dict(x) for x in c.execute(sql,p)]; cats=[dict(x) for x in c.execute("SELECT * FROM categories ORDER BY sort_order,id")]; c.close()
    return jsonify(products=out,categories=cats)

@app.get("/api/products/<int:pid>")
def product(pid):
    c=conn(); x=c.execute("SELECT * FROM products WHERE id=?",(pid,)).fetchone(); c.close()
    return (jsonify(dict(x)),200) if x else (jsonify(error="Not found"),404)

@app.get("/api/categories")
def categories():
    c=conn(); x=[dict(r) for r in c.execute("SELECT * FROM categories ORDER BY sort_order,id")]; c.close(); return jsonify(x)

@app.get("/api/settings")
def settings():
    c=conn(); x={r["key"]:r["value"] for r in c.execute("SELECT key,value FROM settings")}; c.close(); return jsonify(x)

@app.post("/api/enquiries")
def enquiry():
    d=request.get_json(silent=True) or {}
    if not str(d.get("customer_name","")).strip() or not str(d.get("phone","")).strip(): return jsonify(error="Name and phone are required"),400
    c=conn(); c.execute("""INSERT INTO enquiries(product_id,product_code,product_title,customer_name,phone,email,message,status,created_at) VALUES(?,?,?,?,?,?,?,?,?)""",
      (d.get("product_id"),d.get("product_code",""),d.get("product_title",""),d["customer_name"],d["phone"],d.get("email",""),d.get("message",""),"New",datetime.now().isoformat(timespec="seconds"))); c.commit(); c.close()
    return jsonify(ok=True,message="Enquiry submitted successfully")

@app.post("/api/admin/login")
def login():
    d=request.get_json(silent=True) or {}
    if d.get("password")=="vaddi123": session["admin"]=True; return jsonify(ok=True)
    return jsonify(error="Invalid password"),401
@app.post("/api/admin/logout")
def logout(): session.clear(); return jsonify(ok=True)
@app.get("/api/admin/me")
def me(): return jsonify(authenticated=bool(session.get("admin")))

@app.get("/api/admin/stats")
@auth
def stats():
    c=conn(); r={"gold":c.execute("SELECT COUNT(*) FROM products WHERE metal='Gold'").fetchone()[0],"silver":c.execute("SELECT COUNT(*) FROM products WHERE metal='Silver'").fetchone()[0],"enquiries":c.execute("SELECT COUNT(*) FROM enquiries").fetchone()[0],"out_of_stock":c.execute("SELECT COUNT(*) FROM products WHERE availability='Out of Stock'").fetchone()[0]}; c.close(); return jsonify(r)

@app.get("/api/admin/products")
@auth
def all_products():
    c=conn(); r=[dict(x) for x in c.execute("SELECT * FROM products ORDER BY id DESC")]; c.close(); return jsonify(r)

def generate_product_code(c, metal):
    prefix = "VD-G" if metal == "Gold" else "VD-S"
    row = c.execute(
        "SELECT code FROM products WHERE code LIKE ? ORDER BY id DESC LIMIT 1",
        (prefix + "%",)
    ).fetchone()
    last = 0
    if row:
        try:
            last = int(str(row["code"])[4:])
        except (ValueError, TypeError):
            last = 0
    return f"{prefix}{last+1:03d}"

def remove_image_background(src_path, dest_path):
    """Create the storefront image without making upload depend on AI model availability.
    By default the original image is copied to the processed path.
    Set VADDI_REMOVE_BG=1 to enable local rembg processing.
    """
    if os.getenv("VADDI_REMOVE_BG", "0") != "1" or not REMBG_AVAILABLE:
        shutil.copy2(src_path, dest_path)
        return False, "original image used"
    try:
        with open(src_path, "rb") as inp:
            output = rembg_remove(inp.read())
        with open(dest_path, "wb") as out:
            out.write(output)
        return True, "background removed"
    except Exception as exc:
        shutil.copy2(src_path, dest_path)
        return False, f"background removal failed; original image used: {type(exc).__name__}"


def save_images(files):
    """Validate and normalize uploads. Images are always saved in browser-safe PNG format."""
    paths=[]
    warnings=[]
    max_bytes = 15 * 1024 * 1024

    for f in files:
        if not f or not f.filename:
            continue
        if not ext_ok(f.filename):
            raise ValueError("Unsupported image type. Use JPG, JPEG, PNG, WEBP or GIF.")

        try:
            current = f.stream.tell()
            f.stream.seek(0, os.SEEK_END)
            size = f.stream.tell()
            f.stream.seek(current)
        except Exception:
            size = 0

        if size and size > max_bytes:
            raise ValueError(f"Image '{f.filename}' is larger than 15 MB.")

        base = uuid.uuid4().hex
        original_name = f"{base}_{secure_filename(f.filename)}"
        original_path = UPLOADS / original_name
        f.save(original_path)

        # Normalize using Pillow. This guarantees a browser-compatible image.
        try:
            from PIL import Image, ImageOps
            with Image.open(original_path) as im:
                im = ImageOps.exif_transpose(im)
                if im.mode not in ("RGB", "RGBA"):
                    im = im.convert("RGBA")
                clean_name = f"{base}_clean.png"
                clean_path = UPLOADS / clean_name
                im.save(clean_path, "PNG", optimize=True)
        except Exception as exc:
            # If Pillow conversion fails, retain the original upload path.
            warnings.append(f"{f.filename}: image normalization failed; original retained")
            clean_name = original_name
            clean_path = original_path

        # Optional local background removal. It is disabled by default to keep upload reliable.
        if os.getenv("VADDI_REMOVE_BG", "0") == "1" and REMBG_AVAILABLE:
            try:
                remove_image_background(clean_path, clean_path)
            except Exception:
                pass

        paths.append("/static/uploads/" + clean_name)

    return paths, warnings


def save_image(f):
    if not f or not f.filename: return ""
    if not ext_ok(f.filename): raise ValueError("Unsupported image type")
    n=f"{uuid.uuid4().hex}_{secure_filename(f.filename)}"; f.save(UPLOADS/n); return f"/static/uploads/{n}"

@app.post("/api/admin/products")
@auth
def create_product():
    c = conn()
    try:
        d = request.form
        title = d.get("title", "").strip()
        if not title:
            return jsonify(ok=False, error="Product title is required."), 400

        metal = d.get("metal", "Gold")
        if metal not in ("Gold", "Silver"):
            return jsonify(ok=False, error="Invalid metal type."), 400

        try:
            image_paths, warnings = save_images(request.files.getlist("images"))
        except ValueError as e:
            return jsonify(ok=False, error=str(e)), 400
        except Exception as e:
            app.logger.exception("Image upload failed")
            return jsonify(ok=False, error=f"Image upload failed: {type(e).__name__}: {e}"), 500

        code = generate_product_code(c, metal)
        now = datetime.now().isoformat(timespec="seconds")
        c.execute("""INSERT INTO products
        (title,code,metal,category,purity,description,weight,size,price,show_price,availability,featured,new_arrival,image_path,image_paths,product_type,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (title, code, metal, d.get("category",""), d.get("purity","22K BIS 916"),
         d.get("description",""), float(d.get("weight") or 0), d.get("size",""),
         float(d.get("price") or 0), int(bool(d.get("show_price"))),
         d.get("availability","In Stock"), int(bool(d.get("featured"))),
         int(bool(d.get("new_arrival"))), image_paths[0] if image_paths else "",
         json.dumps(image_paths), d.get("product_type","Jewellery"), now, now))
        c.commit()
        return jsonify(ok=True, code=code, warnings=warnings)
    except Exception as e:
        c.rollback()
        app.logger.exception("Product creation failed")
        return jsonify(ok=False, error=f"Unable to save product: {type(e).__name__}: {e}"), 500
    finally:
        c.close()

@app.put("/api/admin/products/<int:pid>")
@auth
def update_product(pid):
    c = conn()
    try:
        d = request.form
        old = c.execute("SELECT * FROM products WHERE id=?", (pid,)).fetchone()
        if not old:
            return jsonify(ok=False, error="Product not found."), 404

        try:
            new_images, warnings = save_images(request.files.getlist("images"))
        except ValueError as e:
            return jsonify(ok=False, error=str(e)), 400
        except Exception as e:
            app.logger.exception("Image upload failed during update")
            return jsonify(ok=False, error=f"Image upload failed: {type(e).__name__}: {e}"), 500

        try:
            existing = json.loads(old["image_paths"] or "[]") if "image_paths" in old.keys() else []
        except Exception:
            existing = [old["image_path"]] if old["image_path"] else []

        image_paths = new_images if new_images else existing
        now = datetime.now().isoformat(timespec="seconds")
        c.execute("""UPDATE products SET title=?,metal=?,category=?,purity=?,description=?,weight=?,size=?,price=?,show_price=?,
        availability=?,featured=?,new_arrival=?,image_path=?,image_paths=?,product_type=?,updated_at=? WHERE id=?""",
        (d.get("title","").strip(), d.get("metal",old["metal"]), d.get("category",old["category"]),
         d.get("purity",old["purity"]), d.get("description",""), float(d.get("weight") or 0),
         d.get("size",""), float(d.get("price") or 0), int(bool(d.get("show_price"))),
         d.get("availability","In Stock"), int(bool(d.get("featured"))), int(bool(d.get("new_arrival"))),
         image_paths[0] if image_paths else "", json.dumps(image_paths),
         d.get("product_type", old["product_type"] if "product_type" in old.keys() else "Jewellery"),
         now, pid))
        c.commit()
        return jsonify(ok=True, warnings=warnings)
    except Exception as e:
        c.rollback()
        app.logger.exception("Product update failed")
        return jsonify(ok=False, error=f"Unable to update product: {type(e).__name__}: {e}"), 500
    finally:
        c.close()

@app.delete("/api/admin/products/<int:pid>")
@auth
def delete_product(pid):
    c=conn(); c.execute("DELETE FROM products WHERE id=?",(pid,)); c.commit(); c.close(); return jsonify(ok=True)

@app.get("/api/admin/enquiries")
@auth
def enquiries():
    c=conn(); r=[dict(x) for x in c.execute("SELECT * FROM enquiries ORDER BY id DESC")]; c.close(); return jsonify(r)

@app.patch("/api/admin/enquiries/<int:eid>")
@auth
def update_enquiry(eid):
    s=(request.get_json(silent=True) or {}).get("status")
    if s not in {"New","Contacted","Completed","Cancelled"}: return jsonify(error="Invalid status"),400
    c=conn(); c.execute("UPDATE enquiries SET status=? WHERE id=?",(s,eid)); c.commit(); c.close(); return jsonify(ok=True)

@app.post("/api/admin/categories")
@auth
def create_category():
    d=request.get_json(silent=True) or {}; n=str(d.get("name","")).strip(); m=d.get("metal","All")
    if not n or m not in {"Gold","Silver","All"}: return jsonify(error="Invalid category"),400
    c=conn()
    try:
        o=c.execute("SELECT COALESCE(MAX(sort_order),0) FROM categories").fetchone()[0]+1
        c.execute("INSERT INTO categories(name,metal,sort_order,created_at) VALUES(?,?,?,?,?)",(n,m,o,datetime.now().isoformat(timespec="seconds"))); c.commit()
    except sqlite3.IntegrityError: c.close(); return jsonify(error="Category exists"),409
    c.close(); return jsonify(ok=True)

@app.delete("/api/admin/categories/<int:cid>")
@auth
def delete_category(cid):
    c=conn(); c.execute("DELETE FROM categories WHERE id=?",(cid,)); c.commit(); c.close(); return jsonify(ok=True)

@app.get("/health")
def health(): return jsonify(status="ok",database="vaddi.db")

if __name__=="__main__":
    init_db()
    print("VADDI Jewellery: http://127.0.0.1:5000")
    print("Admin: http://127.0.0.1:5000/admin")
    app.run(host="0.0.0.0",port=5000,debug=False)
