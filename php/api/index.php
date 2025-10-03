<?php
/**
 * API Router - RESTful API kezelés
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/classes/Database.php';
require_once dirname(__DIR__) . '/classes/Customer.php';
require_once dirname(__DIR__) . '/classes/Order.php';
require_once dirname(__DIR__) . '/classes/Pricing.php';
require_once dirname(__DIR__) . '/classes/GLSClient.php';
require_once dirname(__DIR__) . '/classes/SzamlazzClient.php';

// CORS fejlécek
header('Access-Control-Allow-Origin: ' . CORS_ALLOWED_ORIGINS);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// OPTIONS preflight request kezelése
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Request adatok
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Query string eltávolítása
$requestUri = strtok($requestUri, '?');

// API prefix eltávolítása (/api/)
$requestUri = preg_replace('#^/api/?#', '', $requestUri);

// Route szétbontása
$routes = array_filter(explode('/', $requestUri));
$routes = array_values($routes);

// Request body
$requestBody = file_get_contents('php://input');
$requestData = json_decode($requestBody, true) ?? [];

// Query paraméterek
$queryParams = $_GET;

/**
 * JSON válasz küldése
 */
function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Hiba válasz küldése
 */
function sendError($message, $statusCode = 500, $details = null) {
    $response = ['error' => $message];
    if ($details && APP_DEBUG) {
        $response['details'] = $details;
    }
    sendJson($response, $statusCode);
}

/**
 * Router
 */
try {
    // Route: /api/orders
    if ($routes[0] === 'orders' && !isset($routes[1])) {
        require __DIR__ . '/orders.php';
        exit;
    }
    
    // Route: /api/orders/{id}
    if ($routes[0] === 'orders' && isset($routes[1])) {
        $_GET['id'] = $routes[1];
        require __DIR__ . '/orders-id.php';
        exit;
    }
    
    // Route: /api/customers
    if ($routes[0] === 'customers' && !isset($routes[1])) {
        require __DIR__ . '/customers.php';
        exit;
    }
    
    // Route: /api/customers/{id}
    if ($routes[0] === 'customers' && isset($routes[1])) {
        $_GET['id'] = $routes[1];
        require __DIR__ . '/customers-id.php';
        exit;
    }
    
    // Route: /api/pricing
    if ($routes[0] === 'pricing') {
        require __DIR__ . '/pricing.php';
        exit;
    }
    
    // Route: /api/stats
    if ($routes[0] === 'stats') {
        require __DIR__ . '/stats.php';
        exit;
    }
    
    // Route: /api/gls/create-parcel
    if ($routes[0] === 'gls' && $routes[1] === 'create-parcel') {
        require __DIR__ . '/gls-create-parcel.php';
        exit;
    }
    
    // Route: /api/gls/track/{parcelNumber}
    if ($routes[0] === 'gls' && $routes[1] === 'track' && isset($routes[2])) {
        $_GET['parcelNumber'] = $routes[2];
        require __DIR__ . '/gls-track.php';
        exit;
    }
    
    // Route: /api/szamlazz/create
    if ($routes[0] === 'szamlazz' && $routes[1] === 'create') {
        require __DIR__ . '/szamlazz-create.php';
        exit;
    }
    
    // Route: /api/szamlazz/cancel
    if ($routes[0] === 'szamlazz' && $routes[1] === 'cancel') {
        require __DIR__ . '/szamlazz-cancel.php';
        exit;
    }
    
    // Route: /api/szamlazz/download/{invoiceNumber}
    if ($routes[0] === 'szamlazz' && $routes[1] === 'download' && isset($routes[2])) {
        $_GET['invoiceNumber'] = $routes[2];
        require __DIR__ . '/szamlazz-download.php';
        exit;
    }
    
    // 404 - Route nem található
    sendError('Endpoint nem található', 404);
    
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    sendError('Szerver hiba történt', 500, $e->getMessage());
}
