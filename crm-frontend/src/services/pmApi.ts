import axios from 'axios';

const pmApi = axios.create({
  baseURL: '/pm-api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

pmApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

pmApi.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const projectsApi = {
  getAll: (params?: any) => pmApi.get('/pm/projects', { params }),
  getOne: (id: string) => pmApi.get(`/pm/projects/${id}`),
  create: (data: any) => pmApi.post('/pm/projects', data),
  update: (id: string, data: any) => pmApi.put(`/pm/projects/${id}`, data),
  delete: (id: string) => pmApi.delete(`/pm/projects/${id}`),
};

export const stagesApi = {
  getAll: (projectId: string) => pmApi.get('/pm/stages', { params: { projectId } }),
  create: (data: any) => pmApi.post('/pm/stages', data),
  update: (id: string, data: any) => pmApi.put(`/pm/stages/${id}`, data),
  delete: (id: string) => pmApi.delete(`/pm/stages/${id}`),
  reorder: (stages: any[]) => pmApi.post('/pm/stages/reorder', { stages }),
};

export const tasksApi = {
  getAll: (params?: any) => pmApi.get('/pm/tasks', { params }),
  getOne: (id: string) => pmApi.get(`/pm/tasks/${id}`),
  create: (data: any) => pmApi.post('/pm/tasks', data),
  update: (id: string, data: any) => pmApi.put(`/pm/tasks/${id}`, data),
  delete: (id: string) => pmApi.delete(`/pm/tasks/${id}`),
};

export const resourcesApi = {
  getAll: (projectId: string) => pmApi.get('/pm/resources', { params: { projectId } }),
  create: (data: any) => pmApi.post('/pm/resources', data),
  update: (id: string, data: any) => pmApi.put(`/pm/resources/${id}`, data),
  delete: (id: string) => pmApi.delete(`/pm/resources/${id}`),
};

export const milestonesApi = {
  getAll: (projectId: string) => pmApi.get('/pm/milestones', { params: { projectId } }),
  create: (data: any) => pmApi.post('/pm/milestones', data),
  update: (id: string, data: any) => pmApi.put(`/pm/milestones/${id}`, data),
  delete: (id: string) => pmApi.delete(`/pm/milestones/${id}`),
};

export const budgetApi = {
  getAll: (projectId: string) => pmApi.get('/pm/budget', { params: { projectId } }),
  getSummary: (projectId: string) => pmApi.get(`/pm/budget/summary/${projectId}`),
  create: (data: any) => pmApi.post('/pm/budget', data),
  delete: (id: string) => pmApi.delete(`/pm/budget/${id}`),
};

export const changeRequestsApi = {
  getAll: (projectId: string) => pmApi.get('/pm/change-requests', { params: { projectId } }),
  create: (data: any) => pmApi.post('/pm/change-requests', data),
  update: (id: string, data: any) => pmApi.put(`/pm/change-requests/${id}`, data),
  delete: (id: string) => pmApi.delete(`/pm/change-requests/${id}`),
};

export const risksApi = {
  getAll: (projectId: string) => pmApi.get('/pm/risks', { params: { projectId } }),
  create: (data: any) => pmApi.post('/pm/risks', data),
  update: (id: string, data: any) => pmApi.put(`/pm/risks/${id}`, data),
  delete: (id: string) => pmApi.delete(`/pm/risks/${id}`),
};

export const meetingsApi = {
  getAll: (projectId: string) => pmApi.get('/pm/meetings', { params: { projectId } }),
  create: (data: any) => pmApi.post('/pm/meetings', data),
  update: (id: string, data: any) => pmApi.put(`/pm/meetings/${id}`, data),
  delete: (id: string) => pmApi.delete(`/pm/meetings/${id}`),
};

export const pmDashboardApi = {
  get: () => pmApi.get('/pm/dashboard'),
};

export const taskDocumentsApi = {
  getAll: (taskId: string) => pmApi.get('/pm/task-documents', { params: { taskId } }),
  delete: (id: string) => pmApi.delete(`/pm/task-documents/${id}`),
};

export const taskCommentsApi = {
  getAll: (taskId: string) => pmApi.get('/pm/task-comments', { params: { taskId } }),
  create: (data: any) => pmApi.post('/pm/task-comments', data),
  delete: (id: string) => pmApi.delete(`/pm/task-comments/${id}`),
};

export default pmApi;
