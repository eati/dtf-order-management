# 🚀 Vercel Deployment Útmutató

## Előkészítés (Helyi gépen)

### 1. Git Repository Létrehozása

```bash
git init
git add .
git commit -m "Initial commit"
```

Töltsd fel GitHub-ra, GitLab-ra vagy Bitbucket-re.

---

## Vercel Setup

### 2. Vercel Fiók Készítése

1. Menj a [vercel.com](https://vercel.com) oldalra
2. Jelentkezz be GitHub/GitLab/Bitbucket fiókkal

### 3. Új Projekt Importálása

1. Kattints **"Add New Project"**-re
2. Válaszd ki a Git repository-t
3. Framework: **Next.js** (automatikusan felismeri)
4. Kattints **"Deploy"**-ra (első körben sikertelen lesz, mert nincs még adatbázis)

---

## PostgreSQL Adatbázis Beállítása

### 4. Vercel Postgres Létrehozása

1. A projekt dashboard-on menj a **Storage** fülre
2. Kattints **"Create Database"**
3. Válaszd ki: **Postgres**
4. Nevezd el: `dtf-order-db` (vagy bármilyen név)
5. Régió: **Frankfurt** (legközelebbi EU régió)
6. Kattints **"Create"**

### 5. Környezeti Változók Beállítása

A Vercel automatikusan beállítja a `DATABASE_URL`-t. Most add hozzá a többi változót:

1. Menj a **Settings → Environment Variables**-hoz
2. Add hozzá az alábbi változókat:

```env
# GLS API
GLS_API_URL=https://api.mygls.hu/ParcelService.svc
GLS_CLIENT_NUMBER=<valódi_client_number>
GLS_USERNAME=<valódi_username>
GLS_PASSWORD=<valódi_password>

# Feladó adatok
SENDER_NAME=DTF Nyomda Kft.
SENDER_ADDRESS=Fő utca 1.
SENDER_CITY=Budapest
SENDER_ZIPCODE=1111
SENDER_CONTACT_NAME=Kapcsolattartó
SENDER_PHONE=+36301234567
SENDER_EMAIL=info@dtfnyomda.hu
```

**Fontos:** Minden változóhoz válaszd ki az **"All" (Production, Preview, Development)** scope-ot.

---

## Adatbázis Migráció

### 6. Prisma Migráció Futtatása

Két lehetőséged van:

#### **Opció A: Helyi Gépen (Ajánlott)**

1. Frissítsd a helyi `.env` fájlod a Vercel Postgres kapcsolati stringgel:
   - Másold ki a `DATABASE_URL`-t a Vercel projekt Settings → Environment Variables menüből
   
2. Futtasd le a migrációt:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

3. (Opcionális) Töltsd fel a seed adatokat:

```bash
npm run db:seed
```

#### **Opció B: Vercel CLI-vel**

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate
```

---

## Újra-deploy

### 7. Trigger Új Build

Mivel most már minden konfigurálva van:

1. Menj a Vercel projekt **Deployments** fülre
2. Kattints a legutóbbi deploy-ra → **"Redeploy"**

VAGY:

```bash
git add .
git commit -m "Add deployment configuration"
git push
```

A Vercel automatikusan észleli a push-t és újra-deploy-ol.

---

## ✅ Ellenőrzés

A deployment sikeres, ha:

1. **Build Log**: Nincs hiba
2. **Functions**: Minden API route elérhető
3. **Database**: Kapcsolódás sikeres
4. **UI**: Az alkalmazás betöltődik

---

## 🔍 Teszt

1. Nyisd meg a production URL-t (pl. `https://dtf-order-management.vercel.app`)
2. Próbálj létrehozni egy rendelést
3. Ellenőrizd a GLS integráció működését

---

## 📊 Adatok Migrálása SQLite-ról PostgreSQL-re

Ha már van adatod az SQLite adatbázisban:

### Lehetőség 1: Manuális Export/Import

```bash
# SQLite-ból export
npx prisma db seed

# PostgreSQL-be import
# Frissítsd a DATABASE_URL-t PostgreSQL-re
npm run db:seed
```

### Lehetőség 2: Prisma Studio-val

```bash
npx prisma studio
# Másold át manuálisan az adatokat
```

### Lehetőség 3: Script (Ha sok adat van)

Készíthetek egy migrációs scriptet, ha szükséges.

---

## 🛠️ Hasznos Parancsok

```bash
# Helyi fejlesztés Vercel környezettel
vercel dev

# Környezeti változók letöltése
vercel env pull

# Production log-ok megtekintése
vercel logs

# Domain beállítása
vercel domains add <yourdomain.com>
```

---

## ⚠️ Gyakori Hibák

### 1. **Build Timeout**
- Megoldás: Upgrade-elj Hobby+ vagy Pro fiókra

### 2. **Database Connection Error**
- Ellenőrizd: `DATABASE_URL` helyesen van-e beállítva
- Futtasd le: `npx prisma generate`

### 3. **Environment Variables Nem Töltődnek Be**
- Győződj meg róla, hogy minden scope-nak (Production, Preview, Development) be van állítva
- Redeploy után frissülnek csak

### 4. **Prisma Client Not Generated**
- Add hozzá a `vercel.json`-ba:
  ```json
  {
    "buildCommand": "prisma generate && next build"
  }
  ```

---

## 💰 Költségek

**Vercel Free Tier:**
- ✅ 100 GB bandwidth/hó
- ✅ Unlimited deployments
- ✅ Automatic HTTPS

**Postgres Free Tier:**
- ✅ 256 MB storage
- ✅ 60 óra compute/hó
- ✅ Később upgrade-elhető

Ha túlléped: ~$20/hó Hobby plan ajánlott.

---

## 🎯 Következő Lépések

1. ✅ **Custom Domain**: Add hozzá a saját domain-ed (pl. `dtfnyomda.hu`)
2. ✅ **Analytics**: Kapcsold be a Vercel Analytics-et
3. ✅ **Monitoring**: Állíts be alert-eket
4. ✅ **Backup**: Rendszeres adatbázis mentés

---

## 📞 Támogatás

- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

---

Sikeres deployment-et! 🎉
