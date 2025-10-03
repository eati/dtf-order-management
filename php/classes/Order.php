<?php
/**
 * Order Model osztály
 */

class Order {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Összes rendelés lekérése
     */
    public function getAll($status = null) {
        if ($status) {
            $sql = "SELECT o.*, 
                    c.id as customer_id, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
                    FROM orders o
                    LEFT JOIN customers c ON o.customer_id = c.id
                    WHERE o.order_status = :status
                    ORDER BY o.created_at DESC";
            return $this->db->query($sql, ['status' => $status]);
        } else {
            $sql = "SELECT o.*, 
                    c.id as customer_id, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
                    FROM orders o
                    LEFT JOIN customers c ON o.customer_id = c.id
                    ORDER BY o.created_at DESC";
            return $this->db->query($sql);
        }
    }
    
    /**
     * Rendelés lekérése ID alapján
     */
    public function getById($id) {
        $sql = "SELECT o.*, 
                c.id as customer_id, c.name as customer_name, c.email as customer_email, 
                c.phone as customer_phone, c.billing_name, c.billing_zip, c.billing_city, 
                c.billing_address, c.company_name, c.tax_number
                FROM orders o
                LEFT JOIN customers c ON o.customer_id = c.id
                WHERE o.id = :id";
        return $this->db->fetchOne($sql, ['id' => $id]);
    }
    
    /**
     * Rendelés lekérése rendelésszám alapján
     */
    public function getByOrderNumber($orderNumber) {
        $sql = "SELECT o.*, 
                c.id as customer_id, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
                FROM orders o
                LEFT JOIN customers c ON o.customer_id = c.id
                WHERE o.order_number = :order_number";
        return $this->db->fetchOne($sql, ['order_number' => $orderNumber]);
    }
    
    /**
     * Rendelésszám generálása
     */
    public function generateOrderNumber() {
        $year = date('Y');
        $prefix = "DTF-{$year}-";
        
        $sql = "SELECT order_number FROM orders 
                WHERE order_number LIKE :prefix 
                ORDER BY created_at DESC LIMIT 1";
        
        $lastOrder = $this->db->fetchOne($sql, ['prefix' => $prefix . '%']);
        
        $nextNumber = 1;
        if ($lastOrder) {
            $parts = explode('-', $lastOrder['order_number']);
            $lastNumber = intval($parts[2] ?? 0);
            $nextNumber = $lastNumber + 1;
        }
        
        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
    
    /**
     * Ár számítása
     */
    public function calculatePrice($lengthMm, $shippingMethod, $paymentMethod) {
        // Aktuális árazás lekérése
        $pricingModel = new Pricing();
        $pricing = $pricingModel->getCurrent();
        
        $pricePerSqm = $pricing['price_per_sqm'];
        $vatRate = $pricing['vat_rate'];
        $glsPrice = $pricing['gls_price'];
        $codPrice = $pricing['cod_price'];
        
        // Négyzetméter számítás (szélesség mindig 300mm)
        $squareMeters = (300 * $lengthMm) / 1000000;
        
        // Termék ár
        $productNet = $squareMeters * $pricePerSqm;
        $productVat = $productNet * ($vatRate / 100);
        
        // Szállítási díj
        $shippingNet = 0;
        $shippingVat = 0;
        if ($shippingMethod === 'gls') {
            $shippingNet = $glsPrice;
            $shippingVat = $shippingNet * ($vatRate / 100);
        }
        
        // Utánvét díj
        $codNet = 0;
        $codVat = 0;
        if ($paymentMethod === 'utánvét') {
            $codNet = $codPrice;
            $codVat = $codNet * ($vatRate / 100);
        }
        
        // Összegek
        $totalNet = $productNet + $shippingNet + $codNet;
        $totalVat = $productVat + $shippingVat + $codVat;
        $totalGross = $totalNet + $totalVat;
        
        return [
            'squareMeters' => round($squareMeters, 2),
            'productNetPrice' => round($productNet),
            'productVat' => round($productVat),
            'shippingNetPrice' => round($shippingNet),
            'shippingVat' => round($shippingVat),
            'codNetPrice' => round($codNet),
            'codVat' => round($codVat),
            'totalNet' => round($totalNet),
            'totalVat' => round($totalVat),
            'totalGross' => round($totalGross),
        ];
    }
    
    /**
     * Új rendelés létrehozása
     */
    public function create($data) {
        $orderNumber = $this->generateOrderNumber();
        $prices = $this->calculatePrice(
            $data['lengthMm'], 
            $data['shippingMethod'], 
            $data['paymentMethod']
        );
        
        $sql = "INSERT INTO orders (
            order_number, customer_id,
            width_mm, length_mm, square_meters,
            product_net_price, product_vat,
            shipping_net_price, shipping_vat,
            cod_net_price, cod_vat,
            total_net, total_vat, total_gross,
            description, shipping_method, shipping_address,
            payment_method, payment_date,
            order_status, payment_status, invoice_status,
            deadline
        ) VALUES (
            :order_number, :customer_id,
            :width_mm, :length_mm, :square_meters,
            :product_net_price, :product_vat,
            :shipping_net_price, :shipping_vat,
            :cod_net_price, :cod_vat,
            :total_net, :total_vat, :total_gross,
            :description, :shipping_method, :shipping_address,
            :payment_method, :payment_date,
            :order_status, :payment_status, :invoice_status,
            :deadline
        )";
        
        $params = [
            'order_number' => $orderNumber,
            'customer_id' => $data['customerId'],
            'width_mm' => 300,
            'length_mm' => $data['lengthMm'],
            'square_meters' => $prices['squareMeters'],
            'product_net_price' => $prices['productNetPrice'],
            'product_vat' => $prices['productVat'],
            'shipping_net_price' => $prices['shippingNetPrice'],
            'shipping_vat' => $prices['shippingVat'],
            'cod_net_price' => $prices['codNetPrice'],
            'cod_vat' => $prices['codVat'],
            'total_net' => $prices['totalNet'],
            'total_vat' => $prices['totalVat'],
            'total_gross' => $prices['totalGross'],
            'description' => $data['description'] ?? null,
            'shipping_method' => $data['shippingMethod'],
            'shipping_address' => $data['shippingAddress'] ?? null,
            'payment_method' => $data['paymentMethod'],
            'payment_date' => $data['paymentDate'] ?? null,
            'order_status' => 'új',
            'payment_status' => 'nem_fizetve',
            'invoice_status' => 'nincs_számla',
            'deadline' => $data['deadline'] ?? null,
        ];
        
        $this->db->execute($sql, $params);
        $orderId = $this->db->lastInsertId();
        
        return $this->getById($orderId);
    }
    
