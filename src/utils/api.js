// =============================================================================
// src/utils/api.js — Centralized API helpers
// =============================================================================

const BASE = '/api';

async function request(path, options = {}) {
  // Attach stored session token for RBAC permission checks
  const session = (() => { try { return JSON.parse(localStorage.getItem('doca_session')); } catch { return null; } })();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (session?.token) headers['x-auth-token'] = session.token;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  login:            (username, password) => request('/auth/login',           { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout:           ()                   => request('/auth/logout',          { method: 'POST' }),
  getUsers:         ()                   => request('/auth/users'),
  register:         (body)               => request('/auth/register',        { method: 'POST', body: JSON.stringify(body) }),
  sendOtp:          (phone, purpose, aadhaar) => request('/auth/send-otp',   { method: 'POST', body: JSON.stringify({ phone, purpose, aadhaar }) }),
  verifyOtp:        (phone, otp, purpose)     => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp, purpose }) }),
  forgotPassword:   (aadhaar, phone)          => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ aadhaar, phone }) }),
  resetPassword:    (aadhaar, phone, otp, newPassword) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ aadhaar, phone, otp, newPassword }) }),

  // Slots
  getSlots:         ()           => request('/slots'),
  getSlot:          (id)         => request(`/slots/${id}`),
  bookSlot:         (body)       => request('/slots', { method: 'POST', body: JSON.stringify(body) }),
  bookIvr:          (body)       => request('/slots/ivr', { method: 'POST', body: JSON.stringify(body) }),
  updateQueue:      (id, status) => request(`/slots/${id}/queue`,   { method: 'PATCH', body: JSON.stringify({ queue_status: status }) }),
  updatePayment:    (id, status) => request(`/slots/${id}/payment`, { method: 'PATCH', body: JSON.stringify({ payment_status: status }) }),

  // Admin
  getRawDb:         ()           => request('/admin/raw-db'),
  getStats:         ()           => request('/admin/stats'),
  getServingToken:  ()           => request('/serving-token'),

  // Chatbot
  chat:             (message, language) => request('/chatbot', { method: 'POST', body: JSON.stringify({ message, language }) }),

  // SMS
  getSmsLog:        ()           => request('/sms-log'),
};

