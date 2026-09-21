/**
 * Add/Edit User Management Modal Component for icrs-fe.
 * Manages form state, validation, edit population, and submission for user accounts.
 * Adheres to GCG E-ICRS standards.
 */

export function addEditUserModal({
  onSubmit = null,
  onDeactivate = null,
} = {}) {
  return {
    isOpen: false,
    isEditMode: false,
    errorMessage: '',
    
    // Base object structure
    user: {
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      agency: '',
      isActive: true
    },

    resetForm() {
      this.errorMessage = '';
      this.user = {
        id: null,
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        agency: '',
        isActive: true
      };
    },

    openForAdd() {
      this.isEditMode = false;
      this.resetForm();
      this.isOpen = true;
    },

    openForEdit(userData) {
      this.isEditMode = true;
      this.errorMessage = '';
      // Populate the form with the passed user data
      this.user = { ...this.user, ...userData };
      this.isOpen = true;
    },

    closeModal() {
      this.isOpen = false;
      this.errorMessage = '';
    },

    getInitials() {
      const f = this.user.firstName ? this.user.firstName.charAt(0).toUpperCase() : '';
      const l = this.user.lastName ? this.user.lastName.charAt(0).toUpperCase() : '';
      return (f + l) || 'U';
    },

    deactivateUser() {
      this.user.isActive = false;
      if (typeof onDeactivate === 'function') {
        onDeactivate(this.user);
      }
      this.submitUser();
    },

    submitUser() {
      // Basic validation
      if (!this.user.firstName?.trim() || !this.user.lastName?.trim() || (!this.user.email?.trim() && !this.isEditMode) || !this.user.role) {
        this.errorMessage = "Please fill out all required fields.";
        return;
      }

      this.errorMessage = '';
      const payload = {
        mode: this.isEditMode ? 'edit' : 'add',
        data: { ...this.user },
        timestamp: new Date().toISOString()
      };

      console.log(`${this.isEditMode ? 'Updating' : 'Creating'} User:`, payload);

      if (typeof onSubmit === 'function') {
        onSubmit(payload);
      }

      this.closeModal();
    }
  };
}

export const addEditUser = addEditUserModal;

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    if (typeof Alpine !== 'undefined') {
      Alpine.data('addEditUserModal', addEditUserModal);
      Alpine.data('addEditUser', addEditUserModal);
    }
  });
}