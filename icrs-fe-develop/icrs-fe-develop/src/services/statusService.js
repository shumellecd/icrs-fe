import { ApiClient } from './apiClient.js';
import { config } from '../config/env.js';

// Example of calling a third-party API through the BFF instead of the
// browser hitting it directly — see bff/server.js's dedicated
// /api/status/github route and bff/config.js's externalApis entry.
const client = new ApiClient(config.services.status);

export const statusService = {
  githubStatus: () => client.get('/status/github'),
};
