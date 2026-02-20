import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const code = localStorage.getItem('code');
  if (code) {
    config.headers['X-Activation-Code'] = code;
  }
  return config;
});

api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error || '请求失败';
    return Promise.reject(new Error(message));
  }
);

export const codeApi = {
  verify: (code) => api.post('/api/code/verify', { code })
};

export const calculateApi = {
  calculate: (data) => api.post('/api/calculate', data)
};

export const adminApi = {
  generateCodes: (data, token) => 
    api.post('/api/admin/codes/generate', data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  listCodes: (params, token) => 
    api.get('/api/admin/codes/list', {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }),
  revokeCode: (code, token) => 
    api.post('/api/admin/codes/revoke', { code }, {
      headers: { Authorization: `Bearer ${token}` }
    })
};

export default api;
