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
      // REST endpoint XML formátummal
      const fullUrl = `${this.config.apiUrl}/xml/PrintLabels`;

      console.log('=== GLS API Request Debug ===');
      console.log('Full URL:', fullUrl);
      console.log('API URL from config:', this.config.apiUrl);
      console.log('Client Number:', this.config.clientNumber);
      console.log('Username:', this.config.username);
      console.log('Request Method:', 'POST');
      console.log('=============================');

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Accept': 'application/xml'
        },
        body: xmlData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GLS API Error Response:', errorText);
        console.error('Response Status:', response.status);
        console.error('Response Headers:', Object.fromEntries(response.headers.entries()));
        throw new Error(`GLS API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.text();
      
      console.log('=== GLS API Response ===');
      console.log('Response length:', result.length);
      console.log('First 500 chars:', result.substring(0, 500));
      console.log('========================');
      
      // XML válasz feldolgozása
      const parcelNumber = this.extractParcelNumber(result);
      const labelUrl = this.extractLabelUrl(result);
      const trackingUrl = parcelNumber 
        ? `https://online.gls-hungary.com/tt_page.php?tt_value=${parcelNumber}`
        : undefined;

      if (!parcelNumber) {
        console.error('Full GLS Response:', result);
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

      const response = await fetch(`${this.config.apiUrl}/xml/GetPrintedLabels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Accept': 'application/xml'
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

      const response = await fetch(`${this.config.apiUrl}/xml/GetParcelStatuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Accept': 'application/xml'
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

  // XML építők (REST API DataContract formátum)
  private buildParcelXML(data: GLSParcelData): string {
    const senderName = process.env.SENDER_NAME || 'DTF Nyomda Kft.';
    const senderAddress = process.env.SENDER_ADDRESS || 'Fő utca 1.';
    const senderCity = process.env.SENDER_CITY || 'Budapest';
    const senderZipcode = process.env.SENDER_ZIPCODE || '1111';
    const senderContactName = process.env.SENDER_CONTACT_NAME || 'Kapcsolattartó';
    const senderPhone = process.env.SENDER_PHONE || '+36301234567';
    const senderEmail = process.env.SENDER_EMAIL || 'info@dtfnyomda.hu';

    return `<?xml version="1.0" encoding="UTF-8"?>
<PrintLabelsRequest xmlns="http://schemas.datacontract.org/2004/07/GLS.MyGLS.ServiceData.APIDTOs.LabelOperations">
  <Username>${this.escapeXml(this.config.username)}</Username>
  <Password>${this.escapeXml(this.config.password)}</Password>
  <ParcelList>
    <ParcelData xmlns="http://schemas.datacontract.org/2004/07/GLS.MyGLS.ServiceData.APIDTOs.Common">
      <ClientNumber>${this.escapeXml(this.config.clientNumber)}</ClientNumber>
      <ClientReference>${this.escapeXml(data.reference)}</ClientReference>
      <CODAmount>${data.codAmount || 0}</CODAmount>
      <CODReference>${data.codAmount ? this.escapeXml(data.reference) : ''}</CODReference>
      <Content>DTF Film</Content>
      <Count>${data.count}</Count>
      <DeliveryName>${this.escapeXml(data.name)}</DeliveryName>
      <DeliveryAddress>${this.escapeXml(data.address)}</DeliveryAddress>
      <DeliveryCity>${this.escapeXml(data.city)}</DeliveryCity>
      <DeliveryZipCode>${this.escapeXml(data.zipCode)}</DeliveryZipCode>
      <DeliveryContactName>${this.escapeXml(data.name)}</DeliveryContactName>
      <DeliveryContactPhone>${this.escapeXml(data.phone)}</DeliveryContactPhone>
      <DeliveryContactEmail>${data.email ? this.escapeXml(data.email) : ''}</DeliveryContactEmail>
      <PickupName>${this.escapeXml(senderName)}</PickupName>
      <PickupAddress>${this.escapeXml(senderAddress)}</PickupAddress>
      <PickupCity>${this.escapeXml(senderCity)}</PickupCity>
      <PickupZipCode>${this.escapeXml(senderZipcode)}</PickupZipCode>
      <PickupContactName>${this.escapeXml(senderContactName)}</PickupContactName>
      <PickupContactPhone>${this.escapeXml(senderPhone)}</PickupContactPhone>
      <PickupContactEmail>${this.escapeXml(senderEmail)}</PickupContactEmail>
      <Weight>${data.weight}</Weight>
    </ParcelData>
  </ParcelList>
  <PrinterTemplate>A4_2x2</PrinterTemplate>
</PrintLabelsRequest>`;
  }

  private buildPrintLabelXML(parcelNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<GetPrintedLabelsRequest xmlns="http://schemas.datacontract.org/2004/07/GLS.MyGLS.ServiceData.APIDTOs.LabelOperations">
  <Username>${this.escapeXml(this.config.username)}</Username>
  <Password>${this.escapeXml(this.config.password)}</Password>
  <ParcelIdList>
    <long>${this.escapeXml(parcelNumber)}</long>
  </ParcelIdList>
  <PrinterTemplate>A4_2x2</PrinterTemplate>
</GetPrintedLabelsRequest>`;
  }

  private buildTrackXML(parcelNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<GetParcelStatusesRequest xmlns="http://schemas.datacontract.org/2004/07/GLS.MyGLS.ServiceData.APIDTOs.TrackAndTrace">
  <Username>${this.escapeXml(this.config.username)}</Username>
  <Password>${this.escapeXml(this.config.password)}</Password>
  <ParcelNumberList>
    <string>${this.escapeXml(parcelNumber)}</string>
  </ParcelNumberList>
</GetParcelStatusesRequest>`;
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
