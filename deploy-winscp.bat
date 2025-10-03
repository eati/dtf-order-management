@echo off
REM DTF Order Management - WinSCP Deployment Script
REM Windows kompatibilis automatikus feltöltés

REM ============================================
REM KONFIGURÁCIÓ - Töltsd ki az adataidat!
REM ============================================
set SERVER_USER=your_cpanel_username
set SERVER_PASS=your_cpanel_password
set SERVER_HOST=yourdomain.hu
set SERVER_PATH=/home/%SERVER_USER%/public_html

REM WinSCP telepítési útvonal (módosítsd ha szükséges)
set WINSCP_PATH="C:\Program Files (x86)\WinSCP\WinSCP.com"

echo.
echo ========================================
echo  DTF Order Management - Deploy Script
echo ========================================
echo.

REM Ellenőrzés: WinSCP telepítve van-e
if not exist %WINSCP_PATH% (
    echo [HIBA] WinSCP nem talalhato: %WINSCP_PATH%
    echo.
    echo Telepitsd innen: https://winscp.net/eng/download.php
    echo Vagy modositsd a WINSCP_PATH valtozot a scriptben.
    echo.
    pause
    exit /b 1
)

REM 1. Frontend build
echo [1/4] Frontend build...
call npm run build
if errorlevel 1 (
    echo [HIBA] Build sikertelen!
    pause
    exit /b 1
)
echo [OK] Build kesz!
echo.

REM 2. WinSCP script generálása
echo [2/4] Deploy script generalasa...
(
    echo option batch abort
    echo option confirm off
    echo open sftp://%SERVER_USER%:%SERVER_PASS%@%SERVER_HOST%/
    echo.
    echo # Frontend feltöltése
    echo lcd out
    echo cd %SERVER_PATH%
    echo synchronize remote -delete
    echo.
    echo # PHP backend feltöltése
    echo lcd ..\php
    echo cd %SERVER_PATH%/php
    echo synchronize remote -delete
    echo.
    echo # Config fájlok
    echo lcd ..
    echo cd %SERVER_PATH%
    echo put php\.htaccess .htaccess
    echo put php\index.php index.php
    echo.
    echo exit
) > winscp_deploy_script.txt

echo [OK] Script kesz!
echo.

REM 3. Feltöltés
echo [3/4] Fajlok feltoltese WinSCP-vel...
%WINSCP_PATH% /script=winscp_deploy_script.txt /log=deploy.log

if errorlevel 1 (
    echo.
    echo [HIBA] Feltoites sikertelen!
    echo Nezd meg a deploy.log fajlt reszletekert.
    pause
    exit /b 1
)

echo [OK] Feltoites kesz!
echo.

REM 4. Takarítás
echo [4/4] Takaritas...
del winscp_deploy_script.txt

echo.
echo ========================================
echo  SIKERES DEPLOYMENT!
echo ========================================
echo.
echo Latogasd meg: https://%SERVER_HOST%
echo.
echo FONTOS: Ne felejtsd el a .env fajltkezzel letrehozni a szerveren!
echo.
pause
