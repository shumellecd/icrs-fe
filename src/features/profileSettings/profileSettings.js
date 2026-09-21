/**
 * Profile Settings Component
 * Manages the user state, edit capabilities, and save simulation.
 */

export function profileSettings() {
  return {
    // Initial User Data
    user: {
      fullName: 'Ana Reyes',
      email: 'a.reyes@dof.gov.ph',
      role: 'Approver',
      agency: 'Dept. of Finance'
    },
    
    // UI State
    isSaving: false,
    isSaved: false,

    saveChanges() {
      if (this.isSaving) return;
      
      this.isSaving = true;
      
      // Simulate API network request
      setTimeout(() => {
        this.isSaving = false;
        this.isSaved = true;

        // Revert button text/icon back to default after 3 seconds
        setTimeout(() => {
          this.isSaved = false;
        }, 3000);
        
      }, 500); // 500ms fake delay
    }
  };
}

// Auto-registration for Alpine
if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    if (typeof Alpine !== 'undefined') {
      Alpine.data('profileSettings', profileSettings);
    }
  });
}