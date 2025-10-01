// GLS API Service
// Dokumentáció: https://api.mygls.hu/

interface GLSConfig {
  username: string;
  password: string;
  clientNumber: string;
  apiUrl: string;
}

interface GLSParcelData {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  email?: string;
  reference: string; // rendelésszám
  weight: number; // kg-ban
  codAmount?: number; // utánvét összeg
  count: number; // csomagok száma
}

export class GLSService {
  private config: GLSConfig;

  constructor() {
    this.config = {
      username: process.env.GLS_USERNAME || '',
      password: process.env.GLS_PASSWORD || '',
      clientNumber: process.env.GLS_CLIENT_NUMBER || '',
      apiUrl: process.env.GLS_API_URL || 'https://api.mygls.hu/ParcelService.svc'
    };
  }

  // Címke létrehozása
  async createParcel(parcelData: GLSParcelData) {
    try {
      // GLS XML formátum (egyszerűsített példa)
      const xmlData = this.buildParcelXML(parcelData);

      const response = await fetch(`${this.config.apiUrl}/PrintLabels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
        },
        body: xmlData,
      });

      if (!response.ok) {
        throw new Error('GLS API hiba');
      }

      const result = await response.text();
      
      // XML válasz feldolgozása (egyszerűsített)
      const parcelNumber = this.extractParcelNumber(result);
      const labelUrl = this.extractLabelUrl(result);

      return {
        success: true,
        parcelNumber,
        labelUrl,
      };
    } catch (error) {
      console.error('GLS API hiba:', error);
      return {
        success: false,
        error: 'Hiba a GLS címke létrehozása során',
      };
    }
  }

  // Címke nyomtatása (meglévő csomaghoz)
  async printLabel(parcelNumber: string) {
    try {
      const response = await fetch(`${this.config.apiUrl}/GetPrintedLabels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
        },
        body: this.buildPrintLabelXML(parcelNumber),
      });

      if (!response.ok) {
        throw new Error('GLS API hiba');
      }

      const result = await response.text();
      const labelUrl = this.extractLabelUrl(result);

      return {
        success: true,
        labelUrl,
      };
    } catch (error) {
      console.error('GLS címke nyomtatás hiba:', error);
      return {
        success: false,
        error: 'Hiba a címke letöltése során',
      };
    }
  }

  // Nyomkövetés
  async trackParcel(parcelNumber: string) {
    try {
      const response = await fetch(`${this.config.apiUrl}/GetParcelStatuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
        },
        body: this.buildTrackXML(parcelNumber),
      });

      if (!response.ok) {
        throw new Error('GLS API hiba');
      }

      const result = await response.text();
      const status = this.extractStatus(result);

      return {
        success: true,
        status,
      };
    } catch (error) {
      console.error('GLS nyomkövetés hiba:', error);
      return {
        success: false,
        error: 'Hiba a nyomkövetés során',
      };
    }
  }

  // XML építők (egyszerűsített példák - a tényleges GLS XML eltérhet)
  private buildParcelXML(data: GLSParcelData): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP-ENV:Body>
    <PrintLabelsRequest>
      <UserName>${this.config.username}</UserName>
      <Password>${this.config.password}</Password>
      <ParcelList>
        <Parcel>
          <ClientNumber>${this.config.clientNumber}</ClientNumber>
          <Reference>${data.reference}</Reference>
          <Name>${data.name}</Name>
          <Address>${data.address}</Address>
          <City>${data.city}</City>
          <ZipCode>${data.zipCode}</ZipCode>
          <Phone>${data.phone}</Phone>
          ${data.email ? `<Email>${data.email}</Email>` : ''}
          <Weight>${data.weight}</Weight>
          <Count>${data.count}</Count>
          ${data.codAmount ? `<CODAmount>${data.codAmount}</CODAmount>` : ''}
          <ServiceList>
            <Service>
              <Code>SM</Code>
            </Service>
          </ServiceList>
        </Parcel>
      </ParcelList>
      <PrintPosition>1</PrintPosition>
      <ShowPrintDialog>0</ShowPrintDialog>
    </PrintLabelsRequest>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
  }

  private buildPrintLabelXML(parcelNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP-ENV:Body>
    <GetPrintedLabelsRequest>
      <UserName>${this.config.username}</UserName>
      <Password>${this.config.password}</Password>
      <ParcelIdList>
        <ParcelId>${parcelNumber}</ParcelId>
      </ParcelIdList>
    </GetPrintedLabelsRequest>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
  }

  private buildTrackXML(parcelNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP-ENV:Body>
    <GetParcelStatusesRequest>
      <UserName>${this.config.username}</UserName>
      <Password>${this.config.password}</Password>
      <ParcelNumberList>
        <ParcelNumber>${parcelNumber}</ParcelNumber>
      </ParcelNumberList>
    </GetParcelStatusesRequest>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
  }

  // XML válasz parserek (egyszerűsített - valós esetben XML parser kell)
  private extractParcelNumber(xml: string): string {
    const match = xml.match(/<ParcelNumber>(.*?)<\/ParcelNumber>/);
    return match ? match[1] : '';
  }

  private extractLabelUrl(xml: string): string {
    const match = xml.match(/<Labels>(.*?)<\/Labels>/);
    if (match) {
      // Base64 PDF -> Data URL konverzió
      return `data:application/pdf;base64,${match[1]}`;
    }
    return '';
  }

  private extractStatus(xml: string): string {
    const match = xml.match(/<StatusCode>(.*?)<\/StatusCode>/);
    return match ? match[1] : '';
  }
}

export const glsService = new GLSService();