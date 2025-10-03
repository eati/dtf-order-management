# 🚀 Deployment Opciók - mhosting.hu

## Áttekintés

Az mhosting.hu shared hosting-ra több módon is feltöltheted az alkalmazást:

| Módszer | Sebesség | Automatizálás | Nehézség | Ajánlott |
|---------|----------|---------------|----------|----------|
| **FTP/SFTP** | ⭐⭐ | ❌ | Könnyű | Kezdőknek |
| **cPanel Git** | ⭐⭐⭐ | ✅ | Közepes | ⭐ Legjobb |
| **SSH rsync** | ⭐⭐⭐⭐ | ✅ | Nehéz | Haladóknak |
| **GitHub Actions** | ⭐⭐⭐⭐⭐ | ✅✅ | Nehéz | CI/CD |

---

## 1️⃣ FTP/SFTP (FileZilla) - Hagyományos

### Előkészítés

```bash
# Frontend build
npm run build
```

### FileZilla Setup

```
Host: ftp.yourdomain.hu (vagy sftp://)
Username: cPanel username
Password: cPanel password
Port: 21 (FTP) vagy 22 (SFTP)
```

### Feltöltés

```
Helyi (bal oldal)          →  Szerver (jobb oldal)
─────────────────────────────────────────────────
out/                       →  /public_html/
php/                       →  /public_html/php/
php/.htaccess              →  /public_html/.htaccess
php/index.php              →  /public_html/index.php
.env (kézzel szerkesztve)  →  /public_html/.env
```

**Előnyök:**
- ✅ Egyszerű, GUI-s
- ✅ Nincs technikai előismeret szükséges
- ✅ Mindig működik

**Hátrányok:**
- ❌ Lassú (különösen sok fájlnál)
- ❌ Manuális folyamat
- ❌ Nincs verziókövetés

**Időigény:** ~10-15 perc frissítésenként

---

## 2️⃣ cPanel Git Version Control ⭐ JAVASOLT

### Előfeltételek

Ellenőrizd, hogy elérhető-e:
```
cPanel → Software → Git Version Control
```

Ha **IGEN**, akkor:

### 1. GitHub/GitLab Repository

```bash
# Helyi repo inicializálása
git init
git add .
git commit -m "Initial commit - PHP version"

# Remote hozzáadása
git remote add origin https://github.com/yourusername/dtf-order-management.git
git branch -M main
git push -u origin main
```

### 2. cPanel Git Setup

**cPanel → Git Version Control → Create**

```
Clone URL: https://github.com/yourusername/dtf-order-management.git
Repository Path: /home/username/repositories/dtf-order-management
Clone: ✓
```

**Deployment beállítás:**

```bash
# cPanel → Advanced → Terminal (vagy SSH)
cd /home/username/repositories/dtf-order-management

# Build script létrehozása
nano .cpanel.yml
```

**.cpanel.yml tartalma:**

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/username/public_html
    - /bin/cp -R php $DEPLOYPATH/
    - /bin/cp php/.htaccess $DEPLOYPATH/
    - /bin/cp php/index.php $DEPLOYPATH/
    # Frontend build (ha van Node.js)
    # - npm install
    # - npm run build
    # - /bin/cp -R out/* $DEPLOYPATH/
```

### 3. Deploy Workflow

```bash
# Helyi gépen fejlesztés
git add .
git commit -m "Feature X implemented"
git push origin main

# cPanel-ben
# Git Version Control → Pull or Deploy → Deploy HEAD Commit
```

**Előnyök:**
- ✅ Gyors frissítés (1 kattintás)
- ✅ Git verziókövetés
- ✅ Automatikus deployment
- ✅ Rollback lehetőség

**Hátrányok:**
- ⚠️ Nem minden hosting csomag támogatja
- ⚠️ Node.js build nem minden szerveren érhető el
- ⚠️ .env-t kézzel kell kezelni

**Időigény első alkalommal:** ~20 perc  
**Frissítés:** ~2 perc

---

## 3️⃣ SSH + rsync/scp

### Előfeltétel: SSH Access Ellenőrzése

```bash
# Windows (PowerShell/CMD)
ssh cpanel_username@yourdomain.hu

# Ha működik, gratulálunk! Van SSH access.
# Ha "connection refused" → kérd meg az mhosting support-ot
```

### Windows Deployment (PowerShell)

**Script használata:**

```powershell
# 1. Szerkeszd a deploy.ps1-t
notepad deploy.ps1

# Írd be az adataidat:
$SERVER_USER = "actual_username"
$SERVER_HOST = "actual_domain.hu"

# 2. Futtatás
.\deploy.ps1
```

**Vagy WinSCP CLI:**

```bash
# WinSCP telepítése: https://winscp.net/
# PowerShell:

# Frontend build
npm run build

# Upload
winscp.com /command ^
    "open sftp://username:password@yourdomain.hu" ^
    "lcd out" ^
    "cd /home/username/public_html" ^
    "put -delete *" ^
    "lcd ..\php" ^
    "cd /home/username/public_html/php" ^
    "put -delete *" ^
    "exit"
```

### Linux/Mac Deployment (Bash)

```bash
# 1. Szerkeszd a deploy.sh-t
nano deploy.sh

# Írd be az adataidat:
SERVER_USER="actual_username"
SERVER_HOST="actual_domain.hu"

