<?php
/**
 * GLS Create Parcel API - POST /api/gls/create-parcel
 */

$glsClient = new GLSClient();
$orderModel = new Order();

// POST - GLS csomag létrehozása
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
    
    if ($order['shipping_method'] !== 'gls') {
        sendError('Ez a rendelés nem GLS szállítási módot használ', 400);
    }
    
    try {
        // GLS API hívás
        $parcelData = [
            'reference' => $order['order_number'],
            'name' => $order['customer_name'],
            'address' => $order['shipping_address'] ?? $order['billing_address'],
            'city' => $order['billing_city'],
            'zipCode' => $order['billing_zip'],
            'phone' => $order['customer_phone'],
            'email' => $order['customer_email'],
            'weight' => 1, // kg
            'count' => 1,
            'codAmount' => $order['payment_method'] === 'utánvét' ? (int)$order['total_gross'] : 0,
        ];
        
        $result = $glsClient->createParcel($parcelData);
        
        if ($result['success']) {
            // Rendelés frissítése GLS adatokkal
            $orderModel->update($orderId, [
                'glsParcelNumber' => $result['parcelNumber'],
                'glsLabelUrl' => $result['labelUrl'],
                'glsTrackingUrl' => $result['trackingUrl'],
                'glsStatus' => 'Regisztrálva',
            ]);
            
            sendJson($result);
        } else {
            sendError($result['error'] ?? 'GLS csomag létrehozása sikertelen', 500);
        }
        
    } catch (Exception $e) {
        sendError('Hiba történt a GLS csomag létrehozása során', 500, $e->getMessage());
    }
}

sendError('Method not allowed', 405);
