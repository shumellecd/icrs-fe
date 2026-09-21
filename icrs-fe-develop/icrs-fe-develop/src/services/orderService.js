import { ApiClient } from './apiClient.js';
import { config } from '../config/env.js';
import { authStore } from '../stores/authStore.js';

// Second example service — shows how a new microservice is wired up:
// one ApiClient instance pointed at its own base URL, same shared auth source.
const client = new ApiClient(config.services.orders, {
  getToken: () => authStore.token,
});

export const orderService = {
  list: () => client.get('/orders'),
  get: (id) => client.get(`/orders/${id}`),
  create: (payload) => client.post('/orders', payload),
};
