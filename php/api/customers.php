<?php
/**
 * Customers API - GET /api/customers, POST /api/customers
 */

$customerModel = new Customer();

// GET - Összes ügyfél lekérése
if ($requestMethod === 'GET') {
    $customers = $customerModel->getAll();
    
    // Formázott válasz
    $formattedCustomers = array_map(function($customer) {
        return [
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
    }, $customers);
    
    sendJson($formattedCustomers);
}

// POST - Új ügyfél létrehozása
if ($requestMethod === 'POST') {
    // Validáció
    if (empty($requestData['name'])) {
        sendError('Név megadása kötelező', 400);
    }
    if (empty($requestData['email'])) {
        sendError('Email megadása kötelező', 400);
    }
    if (empty($requestData['phone'])) {
        sendError('Telefonszám megadása kötelező', 400);
    }
    
    try {
        $customerId = $customerModel->create($requestData);
        $customer = $customerModel->getById($customerId);
        
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
        
        sendJson($formattedCustomer, 201);
        
    } catch (Exception $e) {
        sendError('Hiba történt az ügyfél létrehozása során', 500, $e->getMessage());
    }
}

sendError('Method not allowed', 405);
