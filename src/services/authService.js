import { ApiClient } from './apiClient.js';
import { config } from '../config/env.js';

// icrs-auth's routes (/register, /login, /login/verify) don't share the
// /api/<resource> shape other services use — see bff/server.js's dedicated
// /api/auth/* routes and bff/config.js's authServiceUrl.
const client = new ApiClient(config.services.auth);

export const authService = {
  register: (payload) => client.post('/auth/register', payload),
  requestLogin: (workEmail) => client.post('/auth/login', { workEmail }),
  verifyLogin: (token) => client.get(`/auth/login/verify?token=${encodeURIComponent(token)}`),
};
