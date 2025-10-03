<?php
/**
 * Számlázz.hu API Client osztály
 * Dokumentáció: https://www.szamlazz.hu/szamla/docs/
 */

class SzamlazzClient {
    private $config;
    private $apiUrl;
    
    public function __construct() {
        $this->config = [
            'apiKey' => SZAMLAZZ_API_KEY,
            'invoicePrefix' => SZAMLAZZ_INVOICE_PREFIX,
        ];
        $this->apiUrl = 'https://www.szamlazz.hu/szamla/';
    }
    
    /**
     * Számla kiállítása
     */
    public function createInvoice($data) {
        try {
            $xmlData = $this->buildInvoiceXML($data);
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $this->apiUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                'action' => 'xml_invoice',
                'data' => $xmlData,
            ]));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/x-www-form-urlencoded',
                'Accept: application/xml',
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            if (curl_errno($ch)) {
                throw new Exception('cURL error: ' . curl_error($ch));
            }
            
            curl_close($ch);
            
            if ($httpCode !== 200) {
                throw new Exception("Számlázz.hu API hiba: HTTP $httpCode");
            }
            
            return $this->parseInvoiceResponse($response);
            
        } catch (Exception $e) {
            error_log('Számlázz.hu hiba: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Számla sztornózása
     */
    public function cancelInvoice($invoiceNumber) {
        try {
            $xmlData = $this->buildCancelXML($invoiceNumber);
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $this->apiUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                'action' => 'xml_invoice_cancel',
                'data' => $xmlData,
            ]));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/x-www-form-urlencoded',
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200) {
                throw new Exception("Számlázz.hu API hiba: HTTP $httpCode");
            }
            
            return $this->parseCancelResponse($response);
            
        } catch (Exception $e) {
            error_log('Számlázz.hu sztornó hiba: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Számla PDF letöltése
     */
    public function downloadInvoice($invoiceNumber) {
        try {
            $xmlData = $this->buildDownloadXML($invoiceNumber);
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $this->apiUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                'action' => 'xml_invoice_download',
                'data' => $xmlData,
            ]));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/x-www-form-urlencoded',
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200) {
                throw new Exception("Számlázz.hu API hiba: HTTP $httpCode");
            }
            
            return $response;
            
        } catch (Exception $e) {
            error_log('Számlázz.hu letöltés hiba: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * XML építés - Számla kiállítás
     */
    private function buildInvoiceXML($data) {
        $issueDate = date('Y-m-d');
        $fulfillmentDate = $data['deadline'] ?? $issueDate;
        $paymentDeadline = $data['paymentDate'] ?? date('Y-m-d', strtotime('+8 days'));
        
        // Fizetési mód mapping
        $paymentMethodMap = [
            'előre_utalás' => 'átutalás',
            'utalás' => 'átutalás',
            'utánvét' => 'utánvét',
            'személyes_átvétel' => 'készpénz',
            'havi_elszámolás' => 'bankkártya',
        ];
        
        $paymentMethod = $paymentMethodMap[$data['paymentMethod']] ?? 'átutalás';
        
        $apiKey = $this->escapeXml($this->config['apiKey']);
        $orderNumber = $this->escapeXml($data['orderNumber']);
        $comment = $this->escapeXml($data['comment'] ?? "Rendelés: {$data['orderNumber']}");
        
        $customerName = $this->escapeXml($data['customer']['name']);
        $customerZip = $this->escapeXml($data['customer']['zip']);
        $customerCity = $this->escapeXml($data['customer']['city']);
        $customerAddress = $this->escapeXml($data['customer']['address']);
        $customerEmail = $this->escapeXml($data['customer']['email']);
        $customerTaxNumber = isset($data['customer']['taxNumber']) ? $this->escapeXml($data['customer']['taxNumber']) : '';
        $customerPhone = isset($data['customer']['phone']) ? $this->escapeXml($data['customer']['phone']) : '';
        
        $bankName = $this->escapeXml(SZAMLAZZ_BANK_NAME);
        $bankAccount = $this->escapeXml(SZAMLAZZ_BANK_ACCOUNT);
        
        $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <beallitasok>
    <szamlaagentkulcs>$apiKey</szamlaagentkulcs>
    <eszamla>true</eszamla>
    <szamlaLetoltes>true</szamlaLetoltes>
    <valaszVerzio>2</valaszVerzio>
  </beallitasok>
  <fejlec>
    <keltDatum>$issueDate</keltDatum>
    <teljesitesDatum>$fulfillmentDate</teljesitesDatum>
    <fizetesiHataridoDatum>$paymentDeadline</fizetesiHataridoDatum>
    <fizmod>$paymentMethod</fizmod>
    <penznem>HUF</penznem>
    <szamlaNyelve>hu</szamlaNyelve>
    <megjegyzes>$comment</megjegyzes>
    <rendelesSzam>$orderNumber</rendelesSzam>
  </fejlec>
  <elado>
    <bank>$bankName</bank>
    <bankszamlaszam>$bankAccount</bankszamlaszam>
  </elado>
  <vevo>
    <nev>$customerName</nev>
    <irsz>$customerZip</irsz>
    <telepules>$customerCity</telepules>
    <cim>$customerAddress</cim>
    <email>$customerEmail</email>
XML;
        
        if ($customerTaxNumber) {
            $xml .= "\n    <adoszam>$customerTaxNumber</adoszam>";
        }
        if ($customerPhone) {
            $xml .= "\n    <telefonszam>$customerPhone</telefonszam>";
        }
        
        $xml .= <<<XML

    <sendEmail>true</sendEmail>
  </vevo>
  <tetelek>
XML;
        
        // Tételek hozzáadása
        foreach ($data['items'] as $item) {
            $itemName = $this->escapeXml($item['name']);
            $itemUnit = $this->escapeXml($item['unit']);
            
            $xml .= <<<XML

    <tetel>
      <megnevezes>$itemName</megnevezes>
      <mennyiseg>{$item['quantity']}</mennyiseg>
      <mennyisegiEgyseg>$itemUnit</mennyisegiEgyseg>
      <nettoEgysegar>{$item['netUnitPrice']}</nettoEgysegar>
      <afakulcs>{$item['vatRate']}</afakulcs>
      <netto>{$item['netPrice']}</netto>
      <afa>{$item['vatAmount']}</afa>
      <brutto>{$item['grossAmount']}</brutto>
    </tetel>
XML;
        }
        
        $xml .= <<<XML

  </tetelek>
</xmlszamla>
XML;
        
        return $xml;
    }
    
    /**
     * XML építés - Számla sztornó
     */
    private function buildCancelXML($invoiceNumber) {
        $apiKey = $this->escapeXml($this->config['apiKey']);
        $invoiceNumber = $this->escapeXml($invoiceNumber);
        
        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<xmlszamlast xmlns="http://www.szamlazz.hu/xmlszamlast">
  <beallitasok>
    <szamlaagentkulcs>$apiKey</szamlaagentkulcs>
    <eszamla>true</eszamla>
  </beallitasok>
  <fejlec>
    <szamlaszam>$invoiceNumber</szamlaszam>
  </fejlec>
</xmlszamlast>
XML;
    }
    
    /**
     * XML építés - Számla letöltés
     */
    private function buildDownloadXML($invoiceNumber) {
        $apiKey = $this->escapeXml($this->config['apiKey']);
        $invoiceNumber = $this->escapeXml($invoiceNumber);
        
        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<xmlszamladown xmlns="http://www.szamlazz.hu/xmlszamladown">
  <felhasznalo>$apiKey</felhasznalo>
  <szamlaszam>$invoiceNumber</szamlaszam>
</xmlszamladown>
XML;
    }
    
    /**
     * Válasz parse - Számla kiállítás
     */
    private function parseInvoiceResponse($xml) {
        if (strpos($xml, '<sikeres>true</sikeres>') !== false) {
            preg_match('/<szamlaszam>(.*?)<\/szamlaszam>/', $xml, $invoiceNumberMatch);
            preg_match('/<szamlapdf>(.*?)<\/szamlapdf>/', $xml, $pdfUrlMatch);
            
            return [
                'success' => true,
                'invoiceNumber' => $invoiceNumberMatch[1] ?? null,
                'invoicePdfUrl' => $pdfUrlMatch[1] ?? null,
            ];
        } else {
            preg_match('/<hibakod>(.*?)<\/hibakod>/', $xml, $errorMatch);
            preg_match('/<hibauzenet>(.*?)<\/hibauzenet>/', $xml, $messageMatch);
            
            return [
                'success' => false,
                'error' => $errorMatch[1] ?? 'Ismeretlen hiba',
                'message' => $messageMatch[1] ?? null,
            ];
        }
    }
    
    /**
     * Válasz parse - Sztornó
     */
    private function parseCancelResponse($xml) {
        if (strpos($xml, '<sikeres>true</sikeres>') !== false) {
            return [
                'success' => true,
                'message' => 'Számla sikeresen sztornózva',
            ];
        } else {
            preg_match('/<hibakod>(.*?)<\/hibakod>/', $xml, $errorMatch);
            preg_match('/<hibauzenet>(.*?)<\/hibauzenet>/', $xml, $messageMatch);
            
            return [
                'success' => false,
                'error' => $errorMatch[1] ?? 'Ismeretlen hiba',
                'message' => $messageMatch[1] ?? null,
            ];
        }
    }
    
    /**
     * XML escape
     */
    private function escapeXml($string) {
        return htmlspecialchars($string, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
