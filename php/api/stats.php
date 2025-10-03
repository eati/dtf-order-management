<?php
/**
 * Stats API - GET /api/stats
 */

$orderModel = new Order();

// GET - Statisztikák lekérése
if ($requestMethod === 'GET') {
    try {
        $stats = $orderModel->getStats();
        
        // Formázott válasz
        $formattedStats = [
            'totalOrders' => (int)$stats['total_orders'],
            'newOrders' => (int)$stats['new_orders'],
            'inProduction' => (int)$stats['in_production'],
            'readyOrders' => (int)$stats['ready_orders'],
            'unpaidOrders' => (int)$stats['unpaid_orders'],
            'totalRevenue' => (float)$stats['total_revenue'],
        ];
        
        sendJson($formattedStats);
        
    } catch (Exception $e) {
        sendError('Hiba történt a statisztikák lekérése során', 500, $e->getMessage());
    }
}

sendError('Method not allowed', 405);
