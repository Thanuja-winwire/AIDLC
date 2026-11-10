import axios from 'axios';

const TOKEN_KEY = 'shop_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

const api = axios.create({ baseURL: '/api/v1' });

api.interceptors.request.use((config) => {
  const t = tokenStore.get();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.startsWith('/auth/login') && !url.startsWith('/auth/register')) {
      onUnauthorized();
    }
    return Promise.reject(err);
  }
);

/** Convert an axios error into { message, fields } for UI display. */
export function parseError(err) {
  const data = err.response?.data;
  if (!err.response) return { message: 'Network error. Is the server running?', fields: {} };
  if (Array.isArray(data?.detail)) {
    const fields = {};
    data.detail.forEach((d) => {
      const key = d.loc[d.loc.length - 1];
      fields[key] = (d.msg || '').replace(/^Value error, /, '');
    });
    return { message: 'Please correct the highlighted fields.', fields };
  }
  return { message: data?.detail || 'Something went wrong.', fields: {} };
}

export const authApi = {
  login: (b) => api.post('/auth/login', b).then((r) => r.data),
  register: (b) => api.post('/auth/register', b).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  update: (b) => api.put('/auth/me', b).then((r) => r.data),
};
export const productsApi = {
  list: (params) => api.get('/products', { params }).then((r) => r.data),
  get: (id) => api.get(`/products/${id}`).then((r) => r.data),
  categories: () => api.get('/categories').then((r) => r.data),
};
export const cartApi = {
  get: () => api.get('/cart').then((r) => r.data),
  add: (product_id, quantity) => api.post('/cart/items', { product_id, quantity }).then((r) => r.data),
  update: (id, quantity) => api.put(`/cart/items/${id}`, { quantity }).then((r) => r.data),
  remove: (id) => api.delete(`/cart/items/${id}`).then((r) => r.data),
  clear: () => api.delete('/cart').then((r) => r.data),
};
export const ordersApi = {
  checkout: (b) => api.post('/orders', b).then((r) => r.data),
  list: (params) => api.get('/orders', { params }).then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  cancel: (id) => api.post(`/orders/${id}/cancel`).then((r) => r.data),
  pay: (id, card) => api.post(`/orders/${id}/pay`, { card }).then((r) => r.data),
};
export const adminApi = {
  metrics: () => api.get('/admin/metrics').then((r) => r.data),
  products: (params) => api.get('/admin/products', { params }).then((r) => r.data),
  createProduct: (b) => api.post('/admin/products', b).then((r) => r.data),
  updateProduct: (id, b) => api.put(`/admin/products/${id}`, b).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  users: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  updateUser: (id, b) => api.put(`/admin/users/${id}`, b).then((r) => r.data),
  orders: (params) => api.get('/admin/orders', { params }).then((r) => r.data),
  order: (id) => api.get(`/admin/orders/${id}`).then((r) => r.data),
  setStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
};
