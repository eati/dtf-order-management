/**
 * API Client - Frontend API hívások kezelése
 * Automatikusan váltogat Vercel és PHP backend között
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * API hívás wrapper
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Query paraméterek hozzáadása
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// API Client exportálása
export const apiClient = {
  // Orders
  getOrders: (status?: string) =>
    apiRequest('/orders', { params: status ? { status } : undefined }),
  
  getOrder: (id: number) =>
    apiRequest(`/orders/${id}`),
  
  createOrder: (data: any) =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateOrder: (id: number, data: any) =>
    apiRequest(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteOrder: (id: number) =>
    apiRequest(`/orders/${id}`, { method: 'DELETE' }),
  
  // Customers
  getCustomers: () =>
    apiRequest('/customers'),
  
  getCustomer: (id: number) =>
    apiRequest(`/customers/${id}`),
  
  createCustomer: (data: any) =>
    apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateCustomer: (id: number, data: any) =>
    apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteCustomer: (id: number) =>
    apiRequest(`/customers/${id}`, { method: 'DELETE' }),
  
  // Pricing
  getPricing: () =>
    apiRequest('/pricing'),
  
  createPricing: (data: any) =>
    apiRequest('/pricing', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Stats
  getStats: () =>
    apiRequest('/stats'),
  
  // GLS
  createGLSParcel: (data: any) =>
    apiRequest('/gls/create-parcel', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  trackGLSParcel: (parcelNumber: string) =>
    apiRequest(`/gls/track/${parcelNumber}`),
  
  // Számlázz.hu
  createInvoice: (data: any) =>
    apiRequest('/szamlazz/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  cancelInvoice: (data: any) =>
    apiRequest('/szamlazz/cancel', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  downloadInvoice: (invoiceNumber: string) => {
    window.open(`${API_BASE_URL}/szamlazz/download/${invoiceNumber}`, '_blank');
  },
};
