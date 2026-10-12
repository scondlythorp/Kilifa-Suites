/**
 * Kilifa Suites REST API Client
 * Connects frontend React components exclusively to backend REST API endpoints.
 */

// In production split deployments (e.g. Vercel frontend + Render backend), VITE_API_URL can be set to "https://api.kilifasuites.com/api" or "https://<render-service>.onrender.com/api".
// When empty or running unified/locally, it defaults to the relative '/api' endpoint.
const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) || '/api';
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

export function getStoredToken(): string | null {
  return localStorage.getItem('kilifa_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('kilifa_token', token);
}

export function removeStoredToken() {
  localStorage.removeItem('kilifa_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || data.error || `HTTP ${response.status} Error`;
    throw new Error(errorMsg);
  }

  return data;
}

// REST API Helper methods
export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => apiRequest('/auth/me'),
    logout: () =>
      apiRequest('/auth/logout', { method: 'POST' }).finally(() => removeStoredToken()),
  },
  dashboard: {
    getStats: () => apiRequest('/dashboard/stats'),
  },
  suites: {
    getAll: () => apiRequest('/suites'),
    getById: (id: string) => apiRequest(`/suites/${id}`),
    create: (data: any) => apiRequest('/suites', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/suites/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/suites/${id}`, { method: 'DELETE' }),
  },
  bookings: {
    getAll: () => apiRequest('/bookings'),
    getById: (id: string) => apiRequest(`/bookings/${id}`),
    create: (data: any) => apiRequest('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      apiRequest(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  guests: {
    getAll: () => apiRequest('/guests'),
    getById: (id: string) => apiRequest(`/guests/${id}`),
    update: (id: string, data: { vipStatus?: boolean; phone?: string; country?: string; fullName?: string }) =>
      apiRequest(`/guests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    checkIn: (bookingId: string) =>
      apiRequest(`/guests/bookings/${bookingId}/check-in`, { method: 'POST' }),
    checkOut: (bookingId: string) =>
      apiRequest(`/guests/bookings/${bookingId}/check-out`, { method: 'POST' }),
    updateSpecialRequests: (bookingId: string, specialRequests: string) =>
      apiRequest(`/guests/bookings/${bookingId}/special-requests`, {
        method: 'PATCH',
        body: JSON.stringify({ specialRequests }),
      }),
  },
  media: {
    getAll: (admin = true) => apiRequest(`/media?admin=${admin}`),
    create: (data: any) => apiRequest('/media', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/media/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/media/${id}`, { method: 'DELETE' }),
    togglePublish: (id: string) => apiRequest(`/media/${id}/publish`, { method: 'PATCH' }),
  },
  payments: {
    getProviders: () => apiRequest('/payments/providers'),
    getAll: () => apiRequest('/payments'),
    initiate: (data: any) => apiRequest('/payments/initiate', { method: 'POST', body: JSON.stringify(data) }),
    recordPartial: (paymentId: string, paidAmount: number, notes?: string) =>
      apiRequest(`/payments/${paymentId}/partial`, { method: 'POST', body: JSON.stringify({ paidAmount, notes }) }),
    updateStatus: (paymentId: string, status: string, notes?: string) =>
      apiRequest(`/payments/${paymentId}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
    refund: (paymentId: string, amount?: number) =>
      apiRequest(`/payments/${paymentId}/refund`, { method: 'POST', body: JSON.stringify({ amount }) }),
  },
  access: {
    getHardwareSpec: () => apiRequest('/access/hardware-spec'),
    getAllCards: () => apiRequest('/access/cards'),
    getCardDetails: (cardId: string) => apiRequest(`/access/cards/${cardId}`),
    createCard: (data: any) => apiRequest('/access/cards/create', { method: 'POST', body: JSON.stringify(data) }),
    activateCard: (cardId: string) => apiRequest(`/access/cards/${cardId}/activate`, { method: 'POST' }),
    processCheckIn: (cardId: string) => apiRequest(`/access/cards/${cardId}/checkin`, { method: 'POST' }),
    processCheckOut: (cardId: string) => apiRequest(`/access/cards/${cardId}/checkout`, { method: 'POST' }),
    revokeCard: (cardId: string, reason?: string) =>
      apiRequest(`/access/cards/${cardId}/revoke`, { method: 'POST', body: JSON.stringify({ reason }) }),
    simulateEntry: (data: { cardId: string; doorId?: string; doorName?: string }) =>
      apiRequest('/access/simulate-entry', { method: 'POST', body: JSON.stringify(data) }),
    getLogs: (cardId?: string) => apiRequest(`/access/logs${cardId ? '?cardId=' + cardId : ''}`),
  },
  notifications: {
    getProvidersStatus: () => apiRequest('/notifications/providers'),
    getHistory: (limit?: number) => apiRequest(`/notifications/history${limit ? '?limit=' + limit : ''}`),
    send: (data: any) => apiRequest('/notifications/send', { method: 'POST', body: JSON.stringify(data) }),
    triggerReminder: (data: any) =>
      apiRequest('/notifications/trigger-reminder', { method: 'POST', body: JSON.stringify(data) }),
  },
  analytics: {
    getReport: (timeframe?: string) =>
      apiRequest(`/analytics/report${timeframe ? '?timeframe=' + timeframe : ''}`),
  },
};
