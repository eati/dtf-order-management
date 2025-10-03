<?php
/**
 * Pricing Model osztály
 */

class Pricing {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Aktuális árazás lekérése
     */
    public function getCurrent() {
        $sql = "SELECT * FROM pricing ORDER BY valid_from DESC LIMIT 1";
        return $this->db->fetchOne($sql);
    }
    
    /**
     * Összes árazás lekérése
     */
    public function getAll() {
        $sql = "SELECT * FROM pricing ORDER BY valid_from DESC";
        return $this->db->query($sql);
    }
    
    /**
     * Árazás lekérése ID alapján
     */
    public function getById($id) {
        $sql = "SELECT * FROM pricing WHERE id = :id";
        return $this->db->fetchOne($sql, ['id' => $id]);
    }
    
    /**
     * Új árazás létrehozása
     */
    public function create($data) {
        $sql = "INSERT INTO pricing (
            price_per_sqm, vat_rate, gls_price, cod_price, valid_from
        ) VALUES (
            :price_per_sqm, :vat_rate, :gls_price, :cod_price, :valid_from
        )";
        
        $params = [
            'price_per_sqm' => $data['pricePerSqm'],
            'vat_rate' => $data['vatRate'],
            'gls_price' => $data['glsPrice'],
            'cod_price' => $data['codPrice'],
            'valid_from' => $data['validFrom'] ?? date('Y-m-d H:i:s'),
        ];
        
        $this->db->execute($sql, $params);
        return $this->db->lastInsertId();
    }
    
    /**
     * Árazás frissítése
     */
    public function update($id, $data) {
        $sql = "UPDATE pricing SET
            price_per_sqm = :price_per_sqm,
            vat_rate = :vat_rate,
            gls_price = :gls_price,
            cod_price = :cod_price
        WHERE id = :id";
        
        $params = [
            'id' => $id,
            'price_per_sqm' => $data['pricePerSqm'],
            'vat_rate' => $data['vatRate'],
            'gls_price' => $data['glsPrice'],
            'cod_price' => $data['codPrice'],
        ];
        
        return $this->db->execute($sql, $params);
    }
}
