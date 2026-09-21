import { config } from '../config/env.js';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// One instance per microservice. Keeps auth/timeout/error handling in one place
// so adding a new service is just `new ApiClient(config.services.newThing)`.
export class ApiClient {
  constructor(baseURL, { getToken } = {}) {
    this.baseURL = baseURL.replace(/\/$/, '');
    this.getToken = getToken ?? (() => null);
    this.timeoutMs = config.requestTimeoutMs;
  }

  async request(path, { method = 'GET', body, headers = {}, signal } = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    if (signal) signal.addEventListener('abort', () => controller.abort());

    const token = this.getToken();

    try {
      const res = await fetch(`${this.baseURL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json().catch(() => null) : await res.text();

      if (!res.ok) {
        throw new ApiError(`Request to ${path} failed with ${res.status}`, res.status, data);
      }

      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new ApiError(`Request to ${path} timed out`, 0, null);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  get(path, opts) {
    return this.request(path, { ...opts, method: 'GET' });
  }
  post(path, body, opts) {
    return this.request(path, { ...opts, method: 'POST', body });
  }
  put(path, body, opts) {
    return this.request(path, { ...opts, method: 'PUT', body });
  }
  delete(path, opts) {
    return this.request(path, { ...opts, method: 'DELETE' });
  }
}
