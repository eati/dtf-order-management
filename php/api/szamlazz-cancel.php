<?php
/**
 * Számlázz.hu Cancel Invoice API - POST /api/szamlazz/cancel
 */

$szamlazzClient = new SzamlazzClient();
$orderModel = new Order();

// POST - Számla sztornózása
if ($requestMethod === 'POST') {
    // Validáció
    if (!isset($requestData['orderId']) || !is_numeric($requestData['orderId'])) {
        sendError('Érvénytelen rendelés ID', 400);
    }
    
    $orderId = (int)$requestData['orderId'];
    $order = $orderModel->getById($orderId);
    
    if (!$order) {
        sendError('Rendelés nem található', 404);
    }
    
    if ($order['invoice_status'] !== 'kiállítva') {
        sendError('Nincs kiállított számla ehhez a rendeléshez', 400);
    }
    
    if (empty($order['invoice_number'])) {
        sendError('Hiányzik a számlaszám', 400);
    }
    
    try {
        $result = $szamlazzClient->cancelInvoice($order['invoice_number']);
        
        if ($result['success']) {
            // Rendelés frissítése
            $orderModel->update($orderId, [
                'invoiceStatus' => 'sztornózva',
            ]);
            
            sendJson($result);
        } else {
            sendError($result['error'] ?? 'Számla sztornózása sikertelen', 500);
        }
        
    } catch (Exception $e) {
        sendError('Hiba történt a számla sztornózása során', 500, $e->getMessage());
    }
}

sendError('Method not allowed', 405);
