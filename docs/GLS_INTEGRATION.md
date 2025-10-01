# GLS Integráció Dokumentáció

## Áttekintés

Ez a dokumentum a GLS szállítási integráció implementációját ismerteti a DTF Order Management rendszerben.

## Fájlok

### API Végpontok

- **`app/api/gls/create-parcel/route.ts`** - Csomagcímke létrehozása
- **`app/api/gls/track/[parcelNumber]/route.ts`** - Csomag követése
- **`app/api/gls/webhook/route.ts`** - GLS státusz frissítések fogadása

### Kliensek és Típusok

- **`lib/gls-client.ts`** - GLS API kliens implementáció
- **`lib/types/gls.ts`** - TypeScript típusdefiníciók

### Komponensek

- **`components/OrderDetails.tsx`** - Frissített rendelés részletek komponens GLS támogatással

## API Végpontok Használata

### Csomagcímke Létrehozása

```typescript
POST /api/gls/create-parcel
Content-Type: application/json

{
  "orderId": 123
}
```

**Válasz:**
```json
{
  "success": true,
  "parcelNumber": "123456789",
  "labelUrl": "data:application/pdf;base64,...",
  "trackingUrl": "https://online.gls-hungary.com/tt_page.php?tt_value=123456789"
}
```

### Csomag Követése

```typescript
GET /api/gls/track/[parcelNumber]
```

**Válasz:**
```json
{
  "success": true,
  "parcelNumber": "123456789",
  "status": "Kézbesítve",
  "statusText": "Kézbesítve",
  "location": "Budapest",
  "timestamp": "2025-01-15T10:30:00Z",
  "trackingUrl": "https://online.gls-hungary.com/tt_page.php?tt_value=123456789"
}
```

### Webhook (GLS -> Rendszer)

```typescript
POST /api/gls/webhook
Content-Type: application/json

{
  "parcelNumber": "123456789",
  "status": "Kézbesítve",
  "statusCode": "6",
  "timestamp": "2025-01-15T10:30:00Z",
  "location": "Budapest"
}
```

## Környezeti Változók

A `.env.example` fájl tartalmazza az összes szükséges környezeti változót:

```env
# GLS API
GLS_API_URL=https://api.mygls.hu/ParcelService.svc/json
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

## Adatbázis Séma

Az `Order` modell a következő GLS mezőket tartalmazza:

```prisma
model Order {
  // ...
  glsParcelNumber  String?  // GLS csomag követési szám
  glsLabelUrl      String?  // Címke PDF URL (base64)
  glsStatus        String?  // GLS státusz (magyar)
  glsTrackingUrl   String?  // GLS nyomkövetési URL
  // ...
}
```

## Frontend Használat

Az `OrderDetails` komponens automatikusan megjeleníti a GLS opciókat GLS szállítású rendeléseknél:

1. **Címke létrehozása gomb** - Ha még nincs címke
2. **Csomagszám megjelenítése** - Ha már létezik címke
3. **Státusz megjelenítése** - Legfrissebb GLS státusz
4. **Nyomkövetés link** - Külső GLS tracking oldal
5. **Címke letöltés gomb** - PDF címke letöltése

## Hibakezelés

- Minden API végpont megfelelő HTTP státuszkódokat ad vissza
- Részletes hibaüzenetek a felhasználók számára
- Console logging a fejlesztők számára
- Frontend error state kezelés

## Státusz Kódok

| Kód | Jelentés |
|-----|----------|
| 1 | Csomag regisztrálva |
| 2 | Csomag átvéve |
| 3 | Depóban |
| 4 | Úton a címzetthez |
| 5 | Kézbesítés alatt |
| 6 | Kézbesítve |
| 7 | Sikertelen kézbesítés |
| 8 | Visszaküldve |
| 9 | Megsemmisítve |
| 10 | Tárolva |

## Tesztelés

A GLS API-t éles API kulcsokkal kell tesztelni, mivel sandbox környezet nem áll rendelkezésre.

**Javasolt tesztelési sorrend:**

1. Környezeti változók beállítása
2. Prisma séma frissítése (`npm run db:push`)
3. Teszt rendelés létrehozása GLS szállítással
4. Címke létrehozása
5. Tracking lekérdezése
6. Webhook tesztelése (manuális POST)

## Megjegyzések

- A GLS API SOAP XML protokollt használ
- A címke PDF-ként base64 kódolással érkezik vissza
- A tracking URL a GLS publikus oldalára mutat
- A webhook endpoint a GLS szerverektől várja a hívásokat
