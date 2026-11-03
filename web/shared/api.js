/* api.js — Jeycyl Cakes API Layer */
const API_BASE = 'http://localhost:8080';

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('json') ? res.json() : res.text();
}

/* ── Cakes ── */
export const getCakes    = ()       => apiFetch('/cakes');
export const getCake     = (id)     => apiFetch(`/cakes/${id}`);

/* ── Pricing ── */
export const previewPrice = (items) => apiFetch('/pricing/preview', {
  method: 'POST', body: JSON.stringify({ items }),
});

/* ── Customers ── */
export const createCustomer = (data) => apiFetch('/customers', {
  method: 'POST', body: JSON.stringify(data),
});
export const getCustomer = (id) => apiFetch(`/customers/${id}`);
export const getCustomerOrders = (customerId) => apiFetch(`/customers/${customerId}/orders`);

/* ── Orders ── */
export const placeOrder = (data) => apiFetch('/orders', {
  method: 'POST', body: JSON.stringify(data),
});
export const getOrder = (id) => apiFetch(`/orders/${id}`);

/* ── Payments ── */
export const recordPayment   = (data) => apiFetch('/payments', {
  method: 'POST', body: JSON.stringify(data),
});
export const getOrderPayments = (orderId) => apiFetch(`/orders/${orderId}/payments`);

/* ── Auth ── */
export const login  = (username, password) => apiFetch('/auth/login', {
  method: 'POST', body: JSON.stringify({ username, password }),
});
export const logout = () => apiFetch('/auth/logout', { method: 'POST' });

/* ── Admin ── */
export const adminListOrders = () => apiFetch('/admin/orders');
export const adminCreateCake = (data) => apiFetch('/admin/cakes', {
  method: 'POST', body: JSON.stringify(data),
});
export const adminSetAvailability = (id, available) =>
  apiFetch(`/admin/cakes/${id}`, {
    method: 'PATCH', body: JSON.stringify({ available }),
  });
export const adminUpdateStatus = (id, status) =>
  apiFetch(`/admin/orders/${id}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  });
export const adminUploadImage = (cakeId, file) => {
  const fd = new FormData();
  fd.append('image', file);
  return apiFetch(`/admin/cakes/${cakeId}/image`, {
    method: 'POST',
    headers: {},   // let browser set multipart boundary
    body: fd,
    credentials: 'include',
  });
};
export const adminListCustomers = () => apiFetch('/admin/customers');

export default { getCakes, getCake, previewPrice, createCustomer, getCustomer,
  getCustomerOrders, placeOrder, getOrder, recordPayment, getOrderPayments,
  login, logout, adminListOrders, adminCreateCake, adminSetAvailability,
  adminUpdateStatus, adminUploadImage, adminListCustomers };
