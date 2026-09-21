// Registered on Alpine as $store.auth. Services read the token from here so
// every microservice client shares one auth source instead of duplicating it.
export const authStore = {
  token: localStorage.getItem('auth_token'),
  user: null,

  get isAuthenticated() {
    return Boolean(this.token);
  },

  login(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
  },

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
  },
};
