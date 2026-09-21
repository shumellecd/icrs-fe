/**
 * Logout Modal Component for icrs-fe.
 * Manages the display state and logout confirmation action.
 * Exactly matches logOut.html.
 */

export function logoutModal({
  onLogout = null
} = {}) {
  return {
    open: false,

    init() {
      // The component is ready. Window event listeners like 
      // @open-logout.window in the HTML will toggle the 'open' state.
    },

    openModal() {
      this.open = true;
    },

    closeModal() {
      this.open = false;
    },

    confirmLogout() {
      console.log("Logging out user...");
      
      // Execute optional callback if provided
      if (typeof onLogout === 'function') {
        onLogout();
      }
      
      this.closeModal();
    }
  };
}

export const logOut = logoutModal;

// Global Alpine auto-registration fallback for standalone scripts
if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    if (typeof Alpine !== 'undefined') {
      Alpine.data('logoutModal', logoutModal);
      Alpine.data('logOut', logoutModal);
    }
  });
}