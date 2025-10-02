/**
 * Számlázz.hu API Integráció
 * Dokumentáció: https://www.szamlazz.hu/szamla/docs/
 */

interface SzamlazzConfig {
  apiKey: string;
  apiUrl?: string;
  invoicePrefix?: string;
}

interface InvoiceItem {
  name: string;
  quantity: number;
  unit: string;
  netUnitPrice: number;
  vatRate: number;
  netPrice: number;
  vatAmount: number;
  grossAmount: number;
}

interface InvoiceCustomer {
  name: string;
  zip: string;
  city: string;
  address: string;
  email: string;
  taxNumber?: string;
  phone?: string;
}

interface CreateInvoiceData {
  orderNumber: string;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  paymentMethod: string;
  paymentDate?: string;
  deadline?: string;
  comment?: string;
}

interface SzamlazzResponse {
  success: boolean;
  invoiceNumber?: string;
  invoicePdfUrl?: string;
  szamlazzId?: string;
  error?: string;
  message?: string;
}

export class SzamlazzClient {
  private config: SzamlazzConfig;
  private apiUrl: string;

  constructor(config: SzamlazzConfig) {
    this.config = config;
    this.apiUrl = config.apiUrl || 'https://www.szamlazz.hu/szamla/';
  }

  /**
   * Számla kiállítása
   */
  async createInvoice(data: CreateInvoiceData): Promise<SzamlazzResponse> {
    try {
      // Számlázz.hu XML felépítése
      const xmlData = this.buildInvoiceXML(data);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/xml',
        },
        body: new URLSearchParams({
          action: 'xml_invoice',
          data: xmlData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Számlázz.hu API hiba: ${response.statusText}`);
      }

      const responseText = await response.text();
      return this.parseInvoiceResponse(responseText);
    } catch (error) {
      console.error('Számlázz.hu hiba:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ismeretlen hiba',
      };
    }
  }

  /**
   * Számla sztornózása
   */
  async cancelInvoice(invoiceNumber: string): Promise<SzamlazzResponse> {
    try {
      const xmlData = this.buildCancelXML(invoiceNumber);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'xml_invoice_cancel',
          data: xmlData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Számlázz.hu API hiba: ${response.statusText}`);
      }

      const responseText = await response.text();
      return this.parseCancelResponse(responseText);
    } catch (error) {
      console.error('Számlázz.hu sztornó hiba:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ismeretlen hiba',
      };
    }
  }

  /**
   * Számla PDF letöltése
   */
  async downloadInvoice(invoiceNumber: string): Promise<Blob | null> {
    try {
      const xmlData = this.buildDownloadXML(invoiceNumber);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'xml_invoice_download',
          data: xmlData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Számlázz.hu API hiba: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Számlázz.hu letöltés hiba:', error);
      return null;
    }
  }

  /**
   * XML építés - Számla kiállítás
   */
  private buildInvoiceXML(data: CreateInvoiceData): string {
    const now = new Date();
    const issueDate = now.toISOString().split('T')[0];
    const fulfillmentDate = data.deadline || issueDate;
    const paymentDeadline = data.paymentDate || this.addDays(now, 8).toISOString().split('T')[0];

    // Fizetési mód mapping
    const paymentMethodMap: Record<string, string> = {
      'előre_utalás': 'átutalás',
      'utalás': 'átutalás',
      'utánvét': 'utánvét',
      'személyes_átvétel': 'készpénz',
      'havi_elszámolás': 'bankkártya',
    };

    const paymentMethod = paymentMethodMap[data.paymentMethod] || 'átutalás';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <beallitasok>
    <szamlaagentkulcs>${this.escapeXml(this.config.apiKey)}</szamlaagentkulcs>
    <eszamla>true</eszamla>
    <szamlaLetoltes>true</szamlaLetoltes>
    <valaszVerzio>2</valaszVerzio>
  </beallitasok>
  <fejlec>
    <keltDatum>${issueDate}</keltDatum>
    <teljesitesDatum>${fulfillmentDate}</teljesitesDatum>
    <fizetesiHataridoDatum>${paymentDeadline}</fizetesiHataridoDatum>
    <fizmod>${paymentMethod}</fizmod>
    <penznem>HUF</penznem>
    <szamlaNyelve>hu</szamlaNyelve>
    <megjegyzes>${this.escapeXml(data.comment || `Rendelés: ${data.orderNumber}`)}</megjegyzes>
    <rendelesSzam>${this.escapeXml(data.orderNumber)}</rendelesSzam>
  </fejlec>
  <elado>
    <bank>${this.escapeXml(process.env.SZAMLAZZ_BANK_NAME || 'OTP Bank')}</bank>
    <bankszamlaszam>${this.escapeXml(process.env.SZAMLAZZ_BANK_ACCOUNT || '')}</bankszamlaszam>
  </elado>
  <vevo>
    <nev>${this.escapeXml(data.customer.name)}</nev>
    <irsz>${this.escapeXml(data.customer.zip)}</irsz>
    <telepules>${this.escapeXml(data.customer.city)}</telepules>
    <cim>${this.escapeXml(data.customer.address)}</cim>
    <email>${this.escapeXml(data.customer.email)}</email>
    ${data.customer.taxNumber ? `<adoszam>${this.escapeXml(data.customer.taxNumber)}</adoszam>` : ''}
    ${data.customer.phone ? `<telefonszam>${this.escapeXml(data.customer.phone)}</telefonszam>` : ''}
    <sendEmail>true</sendEmail>
  </vevo>
  <tetelek>`;

    // Tételek hozzáadása
    data.items.forEach((item) => {
      xml += `
    <tetel>
      <megnevezes>${this.escapeXml(item.name)}</megnevezes>
      <mennyiseg>${item.quantity}</mennyiseg>
      <mennyisegiEgyseg>${this.escapeXml(item.unit)}</mennyisegiEgyseg>
      <nettoEgysegar>${item.netUnitPrice}</nettoEgysegar>
      <afakulcs>${item.vatRate}</afakulcs>
      <netto>${item.netPrice}</netto>
      <afa>${item.vatAmount}</afa>
      <brutto>${item.grossAmount}</brutto>
    </tetel>`;
    });

    xml += `
  </tetelek>
</xmlszamla>`;

    return xml;
  }

  /**
   * XML építés - Számla sztornó
   */
  private buildCancelXML(invoiceNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<xmlszamlast xmlns="http://www.szamlazz.hu/xmlszamlast">
  <beallitasok>
    <szamlaagentkulcs>${this.escapeXml(this.config.apiKey)}</szamlaagentkulcs>
    <eszamla>true</eszamla>
  </beallitasok>
  <fejlec>
    <szamlaszam>${this.escapeXml(invoiceNumber)}</szamlaszam>
  </fejlec>
</xmlszamlast>`;
  }

  /**
   * XML építés - Számla letöltés
   */
  private buildDownloadXML(invoiceNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<xmlszamladown xmlns="http://www.szamlazz.hu/xmlszamladown">
  <felhasznalo>${this.escapeXml(this.config.apiKey)}</felhasznalo>
  <szamlaszam>${this.escapeXml(invoiceNumber)}</szamlaszam>
</xmlszamladown>`;
  }

  /**
   * Válasz parse - Számla kiállítás
   */
  private parseInvoiceResponse(xml: string): SzamlazzResponse {
    // Egyszerű XML parsing (production-ben használj XML parser library-t)
    if (xml.includes('<sikeres>true</sikeres>')) {
      const invoiceNumberMatch = xml.match(/<szamlaszam>(.*?)<\/szamlaszam>/);
      const pdfUrlMatch = xml.match(/<szamlapdf>(.*?)<\/szamlapdf>/);

      return {
        success: true,
        invoiceNumber: invoiceNumberMatch?.[1],
        invoicePdfUrl: pdfUrlMatch?.[1],
      };
    } else {
      const errorMatch = xml.match(/<hibakod>(.*?)<\/hibakod>/);
      const messageMatch = xml.match(/<hibauzenet>(.*?)<\/hibauzenet>/);

      return {
        success: false,
        error: errorMatch?.[1] || 'Ismeretlen hiba',
        message: messageMatch?.[1],
      };
    }
  }

  /**
   * Válasz parse - Sztornó
   */
  private parseCancelResponse(xml: string): SzamlazzResponse {
    if (xml.includes('<sikeres>true</sikeres>')) {
      return {
        success: true,
        message: 'Számla sikeresen sztornózva',
      };
    } else {
      const errorMatch = xml.match(/<hibakod>(.*?)<\/hibakod>/);
      const messageMatch = xml.match(/<hibauzenet>(.*?)<\/hibauzenet>/);

      return {
        success: false,
        error: errorMatch?.[1] || 'Ismeretlen hiba',
        message: messageMatch?.[1],
      };
    }
  }

  /**
   * XML escape
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Dátum hozzáadás helper
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

/**
 * Számlázz.hu client singleton
 */
export function getSzamlazzClient(): SzamlazzClient {
  const apiKey = process.env.SZAMLAZZ_API_KEY;

  if (!apiKey) {
    throw new Error('SZAMLAZZ_API_KEY nincs beállítva');
  }

  return new SzamlazzClient({
    apiKey,
    invoicePrefix: process.env.SZAMLAZZ_INVOICE_PREFIX || 'DTF',
  });
}
