<?php
/**
 * Számlázz.hu Create Invoice API - POST /api/szamlazz/create
 */

$szamlazzClient = new SzamlazzClient();
$orderModel = new Order();

// POST - Számla kiállítása
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
    
    if ($order['invoice_status'] === 'kiállítva') {
        sendError('Ehhez a rendeléshez már ki van állítva számla', 400);
    }
    
    try {
        // Számla tételek összeállítása
        $items = [];
        
        // Termék tétel
        $items[] = [
            'name' => "DTF Film - {$order['length_mm']}mm × {$order['width_mm']}mm ({$order['square_meters']} m²)",
            'quantity' => 1,
            'unit' => 'db',
            'netUnitPrice' => (float)$order['product_net_price'],
            'vatRate' => 27,
            'netPrice' => (float)$order['product_net_price'],
            'vatAmount' => (float)$order['product_vat'],
            'grossAmount' => (float)$order['product_net_price'] + (float)$order['product_vat'],
        ];
        
        // Szállítási tétel (ha van)
        if ($order['shipping_net_price'] > 0) {
            $items[] = [
                'name' => 'GLS Szállítás',
                'quantity' => 1,
                'unit' => 'db',
                'netUnitPrice' => (float)$order['shipping_net_price'],
                'vatRate' => 27,
                'netPrice' => (float)$order['shipping_net_price'],
                'vatAmount' => (float)$order['shipping_vat'],
                'grossAmount' => (float)$order['shipping_net_price'] + (float)$order['shipping_vat'],
            ];
        }
        
        // Utánvét tétel (ha van)
        if ($order['cod_net_price'] > 0) {
            $items[] = [
                'name' => 'Utánvét díj',
                'quantity' => 1,
                'unit' => 'db',
                'netUnitPrice' => (float)$order['cod_net_price'],
                'vatRate' => 27,
                'netPrice' => (float)$order['cod_net_price'],
                'vatAmount' => (float)$order['cod_vat'],
                'grossAmount' => (float)$order['cod_net_price'] + (float)$order['cod_vat'],
            ];
        }
        
        // Számla adatok
        $invoiceData = [
            'orderNumber' => $order['order_number'],
            'customer' => [
                'name' => $order['billing_name'],
                'zip' => $order['billing_zip'],
                'city' => $order['billing_city'],
                'address' => $order['billing_address'],
                'email' => $order['customer_email'],
                'taxNumber' => $order['tax_number'],
                'phone' => $order['customer_phone'],
            ],
            'items' => $items,
            'paymentMethod' => $order['payment_method'],
            'paymentDate' => $order['payment_date'],
            'deadline' => $order['deadline'],
            'comment' => $order['description'],
        ];
        
        $result = $szamlazzClient->createInvoice($invoiceData);
        
        if ($result['success']) {
            // Rendelés frissítése számla adatokkal
            $orderModel->update($orderId, [
                'invoiceStatus' => 'kiállítva',
                'invoiceNumber' => $result['invoiceNumber'],
            ]);
            
            sendJson($result);
        } else {
            sendError($result['error'] ?? 'Számla kiállítása sikertelen', 500);
        }
        
    } catch (Exception $e) {
        sendError('Hiba történt a számla kiállítása során', 500, $e->getMessage());
    }
}

sendError('Method not allowed', 405);
