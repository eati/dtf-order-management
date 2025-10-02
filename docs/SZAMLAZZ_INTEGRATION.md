# 🧾 Számlázz.hu Integráció

A DTF Order Management System teljes körű integrációt biztosít a [Számlázz.hu](https://www.szamlazz.hu) számlázó rendszerrel.

## ✨ Funkciók

- ✅ **Automatikus számla kiállítás** - Egy kattintással a rendelésből
- ✅ **Számla sztornózás** - Hibás számlák sztornózása
- ✅ **PDF letöltés** - Számla PDF közvetlen letöltése
- ✅ **E-számla** - Automatikus email küldés az ügyfélnek
- ✅ **Teljes tételes számla** - Termék, szállítás, utánvét külön tételekkel

---

## 🔧 Beállítás

### 1. Számlázz.hu API Kulcs Megszerzése

1. Jelentkezz be a [Számlázz.hu](https://www.szamlazz.hu) fiókodba
2. Menj: **Beállítások → Számlázz.hu API**
3. **Agent kulcs** generálása
4. Másold ki az **API kulcsot**

### 2. Environment Változók Beállítása

Adj hozzá a következő változókat a `.env` fájlhoz:

```env
# Számlázz.hu API
SZAMLAZZ_API_KEY=your_actual_api_key_here
SZAMLAZZ_INVOICE_PREFIX="DTF"
SZAMLAZZ_BANK_NAME="OTP Bank"
SZAMLAZZ_BANK_ACCOUNT="12345678-12345678-12345678"
```

#### Változók magyarázata:

- **SZAMLAZZ_API_KEY**: Számlázz.hu Agent kulcs (kötelező)
- **SZAMLAZZ_INVOICE_PREFIX**: Számla előtag (opcionális, alapértelmezett: "DTF")
- **SZAMLAZZ_BANK_NAME**: Bank neve (opcionális)
- **SZAMLAZZ_BANK_ACCOUNT**: Bankszámlaszám (opcionális)

### 3. Vercel Environment Variables (Production)

Ha Vercel-en fut a production:

1. **Vercel Dashboard** → Projekt → **Settings → Environment Variables**
2. Add hozzá mindegyik változót:
   - `SZAMLAZZ_API_KEY`
   - `SZAMLAZZ_INVOICE_PREFIX`
   - `SZAMLAZZ_BANK_NAME`
   - `SZAMLAZZ_BANK_ACCOUNT`
3. Scope: **Production, Preview, Development**
4. **Save**
5. **Redeploy** a projektet

---

## 📋 Használat

### Számla Kiállítása

1. **Nyiss meg egy rendelést** a dashboard-on
2. Görgess le a **"Számlázás (Számlázz.hu)"** szekcióhoz
3. Kattints **"📄 Számla Kiállítása"** gombra
4. Megerősítés után a számla automatikusan létrejön
5. Az ügyfél **email-ben megkapja** az e-számlát
6. A **PDF letölthető** közvetlenül

### Számla Sztornózása

1. Nyisd meg a rendelést, aminek ki van állítva a számlája
2. A számlázás szekcióban kattints **"🚫 Számla Sztornózása"** gombra
3. Megerősítés után a számla sztornózásra kerül
4. Új számla kiállítható helyette

### Számla Letöltése

1. Ha a számla **kiállítva**, látható a **"📥 Számla Letöltése"** gomb
2. Kattints rá, és a PDF automatikusan letöltődik

---

## 🔗 API Végpontok

### POST `/api/szamlazz/create`

Számla kiállítása egy rendeléshez.

**Request body:**
```json
{
  "orderId": 123
}
```

**Response:**
```json
{
  "success": true,
  "invoiceNumber": "DTF-2025-0001",
  "pdfUrl": "https://www.szamlazz.hu/...",
  "message": "Számla sikeresen kiállítva"
}
```

---

### POST `/api/szamlazz/cancel`

Számla sztornózása.

**Request body:**
```json
{
  "orderId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Számla sikeresen sztornózva"
}
```

---

### GET `/api/szamlazz/download/[invoiceNumber]`

Számla PDF letöltése.

**Response:** PDF fájl (`application/pdf`)

---

## 📊 Számla Tartalma

A számlán a következő tételek szerepelnek:

### 1. Termék Tétel
- **Megnevezés**: `DTF nyomtatás [szélesség]x[hossz]mm ([m²] m²)`
- **Mennyiség**: 1 db
- **Nettó ár**: A rendelésből számított ár
- **ÁFA**: 27%

### 2. Szállítási Tétel (ha van)
- **Megnevezés**: `Szállítási díj (GLS)`
- **Nettó ár**: GLS szállítási díj
- **ÁFA**: 27%

### 3. Utánvét Tétel (ha van)
- **Megnevezés**: `Utánvét kezelési díj`
- **Nettó ár**: Utánvét díj
- **ÁFA**: 27%

---

## 🔍 Hibaelhárítás

### Hiba: "SZAMLAZZ_API_KEY nincs beállítva"

**Megoldás:**
- Ellenőrizd, hogy a `.env` fájlban szerepel-e a `SZAMLAZZ_API_KEY`
- Vercel-en: Environment Variables beállítása és redeploy

### Hiba: "Számlázz.hu API hiba"

**Lehetséges okok:**
1. **Hibás API kulcs** - Ellenőrizd a Számlázz.hu oldalon
2. **Hiányos ügyfél adatok** - Email, cím, stb. kitöltése szükséges
3. **Hálózati hiba** - Próbáld újra

**Debug:**
- Nézd meg a Vercel **Function Logs**-ot
- Ellenőrizd a böngésző konzolt

### Hiba: "Ehhez a rendeléshez már ki van állítva számla"

**Megoldás:**
- Ha újra ki szeretnéd állítani, először **sztornózd** az előzőt

---

## 🧪 Tesztelés

### Teszt Környezet

Számlázz.hu **sandbox** mód használata ajánlott fejlesztéshez:

1. Számlázz.hu oldalon: **Beállítások → API**
2. Kapcsold be a **Teszt módot**
3. Használj teszt API kulcsot

### Manuális Teszt

1. Hozz létre egy rendelést az alkalmazásban
2. Állíts ki számlát
3. Ellenőrizd:
   - ✅ Számla megjelent-e a Számlázz.hu-n
   - ✅ Email érkezett-e az ügyfélnek
   - ✅ PDF letölthető-e
   - ✅ Rendelés státusza frissült-e

---

## 📄 Számla Státuszok

| Státusz | Leírás |
|---------|--------|
| `nincs_számla` | Még nem lett kiállítva számla |
| `kiállítva` | Számla sikeresen kiállítva |
| `sztornózva` | Számla sztornózva (érvénytelen) |

---

## 🔐 Biztonság

- ✅ API kulcs **SOHA NE KERÜLJÖN** Git repository-ba
- ✅ Használj `.env` fájlt (`.gitignore`-ban szerepel)
- ✅ Production környezetben: Vercel Environment Variables
- ✅ HTTPS használata kötelező

---

## 📚 Számlázz.hu Dokumentáció

- **API Docs**: [https://www.szamlazz.hu/szamla/docs/](https://www.szamlazz.hu/szamla/docs/)
- **XML Specifikáció**: [https://www.szamlazz.hu/szamla/docs/xsds/](https://www.szamlazz.hu/szamla/docs/xsds/)

---

## 🎯 Támogatás

Ha problémád van:
1. Ellenőrizd ezt a dokumentációt
2. Nézd meg a **Function Logs**-ot (Vercel)
3. Ellenőrizd a Számlázz.hu API státuszát

---

Sikeres számlázást! 🎉
