<?php
/**
 * Pricing API - GET /api/pricing, POST /api/pricing
 */

$pricingModel = new Pricing();

// GET - Aktuális árazás lekérése
if ($requestMethod === 'GET') {
    $pricing = $pricingModel->getCurrent();
    
    if (!$pricing) {
        sendError('Nincs érvényes árazás', 404);
    }
    
    // Formázott válasz
    $formattedPricing = [
        'id' => (int)$pricing['id'],
        'pricePerSqm' => (float)$pricing['price_per_sqm'],
        'vatRate' => (float)$pricing['vat_rate'],
        'glsPrice' => (float)$pricing['gls_price'],
        'codPrice' => (float)$pricing['cod_price'],
        'validFrom' => $pricing['valid_from'],
    ];
    
    sendJson($formattedPricing);
}

// POST - Új árazás létrehozása
if ($requestMethod === 'POST') {
    // Validáció
    if (!isset($requestData['pricePerSqm']) || !is_numeric($requestData['pricePerSqm'])) {
        sendError('Érvénytelen négyzetméter ár', 400);
    }
    
    try {
        $pricingId = $pricingModel->create($requestData);
        $pricing = $pricingModel->getById($pricingId);
        
        // Formázott válasz
        $formattedPricing = [
            'id' => (int)$pricing['id'],
            'pricePerSqm' => (float)$pricing['price_per_sqm'],
            'vatRate' => (float)$pricing['vat_rate'],
            'glsPrice' => (float)$pricing['gls_price'],
            'codPrice' => (float)$pricing['cod_price'],
            'validFrom' => $pricing['valid_from'],
        ];
        
        sendJson($formattedPricing, 201);
        
    } catch (Exception $e) {
        sendError('Hiba történt az árazás létrehozása során', 500, $e->getMessage());
    }
}

sendError('Method not allowed', 405);
