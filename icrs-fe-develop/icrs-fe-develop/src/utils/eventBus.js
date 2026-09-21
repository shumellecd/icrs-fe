// Minimal pub/sub so components/stores can talk without prop drilling.
const target = new EventTarget();

export const eventBus = {
  on(event, handler) {
    const listener = (e) => handler(e.detail);
    target.addEventListener(event, listener);
    return () => target.removeEventListener(event, listener);
  },
  emit(event, detail) {
    target.dispatchEvent(new CustomEvent(event, { detail }));
  },
};
