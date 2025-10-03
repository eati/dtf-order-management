<?php
/**
 * Számlázz.hu Download Invoice API - GET /api/szamlazz/download/{invoiceNumber}
 */

$szamlazzClient = new SzamlazzClient();

// GET - Számla PDF letöltése
if ($requestMethod === 'GET') {
    $invoiceNumber = $_GET['invoiceNumber'] ?? '';
    
    if (empty($invoiceNumber)) {
        sendError('Számlaszám megadása kötelező', 400);
    }
    
    try {
        $pdfContent = $szamlazzClient->downloadInvoice($invoiceNumber);
        
        if ($pdfContent) {
            // PDF válasz küldése
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="szamla-' . $invoiceNumber . '.pdf"');
            header('Content-Length: ' . strlen($pdfContent));
            echo $pdfContent;
            exit;
        } else {
            sendError('Számla letöltése sikertelen', 500);
        }
        
    } catch (Exception $e) {
        sendError('Hiba történt a számla letöltése során', 500, $e->getMessage());
    }
}

sendError('Method not allowed', 405);
