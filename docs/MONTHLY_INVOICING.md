# Havi Elszámolás Funkció

## 📋 Áttekintés

A havi elszámolás funkció lehetővé teszi a "havi elszámolásos" fizetési móddal rendelkező ügyfelek rendeléseinek összesítését és számlázását.

## 🎯 Funkciók

### 1. Szűrési Lehetőségek

- **Ügyfél szerint:** Egy adott ügyfél rendeléseinek szűrése
- **Év szerint:** Év kiválasztása (2024, 2025, 2026)
- **Hónap szerint:** Hónap kiválasztása (Január - December)

### 2. Összesítő Statisztikák

A rendszer automatikusan számítja:
- **Rendelések száma:** Összes havi elszámolásos rendelés
- **Összesen m²:** Összes rendelt négyzetméter (számlázási alap)
- **Nettó összesen:** Összes nettó érték
- **ÁFA összesen:** Összes ÁFA
- **Bruttó összesen:** Összes bruttó érték

### 3. Ügyfél Szerinti Csoportosítás

Táblázatos megjelenítés ügyfelenként:
- Ügyfél neve
- Rendelések száma
- Összesen m² (számlázási alap)
- Nettó összeg
- ÁFA összeg
- Bruttó összeg

### 4. Részletes Rendelési Lista

Minden rendelés megjelenítése:
- **Checkbox:** Rendelés kiválasztása tömeges művelethez
- Rendelésszám
- Dátum
- Ügyfél neve
- Leírás
- m² (négyzetméter)
- Nettó és bruttó összeg
- Számla státusz (badge formátumban)
- **Művelet gomb:** Egyedi rendelés számlázottnak jelölése

### 5. Számlázási Műveletek

#### Egyedi Számlázás
- Minden rendelés mellett "Számlázott" gomb
- Egy kattintással jelölhető számlázottnak
- Automatikus számla szám generálás: `INV-{év}-{rendelésID}`

#### Tömeges Számlázás
- Checkbox-okkal kiválasztható rendelések
- "Összes kiválasztása" funkció
- "Kiválasztottak számlázottnak jelölése" gomb
- Megerősítő dialógus
- Tömeges frissítés egy művelettel

## 🔌 API Endpoint

### GET /api/invoicing/monthly

**Query paraméterek:**
- `customerId` (opcionális): Ügyfél ID szűrés
- `year` (opcionális): Év (pl. 2025)
- `month` (opcionális): Hónap (1-12)

**Példa kérés:**
```bash
GET /api/invoicing/monthly?year=2025&month=10
GET /api/invoicing/monthly?customerId=5&year=2025&month=10
```

**Válasz formátum:**
```json
{
  "orders": [
    {
      "id": 1,
      "orderNumber": "ORD-2025-001",
      "createdAt": "2025-10-01T10:00:00Z",
      "totalNet": 10000,
      "totalVat": 2700,
      "totalGross": 12700,
      "customer": {
        "id": 5,
        "name": "Példa Kft.",
        "email": "info@pelda.hu"
      }
    }
  ],
  "summary": {
    "totalOrders": 10,
    "totalSquareMeters": 15.75,
    "totalNet": 100000,
    "totalVat": 27000,
    "totalGross": 127000,
    "byCustomer": {
      "5": {
        "customerName": "Példa Kft.",
        "orderCount": 10,
        "totalSquareMeters": 15.75,
        "totalNet": 100000,
        "totalVat": 27000,
        "totalGross": 127000
      }
    }
  },
  "filters": {
    "customerId": 5,
    "year": 2025,
    "month": 10,
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": "2025-10-31T23:59:59.999Z"
  }
}
```

## 🖥️ Használat

### 1. Navigáció

A főoldalon kattints a **"Havi Elszámolás"** tab-ra. A funkció közvetlenül betöltődik, ugyanúgy mint a többi tab (Dashboard, Rendelések, stb.).

### 2. Szűrés

1. Válaszd ki az **évet** (alapértelmezett: aktuális év)
2. Válaszd ki a **hónapot** (alapértelmezett: aktuális hónap)
3. Opcionálisan válassz egy **ügyfelet** (alapértelmezett: összes)
4. Kattints a **"Szűrés"** gombra

### 3. Eredmények Megtekintése

Az oldal három részre oszlik:

