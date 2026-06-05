import axios from 'axios';

const BASE_URL = '';

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', res.data.accessToken);
          original.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken?: string) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  setup2FA: () => api.post('/auth/2fa/setup'),
  verify2FA: (code: string) => api.post('/auth/2fa/verify', { code }),
  disable2FA: (code: string) => api.delete('/auth/2fa/disable', { data: { code } }),
};

export const usersApi = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (data: any) => api.post('/users', data),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  toggleStatus: (id: string, isActive: boolean) => api.patch(`/users/${id}/status`, { isActive }),
  resetPassword: (id: string, newPassword: string) => api.patch(`/users/${id}/reset-password`, { newPassword }),
  changePassword: (data: any) => api.patch('/users/me/change-password', data),
  getGroups: () => api.get('/users/groups'),
  createGroup: (data: any) => api.post('/users/groups', data),
  updateGroup: (id: string, data: any) => api.put(`/users/groups/${id}`, data),
  deleteGroup: (id: string) => api.delete(`/users/groups/${id}`),
};

export const permissionsApi = {
  getMyMap: () => api.get('/permissions/my-map'),
  getModules: () => api.get('/permissions/modules'),
  getGrid: (userGroupId: string) => api.get(`/permissions/grid/${userGroupId}`),
  setPermissions: (data: any) => api.post('/permissions/set', data),
  copyPermissions: (data: any) => api.post('/permissions/copy', data),
};

export const mastersApi = {
  getCategories: (module?: string) => api.get('/masters/categories', { params: { module } }),
  getAllWithValues: () => api.get('/masters/all-with-values'),
  getValues: (categoryCode: string) => api.get(`/masters/${categoryCode}/values`),
  getBulkValues: (categoryCodes: string[]) => api.post('/masters/bulk-values', { categoryCodes }),
  createValue: (categoryCode: string, data: any) => api.post(`/masters/${categoryCode}/values`, data),
  updateValue: (valueId: string, data: any) => api.put(`/masters/values/${valueId}`, data),
  deleteValue: (valueId: string) => api.delete(`/masters/values/${valueId}`),
  reorder: (items: any[]) => api.patch('/masters/reorder', { items }),
};

export const tenantsApi = {
  getMyTenant: () => api.get('/tenants/me'),
  updateTenant: (data: any) => api.put('/tenants/me', data),
  updateModules: (modules: string[]) => api.patch('/tenants/me/modules', { modules }),
};

export const documentConfigApi = {
  get: (docType: string) => api.get(`/tenants/document-config/${docType}`),
  save: (docType: string, data: any) => api.put(`/tenants/document-config/${docType}`, data),
};

export const auditApi = {
  getLogs: (params?: any) => api.get('/audit', { params }),
};
