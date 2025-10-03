<?php
/**
 * Customer by ID API - GET /api/customers/{id}, PUT /api/customers/{id}, DELETE /api/customers/{id}
 */

$customerModel = new Customer();
$customerId = (int)$_GET['id'];

if (!$customerId) {
    sendError('Érvénytelen ügyfél ID', 400);
}

// GET - Ügyfél lekérése ID alapján
if ($requestMethod === 'GET') {
    $customer = $customerModel->getById($customerId);
    
    if (!$customer) {
        sendError('Ügyfél nem található', 404);
    }
    
    // Formázott válasz
    $formattedCustomer = [
        'id' => (int)$customer['id'],
        'name' => $customer['name'],
        'email' => $customer['email'],
        'phone' => $customer['phone'],
        'billingName' => $customer['billing_name'],
        'billingZip' => $customer['billing_zip'],
        'billingCity' => $customer['billing_city'],
        'billingAddress' => $customer['billing_address'],
        'companyName' => $customer['company_name'],
        'taxNumber' => $customer['tax_number'],
        'shippingName' => $customer['shipping_name'],
        'shippingZip' => $customer['shipping_zip'],
        'shippingCity' => $customer['shipping_city'],
        'shippingAddress' => $customer['shipping_address'],
        'note' => $customer['note'],
        'createdAt' => $customer['created_at'],
    ];
    
    sendJson($formattedCustomer);
}

// PUT - Ügyfél frissítése
if ($requestMethod === 'PUT') {
    try {
        $result = $customerModel->update($customerId, $requestData);
        
        if ($result) {
            $customer = $customerModel->getById($customerId);
            
            $formattedCustomer = [
                'id' => (int)$customer['id'],
                'name' => $customer['name'],
                'email' => $customer['email'],
                'phone' => $customer['phone'],
                'billingName' => $customer['billing_name'],
                'billingZip' => $customer['billing_zip'],
                'billingCity' => $customer['billing_city'],
                'billingAddress' => $customer['billing_address'],
                'companyName' => $customer['company_name'],
                'taxNumber' => $customer['tax_number'],
                'shippingName' => $customer['shipping_name'],
                'shippingZip' => $customer['shipping_zip'],
                'shippingCity' => $customer['shipping_city'],
                'shippingAddress' => $customer['shipping_address'],
                'note' => $customer['note'],
                'createdAt' => $customer['created_at'],
            ];
            
            sendJson($formattedCustomer);
        } else {
            sendError('Ügyfél frissítése sikertelen', 500);
        }
        
    } catch (Exception $e) {
        sendError('Hiba történt az ügyfél frissítése során', 500, $e->getMessage());
    }
}

// DELETE - Ügyfél törlése
if ($requestMethod === 'DELETE') {
    try {
        $result = $customerModel->delete($customerId);
        
        if ($result) {
            sendJson(['message' => 'Ügyfél sikeresen törölve']);
        } else {
            sendError('Ügyfél törlése sikertelen', 500);
        }
        
    } catch (Exception $e) {
        sendError('Hiba történt az ügyfél törlése során', 500, $e->getMessage());
    }
}

sendError('Method not allowed', 405);
