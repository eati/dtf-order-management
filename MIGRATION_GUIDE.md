# 🔄 Migrációs Útmutató - Vercel → mhosting.hu

## Áttekintés

A rendszer eredeti architektúrája:
- **Vercel Serverless** (Next.js API Routes + PostgreSQL)

Új architektúra:
- **mhosting.hu Shared Hosting** (PHP + MySQL + Next.js Static Export)

---

## Architektúra Változások

### Backend

| Előtte | Utána |
|--------|-------|
| Next.js API Routes | PHP REST API |
| PostgreSQL | MySQL |
| Prisma ORM | PDO (natív PHP) |
| Serverless Functions | Apache + PHP-FPM |
| TypeScript | PHP 7.4+ |

### Frontend

| Előtte | Utána |
|--------|-------|
| Next.js SSR/ISR | Next.js Static Export |
| Vercel Edge Functions | Statikus HTML/CSS/JS |
| Dynamikus route-ok | Statikus route-ok |
| `fetch('/api/...')` | `fetch('/api/...')` (változatlan) |

---

## Változások Részletesen

### 1. Adatbázis Séma

#### PostgreSQL → MySQL konverzió

**PostgreSQL típusok:**
```sql
SERIAL → INT AUTO_INCREMENT
TEXT → TEXT vagy VARCHAR
TIMESTAMP → TIMESTAMP vagy DATETIME
```

**Változások a `schema.prisma`-hoz képest:**
- `@default(autoincrement())` → `AUTO_INCREMENT`
- `DateTime` mezők → `TIMESTAMP` vagy `DATETIME`
- Snake_case mezőnevek (pl. `order_number`)

### 2. API Struktúra

#### Route-ok változása

**Vercel (TypeScript):**
```
app/api/orders/route.ts          → GET, POST /api/orders
app/api/orders/[id]/route.ts     → GET, PUT, DELETE /api/orders/:id
```

**mhosting.hu (PHP):**
```
php/api/index.php                → Router
php/api/orders.php               → GET, POST /api/orders
php/api/orders-id.php            → GET, PUT, DELETE /api/orders/:id
```

#### API válaszok

Mindkét verzió **JSON**-t ad vissza, azonos struktúrával:
```json
{
  "id": 1,
  "orderNumber": "DTF-2025-0001",
  "customerId": 1,
  "totalGross": 8636
}
```

**Különbség:** PHP verzió `snake_case` → `camelCase` konverziót végez.

### 3. Környezeti Változók

#### Vercel `.env`

```env
DATABASE_URL="postgresql://..."
GLS_API_URL=...
```

#### mhosting.hu `.env`

```env
DB_HOST=localhost
DB_NAME=dtf_order_management
DB_USER=user
DB_PASSWORD=pass
GLS_API_URL=...
```

**Új változók:**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (külön mezők)
- `APP_URL`, `APP_ENV`, `APP_DEBUG`
- `CORS_ALLOWED_ORIGINS`

### 4. Frontend Módosítások

#### Next.js Config

```javascript
// next.config.js
module.exports = {
  output: 'export',           // Statikus export
  trailingSlash: true,        // SEO barát URL-ek
  images: { unoptimized: true } // Nincs Image Optimization
}
```

#### API Hívások

**Vercel (relatív):**
```typescript
fetch('/api/orders')
```

**mhosting.hu (környezeti változó):**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
fetch(`${API_URL}/orders`)
```

#### Build folyamat

**Vercel:**
```bash
vercel deploy
```

**mhosting.hu:**
```bash
npm run build        # Statikus export létrehozása
# out/ könyvtár feltöltése FTP-vel
```

---

## Adatmigráció Lépései

### 1. Adatbázis Export (Vercel Postgres)

```bash
# Csatlakozz a Vercel Postgres-hez
vercel env pull .env.local

# Prisma Studio-val exportálj adatokat
npx prisma studio