#### Összesítő Kártyák
- Gyors áttekintés a legfontosabb számokról
- Színkódolt megjelenítés (kék: nettó, zöld: bruttó)

#### Ügyfél Szerinti Táblázat
- Minden ügyfél összesített adatai
- Rendezés ügyfélenként
- Gyors áttekintés ügyfél szinten

#### Részletes Rendelési Lista
- Minden egyes rendelés külön sorban
- Számla státusz jelzése
- Kattintható rendelésszámok (jövőbeli funkció)

## 💡 Használati Példák

### Példa 1: Egy Ügyfél Havi Számlázása

1. Válaszd ki az ügyfelet a legördülő menüből
2. Állítsd be az aktuális hónapot
3. Kattints "Szűrés"
4. Az összesítő kártyák megmutatják a számlázandó összeget
5. A részletes lista tartalmazza az összes rendelést

### Példa 2: Havi Összesítés Minden Ügyfélre

1. Ne válassz ügyfelet (maradjon "Összes ügyfél")
2. Állítsd be a hónapot
3. Kattints "Szűrés"
4. Az "Ügyfél szerinti összesítés" táblázat mutatja az összes ügyfelet
5. Lásd, hogy melyik ügyfélnek mennyi a számlázandó összege

### Példa 3: Éves Áttekintés Egy Ügyfélről

1. Válaszd ki az ügyfelet
2. Válts hónapról hónapra
3. Nézd meg a havi bontást

### Példa 4: Tömeges Számlázás

1. Szűrd le a hónapot
2. Jelöld ki az összes rendelést (checkbox a táblázat fejlécében)
3. Kattints a "Kiválasztottak számlázottnak jelölése" gombra
4. Erősítsd meg a műveletet
5. Minden kiválasztott rendelés számlázott státuszra vált

### Példa 5: Egyedi Számlázás

1. Keresd meg a rendelést a listában
2. Kattints a "Számlázott" gombra a rendelés sorában
3. A rendelés azonnal számlázott státuszra vált
4. Megjelenik a zöld "✓ Kiállítva" badge

## 🔧 Technikai Részletek

### Komponensek

- **`components/MonthlyInvoicing.tsx`** - Fő frontend komponens
- **`app/page.tsx`** - Integrálva a főoldalba (invoicing tab)
- **`app/api/invoicing/monthly/route.ts`** - API endpoint

### Adatbázis Lekérdezés

A rendszer a következő feltételekkel szűr:
```typescript
{
  paymentMethod: 'havi_elszámolás',
  customerId: ..., // ha van
  createdAt: {
    gte: startDate,
    lte: endDate
  }
}
```

### Számítások

- **Összesítések:** JavaScript `reduce()` függvénnyel
- **Csoportosítás:** Ügyfél ID szerint objektumba rendezés
- **Formázás:** `Intl.NumberFormat` magyar formátummal

## 📊 Jövőbeli Fejlesztések

- [ ] PDF export funkció
- [ ] Excel export
- [ ] Email küldés ügyfeleknek
- [ ] Automatikus számla generálás
- [ ] Több időszak összehasonlítása
- [ ] Grafikus megjelenítés (diagramok)
- [ ] Szűrés számla státusz szerint
- [ ] Megjegyzések hozzáadása rendelésekhez

## ⚠️ Megjegyzések

- Csak a **"havi_elszámolás"** fizetési móddal rendelkező rendelések jelennek meg
- A dátum szűrés a rendelés **létrehozási dátuma** alapján működik
- Az összegek mindig **HUF** valutában jelennek meg
- A számla státusz csak tájékoztató jellegű (külön számla modul szükséges)

## 🐛 Hibaelhárítás

### "Nincs havi elszámolásos rendelés"

**Ok:** Nincs olyan rendelés, ami megfelel a szűrési feltételeknek.

**Megoldás:**
1. Ellenőrizd, hogy van-e "havi_elszámolás" fizetési móddal rendelés
2. Próbálj más időszakot választani
3. Vedd ki az ügyfél szűrést

### Az összegek nem stimmelnek

**Ok:** Lehet, hogy a rendelések árai hibásak.

**Megoldás:**
1. Ellenőrizd a rendelések részleteit
2. Nézd meg az API választ a böngésző konzolban
3. Ellenőrizd az adatbázisban az összegeket

---

**Utolsó frissítés:** 2025-10-01  
**Verzió:** 1.0  
**Státusz:** ✅ Működőképes
