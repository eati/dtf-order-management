# GLS Integráció - Beállítási és Tesztelési Útmutató

## 📋 Állapot

A GLS integráció **teljes mértékben implementálva** van a projektben. Az alábbi lépések szükségesek az éles használathoz.

## ✅ Implementált Funkciók

### API Végpontok
- ✅ **POST /api/gls/create-parcel** - Csomagcímke létrehozása
- ✅ **GET /api/gls/track/[parcelNumber]** - Csomag követése
- ✅ **POST /api/gls/webhook** - GLS státusz frissítések fogadása

### Backend
- ✅ **lib/gls-client.ts** - Teljes GLS SOAP XML API kliens
- ✅ **lib/types/gls.ts** - TypeScript típusdefiníciók
- ✅ Adatbázis séma frissítve (glsParcelNumber, glsLabelUrl, glsStatus, glsTrackingUrl)

### Frontend
- ✅ **components/OrderDetails.tsx** - GLS funkciók integrálva
  - Címke létrehozása gomb
  - Csomagszám megjelenítése
  - Státusz megjelenítése
  - Nyomkövetés link
  - Címke letöltés

## 🔧 Beállítási Lépések

### 1. Környezeti Változók Beállítása

Szerkeszd a `.env` fájlt (vagy hozd létre a `.env.example` alapján):

```bash
# GLS API hitelesítési adatok
# FONTOS: Ne add hozzá a /json végződést! A SOAP API-t használjuk.
GLS_API_URL=https://api.mygls.hu/ParcelService.svc
GLS_CLIENT_NUMBER=your_client_number_here
GLS_USERNAME=your_username_here
GLS_PASSWORD=your_password_here

# Feladó adatok (a te céged adatai)
SENDER_NAME="DTF Nyomda Kft."
SENDER_ADDRESS="Fő utca 1."
SENDER_CITY="Budapest"
SENDER_ZIPCODE="1111"
SENDER_CONTACT_NAME="Kapcsolattartó Neve"
SENDER_PHONE="+36301234567"
SENDER_EMAIL="info@dtfnyomda.hu"
```

**Fontos:** A GLS API hitelesítési adatokat a GLS-től kell beszerezned.

### 2. Adatbázis Frissítése

Az adatbázis séma már tartalmazza a szükséges mezőket. Ha még nem futtattad:

```bash
npm run db:push
```

### 3. Prisma Kliens Generálása

```bash
npx prisma generate
```

### 4. Alkalmazás Indítása

```bash
npm run dev
```

Az alkalmazás elérhető lesz: http://localhost:3000

## 🧪 Tesztelési Útmutató

### Előfeltételek
- ✅ Éles GLS API hitelesítési adatok (sandbox nincs)
- ✅ Futó alkalmazás (`npm run dev`)
- ✅ Legalább egy teszt rendelés GLS szállítással

### Tesztelési Lépések

#### 1. Rendelés Létrehozása GLS Szállítással

1. Nyisd meg az alkalmazást: http://localhost:3000
2. Hozz létre egy új rendelést
3. Válaszd a **"GLS"** szállítási módot
4. Töltsd ki a szállítási címet pontosan
5. Mentsd el a rendelést

#### 2. GLS Címke Létrehozása

1. Nyisd meg a rendelés részleteit
2. Kattints a **"GLS Címke Létrehozása"** gombra
3. Erősítsd meg a műveletet
4. Várd meg, amíg a címke létrejön

**Elvárt eredmény:**
- ✅ Megjelenik a csomagszám
- ✅ Megjelenik a "Címke letöltése" gomb
- ✅ Megjelenik a "Nyomkövetés" link
- ✅ Státusz: "Címke létrehozva"

#### 3. Címke Letöltése

1. Kattints a **"Címke letöltése"** gombra
2. A PDF címke letöltődik

**Elvárt eredmény:**
- ✅ PDF fájl letöltődik
- ✅ A PDF tartalmazza a GLS címkét vonalkóddal

#### 4. Nyomkövetés Tesztelése

1. Kattints a **"Nyomkövetés"** linkre
2. Megnyílik a GLS publikus nyomkövetési oldala

**Elvárt eredmény:**
- ✅ A GLS oldal megnyílik új ablakban
- ✅ A csomagszám automatikusan be van írva
- ✅ Látható a csomag státusza

#### 5. API Tesztelés (Opcionális)

**Címke létrehozása API-n keresztül:**
```bash
curl -X POST http://localhost:3000/api/gls/create-parcel \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1}'
```

**Nyomkövetés API-n keresztül:**
```bash
curl http://localhost:3000/api/gls/track/123456789
```

