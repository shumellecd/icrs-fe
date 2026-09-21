import { ApiClient } from './apiClient.js';
import { config } from '../config/env.js';
import { authStore } from '../stores/authStore.js';

const client = new ApiClient(config.services.users, {
  getToken: () => authStore.token,
});

export const userService = {
  list: () => client.get('/users'),
  get: (id) => client.get(`/users/${id}`),
  create: (payload) => client.post('/users', payload),
  update: (id, payload) => client.put(`/users/${id}`, payload),
  remove: (id) => client.delete(`/users/${id}`),
};
