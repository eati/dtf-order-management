<?php
/**
 * Orders API - GET /api/orders, POST /api/orders
 */

$orderModel = new Order();

// GET - Összes rendelés lekérése
if ($requestMethod === 'GET') {
    $status = $queryParams['status'] ?? null;
    $orders = $orderModel->getAll($status);
    
    // Adatok formázása (snake_case -> camelCase)
    $formattedOrders = array_map(function($order) {
        return [
            'id' => (int)$order['id'],
            'orderNumber' => $order['order_number'],
            'customerId' => (int)$order['customer_id'],
            'customer' => [
                'id' => (int)$order['customer_id'],
                'name' => $order['customer_name'],
                'email' => $order['customer_email'],
                'phone' => $order['customer_phone'],
            ],
            'widthMm' => (int)$order['width_mm'],
            'lengthMm' => (int)$order['length_mm'],
            'squareMeters' => (float)$order['square_meters'],
            'productNetPrice' => (float)$order['product_net_price'],
            'productVat' => (float)$order['product_vat'],
            'shippingNetPrice' => (float)$order['shipping_net_price'],
            'shippingVat' => (float)$order['shipping_vat'],
            'codNetPrice' => (float)$order['cod_net_price'],
            'codVat' => (float)$order['cod_vat'],
            'totalNet' => (float)$order['total_net'],
            'totalVat' => (float)$order['total_vat'],
            'totalGross' => (float)$order['total_gross'],
            'description' => $order['description'],
            'shippingMethod' => $order['shipping_method'],
            'shippingAddress' => $order['shipping_address'],
            'paymentMethod' => $order['payment_method'],
            'paymentDate' => $order['payment_date'],
            'glsParcelNumber' => $order['gls_parcel_number'],
            'glsLabelUrl' => $order['gls_label_url'],
            'glsStatus' => $order['gls_status'],
            'glsTrackingUrl' => $order['gls_tracking_url'],
            'orderStatus' => $order['order_status'],
            'paymentStatus' => $order['payment_status'],
            'invoiceStatus' => $order['invoice_status'],
            'invoiceNumber' => $order['invoice_number'],
            'deadline' => $order['deadline'],
            'createdAt' => $order['created_at'],
            'updatedAt' => $order['updated_at'],
        ];
    }, $orders);
    
    sendJson($formattedOrders);
}

// POST - Új rendelés létrehozása
if ($requestMethod === 'POST') {
    // Validáció
    if (!isset($requestData['customerId']) || !is_numeric($requestData['customerId'])) {
        sendError('Érvénytelen ügyfél ID', 400);
    }
    
    if (!isset($requestData['lengthMm']) || !is_numeric($requestData['lengthMm']) || $requestData['lengthMm'] <= 0) {
        sendError('Érvénytelen hosszúság', 400);
    }
    
    try {
        $order = $orderModel->create($requestData);
        
        // Formázott válasz
        $formattedOrder = [
            'id' => (int)$order['id'],
            'orderNumber' => $order['order_number'],
            'customerId' => (int)$order['customer_id'],
            'customer' => [
                'id' => (int)$order['customer_id'],
                'name' => $order['customer_name'],
                'email' => $order['customer_email'],
                'phone' => $order['customer_phone'],
            ],
            'widthMm' => (int)$order['width_mm'],
            'lengthMm' => (int)$order['length_mm'],
            'squareMeters' => (float)$order['square_meters'],
            'productNetPrice' => (float)$order['product_net_price'],
            'productVat' => (float)$order['product_vat'],
            'shippingNetPrice' => (float)$order['shipping_net_price'],
            'shippingVat' => (float)$order['shipping_vat'],
            'codNetPrice' => (float)$order['cod_net_price'],
            'codVat' => (float)$order['cod_vat'],
            'totalNet' => (float)$order['total_net'],
            'totalVat' => (float)$order['total_vat'],
            'totalGross' => (float)$order['total_gross'],
            'description' => $order['description'],
            'shippingMethod' => $order['shipping_method'],
            'shippingAddress' => $order['shipping_address'],
            'paymentMethod' => $order['payment_method'],
            'paymentDate' => $order['payment_date'],
            'orderStatus' => $order['order_status'],
            'paymentStatus' => $order['payment_status'],
            'invoiceStatus' => $order['invoice_status'],
            'deadline' => $order['deadline'],
            'createdAt' => $order['created_at'],
            'updatedAt' => $order['updated_at'],
        ];
        
        sendJson($formattedOrder, 201);
        
    } catch (Exception $e) {
        sendError('Hiba történt a rendelés létrehozása során', 500, $e->getMessage());
    }
}

sendError('Method not allowed', 405);
