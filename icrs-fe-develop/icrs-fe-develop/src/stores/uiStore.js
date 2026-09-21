// Registered on Alpine as $store.ui. Cross-cutting UI state (loading, toasts)
// that any component can read/write without prop drilling.
export const uiStore = {
  loading: false,
  toasts: [],

  pushToast(message, type = 'info') {
    const id = crypto.randomUUID();
    this.toasts.push({ id, message, type });
    setTimeout(() => this.dismissToast(id), 4000);
  },

  dismissToast(id) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  },
};
