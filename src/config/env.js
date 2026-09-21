// Central place for environment/config values.
// No build step, so this is a plain module — override values here per environment,
// or replace with a generated config.local.js that shadows this file at deploy time.
// The browser never talks to a microservice directly — every service base
// URL is same-origin '/api', proxied by bff/server.js to the real service
// (see bff/config.js for the upstream mapping / auth's dedicated routes).

export const config = {
  services: {
    auth: '/api',
  },
  requestTimeoutMs: 8000,
};
