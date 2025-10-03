# ⚡ Gyors Kezdési Útmutató - mhosting.hu

## 🎯 5 Lépésben Élesbe Állítás

### 1️⃣ Adatbázis Setup (5 perc)

**cPanel → MySQL Databases**

```
1. Új adatbázis: dtf_order_management
2. Új user: dtf_user + erős jelszó
3. User hozzáadása DB-hez (ALL PRIVILEGES)
```

**phpMyAdmin → Import**

```
Fájl: php/database/schema.sql → Go
```

✅ **Ellenőrzés:** 3 tábla létrejött (customers, orders, pricing)

---

### 2️⃣ Fájlok Feltöltése (10 perc)

**FileZilla vagy cPanel File Manager**

```
FTP Host: ftp.yourdomain.hu
User: cPanel username
Pass: cPanel password

Útvonal: public_html/
```

**Feltöltendő:**

```
public_html/
  ├── php/          (teljes könyvtár)
  ├── .htaccess     (php/.htaccess másolata)
  ├── index.php     (php/index.php másolata)
```

✅ **Ellenőrzés:** `php/api/index.php` létezik

---

### 3️⃣ .env Konfiguráció (5 perc)

**Hozz létre `.env` fájlt a gyökérben:**

```env
# Adatbázis (cPanelből másold ki)
DB_HOST=localhost
DB_NAME=cpanel_xxx_dtf_order_management
DB_USER=cpanel_xxx_dtf_user
DB_PASSWORD=xxxxxxxxxxxxxxx

# GLS API (töltsd ki később)
GLS_USERNAME=
GLS_PASSWORD=
GLS_CLIENT_NUMBER=

# Számlázz.hu (töltsd ki később)
SZAMLAZZ_API_KEY=

# Feladó adatok
SENDER_NAME="DTF Nyomda Kft."
SENDER_EMAIL="info@yourdomain.hu"
SENDER_PHONE="+36301234567"

# App
APP_URL=https://yourdomain.hu
APP_ENV=production
APP_DEBUG=false
```

**Jogosultság:**

```bash
chmod 600 .env  # Csak tulajdonos olvasható
```

✅ **Ellenőrzés:** Nyisd meg: `https://yourdomain.hu/api/pricing`

**Várt válasz:**
```json
{"id":1,"pricePerSqm":6800,"vatRate":27,"glsPrice":1490,"codPrice":600}
```

---

### 4️⃣ Frontend Build (15 perc)

**Helyi gépen:**

```bash
# 1. Telepítés
npm install

# 2. Build
npm run build

# Eredmény: out/ könyvtár
```

**FTP feltöltés:**

```
out/ könyvtár tartalma → public_html/ (gyökér)
```

**Fontos fájlok:**
```
public_html/
  ├── index.html
  ├── _next/
  ├── favicon.ico
  └── ...
```

✅ **Ellenőrzés:** Nyisd meg: `https://yourdomain.hu`

---

### 5️⃣ SSL Tanúsítvány (2 perc)

**cPanel → SSL/TLS → Let's Encrypt**

```
1. Domain kiválasztása
2. Issue gomb
3. Várakozás (~30 sec)
```

✅ **Ellenőrzés:** `https://` működik

---

## 🧪 Gyors Teszt

### API Teszt (cURL)

```bash
# Pricing
curl https://yourdomain.hu/api/pricing

# Stats
curl https://yourdomain.hu/api/stats
```

### Frontend Teszt

1. Nyisd meg: `https://yourdomain.hu`
2. Kattints **"Új Rendelés"**
3. Ha hibát ad → Nézd meg a browser console-t

---

## ⚠️ Gyakori Hibák

### API 500 - Internal Server Error

**Ok:** Adatbázis kapcsolat hiba

**Megoldás:**
```bash
# Ellenőrizd .env fájlt
cat .env | grep DB_

# Teszteld
php -r "new PDO('mysql:host=localhost;dbname=DB_NAME', 'DB_USER', 'DB_PASSWORD');"
```

### API 404 - Not Found

**Ok:** .htaccess nem töltődött be

**Megoldás:**
```apache
# Ellenőrizd a .htaccess fájlt
cat .htaccess | grep RewriteEngine

# Ha hiányzik, másold be a php/.htaccess tartalmat
```

### Frontend betölt, de API nem működik

**Ok:** CORS vagy API URL probléma

**Megoldás:**
```env
# .env fájlban
CORS_ALLOWED_ORIGINS=https://yourdomain.hu
```

---

## 📊 Rendszer Státusz Ellenőrzés

### Checklist

```
✅ Adatbázis kapcsolat: curl https://yourdomain.hu/api/pricing
✅ Frontend betöltés: https://yourdomain.hu
✅ SSL működik: https:// van
✅ API végpontok: /api/orders, /api/customers, /api/stats
```

---

## 🚀 Következő Lépések

1. **GLS API konfiguráció**
   - Regisztráció: https://www.gls-hungary.com
   - API hitelesítő adatok beszerzése
   - .env frissítése

2. **Számlázz.hu konfiguráció**
   - Regisztráció: https://www.szamlazz.hu
   - API kulcs generálása
   - .env frissítése

3. **Első rendelés létrehozása**
   - Új ügyfél hozzáadása
   - Rendelés rögzítése
   - Ár kalkuláció tesztelése

4. **Backup beállítása**
   - Automatikus: mhosting.hu default
   - Manuális: Hetente phpMyAdmin export

---

## 📞 Segítség Kérése

**mhosting.hu support:**
- Email: support@mhosting.hu
- Telefon: (cPanel-ben található)

**Alkalmazás dokumentáció:**
- [DEPLOYMENT_MHOSTING.md](DEPLOYMENT_MHOSTING.md) - Részletes telepítési útmutató
- [README_PHP.md](README_PHP.md) - Teljes dokumentáció
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Vercel → mhosting.hu migráció

---

**Becsült telepítési idő:** 30-40 perc  
**Szükséges tudás:** Alapfokú cPanel/FTP ismeretek

**Készen állsz? Kezdjük! 🚀**
