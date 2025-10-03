# 🚀 Telepítési Útmutató - mhosting.hu

## Rendszerkövetelmények

- **Tárhelyszolgáltató:** mhosting.hu (vagy bármely cPanel/DirectAdmin alapú shared hosting)
- **PHP verzió:** 7.4 vagy újabb
- **MySQL verzió:** 5.7 vagy újabb
- **Apache mod_rewrite:** Engedélyezve
- **cURL extension:** Engedélyezve

---

## 1. Adatbázis Létrehozása

### cPanel-en keresztül

1. Jelentkezz be az mhosting.hu **cPanel**-jére
2. Menj a **MySQL Databases** menüpontba
3. Hozz létre egy új adatbázist:
   - Adatbázis név: `dtf_order_management`
4. Hozz létre egy új felhasználót:
   - Felhasználónév: `dtf_user`
   - Jelszó: *erős jelszó generálása*
5. Add hozzá a felhasználót az adatbázishoz:
   - Válaszd ki: **ALL PRIVILEGES**
6. Menj a **phpMyAdmin**-ba
7. Válaszd ki az új adatbázist
8. **Import** fül → tallózd be a `php/database/schema.sql` fájlt
9. Kattints **Go** gombra

---

## 2. Fájlok Feltöltése

### FTP-n keresztül

1. Csatlakozz FTP klienssel (FileZilla ajánlott)
   - Host: `ftp.yourdomain.hu`
   - Felhasználónév: cPanel felhasználónév
   - Jelszó: cPanel jelszó
   
2. Navigálj a `public_html` vagy `www` könyvtárba

3. Töltsd fel az alábbi fájlokat/könyvtárakat:
   ```
   public_html/
   ├── php/           (teljes könyvtár)
   ├── .htaccess      (php/.htaccess → gyökér)
   ├── index.php      (php/index.php → gyökér)
   └── .env           (létre kell hozni)
   ```

4. **Fontos:** A `php/.htaccess` és `php/index.php` fájlokat másold a gyökér könyvtárba is!

---

## 3. Környezeti Változók Beállítása

1. Másold a `.env.php.example` fájlt `.env` néven a gyökér könyvtárba
2. Szerkeszd a `.env` fájlt:

```env
# Adatbázis (cPanelből másold ki az adatokat)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cpanel_user_dtf_order_management
DB_USER=cpanel_user_dtf_user
DB_PASSWORD=your_secure_password

# GLS API (valódi hitelesítő adatok)
GLS_API_URL=https://api.mygls.hu/ParcelService.svc
GLS_CLIENT_NUMBER=your_client_number
GLS_USERNAME=your_username
GLS_PASSWORD=your_password

# Feladó adatok (céges adatok)
SENDER_NAME="DTF Nyomda Kft."
SENDER_ADDRESS="Valós Utca 123."
SENDER_CITY="Budapest"
SENDER_ZIPCODE="1234"
SENDER_CONTACT_NAME="Kapcsolattartó Neve"
SENDER_PHONE="+36301234567"
SENDER_EMAIL="info@yourdomain.hu"

# Számlázz.hu API
SZAMLAZZ_API_KEY=your_szamlazz_api_key
SZAMLAZZ_INVOICE_PREFIX="DTF"
SZAMLAZZ_BANK_NAME="OTP Bank"
SZAMLAZZ_BANK_ACCOUNT="12345678-12345678-12345678"

# Alkalmazás
APP_URL=https://yourdomain.hu
APP_ENV=production
APP_DEBUG=false

# CORS (éles környezetben állítsd be a konkrét domain-t)
CORS_ALLOWED_ORIGINS=https://yourdomain.hu
```

3. Mentsd el a fájlt

---

## 4. Frontend Build és Telepítés

### Helyi gépen (fejlesztői környezet)

1. Nyisd meg a projekt gyökérkönyvtárát terminálban
2. Módosítsd a `next.config.js` fájlt:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Statikus export engedélyezése
  trailingSlash: true,
  images: {
    unoptimized: true, // Shared hosting-on nincs Image Optimization
  },
  // API URL átállítása
  env: {
    NEXT_PUBLIC_API_URL: 'https://yourdomain.hu/api',
  }
}

