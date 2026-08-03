# VADDI Jewellery Python Full Stack

Python Flask + SQLite + local image storage. No npm required.

Run on Windows:

```powershell
python -m venv .venv
.venv\\Scripts\\python.exe -m pip install -r requirements.txt
.venv\\Scripts\\python.exe app.py
```

Store: http://127.0.0.1:5000
Admin: http://127.0.0.1:5000/admin
Admin test password: vaddi123

Database is automatically created at `data/vaddi.db` and seeded with sample catalogue data. Product images uploaded through Admin are stored under `static/uploads/` and their paths are stored in SQLite.

## Updated Admin behavior

- Database numeric `id` is generated automatically by SQLite.
- Product code is generated automatically by the backend:
  - Gold: `VD-G001`, `VD-G002`, ...
  - Silver: `VD-S001`, `VD-S002`, ...
- Admin cannot manually change product IDs or codes.
- Metal, product type, category, purity, weight, size, and availability use dropdowns.
- Multiple product images can be uploaded and are stored under `static/uploads/`.
- Image paths are persisted in SQLite.


## Image enhancement

Uploaded product images are saved locally and a processed `_clean.png` copy is generated using `rembg` when installed. The original upload is retained as a fallback.

First installation:
```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

The first background-removal request can download the local model used by `rembg`. After that processing runs locally; product images are not sent to a hosted image API.

The storefront includes a full-screen viewer:
- click an image to open it
- mouse wheel / +/- to zoom
- 1:1 resets the view
- drag to pan while zoomed
- Escape or X closes the viewer
- entire image is fit inside the screen without being cropped


## Upload error fix

The upload API now always returns JSON for `/api/*` errors, including Flask 400/413/500 errors. The admin frontend safely handles non-JSON responses too, so `Unexpected token '<'` should no longer occur.

Image processing is best-effort: if `rembg` fails, the original image is retained and a warning is returned instead of failing the product upload.

Per-image limit: 15 MB. Total request limit: 50 MB.


## Final image upload reliability

Uploads are now normalized with Pillow into browser-safe PNG files before being stored. The AI background-removal step is optional and disabled by default so a missing/corrupt rembg model can never prevent image upload.

To enable local AI background removal after confirming normal uploads work:
```powershell
$env:VADDI_REMOVE_BG="1"
python app.py
```
If rembg fails, the upload still succeeds and the normalized image is used.

The image preview overlay was also rebuilt to use viewport-relative sizing, `object-fit: contain`, centered positioning, and its own zoom/pan state. This prevents the previous "only the top of the image is visible" issue.


## Exact image preview fix

The product card and product-detail popup now use `object-fit: contain` and centered sizing, so the complete uploaded product image is shown instead of the top portion being cropped. The detail popup explicitly uses the selected product's `image_path` from the database.


## Updated showroom address
VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta, Proddatur, Andhra Pradesh 516360, India

Google Maps: https://maps.app.goo.gl/LcQVnVkd3HuDWsgi9