# Vagy SQL dump (ha van hozzáférés)
pg_dump -h <host> -U <user> dtf_db > dump.sql
```

### 2. Adatok Konverziója

**Opció A: Manuális CSV export/import**

1. Prisma Studio → CSV export minden táblából
2. phpMyAdmin → CSV import MySQL-be

**Opció B: Migráció script** (készíthető)

```php
<?php
// migrate.php - PostgreSQL → MySQL migráció
$source_pg = new PDO('pgsql:host=...');
$target_mysql = new PDO('mysql:host=localhost;dbname=dtf');

// Customers migráció
$customers = $source_pg->query('SELECT * FROM customers')->fetchAll();
foreach ($customers as $customer) {
    $target_mysql->prepare('INSERT INTO customers ...')->execute(...);
}
// ...további táblák
```

### 3. MySQL Adatbázis Feltöltés

```sql
-- 1. Séma létrehozása
SOURCE php/database/schema.sql;

-- 2. Adatok importálása (ha van)
-- CSV vagy INSERT statement-ek
```

---

## Funkcionális Kompatibilitás

### ✅ Támogatott funkciók

- ✅ Rendelések kezelése (CRUD)
- ✅ Ügyfelek kezelése (CRUD)
- ✅ Árazás kezelése
- ✅ GLS API integráció
- ✅ Számlázz.hu integráció
- ✅ Statisztikák
- ✅ Responsive frontend
- ✅ CORS támogatás

### ⚠️ Korlátok

- ⚠️ Nincs real-time update (SSR helyett statikus)
- ⚠️ Nincs Image Optimization
- ⚠️ Nincs automatikus SSL renewal (Let's Encrypt kézi)
- ⚠️ Nincs Edge caching

### ❌ Nem támogatott

- ❌ Vercel Analytics
- ❌ Serverless cron jobs (külön megoldás kell)
- ❌ Incremental Static Regeneration (ISR)

---

## Tesztelési Checklist

### Backend API tesztek

```bash
# Pricing endpoint
curl https://yourdomain.hu/api/pricing

# Orders GET
curl https://yourdomain.hu/api/orders

# Orders POST
curl -X POST https://yourdomain.hu/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":1,"lengthMm":5000,"shippingMethod":"gls","paymentMethod":"előre_utalás"}'
```

### Frontend tesztek

- [ ] Főoldal betöltődik
- [ ] Rendelések listázása működik
- [ ] Rendelés létrehozása működik
- [ ] GLS címke generálás működik
- [ ] Számla kiállítás működik

---

## Teljesítmény Összehasonlítás

| Metrika | Vercel | mhosting.hu |
|---------|--------|-------------|
| **First Load** | ~800ms | ~1200ms |
| **API Response** | ~200ms | ~300ms |
| **Build Time** | 2 min | 3 min (local) |
| **Deploy Time** | 30 sec | 5 min (FTP) |
| **Költség/hó** | $20+ | ~3000 Ft |

---

## Rollback Stratégia

Ha probléma van az mhosting.hu-val:

### 1. Vercel újraindítása

```bash
vercel deploy
```

### 2. DNS átállítás

Vercel domain-re mutasson vissza:
```
A record: vercel IP
```

### 3. Adatok visszamigrálása

PostgreSQL-be visszaimportálni az adatokat.

---

## Következő Lépések

1. ✅ PHP backend telepítése
2. ✅ MySQL adatbázis setup
3. ✅ Frontend build és feltöltés
4. ⬜ Adatok migrálása (ha van)
5. ⬜ DNS átállítás
6. ⬜ SSL tanúsítvány telepítés
7. ⬜ Tesztelés production-ben

---

## Support

**Technikai kérdések:**
- mhosting.hu support: support@mhosting.hu
- PHP issues: `php/logs/error.log`

**Dokumentáció:**
- `DEPLOYMENT_MHOSTING.md` - Részletes telepítési útmutató
- `README.md` - Általános dokumentáció

---

**A migráció sikeres, ha:**
- ✅ API-k válaszolnak
- ✅ Frontend betöltődik
- ✅ Adatok átmásolva
- ✅ GLS és Számlázz.hu működik
- ✅ SSL aktív