module.exports = nextConfig
```

3. Build-eld a projektet:

```bash
npm install
npm run build
```

4. Az `out` könyvtár tartalma lesz a statikus build
5. Töltsd fel az `out` könyvtár teljes tartalmát a `public_html` gyökérbe (FTP-n keresztül)

---

## 5. Jogosultságok Beállítása

Állítsd be a megfelelő fájljogosultságokat (FTP kliens vagy cPanel File Manager):

```
php/logs/          → 755 (írható)
php/uploads/       → 755 (írható)
.env               → 600 (csak olvasható, biztonságos)
```

---

## 6. Tesztelés

### 1. API Tesztelés

Nyisd meg böngészőben:
```
https://yourdomain.hu/api/pricing
```

Elvárható válasz:
```json
{
  "id": 1,
  "pricePerSqm": 6800,
  "vatRate": 27,
  "glsPrice": 1490,
  "codPrice": 600,
  "validFrom": "2025-10-03 09:00:00"
}
```

### 2. Frontend Tesztelés

Nyisd meg:
```
https://yourdomain.hu
```

Az alkalmazásnak be kell töltődnie.

### 3. Funkcionális Tesztek

- ✅ Ügyfél hozzáadása
- ✅ Rendelés létrehozása
- ✅ GLS címke generálás (teszt módban)
- ✅ Számla kiállítás (teszt módban)

---

## 7. Hibakezelés

### Gyakori problémák

#### **API 500 hiba**

**Megoldás:**
1. Ellenőrizd a `php/logs/error.log` fájlt
2. Nézd meg a cPanel Error Logs-t
3. Ellenőrizd az adatbázis kapcsolatot

#### **API 404 - Endpoint nem található**

**Megoldás:**
1. Ellenőrizd, hogy a `.htaccess` fájl a gyökérben van-e
2. Ellenőrizd, hogy a `mod_rewrite` engedélyezve van-e (support ticket az mhosting-nak)

#### **CORS hiba a böngészőben**

**Megoldás:**
1. Állítsd be a `.env` fájlban: `CORS_ALLOWED_ORIGINS=https://yourdomain.hu`
2. Vagy wildcard: `CORS_ALLOWED_ORIGINS=*`

#### **Frontend nem tölt be**

**Megoldás:**
1. Ellenőrizd, hogy az `out` könyvtár tartalma a gyökérben van
2. Ellenőrizd, hogy az `index.html` létezik
3. Nézd meg a böngésző console-t hibákért

---

## 8. Biztonsági Beállítások

### .htaccess biztonság

A `.htaccess` fájl már tartalmazza:
- `.env` fájl elrejtése
- Security headers
- XSS védelem

### SQL Injection védelem

- ✅ Prepared statements (PDO)
- ✅ Input validáció minden endpoint-on

### CSRF védelem

Javasolt: Implementálj CSRF token-t (későbbi verzióban)

---

## 9. Teljesítmény Optimalizálás

### Opcache engedélyezése (cPanel)

1. Menj: **Select PHP Version**
2. **Extensions** → Engedélyezd: `opcache`

### Gzip tömörítés

Már engedélyezve van a `.htaccess`-ben.

### CDN (opcionális)

Használhatsz CloudFlare-t ingyenes CDN-ként.

---

## 10. Backup Stratégia

### Automatikus backup (mhosting.hu)

Az mhosting.hu automatikusan készít napi backup-okat.

### Manuális backup

1. **Adatbázis:** phpMyAdmin → Export → SQL
2. **Fájlok:** FTP-n keresztül letöltés

**Javasolt gyakoriság:** Hetente

---

## 11. Domain Beállítás

Ha a domain nem az mhosting.hu-n van:

1. Állítsd be az **A record**-ot a domain DNS-jében:
   - Host: `@` vagy `www`
   - Value: mhosting.hu szerver IP címe (cPanel-ben megtalálható)

2. Várj 24-48 órát a DNS propagációra

---

## 12. SSL Tanúsítvány (HTTPS)

### mhosting.hu Let's Encrypt

1. cPanel → **SSL/TLS**
2. **Let's Encrypt™ SSL**
3. Domain kiválasztása → **Issue**

Automatikusan feltelepül és megújul 90 naponta.

---

## 13. Frissítések

### Alkalmazás frissítése

1. Helyi gépen dolgozz
2. Build-eld újra: `npm run build`
3. Töltsd fel az új `out` könyvtárat FTP-n
4. Ha PHP változott, töltsd fel a `php` könyvtárat is

### Adatbázis migráció

Ha új táblák/mezők kellenek:
1. Készíts SQL fájlt a változásokkal
2. Futtasd le phpMyAdmin-on keresztül

---

## 14. Monitorozás

### Hibanaplók figyelése

**cPanel → Error Logs** vagy `php/logs/error.log`

### Uptime monitoring (opcionális)

- UptimeRobot.com (ingyenes)
- Pingdom

---

## 15. Támogatás

### mhosting.hu support

- Email: support@mhosting.hu
- Ticket rendszer a cPanel-en keresztül

### Alkalmazás support

- GitHub Issues (ha publikus repo)
- Email: info@yourdomain.hu

---

## ✅ Telepítés Checklist

- [ ] Adatbázis létrehozva
- [ ] SQL séma importálva
- [ ] Fájlok feltöltve FTP-n
- [ ] `.env` fájl konfigurálva
- [ ] Frontend build feltöltve
- [ ] API működik (`/api/pricing` teszt)
- [ ] Frontend betöltődik
- [ ] SSL tanúsítvány telepítve
- [ ] Tesztrendelés sikeres
- [ ] Backup beállítva
- [ ] Monitoring aktív

---

**Gratulálunk! A DTF Order Management rendszer sikeresen telepítve az mhosting.hu-ra! 🎉**
