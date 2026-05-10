import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Подставляем токен в каждый запрос
api.interceptors.request.use(config => {
  const raw = localStorage.getItem('dalamart_auth');
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

// 401 → сбросить auth и редиректнуть на /login
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dalamart_auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post('/api/auth/register', { name, email, password }).then(r => r.data),

  registerFarmer: (data: { name: string; email: string; password: string; region?: string; phone?: string; description?: string }) =>
    api.post('/api/auth/register/farmer', data).then(r => r.data),

  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }).then(r => r.data),

  telegramWidget: (data: Record<string, unknown>) =>
    api.post('/api/auth/telegram-widget', data).then(r => r.data),

  getVerifyCode: () =>
    api.get('/api/auth/verify-code').then(r => r.data),

  getMe: () =>
    api.get('/api/users/me').then(r => r.data),

  updateMe: (body: { residentialComplexId?: number; phoneNumber?: string }) =>
    api.put('/api/users/me', body).then(r => r.data),
};

// ── Lots ──────────────────────────────────────────────────────────────────

export const lotsApi = {
  getAll: (complexId?: number) =>
    api.get('/api/lots', { params: complexId ? { complexId } : {} }).then(r => r.data),

  getById: (id: number) =>
    api.get(`/api/lots/${id}`).then(r => r.data),

  getMy: () =>
    api.get('/api/lots/my').then(r => r.data),

  create: (data: unknown) =>
    api.post('/api/lots', data).then(r => r.data),

  confirm: (id: number) =>
    api.put(`/api/lots/${id}/confirm`).then(r => r.data),

  cancel: (id: number) =>
    api.put(`/api/lots/${id}/cancel`).then(r => r.data),

  deliver: (id: number) =>
    api.put(`/api/lots/${id}/deliver`).then(r => r.data),
};

// ── Bookings ──────────────────────────────────────────────────────────────

export const bookingsApi = {
  create: (lotId: number, quantityKg: number) =>
    api.post('/api/bookings', { lotId, quantityKg }).then(r => r.data),

  getMy: () =>
    api.get('/api/bookings/my').then(r => r.data),

  getMyActive: () =>
    api.get('/api/bookings/my/active').then(r => r.data),

  cancel: (id: number, reason?: string) =>
    api.delete(`/api/bookings/${id}`, { data: { reason } }).then(r => r.data),

  getLotParticipants: (lotId: number) =>
    api.get(`/api/bookings/lot/${lotId}`).then(r => r.data),

  completeBooking: (id: number) =>
    api.post(`/api/bookings/${id}/complete`).then(r => r.data),

  markNoShow: (id: number) =>
    api.post(`/api/bookings/${id}/no-show`).then(r => r.data),
};

// ── Complexes ─────────────────────────────────────────────────────────────

export const complexesApi = {
  getAll: () =>
    api.get('/api/complexes').then(r => r.data),
};

// ── Admin ─────────────────────────────────────────────────────────────────

export const adminApi = {
  getStats: () =>
    api.get('/api/admin/stats').then(r => r.data),

  getFarmers: () =>
    api.get('/api/admin/farmers').then(r => r.data),

  createFarmer: (data: unknown) =>
    api.post('/api/admin/farmers', data).then(r => r.data),

  updateFarmer: (id: number, data: unknown) =>
    api.put(`/api/admin/farmers/${id}`, data).then(r => r.data),

  blockFarmer: (id: number) =>
    api.post(`/api/admin/farmers/${id}/block`).then(r => r.data),

  unblockFarmer: (id: number) =>
    api.post(`/api/admin/farmers/${id}/unblock`).then(r => r.data),

  getUsers: () =>
    api.get('/api/admin/users').then(r => r.data),

  blockUser: (id: number) =>
    api.post(`/api/admin/users/${id}/block`).then(r => r.data),

  unblockUser: (id: number) =>
    api.post(`/api/admin/users/${id}/unblock`).then(r => r.data),

  getAllLots: () =>
    api.get('/api/admin/lots').then(r => r.data),

  cancelLot: (id: number) =>
    api.put(`/api/admin/lots/${id}/cancel`).then(r => r.data),

  getComplexes: () =>
    api.get('/api/admin/complexes').then(r => r.data),

  createComplex: (data: unknown) =>
    api.post('/api/admin/complexes', data).then(r => r.data),
};
