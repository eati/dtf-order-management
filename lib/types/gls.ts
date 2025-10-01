// GLS API Type Definitions

export interface GLSConfig {
  username: string;
  password: string;
  clientNumber: string;
  apiUrl: string;
}

export interface GLSParcelData {
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

export interface GLSCreateParcelResponse {
  success: boolean;
  parcelNumber?: string;
  labelUrl?: string;
  trackingUrl?: string;
  error?: string;
}

export interface GLSTrackingResponse {
  success: boolean;
  status?: string;
  statusCode?: string;
  statusText?: string;
  location?: string;
  timestamp?: string;
  error?: string;
}

export interface GLSWebhookPayload {
  parcelNumber: string;
  status: string;
  statusCode: string;
  timestamp: string;
  location?: string;
}
