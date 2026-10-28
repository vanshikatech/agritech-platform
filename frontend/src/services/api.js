import axios from 'axios';

// All modules use the same API base and expose backend failures to the UI.
// Sample records belong in the explicitly invoked database seeder, never in API fallbacks.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const AuthAPI = {
  getProfile: async () => (await axios.get(`${API_BASE}/auth/profile`)).data.data,
  updateProfile: async (data) => (await axios.put(`${API_BASE}/auth/profile`, data)).data.data,
};

export const FarmAPI = {
  getAll: async () => (await axios.get(`${API_BASE}/farms`)).data.data,
  create: async (data) => (await axios.post(`${API_BASE}/farms`, data)).data.data,
  delete: async (id) => (await axios.delete(`${API_BASE}/farms/${id}`)).data,
};

export const CropAPI = {
  getAll: async (farmId) => (await axios.get(`${API_BASE}/crops`, { params: farmId ? { farmId } : {} })).data.data,
  create: async (data) => (await axios.post(`${API_BASE}/crops`, data)).data.data,
  update: async (id, data) => (await axios.put(`${API_BASE}/crops/${id}`, data)).data.data,
  delete: async (id) => (await axios.delete(`${API_BASE}/crops/${id}`)).data,
};

export const SoilAPI = {
  getAll: async () => (await axios.get(`${API_BASE}/soil`)).data.data,
  create: async (data) => (await axios.post(`${API_BASE}/soil`, data)).data.data,
  update: async (id, data) => (await axios.put(`${API_BASE}/soil/${id}`, data)).data.data,
  delete: async (id) => (await axios.delete(`${API_BASE}/soil/${id}`)).data,
  analyzePreview: async (data) => (await axios.post(`${API_BASE}/soil/analyze`, data)).data.data,
};

export const WeatherAPI = {
  getForecast: async (district = 'Pune') => (await axios.get(`${API_BASE}/weather/forecast`, { params: { district } })).data.data,
  getPestAlerts: async () => (await axios.get(`${API_BASE}/weather/pest-alerts`)).data.data,
  createPestAlert: async (data) => (await axios.post(`${API_BASE}/weather/pest-alerts`, data)).data.data,
};

export const MarketAPI = {
  getProducts: async (category = '') => (await axios.get(`${API_BASE}/resources/products`, { params: category ? { category } : {} })).data.data,
  getAdminProducts: async () => (await axios.get(`${API_BASE}/resources/admin/catalog`)).data.data,
  createProduct: async (data) => (await axios.post(`${API_BASE}/resources/products`, data)).data.data,
  updateProduct: async (id, data) => (await axios.put(`${API_BASE}/resources/products/${id}`, data)).data.data,
  deleteProduct: async (id) => (await axios.delete(`${API_BASE}/resources/products/${id}`)).data,
  createOrder: async (orderData) => (await axios.post(`${API_BASE}/orders`, orderData)).data.data,
  getMyOrders: async () => (await axios.get(`${API_BASE}/orders/my-orders`)).data.data,
  getAllOrders: async () => (await axios.get(`${API_BASE}/orders/all`)).data.data,
  updateOrderStatus: async (id, orderStatus) => (await axios.put(`${API_BASE}/orders/${id}/status`, { orderStatus })).data.data,
};

export const ForumAPI = {
  getPosts: async (category = '', search = '') => (await axios.get(`${API_BASE}/forum`, { params: { category, search } })).data.data,
  createPost: async (data) => (await axios.post(`${API_BASE}/forum`, data)).data.data,
  addReply: async (postId, comment) => (await axios.post(`${API_BASE}/forum/${postId}/reply`, { comment })).data.data,
  upvotePost: async (postId) => (await axios.put(`${API_BASE}/forum/${postId}/upvote`)).data.data,
  updatePost: async (id, data) => (await axios.put(`${API_BASE}/forum/${id}`, data)).data.data,
  deletePost: async (id) => (await axios.delete(`${API_BASE}/forum/${id}`)).data,
  reportPost: async (id, reason) => (await axios.post(`${API_BASE}/forum/${id}/report`, { reason })).data,
};

export const AdminAPI = {
  getMetrics: async () => (await axios.get(`${API_BASE}/admin/metrics`)).data.data,
  getUsers: async () => (await axios.get(`${API_BASE}/admin/users`)).data.data,
  updateUserRole: async (id, role) => (await axios.patch(`${API_BASE}/admin/users/${id}/role`, { role })).data.data,
  getActivity: async (page = 1) => (await axios.get(`${API_BASE}/admin/activity`, { params: { page } })).data,
  getForumReports: async () => (await axios.get(`${API_BASE}/admin/forum/reports`)).data.data,
  moderateForumPost: async (id, moderationStatus) => (await axios.patch(`${API_BASE}/admin/forum/${id}/moderation`, { moderationStatus })).data.data,
};
