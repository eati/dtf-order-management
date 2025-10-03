#!/bin/bash
# Automatikus deployment script - mhosting.hu SSH

# Konfiguráció
SERVER_USER="your_cpanel_username"
SERVER_HOST="yourdomain.hu"
SERVER_PATH="/home/$SERVER_USER/public_html"

echo "🚀 DTF Order Management - Deploy Script"
echo "=========================================="

# 1. Frontend build
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# 2. rsync PHP backend
echo "📤 Uploading PHP backend..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude 'out' \
    --exclude '.env' \
    --exclude 'php/logs/*' \
    --exclude 'php/uploads/*' \
    php/ $SERVER_USER@$SERVER_HOST:$SERVER_PATH/php/

# 3. rsync Frontend build
echo "📤 Uploading frontend..."
rsync -avz --delete \
    out/ $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

# 4. rsync config fájlok
echo "📤 Uploading config files..."
rsync -avz \
    php/.htaccess \
    php/index.php \
    $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

echo "✅ Deployment complete!"
echo "🌐 Visit: https://yourdomain.hu"
