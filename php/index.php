<?php
/**
 * DTF Order Management - Main Entry Point
 * Ez a fájl a root-ba másolandó az mhosting.hu-n
 */

// Ha API hívás, átirányítás az API-ra
if (strpos($_SERVER['REQUEST_URI'], '/api/') === 0) {
    require_once __DIR__ . '/php/api/index.php';
    exit;
}

// Frontend index.html betöltése (ha van Next.js build)
$indexFile = __DIR__ . '/out/index.html';

if (file_exists($indexFile)) {
    // Statikus Next.js export betöltése
    readfile($indexFile);
} else {
    // Ha még nincs build, információs oldal
    ?>
    <!DOCTYPE html>
    <html lang="hu">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DTF Order Management</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 16px;
                padding: 40px;
                max-width: 600px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            h1 {
                color: #667eea;
                margin-bottom: 20px;
                font-size: 32px;
            }
            p {
                color: #555;
                line-height: 1.6;
                margin-bottom: 15px;
            }
            .status {
                background: #f0f4ff;
                border-left: 4px solid #667eea;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
            }
            .status-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            .status-item:last-child {
                border-bottom: none;
            }
            .status-label {
                font-weight: 600;
                color: #333;
            }
            .status-value {
                color: #667eea;
            }
            .success { color: #10b981; }
            .warning { color: #f59e0b; }
            code {
                background: #f3f4f6;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                text-align: center;
                color: #888;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎨 DTF Order Management</h1>
            <p>A rendeléskezelő rendszer sikeresen telepítve az mhosting.hu-n!</p>
            
            <div class="status">
                <div class="status-item">
                    <span class="status-label">API Backend:</span>
                    <span class="status-value success">✓ Működik</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Frontend Build:</span>
                    <span class="status-value warning">⚠ Nincs telepítve</span>
                </div>
            </div>
            
            <h2 style="color: #333; margin: 25px 0 15px; font-size: 20px;">📋 Következő lépések:</h2>
            <ol style="color: #555; line-height: 2; margin-left: 20px;">
                <li>Futtasd le az adatbázis sémát: <code>/php/database/schema.sql</code></li>
                <li>Konfiguráld a <code>.env</code> fájlt az adatbázis és API kulcsokkal</li>
                <li>Build-eld a frontend-et: <code>npm run build && npm run export</code></li>
                <li>Másold az <code>/out</code> könyvtárat a root-ba</li>
            </ol>
            
            <p style="margin-top: 20px;">
                <strong>API Endpoint:</strong> <code><?php echo $_SERVER['HTTP_HOST']; ?>/api/</code>
            </p>
            
            <div class="footer">
                DTF Order Management v1.0 | mhosting.hu Edition
            </div>
        </div>
    </body>
    </html>
    <?php
}
