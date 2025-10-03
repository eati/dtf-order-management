# 🎨 DTF Order Management - PHP Edition

**Rendeléskezelő rendszer DTF nyomdák részére** - mhosting.hu kompatibilis verzió

## 📋 Tartalomjegyzék

- [Áttekintés](#áttekintés)
- [Funkciók](#funkciók)
- [Technológiai Stack](#technológiai-stack)
- [Telepítés](#telepítés)
- [Használat](#használat)
- [API Dokumentáció](#api-dokumentáció)
- [Fejlesztés](#fejlesztés)

---

## 🎯 Áttekintés

Ez a DTF Order Management rendszer **PHP változata**, amely mhosting.hu és más shared hosting szolgáltatásokon futtatható.

**Fő különbségek a Vercel verzióhoz képest:**
- ✅ PHP backend (Next.js API Routes helyett)
- ✅ MySQL adatbázis (PostgreSQL helyett)
- ✅ Statikus Next.js frontend export
- ✅ Apache + .htaccess konfiguráció
- ✅ cPanel kompatibilitás

---

## ✨ Funkciók

### Rendeléskezelés
- 📦 Új rendelések létrehozása automatikus rendelésszám generálással
- 💰 Automatikus árkalkuláció (négyzetméter alapú)
- 📊 Rendelések státuszkövetése (új → gyártásban → kész → kiszállítva)
- 🔍 Szűrés és keresés

### Ügyfélkezelés
- 👥 Ügyféladatok tárolása
- 📍 Számlázási és szállítási címek
- 🏢 Cég és adószám támogatás
- 📝 Jegyzetek és kapcsolattartási adatok

### Szállítás & Számlázás
- 🚚 **GLS API integráció**
  - Automatikus címkegenerálás
  - Nyomkövetés
  - Utánvét támogatás
- 🧾 **Számlázz.hu integráció**
  - Számla kiállítás
  - Számla sztornózás
  - PDF letöltés

### Árazás
- 💵 Dinamikus árkezelés
- 📈 Árelőzmények nyilvántartása
- ⚙️ ÁFA, szállítási és utánvét díjak kezelése

---

## 🛠️ Technológiai Stack

### Backend
- **PHP** 7.4+ (8.0+ ajánlott)
- **MySQL** 5.7+ / MariaDB 10.3+
- **Apache** 2.4+ mod_rewrite-tal
- **cURL** extension

### Frontend
- **Next.js** 15.5.4 (Static Export)
- **React** 19.1.1
- **TypeScript** 5.x
- **Tailwind CSS** 3.3.0

### Külső API-k
- GLS MyGLS API
- Számlázz.hu API

---

## 📦 Telepítés

### Gyors Telepítés (mhosting.hu)

1. **Adatbázis létrehozása**
   ```sql
   -- cPanel → MySQL Databases
   -- Új adatbázis: dtf_order_management
   -- Új user: dtf_user (ALL PRIVILEGES)
   ```

2. **SQL Séma importálása**
   ```bash
   # phpMyAdmin → Import
   php/database/schema.sql
   ```

3. **Fájlok feltöltése**
   ```bash
   # FTP-vel a public_html könyvtárba
   - php/ (teljes könyvtár)
   - .htaccess (php/.htaccess másolata)
   - index.php (php/index.php másolata)
   ```

4. **Környezeti változók**
   ```bash
   # Másold és szerkeszd
   cp .env.php.example .env
   nano .env
   ```

5. **Frontend build**
   ```bash
   npm install
   npm run build
   # out/ könyvtár feltöltése FTP-vel
   ```

**Részletes útmutató:** [DEPLOYMENT_MHOSTING.md](DEPLOYMENT_MHOSTING.md)

---

## 🚀 Használat

### Fejlesztői Környezet

```bash
# Függőségek telepítése
npm install

# Fejlesztői szerver (Next.js)
npm run dev

# PHP backend tesztelés (XAMPP/MAMP)
# Másold a php/ könyvtárat a htdocs-ba
# Konfiguráld a .env fájlt
# Látogasd meg: http://localhost/php/api/pricing
```

### Production Build

```bash
# Frontend build
npm run build

# Eredmény: out/ könyvtár
# Töltsd fel FTP-vel a public_html-be
```

---

## 📚 API Dokumentáció

### Base URL
```
https://yourdomain.hu/api
```

### Endpoints

#### Orders (Rendelések)

```http
GET    /api/orders              # Összes rendelés
GET    /api/orders?status=új    # Szűrés státusz szerint
GET    /api/orders/123          # Egy rendelés
POST   /api/orders              # Új rendelés
PUT    /api/orders/123          # Rendelés frissítése
DELETE /api/orders/123          # Rendelés törlése
```

**Példa request (POST /api/orders):**
```json
{
  "customerId": 1,
  "lengthMm": 5000,
  "shippingMethod": "gls",
  "paymentMethod": "előre_utalás",
  "description": "Logo matrica",
  "deadline": "2025-10-10"
}
```

#### Customers (Ügyfelek)

```http
GET    /api/customers           # Összes ügyfél
GET    /api/customers/123       # Egy ügyfél
POST   /api/customers           # Új ügyfél
PUT    /api/customers/123       # Ügyfél frissítése
DELETE /api/customers/123       # Ügyfél törlése
```

#### Pricing (Árazás)

```http
GET    /api/pricing             # Aktuális árazás
POST   /api/pricing             # Új árazás létrehozása
```

#### Stats (Statisztikák)

```http
GET    /api/stats               # Dashboard statisztikák
```

#### GLS

```http
POST   /api/gls/create-parcel   # Csomag létrehozása
GET    /api/gls/track/{number}  # Nyomkövetés
```

#### Számlázz.hu

```http
POST   /api/szamlazz/create     # Számla kiállítása
POST   /api/szamlazz/cancel     # Számla sztornózása
GET    /api/szamlazz/download/{invoiceNumber}  # PDF letöltés
```

---

## 🔧 Konfiguráció

### .env fájl

```env
# Adatbázis
DB_HOST=localhost
DB_NAME=dtf_order_management
DB_USER=your_user
DB_PASSWORD=your_password

# GLS API
GLS_USERNAME=your_gls_username
GLS_PASSWORD=your_gls_password
GLS_CLIENT_NUMBER=your_client_number

# Számlázz.hu
SZAMLAZZ_API_KEY=your_api_key
SZAMLAZZ_BANK_ACCOUNT=12345678-12345678-12345678

# Feladó
SENDER_NAME="DTF Nyomda Kft."
SENDER_EMAIL="info@dtfnyomda.hu"
```

### Jogosultságok

```bash
chmod 755 php/logs/
chmod 755 php/uploads/
chmod 600 .env
```

---

## 🧪 Tesztelés

### API Tesztek

```bash
# Pricing endpoint
curl https://yourdomain.hu/api/pricing

# Orders lista
curl https://yourdomain.hu/api/orders

# Stats
curl https://yourdomain.hu/api/stats
```

### Frontend Teszt

1. Nyisd meg: `https://yourdomain.hu`
2. Hozz létre egy új ügyfelet
3. Hozz létre egy rendelést
4. Generálj GLS címkét (teszt módban)
5. Állíts ki számlát (teszt módban)

---

## 🐛 Hibaelhárítás

### API 500 hiba

```bash
# Nézd meg a log-okat
tail -f php/logs/error.log

# Vagy cPanel Error Logs
```

### Adatbázis kapcsolat hiba

```bash
# Ellenőrizd a .env fájlt
cat .env | grep DB_

# Teszteld a kapcsolatot
mysql -u USER -p -h localhost DATABASE
```

### Frontend nem tölt be

```bash
# Ellenőrizd, hogy az out/ könyvtár fel van-e töltve
ls -la out/

# Ellenőrizd az index.html létezését
ls -la index.html
```

---

## 📁 Könyvtárstruktúra

```
dtf-order-management/
├── php/
│   ├── api/                    # API végpontok
│   │   ├── index.php          # Router
│   │   ├── orders.php
│   │   ├── customers.php
│   │   └── ...
│   ├── classes/               # PHP osztályok
│   │   ├── Database.php
│   │   ├── Order.php
│   │   ├── Customer.php
│   │   ├── GLSClient.php
│   │   └── SzamlazzClient.php
│   ├── config/
│   │   └── config.php         # Konfiguráció
│   ├── database/
│   │   └── schema.sql         # MySQL séma
│   ├── logs/                  # Hibanaplók
│   └── uploads/               # Fájl feltöltések
├── app/                       # Next.js app
├── components/                # React komponensek
├── lib/                       # Utility könyvtárak
├── public/                    # Statikus fájlok
├── out/                       # Build output (gitignore-ban)
├── .htaccess                  # Apache konfig
├── index.php                  # Entry point
├── .env                       # Környezeti változók (gitignore-ban)
└── package.json
```

---

## 🔐 Biztonság

### Implementált védelmi mechanizmusok

- ✅ **SQL Injection védelem** - Prepared statements (PDO)
- ✅ **XSS védelem** - Input sanitization
- ✅ **CORS konfiguráció** - Restricted origins
- ✅ **.env fájl védelem** - .htaccess tiltás
- ✅ **HTTPS támogatás** - SSL/TLS
- ✅ **Security headers** - X-Frame-Options, X-Content-Type-Options

### Javasolt további lépések

- 🔒 Rate limiting (pl. fail2ban)
- 🔒 CSRF token implementáció
- 🔒 API key authentication
- 🔒 IP whitelist (admin funkciókhoz)

---

## 📊 Teljesítmény

### Optimalizációk

- ✅ Gzip tömörítés
- ✅ Browser caching
- ✅ Statikus asset-ek cache
- ✅ Opcache (PHP)
- ⬜ Redis cache (opcionális)
- ⬜ CDN (CloudFlare)

---

## 🤝 Közreműködés

Ez egy zárt projekt, de issue-k és pull request-ek welcome.

---

## 📄 Licenc

Proprietary - Minden jog fenntartva.

---

## 📞 Support

- **Email:** info@dtfnyomda.hu
- **Dokumentáció:** 
  - [DEPLOYMENT_MHOSTING.md](DEPLOYMENT_MHOSTING.md) - Telepítési útmutató
  - [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Vercel → mhosting.hu migráció

---

**Verzió:** 1.0.0 (PHP Edition)  
**Utolsó frissítés:** 2025-10-03
