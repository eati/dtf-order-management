<?php
/**
 * Customer Model osztály
 */

class Customer {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Összes ügyfél lekérése
     */
    public function getAll() {
        $sql = "SELECT * FROM customers ORDER BY created_at DESC";
        return $this->db->query($sql);
    }
    
    /**
     * Ügyfél lekérése ID alapján
     */
    public function getById($id) {
        $sql = "SELECT * FROM customers WHERE id = :id";
        return $this->db->fetchOne($sql, ['id' => $id]);
    }
    
    /**
     * Ügyfél keresése email alapján
     */
    public function getByEmail($email) {
        $sql = "SELECT * FROM customers WHERE email = :email";
        return $this->db->fetchOne($sql, ['email' => $email]);
    }
    
    /**
     * Új ügyfél létrehozása
     */
    public function create($data) {
        $sql = "INSERT INTO customers (
            name, email, phone,
            billing_name, billing_zip, billing_city, billing_address,
            company_name, tax_number,
            shipping_name, shipping_zip, shipping_city, shipping_address,
            note
        ) VALUES (
            :name, :email, :phone,
            :billing_name, :billing_zip, :billing_city, :billing_address,
            :company_name, :tax_number,
            :shipping_name, :shipping_zip, :shipping_city, :shipping_address,
            :note
        )";
        
        $params = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'billing_name' => $data['billingName'],
            'billing_zip' => $data['billingZip'],
            'billing_city' => $data['billingCity'],
            'billing_address' => $data['billingAddress'],
            'company_name' => $data['companyName'] ?? null,
            'tax_number' => $data['taxNumber'] ?? null,
            'shipping_name' => $data['shippingName'] ?? null,
            'shipping_zip' => $data['shippingZip'] ?? null,
            'shipping_city' => $data['shippingCity'] ?? null,
            'shipping_address' => $data['shippingAddress'] ?? null,
            'note' => $data['note'] ?? null,
        ];
        
        $this->db->execute($sql, $params);
        return $this->db->lastInsertId();
    }
    
    /**
     * Ügyfél frissítése
     */
    public function update($id, $data) {
        $sql = "UPDATE customers SET
            name = :name,
            email = :email,
            phone = :phone,
            billing_name = :billing_name,
            billing_zip = :billing_zip,
            billing_city = :billing_city,
            billing_address = :billing_address,
            company_name = :company_name,
            tax_number = :tax_number,
            shipping_name = :shipping_name,
            shipping_zip = :shipping_zip,
            shipping_city = :shipping_city,
            shipping_address = :shipping_address,
            note = :note
        WHERE id = :id";
        
        $params = [
            'id' => $id,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'billing_name' => $data['billingName'],
            'billing_zip' => $data['billingZip'],
            'billing_city' => $data['billingCity'],
            'billing_address' => $data['billingAddress'],
            'company_name' => $data['companyName'] ?? null,
            'tax_number' => $data['taxNumber'] ?? null,
            'shipping_name' => $data['shippingName'] ?? null,
            'shipping_zip' => $data['shippingZip'] ?? null,
            'shipping_city' => $data['shippingCity'] ?? null,
            'shipping_address' => $data['shippingAddress'] ?? null,
            'note' => $data['note'] ?? null,
        ];
        
        return $this->db->execute($sql, $params);
    }
    
    /**
     * Ügyfél törlése
     */
    public function delete($id) {
        $sql = "DELETE FROM customers WHERE id = :id";
        return $this->db->execute($sql, ['id' => $id]);
    }
    
    /**
     * Ügyfél rendeléseinek lekérése
     */
    public function getOrders($customerId) {
        $sql = "SELECT * FROM orders WHERE customer_id = :customer_id ORDER BY created_at DESC";
        return $this->db->query($sql, ['customer_id' => $customerId]);
    }
}
