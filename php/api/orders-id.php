<?php
/**
 * Order by ID API - GET /api/orders/{id}, PUT /api/orders/{id}, DELETE /api/orders/{id}
 */

$orderModel = new Order();
$orderId = (int)$_GET['id'];

if (!$orderId) {
    sendError('Érvénytelen rendelés ID', 400);
}

// GET - Rendelés lekérése ID alapján
if ($requestMethod === 'GET') {
    $order = $orderModel->getById($orderId);
    
    if (!$order) {
        sendError('Rendelés nem található', 404);
    }
    
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
            'billingName' => $order['billing_name'],
            'billingZip' => $order['billing_zip'],
            'billingCity' => $order['billing_city'],
            'billingAddress' => $order['billing_address'],
            'companyName' => $order['company_name'],
            'taxNumber' => $order['tax_number'],
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
    
    sendJson($formattedOrder);
}

// PUT - Rendelés frissítése
if ($requestMethod === 'PUT') {
    try {
        $result = $orderModel->update($orderId, $requestData);
        
        if ($result) {
            $order = $orderModel->getById($orderId);
            
            // Formázott válasz
            $formattedOrder = [
                'id' => (int)$order['id'],
                'orderNumber' => $order['order_number'],
                'orderStatus' => $order['order_status'],
                'paymentStatus' => $order['payment_status'],
                'invoiceStatus' => $order['invoice_status'],
                'updatedAt' => $order['updated_at'],
            ];
            
            sendJson($formattedOrder);
        } else {
            sendError('Rendelés frissítése sikertelen', 500);
        }
        
    } catch (Exception $e) {
        sendError('Hiba történt a rendelés frissítése során', 500, $e->getMessage());
    }
}

// DELETE - Rendelés törlése
if ($requestMethod === 'DELETE') {
    try {
        $result = $orderModel->delete($orderId);
        
        if ($result) {
            sendJson(['message' => 'Rendelés sikeresen törölve']);
        } else {
            sendError('Rendelés törlése sikertelen', 500);
        }
        
    } catch (Exception $e) {
        sendError('Hiba történt a rendelés törlése során', 500, $e->getMessage());
    }
}

sendError('Method not allowed', 405);
