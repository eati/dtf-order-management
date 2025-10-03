<?php
/**
 * GLS API Client osztály
 * Dokumentáció: https://api.mygls.hu/
 */

class GLSClient {
    private $config;
    
    public function __construct() {
        $this->config = [
            'username' => GLS_USERNAME,
            'password' => GLS_PASSWORD,
            'clientNumber' => GLS_CLIENT_NUMBER,
            'apiUrl' => GLS_API_URL,
        ];
        
        if (empty($this->config['username']) || empty($this->config['password']) || empty($this->config['clientNumber'])) {
            error_log('GLS API credentials are not configured properly');
        }
    }
    
    /**
     * Csomagcímke létrehozása
     */
    public function createParcel($parcelData) {
        try {
            $xmlData = $this->buildParcelXML($parcelData);
            $fullUrl = $this->config['apiUrl'] . '/xml/PrintLabels';
            
            error_log('=== GLS API Request Debug ===');
            error_log('Full URL: ' . $fullUrl);
            error_log('Client Number: ' . $this->config['clientNumber']);
            error_log('Username: ' . $this->config['username']);
            error_log('=============================');
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $fullUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/xml; charset=utf-8',
                'Accept: application/xml',
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            if (curl_errno($ch)) {
                throw new Exception('cURL error: ' . curl_error($ch));
            }
            
            curl_close($ch);
            
            if ($httpCode !== 200) {
                error_log('GLS API Error Response: ' . $response);
                throw new Exception("GLS API error: HTTP $httpCode");
            }
            
            error_log('=== GLS API Response ===');
            error_log('Response length: ' . strlen($response));
            error_log('First 500 chars: ' . substr($response, 0, 500));
            error_log('========================');
            
            $parcelNumber = $this->extractParcelNumber($response);
            $labelUrl = $this->extractLabelUrl($response);
            $trackingUrl = $parcelNumber 
                ? "https://online.gls-hungary.com/tt_page.php?tt_value=$parcelNumber"
                : null;
            
            if (!$parcelNumber) {
                error_log('Full GLS Response: ' . $response);
                throw new Exception('GLS API did not return a parcel number');
            }
            
            return [
                'success' => true,
                'parcelNumber' => $parcelNumber,
                'labelUrl' => $labelUrl,
                'trackingUrl' => $trackingUrl,
            ];
            
        } catch (Exception $e) {
            error_log('GLS createParcel error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Címke újranyomtatása
     */
    public function printLabel($parcelNumber) {
        try {
            $xmlData = $this->buildPrintLabelXML($parcelNumber);
            $fullUrl = $this->config['apiUrl'] . '/xml/GetPrintedLabels';
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $fullUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/xml; charset=utf-8',
                'Accept: application/xml',
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200) {
                throw new Exception("GLS API error: HTTP $httpCode");
            }
            
            $labelUrl = $this->extractLabelUrl($response);
            
            return [
                'success' => true,
                'parcelNumber' => $parcelNumber,
                'labelUrl' => $labelUrl,
                'trackingUrl' => "https://online.gls-hungary.com/tt_page.php?tt_value=$parcelNumber",
            ];
            
        } catch (Exception $e) {
            error_log('GLS printLabel error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Csomag nyomkövetése
     */
    public function trackParcel($parcelNumber) {
        try {
            $xmlData = $this->buildTrackXML($parcelNumber);
            $fullUrl = $this->config['apiUrl'] . '/xml/GetParcelStatuses';
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $fullUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/xml; charset=utf-8',
                'Accept: application/xml',
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200) {
                throw new Exception("GLS API error: HTTP $httpCode");
            }
            
            $status = $this->extractStatus($response);
            $statusCode = $this->extractStatusCode($response);
            $location = $this->extractLocation($response);
            $timestamp = $this->extractTimestamp($response);
            
            return [
                'success' => true,
                'status' => $status,
                'statusCode' => $statusCode,
                'statusText' => $this->getStatusText($statusCode),
                'location' => $location,
                'timestamp' => $timestamp,
            ];
            
        } catch (Exception $e) {
            error_log('GLS trackParcel error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
    
    // XML építők
    
    private function buildParcelXML($data) {
        $username = $this->escapeXml($this->config['username']);
        $password = $this->escapeXml($this->config['password']);
        $clientNumber = $this->escapeXml($this->config['clientNumber']);
        
        $reference = $this->escapeXml($data['reference']);
        $name = $this->escapeXml($data['name']);
        $address = $this->escapeXml($data['address']);
        $city = $this->escapeXml($data['city']);
        $zipCode = $this->escapeXml($data['zipCode']);
        $phone = $this->escapeXml($data['phone']);
        $email = $data['email'] ? $this->escapeXml($data['email']) : '';
        $weight = $data['weight'];
        $count = $data['count'];
        $codAmount = $data['codAmount'] ?? 0;
        $codReference = $codAmount ? $reference : '';
        
        $senderName = $this->escapeXml(SENDER_NAME);
        $senderAddress = $this->escapeXml(SENDER_ADDRESS);
        $senderCity = $this->escapeXml(SENDER_CITY);
        $senderZipcode = $this->escapeXml(SENDER_ZIPCODE);
        $senderContactName = $this->escapeXml(SENDER_CONTACT_NAME);
        $senderPhone = $this->escapeXml(SENDER_PHONE);
        $senderEmail = $this->escapeXml(SENDER_EMAIL);
        
        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<PrintLabelsRequest xmlns="http://schemas.datacontract.org/2004/07/GLS.MyGLS.ServiceData.APIDTOs.LabelOperations">
  <Username>$username</Username>
  <Password>$password</Password>
  <ParcelList>
    <ParcelData xmlns="http://schemas.datacontract.org/2004/07/GLS.MyGLS.ServiceData.APIDTOs.Common">
      <ClientNumber>$clientNumber</ClientNumber>
      <ClientReference>$reference</ClientReference>
      <CODAmount>$codAmount</CODAmount>
      <CODReference>$codReference</CODReference>
      <Content>DTF Film</Content>
      <Count>$count</Count>
      <DeliveryName>$name</DeliveryName>
      <DeliveryAddress>$address</DeliveryAddress>
      <DeliveryCity>$city</DeliveryCity>
      <DeliveryZipCode>$zipCode</DeliveryZipCode>
      <DeliveryContactName>$name</DeliveryContactName>
      <DeliveryContactPhone>$phone</DeliveryContactPhone>
      <DeliveryContactEmail>$email</DeliveryContactEmail>
      <PickupName>$senderName</PickupName>
      <PickupAddress>$senderAddress</PickupAddress>
      <PickupCity>$senderCity</PickupCity>
      <PickupZipCode>$senderZipcode</PickupZipCode>
      <PickupContactName>$senderContactName</PickupContactName>
      <PickupContactPhone>$senderPhone</PickupContactPhone>
      <PickupContactEmail>$senderEmail</PickupContactEmail>
      <Weight>$weight</Weight>
    </ParcelData>
  </ParcelList>
  <PrinterTemplate>A4_2x2</PrinterTemplate>
</PrintLabelsRequest>
XML;
    }
    
    private function buildPrintLabelXML($parcelNumber) {
        $username = $this->escapeXml($this->config['username']);
        $password = $this->escapeXml($this->config['password']);
        $parcelNumber = $this->escapeXml($parcelNumber);
        
        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<GetPrintedLabelsRequest xmlns="http://schemas.datacontract.org/2004/07/GLS.MyGLS.ServiceData.APIDTOs.LabelOperations">
  <Username>$username</Username>
  <Password>$password</Password>
  <ParcelIdList>
    <long>$parcelNumber</long>
  </ParcelIdList>
  <PrinterTemplate>A4_2x2</PrinterTemplate>
</GetPrintedLabelsRequest>
XML;
    }
    
    private function buildTrackXML($parcelNumber) {
        $username = $this->escapeXml($this->config['username']);
        $password = $this->escapeXml($this->config['password']);
        $parcelNumber = $this->escapeXml($parcelNumber);
        
        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<GetParcelStatusesRequest xmlns="http://schemas.datacontract.org/2004/07/GLS.MyGLS.ServiceData.APIDTOs.TrackAndTrace">
  <Username>$username</Username>
  <Password>$password</Password>
  <ParcelNumberList>
    <string>$parcelNumber</string>
  </ParcelNumberList>
</GetParcelStatusesRequest>
XML;
    }
    
    // XML parserek
    
    private function extractParcelNumber($xml) {
        $patterns = [
            '/<ParcelNumber>(.*?)<\/ParcelNumber>/i',
            '/<ParcelId>(.*?)<\/ParcelId>/i',
            '/<ns\d*:ParcelNumber>(.*?)<\/ns\d*:ParcelNumber>/i',
            '/<ns\d*:ParcelId>(.*?)<\/ns\d*:ParcelId>/i',
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $xml, $matches)) {
                return trim($matches[1]);
            }
        }
        return '';
    }
    
    private function extractLabelUrl($xml) {
        $patterns = [
            '/<Labels>([\s\S]*?)<\/Labels>/i',
            '/<ns\d*:Labels>([\s\S]*?)<\/ns\d*:Labels>/i',
            '/<PrintData>([\s\S]*?)<\/PrintData>/i',
            '/<ns\d*:PrintData>([\s\S]*?)<\/ns\d*:PrintData>/i',
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $xml, $matches)) {
                $base64Data = trim($matches[1]);
                if ($base64Data) {
                    return "data:application/pdf;base64,$base64Data";
                }
            }
        }
        return '';
    }
    
    private function extractStatus($xml) {
        $patterns = [
            '/<StatusInfo>(.*?)<\/StatusInfo>/i',
            '/<ns\d*:StatusInfo>(.*?)<\/ns\d*:StatusInfo>/i',
            '/<Status>(.*?)<\/Status>/i',
            '/<ns\d*:Status>(.*?)<\/ns\d*:Status>/i',
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $xml, $matches)) {
                return trim($matches[1]);
            }
        }
        return 'Ismeretlen';
    }
    
    private function extractStatusCode($xml) {
        $patterns = [
            '/<StatusCode>(.*?)<\/StatusCode>/i',
            '/<ns\d*:StatusCode>(.*?)<\/ns\d*:StatusCode>/i',
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $xml, $matches)) {
                return trim($matches[1]);
            }
        }
        return '';
    }
    
    private function extractLocation($xml) {
        $patterns = [
            '/<DepotCity>(.*?)<\/DepotCity>/i',
            '/<ns\d*:DepotCity>(.*?)<\/ns\d*:DepotCity>/i',
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $xml, $matches)) {
                return trim($matches[1]);
            }
        }
        return '';
    }
    
    private function extractTimestamp($xml) {
        $patterns = [
            '/<EventDate>(.*?)<\/EventDate>/i',
            '/<ns\d*:EventDate>(.*?)<\/ns\d*:EventDate>/i',
            '/<StatusDate>(.*?)<\/StatusDate>/i',
            '/<ns\d*:StatusDate>(.*?)<\/ns\d*:StatusDate>/i',
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $xml, $matches)) {
                return trim($matches[1]);
            }
        }
        return '';
    }
    
    private function escapeXml($string) {
        return htmlspecialchars($string, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
    
    private function getStatusText($statusCode) {
        $statusMap = [
            '1' => 'Csomag regisztrálva',
            '2' => 'Csomag átvéve',
            '3' => 'Depóban',
            '4' => 'Úton a címzetthez',
            '5' => 'Kézbesítés alatt',
            '6' => 'Kézbesítve',
            '7' => 'Sikertelen kézbesítés',
            '8' => 'Visszaküldve',
            '9' => 'Megsemmisítve',
            '10' => 'Tárolva',
        ];
        
        return $statusMap[$statusCode] ?? 'Ismeretlen státusz';
    }
}
