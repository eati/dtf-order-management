<?php
/**
 * Konfiguráció - DTF Order Management
 * Környezeti változók betöltése és konstansok definiálása
 */

// Hibakezelés
error_reporting(E_ALL);
ini_set('display_errors', 0); // Production-ben 0-ra állítva
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');

// Időzóna beállítása
date_default_timezone_set('Europe/Budapest');

// .env fájl betöltése
function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception('.env fájl nem található: ' . $path);
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Kommentek kihagyása
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // KEY=VALUE párok feldolgozása
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Idézőjelek eltávolítása
            $value = trim($value, '"\'');
            
            // Környezeti változó beállítása
            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
}

// .env betöltése
$envPath = dirname(__DIR__, 2) . '/.env';
if (file_exists($envPath)) {
    loadEnv($envPath);
}

// Adatbázis konfiguráció
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'dtf_order_management');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: '');
define('DB_CHARSET', 'utf8mb4');

// GLS API
define('GLS_API_URL', getenv('GLS_API_URL') ?: 'https://api.mygls.hu/ParcelService.svc');
define('GLS_CLIENT_NUMBER', getenv('GLS_CLIENT_NUMBER') ?: '');
define('GLS_USERNAME', getenv('GLS_USERNAME') ?: '');
define('GLS_PASSWORD', getenv('GLS_PASSWORD') ?: '');

// Feladó adatok
define('SENDER_NAME', getenv('SENDER_NAME') ?: 'DTF Nyomda Kft.');
define('SENDER_ADDRESS', getenv('SENDER_ADDRESS') ?: 'Fő utca 1.');
define('SENDER_CITY', getenv('SENDER_CITY') ?: 'Budapest');
define('SENDER_ZIPCODE', getenv('SENDER_ZIPCODE') ?: '1111');
define('SENDER_CONTACT_NAME', getenv('SENDER_CONTACT_NAME') ?: 'Kapcsolattartó');
define('SENDER_PHONE', getenv('SENDER_PHONE') ?: '+36301234567');
define('SENDER_EMAIL', getenv('SENDER_EMAIL') ?: 'info@dtfnyomda.hu');

// Számlázz.hu API
define('SZAMLAZZ_API_KEY', getenv('SZAMLAZZ_API_KEY') ?: '');
define('SZAMLAZZ_INVOICE_PREFIX', getenv('SZAMLAZZ_INVOICE_PREFIX') ?: 'DTF');
define('SZAMLAZZ_BANK_NAME', getenv('SZAMLAZZ_BANK_NAME') ?: 'OTP Bank');
define('SZAMLAZZ_BANK_ACCOUNT', getenv('SZAMLAZZ_BANK_ACCOUNT') ?: '');

// Alkalmazás beállítások
define('APP_URL', getenv('APP_URL') ?: 'http://localhost');
define('APP_ENV', getenv('APP_ENV') ?: 'development');
define('APP_DEBUG', getenv('APP_DEBUG') === 'true' || APP_ENV === 'development');

// CORS beállítások
define('CORS_ALLOWED_ORIGINS', getenv('CORS_ALLOWED_ORIGINS') ?: '*');

// API verzió
define('API_VERSION', 'v1');

// Fájl feltöltés
define('MAX_UPLOAD_SIZE', 10 * 1024 * 1024); // 10MB
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/');

// Logs könyvtár
define('LOG_DIR', dirname(__DIR__) . '/logs/');

// Könyvtárak létrehozása, ha nem léteznek
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}
if (!is_dir(LOG_DIR)) {
    mkdir(LOG_DIR, 0755, true);
}

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = '';
    $base_dir = dirname(__DIR__) . '/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});
