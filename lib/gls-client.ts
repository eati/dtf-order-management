// GLS API Client
// Dokumentáció: https://api.mygls.hu/

import type {
  GLSConfig,
  GLSParcelData,
  GLSCreateParcelResponse,
  GLSTrackingResponse
} from './types/gls';

export class GLSClient {
  private config: GLSConfig;

  constructor() {
    this.config = {
      username: process.env.GLS_USERNAME || '',
      password: process.env.GLS_PASSWORD || '',
      clientNumber: process.env.GLS_CLIENT_NUMBER || '',
      apiUrl: process.env.GLS_API_URL || 'https://api.mygls.hu/ParcelService.svc'
    };

    // Validáció
    if (!this.config.username || !this.config.password || !this.config.clientNumber) {
      console.warn('GLS API credentials are not configured properly');
    }
  }

  /**
   * Csomagcímke létrehozása
   */
  async createParcel(parcelData: GLSParcelData): Promise<GLSCreateParcelResponse> {
    try {
      const xmlData = this.buildParcelXML(parcelData);

      const response = await fetch(`${this.config.apiUrl}/PrintLabels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://api.mygls.hu/ParcelService/PrintLabels'
        },
        body: xmlData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GLS API Error Response:', errorText);
        throw new Error(`GLS API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.text();
      
      // XML válasz feldolgozása
      const parcelNumber = this.extractParcelNumber(result);
      const labelUrl = this.extractLabelUrl(result);
      const trackingUrl = parcelNumber 
        ? `https://online.gls-hungary.com/tt_page.php?tt_value=${parcelNumber}`
        : undefined;

      if (!parcelNumber) {
        throw new Error('GLS API did not return a parcel number');
      }

      return {
        success: true,
        parcelNumber,
        labelUrl,
        trackingUrl,
      };
    } catch (error) {
      console.error('GLS createParcel error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Hiba a GLS címke létrehozása során',
      };
    }
  }

  /**
   * Címke újranyomtatása (meglévő csomaghoz)
   */
  async printLabel(parcelNumber: string): Promise<GLSCreateParcelResponse> {
    try {
      const xmlData = this.buildPrintLabelXML(parcelNumber);

      const response = await fetch(`${this.config.apiUrl}/GetPrintedLabels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://api.mygls.hu/ParcelService/GetPrintedLabels'
        },
        body: xmlData,
      });

      if (!response.ok) {
        throw new Error(`GLS API error: ${response.status}`);
      }

      const result = await response.text();
      const labelUrl = this.extractLabelUrl(result);

      return {
        success: true,
        parcelNumber,
        labelUrl,
        trackingUrl: `https://online.gls-hungary.com/tt_page.php?tt_value=${parcelNumber}`,
      };
    } catch (error) {
      console.error('GLS printLabel error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Hiba a címke letöltése során',
      };
    }
  }

  /**
   * Csomag nyomkövetése
   */
  async trackParcel(parcelNumber: string): Promise<GLSTrackingResponse> {
    try {
      const xmlData = this.buildTrackXML(parcelNumber);

      const response = await fetch(`${this.config.apiUrl}/GetParcelStatuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://api.mygls.hu/ParcelService/GetParcelStatuses'
        },
        body: xmlData,
      });

      if (!response.ok) {
        throw new Error(`GLS API error: ${response.status}`);
      }

      const result = await response.text();
      const status = this.extractStatus(result);
      const statusCode = this.extractStatusCode(result);
      const location = this.extractLocation(result);
      const timestamp = this.extractTimestamp(result);

      return {
        success: true,
        status,
        statusCode,
        statusText: this.getStatusText(statusCode || ''),
        location,
        timestamp,
      };
    } catch (error) {
      console.error('GLS trackParcel error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Hiba a nyomkövetés során',
      };
    }
  }

  // XML építők
  private buildParcelXML(data: GLSParcelData): string {
    const senderName = process.env.SENDER_NAME || 'DTF Nyomda Kft.';
    const senderAddress = process.env.SENDER_ADDRESS || 'Fő utca 1.';
    const senderCity = process.env.SENDER_CITY || 'Budapest';
    const senderZipcode = process.env.SENDER_ZIPCODE || '1111';
    const senderContactName = process.env.SENDER_CONTACT_NAME || 'Kapcsolattartó';
    const senderPhone = process.env.SENDER_PHONE || '+36301234567';
    const senderEmail = process.env.SENDER_EMAIL || 'info@dtfnyomda.hu';

    return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://api.mygls.hu/">
  <SOAP-ENV:Body>
    <ns1:PrintLabels>
      <ns1:username>${this.escapeXml(this.config.username)}</ns1:username>
      <ns1:password>${this.escapeXml(this.config.password)}</ns1:password>
      <ns1:pcllist>
        <ns1:ParcelData>
          <ns1:ClientNumber>${this.escapeXml(this.config.clientNumber)}</ns1:ClientNumber>
          <ns1:ClientReference>${this.escapeXml(data.reference)}</ns1:ClientReference>
          <ns1:CODAmount>${data.codAmount || 0}</ns1:CODAmount>
          <ns1:CODReference>${data.codAmount ? this.escapeXml(data.reference) : ''}</ns1:CODReference>
          <ns1:Content>DTF Film</ns1:Content>
          <ns1:Count>${data.count}</ns1:Count>
          <ns1:DeliveryName>${this.escapeXml(data.name)}</ns1:DeliveryName>
          <ns1:DeliveryAddress>${this.escapeXml(data.address)}</ns1:DeliveryAddress>
          <ns1:DeliveryCity>${this.escapeXml(data.city)}</ns1:DeliveryCity>
          <ns1:DeliveryZipCode>${this.escapeXml(data.zipCode)}</ns1:DeliveryZipCode>
          <ns1:DeliveryContactName>${this.escapeXml(data.name)}</ns1:DeliveryContactName>
          <ns1:DeliveryContactPhone>${this.escapeXml(data.phone)}</ns1:DeliveryContactPhone>
          <ns1:DeliveryContactEmail>${data.email ? this.escapeXml(data.email) : ''}</ns1:DeliveryContactEmail>
          <ns1:PickupName>${this.escapeXml(senderName)}</ns1:PickupName>
          <ns1:PickupAddress>${this.escapeXml(senderAddress)}</ns1:PickupAddress>
          <ns1:PickupCity>${this.escapeXml(senderCity)}</ns1:PickupCity>
          <ns1:PickupZipCode>${this.escapeXml(senderZipcode)}</ns1:PickupZipCode>
          <ns1:PickupContactName>${this.escapeXml(senderContactName)}</ns1:PickupContactName>
          <ns1:PickupContactPhone>${this.escapeXml(senderPhone)}</ns1:PickupContactPhone>
          <ns1:PickupContactEmail>${this.escapeXml(senderEmail)}</ns1:PickupContactEmail>
          <ns1:Weight>${data.weight}</ns1:Weight>
        </ns1:ParcelData>
      </ns1:pcllist>
      <ns1:printertemplate>A4_2x2</ns1:printertemplate>
    </ns1:PrintLabels>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
  }

  private buildPrintLabelXML(parcelNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://api.mygls.hu/">
  <SOAP-ENV:Body>
    <ns1:GetPrintedLabels>
      <ns1:username>${this.escapeXml(this.config.username)}</ns1:username>
      <ns1:password>${this.escapeXml(this.config.password)}</ns1:password>
      <ns1:parcelIdList>
        <ns1:long>${this.escapeXml(parcelNumber)}</ns1:long>
      </ns1:parcelIdList>
      <ns1:printertemplate>A4_2x2</ns1:printertemplate>
    </ns1:GetPrintedLabels>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
  }

  private buildTrackXML(parcelNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://api.mygls.hu/">
  <SOAP-ENV:Body>
    <ns1:GetParcelStatuses>
      <ns1:username>${this.escapeXml(this.config.username)}</ns1:username>
      <ns1:password>${this.escapeXml(this.config.password)}</ns1:password>
      <ns1:parcelNumberList>
        <ns1:string>${this.escapeXml(parcelNumber)}</ns1:string>
      </ns1:parcelNumberList>
    </ns1:GetParcelStatuses>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
  }

  // XML válasz parserek
  private extractParcelNumber(xml: string): string {
    const patterns = [
      /<ParcelNumber>(.*?)<\/ParcelNumber>/i,
      /<ParcelId>(.*?)<\/ParcelId>/i,
      /<ns\d*:ParcelNumber>(.*?)<\/ns\d*:ParcelNumber>/i,
      /<ns\d*:ParcelId>(.*?)<\/ns\d*:ParcelId>/i,
    ];

    for (const pattern of patterns) {
      const match = xml.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  }

  private extractLabelUrl(xml: string): string {
    const patterns = [
      /<Labels>([\s\S]*?)<\/Labels>/i,
      /<ns\d*:Labels>([\s\S]*?)<\/ns\d*:Labels>/i,
      /<PrintData>([\s\S]*?)<\/PrintData>/i,
      /<ns\d*:PrintData>([\s\S]*?)<\/ns\d*:PrintData>/i,
    ];

    for (const pattern of patterns) {
      const match = xml.match(pattern);
      if (match && match[1]) {
        const base64Data = match[1].trim();
        // Base64 PDF -> Data URL konverzió
        if (base64Data) {
          return `data:application/pdf;base64,${base64Data}`;
        }
      }
    }
    return '';
  }

  private extractStatus(xml: string): string {
    const patterns = [
      /<StatusInfo>(.*?)<\/StatusInfo>/i,
      /<ns\d*:StatusInfo>(.*?)<\/ns\d*:StatusInfo>/i,
      /<Status>(.*?)<\/Status>/i,
      /<ns\d*:Status>(.*?)<\/ns\d*:Status>/i,
    ];

    for (const pattern of patterns) {
      const match = xml.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return 'Ismeretlen';
  }

  private extractStatusCode(xml: string): string {
    const patterns = [
      /<StatusCode>(.*?)<\/StatusCode>/i,
      /<ns\d*:StatusCode>(.*?)<\/ns\d*:StatusCode>/i,
    ];

    for (const pattern of patterns) {
      const match = xml.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  }

  private extractLocation(xml: string): string {
    const patterns = [
      /<DepotCity>(.*?)<\/DepotCity>/i,
      /<ns\d*:DepotCity>(.*?)<\/ns\d*:DepotCity>/i,
    ];

    for (const pattern of patterns) {
      const match = xml.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  }

  private extractTimestamp(xml: string): string {
    const patterns = [
      /<EventDate>(.*?)<\/EventDate>/i,
      /<ns\d*:EventDate>(.*?)<\/ns\d*:EventDate>/i,
      /<StatusDate>(.*?)<\/StatusDate>/i,
      /<ns\d*:StatusDate>(.*?)<\/ns\d*:StatusDate>/i,
    ];

    for (const pattern of patterns) {
      const match = xml.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private getStatusText(statusCode: string): string {
    const statusMap: Record<string, string> = {
      '1': 'Csomag regisztrálva',
      '2': 'Csomag átvéve',
      '3': 'Depóban',
      '4': 'Úton a címzetthez',
      '5': 'Kézbesítés alatt',
      '6': 'Kézbesítve',
      '7': 'Sikertelen kézbesítés',
      '8': 'Visszaküldve',
      '9': 'Megsemmisítve',
      '10': 'Tárolva',
    };

    return statusMap[statusCode] || 'Ismeretlen státusz';
  }
}

export const glsClient = new GLSClient();