## 🐛 Hibaelhárítás

### "GLS API error: 404 Not Found"

**Probléma:** Hibás API URL - valószínűleg `/json` végződéssel van beállítva.

**Megoldás:**
1. Nyisd meg a `.env` fájlt
2. Ellenőrizd a `GLS_API_URL` értékét
3. **Helyes:** `https://api.mygls.hu/ParcelService.svc` ✅
4. **Hibás:** `https://api.mygls.hu/ParcelService.svc/json` ❌
5. Mentsd el és indítsd újra az alkalmazást (`npm run dev`)

**Magyarázat:** A kód SOAP XML API-t használ, nem JSON-t. A `/json` végződés 404-es hibát okoz.

### "GLS API credentials are not configured properly"

**Probléma:** A környezeti változók nincsenek beállítva.

**Megoldás:**
1. Ellenőrizd, hogy a `.env` fájl létezik
2. Ellenőrizd, hogy a GLS_USERNAME, GLS_PASSWORD, GLS_CLIENT_NUMBER be vannak állítva
3. Indítsd újra az alkalmazást

### "Hiba a GLS címke létrehozása során"

**Lehetséges okok:**
1. Hibás API hitelesítési adatok
2. Hibás szállítási cím formátum
3. GLS API nem elérhető

**Megoldás:**
1. Ellenőrizd a konzol logokat (`console.error`)
2. Ellenőrizd a GLS API hitelesítési adatokat
3. Ellenőrizd a szállítási cím formátumát (irányítószám, város, utca)

### "Csomag nem található" a nyomkövetésnél

**Probléma:** A csomag még nem került be a GLS rendszerébe.

**Megoldás:**
- Várj néhány órát, amíg a GLS feldolgozza a csomagot
- A címke létrehozása után a csomag még nem azonnal követhető

## 📊 Státusz Kódok

| Kód | Magyar Jelentés | Leírás |
|-----|----------------|--------|
| 1 | Csomag regisztrálva | A címke létrejött |
| 2 | Csomag átvéve | A GLS átvette a csomagot |
| 3 | Depóban | A csomag a depóban van |
| 4 | Úton a címzetthez | Szállítás alatt |
| 5 | Kézbesítés alatt | A futár kiszállítja |
| 6 | Kézbesítve | Sikeresen kézbesítve |
| 7 | Sikertelen kézbesítés | Nem sikerült kézbesíteni |
| 8 | Visszaküldve | Visszaküldés folyamatban |
| 9 | Megsemmisítve | A csomag megsemmisítésre került |
| 10 | Tárolva | Tárolás alatt |

## 📝 Megjegyzések

### Utánvét (COD) Támogatás
- ✅ Az integráció támogatja az utánvétet
- Ha a rendelés fizetési módja "utánvét", automatikusan beállítja a COD összeget
- A COD összeg a rendelés teljes bruttó összege

### Címke Formátum
- A címkék **A4_2x2** formátumban készülnek
- Egy A4-es lapon 4 címke fér el
- A címke PDF formátumban base64 kódolással érkezik

### Webhook
- A webhook endpoint: `/api/gls/webhook`
- A GLS automatikusan értesíti a rendszert státusz változásokról
- A webhook URL-t be kell állítani a GLS admin felületén

## 🔗 Hasznos Linkek

- **GLS API Dokumentáció:** https://api.mygls.hu/
- **GLS Nyomkövetés:** https://online.gls-hungary.com/
- **Projekt Dokumentáció:** [docs/GLS_INTEGRATION.md](docs/GLS_INTEGRATION.md)

## ✅ Ellenőrző Lista

Használat előtt ellenőrizd:

- [ ] `.env` fájl létezik és tartalmazza a GLS hitelesítési adatokat
- [ ] Feladó adatok helyesen vannak beállítva
- [ ] Adatbázis frissítve (`npm run db:push`)
- [ ] Prisma kliens generálva (`npx prisma generate`)
- [ ] Alkalmazás sikeresen elindul (`npm run dev`)
- [ ] TypeScript hibák nincsenek (`npx tsc --noEmit`)
- [ ] Build sikeres (`npm run build`)

## 🎯 Következő Lépések

1. ✅ Szerezd be a GLS API hitelesítési adatokat
2. ✅ Állítsd be a környezeti változókat
3. ✅ Teszteld az integrációt teszt rendeléssel
4. ✅ Állítsd be a webhook URL-t a GLS admin felületén
5. ✅ Éles használat megkezdése

---

**Utolsó frissítés:** 2025-10-01  
**Verzió:** 1.0  
**Státusz:** ✅ Éles használatra kész
