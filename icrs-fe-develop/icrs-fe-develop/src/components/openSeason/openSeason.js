/**
 * Open / Re-Open Season Modal Component Library for icrs-fe.
 * Manages modal display, justification reason state, submission, and confirmation flow.
 */

export function openSeason({ // default data only
  reference = '1st Quarter',
  year = '2025',
  startingDate = '02 Apr 2025',
  endingDate = '02 May 2025',
  currentStatus = 'Closed',
  newStatus = 'On-Going',
  onReopen = null,
} = {}) {
  return {
    reason: '',
    error: '',
    isSubmitting: false,
    reopenModalInstance: null,
    successModalInstance: null,

    // Active Season data aligned with button-season.html
    activeSeason: {
      reference,
      year,
      startingDate,
      endingDate,
      currentStatus,
      newStatus,
    },

    init() {
      // Initialize Bootstrap 5 Modal instances if present in DOM
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const reopenEl = document.getElementById('reopenSeasonModal');
        const successEl = document.getElementById('reopenSuccessModal');

        if (reopenEl) {
          this.reopenModalInstance = bootstrap.Modal.getOrCreateInstance(reopenEl);
        }
        if (successEl) {
          this.successModalInstance = bootstrap.Modal.getOrCreateInstance(successEl);
        }
      }
    },

    openReopenModal(season = null) {
      if (season) {
        this.activeSeason = { ...this.activeSeason, ...season };
      }
      this.reason = '';
      this.error = '';

      if (this.reopenModalInstance) {
        this.reopenModalInstance.show();
      }
    },

    submitReopen() {
      if (this.reopenModalInstance) {
        this.reopenModalInstance.hide();
      }
      if (this.successModalInstance) {
        this.successModalInstance.show();
      }

      if (typeof onReopen === 'function') {
        onReopen({
          season: { ...this.activeSeason },
          reason: this.reason.trim(),
          reopenedAt: new Date().toISOString(),
        });
      }
    },

    closeSuccessModal() {
      if (this.successModalInstance) {
        this.successModalInstance.hide();
      }
    },
  };
}

// Global Alpine auto-registration fallback for standalone scripts
if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    if (typeof Alpine !== 'undefined') {
      Alpine.data('openSeason', openSeason);
      Alpine.data('reopenSeasonComponent', openSeason);
    }
  });
}