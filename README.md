# DTF Order Management System

DTF nyomtatási rendelések kezelésére szolgáló Next.js alkalmazás GLS integrációval.

## ✨ Funkciók

- 📦 **Rendeléskezelés** - Teljes körű rendelés nyilvántartás
- 👥 **Ügyfélkezelés** - Számlázási és szállítási adatok
- 🚚 **GLS Integráció** - Automatikus címkekészítés és nyomkövetés
- 💰 **Árazás** - Dinamikus árkalkuláció m² alapján
- 📊 **Statisztikák** - Rendelési és bevételi kimutatások
- 🧾 **Számlázás** - Számla státusz követés

## 🚀 Gyors Indítás

### 1. Telepítés

```bash
npm install
```

### 2. Környezeti Változók

Másold le a `.env.example` fájlt `.env` néven és töltsd ki a szükséges adatokkal:

```bash
cp .env.example .env
```

### 3. Adatbázis Beállítása

```bash
npm run db:push
npx prisma generate
```

### 4. Fejlesztői Szerver Indítása

```bash
npm run dev
```

Nyisd meg a böngészőben: [http://localhost:3000](http://localhost:3000)

## 📚 Dokumentáció

- **[GLS_SETUP.md](GLS_SETUP.md)** - GLS integráció beállítási útmutató
- **[docs/GLS_INTEGRATION.md](docs/GLS_INTEGRATION.md)** - GLS API dokumentáció
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementáció összefoglaló

## 🔧 Technológiák

- **Frontend:** Next.js 15, React 19, TailwindCSS
- **Backend:** Next.js API Routes
- **Adatbázis:** SQLite (Prisma ORM)
- **Integráció:** GLS SOAP XML API
- **Nyelv:** TypeScript

## 📋 Elérhető Scriptek

```bash
npm run dev        # Fejlesztői szerver
npm run build      # Production build
npm run start      # Production szerver
npm run lint       # ESLint ellenőrzés
npm run db:push    # Adatbázis séma frissítése
npm run db:seed    # Teszt adatok betöltése
npm run db:studio  # Prisma Studio (adatbázis böngésző)
```

## 🌐 API Végpontok

### Rendelések
- `GET /api/orders` - Összes rendelés
- `POST /api/orders` - Új rendelés
- `GET /api/orders/[id]` - Rendelés részletei
- `PUT /api/orders/[id]` - Rendelés frissítése
- `DELETE /api/orders/[id]` - Rendelés törlése

### GLS
- `POST /api/gls/create-parcel` - Címke létrehozása
- `GET /api/gls/track/[parcelNumber]` - Nyomkövetés
- `POST /api/gls/webhook` - Státusz frissítések

### Ügyfelek
- `GET /api/customers` - Összes ügyfél
- `POST /api/customers` - Új ügyfél
- `GET /api/customers/[id]` - Ügyfél részletei
- `PUT /api/customers/[id]` - Ügyfél frissítése
- `DELETE /api/customers/[id]` - Ügyfél törlése

### Egyéb
- `GET /api/pricing` - Aktuális árazás
- `GET /api/stats` - Statisztikák

## 🔐 Környezeti Változók

```env
# Adatbázis
DATABASE_URL="file:./dev.db"

# GLS API (SOAP XML - ne használd a /json végződést!)
GLS_API_URL=https://api.mygls.hu/ParcelService.svc
GLS_CLIENT_NUMBER=your_client_number
GLS_USERNAME=your_username
GLS_PASSWORD=your_password

# Feladó adatok
SENDER_NAME="DTF Nyomda Kft."
SENDER_ADDRESS="Fő utca 1."
SENDER_CITY="Budapest"
SENDER_ZIPCODE="1111"
SENDER_CONTACT_NAME="Kapcsolattartó"
SENDER_PHONE="+36301234567"
SENDER_EMAIL="info@dtfnyomda.hu"
```

## 📦 GLS Integráció

A rendszer teljes körű GLS integrációval rendelkezik:

- ✅ Automatikus címkekészítés
- ✅ Nyomkövetési link generálás
- ✅ Státusz frissítések webhook-on keresztül
- ✅ Utánvét (COD) támogatás
- ✅ PDF címke letöltés

Részletes útmutató: **[GLS_SETUP.md](GLS_SETUP.md)**

## 🛠️ Fejlesztés

### TypeScript Ellenőrzés

```bash
npx tsc --noEmit
```

### Build Tesztelés

```bash
npm run build
```

## 📄 Licenc

Privát projekt - DTF Nyomda Kft.

## 🤝 Támogatás

Kérdések esetén fordulj a fejlesztőhöz vagy nézd meg a dokumentációt.
