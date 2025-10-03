# PowerShell Deploy Script - mhosting.hu
# Windows kompatibilis automatikus deployment

# Konfiguráció
$SERVER_USER = "your_cpanel_username"
$SERVER_HOST = "yourdomain.hu"
$SERVER_PATH = "/home/$SERVER_USER/public_html"

Write-Host "🚀 DTF Order Management - Deploy Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Frontend build
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# 2. WinSCP használata (ha telepítve van)
if (Get-Command winscp.com -ErrorAction SilentlyContinue) {
    Write-Host "📤 Uploading with WinSCP..." -ForegroundColor Yellow
    
    # WinSCP script generálása
    $scriptContent = @"
open sftp://${SERVER_USER}@${SERVER_HOST}
lcd out
cd $SERVER_PATH
put -delete *
lcd ..\php
cd $SERVER_PATH/php
put -delete *
exit
"@
    
    $scriptContent | Out-File -FilePath "winscp_script.txt" -Encoding ASCII
    winscp.com /script=winscp_script.txt
    Remove-Item winscp_script.txt
    
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
} else {
    Write-Host "⚠️ WinSCP nem található. Telepítsd vagy használj FTP-t." -ForegroundColor Yellow
    Write-Host "Letöltés: https://winscp.net/eng/download.php" -ForegroundColor Cyan
}

Write-Host "🌐 Visit: https://yourdomain.hu" -ForegroundColor Green
