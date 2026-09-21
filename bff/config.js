// Maps the first path segment under /api to the microservice that owns it.
// e.g. GET /api/<name>/42  ->  GET http://localhost:<port>/api/<name>/42
// Empty for now — auth is the only real service, and it gets dedicated
// routes below (its paths don't fit this generic shape). Add an entry here
// when a service that does follow /api/<resource> comes online.
export const upstreams = {};

// icrs-auth's routes (/register, /login, /login/verify) are flat — they
// don't follow the /api/<resource> shape the generic proxy assumes — so it
// gets dedicated routes in server.js instead of an `upstreams` entry.
export const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

export const port = process.env.PORT || 1001;
