// Maps the first path segment under /api to the microservice that owns it.
// e.g. GET /api/users/42  ->  GET http://localhost:1002/api/users/42
export const upstreams = {
  users: process.env.USERS_SERVICE_URL || 'http://localhost:1002',
  orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:1003',
};

// Third-party APIs the BFF calls on the frontend's behalf, given their own
// explicit routes (server.js) instead of the generic resource-name proxy —
// their path shape doesn't follow the /api/<resource> convention, and the
// real host/URL should never be visible to the browser.
export const externalApis = {
  githubStatus: 'https://isitdownstatus.com/api/v1/status/github',
};

export const port = process.env.PORT || 1001;
