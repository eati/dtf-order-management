<?php
/**
 * GLS Track Parcel API - GET /api/gls/track/{parcelNumber}
 */

$glsClient = new GLSClient();

// GET - GLS csomag nyomkövetése
if ($requestMethod === 'GET') {
    $parcelNumber = $_GET['parcelNumber'] ?? '';
    
    if (empty($parcelNumber)) {
        sendError('Csomagszám megadása kötelező', 400);
    }
    
    try {
        $result = $glsClient->trackParcel($parcelNumber);
        
        if ($result['success']) {
            sendJson($result);
        } else {
            sendError($result['error'] ?? 'GLS nyomkövetés sikertelen', 500);
        }
        
    } catch (Exception $e) {
        sendError('Hiba történt a GLS nyomkövetés során', 500, $e->getMessage());
    }
}

sendError('Method not allowed', 405);
