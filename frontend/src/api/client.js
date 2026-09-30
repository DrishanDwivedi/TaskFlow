// TaskFlow API Client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const getAuthToken = () => localStorage.getItem('taskflow_token');
export const setAuthToken = (token) => localStorage.setItem('taskflow_token', token);
export const removeAuthToken = () => localStorage.removeItem('taskflow_token');

export const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401 || response.status === 403) {
    // Token expired or invalid
    removeAuthToken();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'An unexpected error occurred');
    error.status = response.status;
    throw error;
  }

  return data;
};

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => request('/auth/me'),

  // Tasks
  getTasks: (statusFilter, priorityFilter) => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
    if (priorityFilter && priorityFilter !== 'All') params.append('priority', priorityFilter);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/tasks${queryString}`);
  },
  createTask: (taskData) => request('/tasks', { method: 'POST', body: JSON.stringify(taskData) }),
  updateTask: (id, taskData) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(taskData) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