    /**
     * Rendelés frissítése
     */
    public function update($id, $data) {
        $fields = [];
        $params = ['id' => $id];
        
        // Dinamikus UPDATE építés
        $allowedFields = [
            'length_mm', 'description', 'shipping_method', 'shipping_address',
            'payment_method', 'payment_date', 'order_status', 'payment_status',
            'invoice_status', 'invoice_number', 'deadline',
            'gls_parcel_number', 'gls_label_url', 'gls_status', 'gls_tracking_url'
        ];
        
        foreach ($data as $key => $value) {
            $snakeKey = $this->camelToSnake($key);
            if (in_array($snakeKey, $allowedFields)) {
                $fields[] = "$snakeKey = :$snakeKey";
                $params[$snakeKey] = $value;
            }
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $sql = "UPDATE orders SET " . implode(', ', $fields) . " WHERE id = :id";
        return $this->db->execute($sql, $params);
    }
    
    /**
     * Rendelés törlése
     */
    public function delete($id) {
        $sql = "DELETE FROM orders WHERE id = :id";
        return $this->db->execute($sql, ['id' => $id]);
    }
    
    /**
     * Statisztikák lekérése
     */
    public function getStats() {
        $sql = "SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN order_status = 'új' THEN 1 END) as new_orders,
                COUNT(CASE WHEN order_status = 'gyártásban' THEN 1 END) as in_production,
                COUNT(CASE WHEN order_status = 'kész' THEN 1 END) as ready_orders,
                COUNT(CASE WHEN payment_status = 'nem_fizetve' THEN 1 END) as unpaid_orders,
                SUM(total_gross) as total_revenue
                FROM orders";
        
        return $this->db->fetchOne($sql);
    }
    
    /**
     * CamelCase -> snake_case konverzió
     */
    private function camelToSnake($input) {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $input));
    }
}