# 2. Futtatás
chmod +x deploy.sh
./deploy.sh
```

**Előnyök:**
- ✅ Nagyon gyors
- ✅ Automatizálható
- ✅ Inkrementális sync (csak változások)

**Hátrányok:**
- ⚠️ SSH hozzáférés szükséges
- ⚠️ Parancssor ismeret
- ⚠️ SSH kulcs setup ajánlott

**Időigény első alkalommal:** ~30 perc  
**Frissítés:** ~1 perc

---

## 4️⃣ GitHub Actions CI/CD (Professzionális)

### Setup

**.github/workflows/deploy.yml:**

```yaml
name: Deploy to mhosting.hu

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build frontend
      run: npm run build
    
    - name: Deploy to server
      uses: SamKirkland/FTP-Deploy-Action@4.3.3
      with:
        server: ftp.yourdomain.hu
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        local-dir: ./
        server-dir: /public_html/
        exclude: |
          node_modules/**
          .git/**
          .env
```

### GitHub Secrets

```
GitHub Repo → Settings → Secrets → Actions

FTP_USERNAME: your_cpanel_username
FTP_PASSWORD: your_cpanel_password
```

**Előnyök:**
- ✅ Teljesen automatikus
- ✅ CI/CD pipeline
- ✅ Tesztelés deploy előtt
- ✅ History és rollback

**Hátrányok:**
- ⚠️ Komplex setup
- ⚠️ GitHub account szükséges
- ⚠️ FTP lassú lehet nagy fájloknál

**Időigény első alkalommal:** ~1 óra  
**Frissítés:** Automatikus (git push után)

---

## 5️⃣ Hibrid Megoldás - Lokális Build + FTP ⭐ Egyszerű Windows-ra

Ha nincs SSH, de nem akarsz mindent kézzel csinálni:

### WinSCP Scripting (Windows)

**deploy-winscp.bat:**

```batch
@echo off
echo Building frontend...
call npm run build

echo Uploading files...
"C:\Program Files (x86)\WinSCP\WinSCP.com" ^
  /log="deploy.log" /ini=nul ^
  /command ^
    "open sftp://username:password@yourdomain.hu/" ^
    "lcd out" ^
    "cd /public_html" ^
    "synchronize remote -delete" ^
    "lcd ..\php" ^
    "cd /public_html/php" ^
    "synchronize remote -delete" ^
    "exit"

echo Deployment complete!
pause
```

**Használat:**

1. Telepítsd a WinSCP-t
2. Szerkeszd a `deploy-winscp.bat`-ot (username, password)
3. Dupla kattintás → automatikus feltöltés

**Előnyök:**
- ✅ Windows-barát
- ✅ Egyszerű (dupla kattintás)
- ✅ Gyorsabb mint manuális FTP
- ✅ Inkrementális sync

**Hátrányok:**
- ⚠️ WinSCP telepítés szükséges
- ⚠️ Jelszó a scriptben (vagy prompt)

---

## 🎯 Ajánlás - Melyiket Válaszd?

### Kezdő felhasználónak:
```
1. FileZilla (FTP)
2. Később: WinSCP script
```

### Van cPanel Git támogatás?
```
1. cPanel Git Version Control ⭐
2. Frontend-et előre build-eld, csak PHP-t git-tel
```

### Van SSH hozzáférés?
```
1. deploy.ps1 (Windows)
2. deploy.sh (Linux/Mac)
```

### Professzionális használatra:
```
1. GitHub Actions + FTP
2. Vagy SSH + Git hooks
```

---

## 🔒 .env Fájl Kezelése

**SOHA NE COMMITÁLD** az .env fájlt!

### Biztonságos kezelés:

**1. Manuális létrehozás SSH-val:**

```bash
ssh username@yourdomain.hu
cd /home/username/public_html
nano .env
# Másold be a tartalmat
# Ctrl+X, Y, Enter
chmod 600 .env
```

**2. WinSCP-vel (GUI):**

```
1. Csatlakozás WinSCP-vel
2. Navigálj: /home/username/public_html
3. Jobb klikk → New → File
4. Név: .env
5. Szerkesztés → másold be a tartalmat
6. Properties → Permissions: 600
```

**3. cPanel File Manager:**

```
1. cPanel → File Manager
2. public_html könyvtár
3. + File → .env
4. Edit → másold be a tartalmat
```

---

## ⚡ Gyors Összehasonlítás

| Feladat | FTP | cPanel Git | SSH rsync | GitHub Actions |
|---------|-----|------------|-----------|----------------|
| **Első deploy** | 15 min | 20 min | 30 min | 60 min |
| **Frissítés** | 10 min | 2 min | 1 min | Auto |
| **Nehézség** | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Automatizálás** | ❌ | ✅ | ✅ | ✅✅ |

---

## 📞 mhosting.hu Support Kérdések

Ha bizonytalan vagy, kérdezd meg az mhosting support-ot:

```
Szia!

Az alábbi deployment módszerek közül melyeket támogatja 
a csomagom?

1. SSH hozzáférés (rsync/scp)
2. cPanel Git Version Control
3. Node.js futtatás (frontend build-hez)

Köszönöm!
```

---

**Következő lépés:** Válassz egy módszert a fentiek közül és kövesd az útmutatót! 🚀
