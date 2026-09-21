/**
 * View / Editor Encoding Modal Component for icrs-fe.
 * Manages modal display, text content state, toolbar operations, and download/submit actions.
 * Exactly matches the design and behavior of button-view.html.
 */

export function viewEncoding({
  description = "A one-page overview, usually made by the Chair, reflecting upon the significant achievements or events for GOCC in the previous year; and summarising the GOCC's strategic intent over the life of the plan.",
  initialContent = "",
  placeholder = "Write the opening statement here...",
  onSubmit = null,
  onDownloadExcel = null,
  onDownloadPdf = null,
} = {}) {
  return {
    content: initialContent,
    descriptionText: description,
    placeholderText: placeholder,
    modalInstance: null,
    statusMessage: '',

    init() {
      // Initialize Bootstrap 5 Modal instance if present in DOM
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modalEl = document.getElementById('viewEditorModal');
        if (modalEl) {
          this.modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        }
      }
    },

    openModal(data = null) {
      if (data) {
        if (typeof data === 'string') {
          this.content = data;
        } else if (typeof data === 'object') {
          if (data.content !== undefined) this.content = data.content;
          if (data.description !== undefined) this.descriptionText = data.description;
        }
      }
      this.statusMessage = '';
      if (this.modalInstance) {
        this.modalInstance.show();
      }
    },

    closeModal() {
      if (this.modalInstance) {
        this.modalInstance.hide();
      }
    },

    // --- Toolbar Actions ---
    applyFormat(tag) {
      const textarea = document.getElementById('editorContentArea') || document.querySelector('.view-editor-textarea');
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = this.content.substring(start, end);

      if (tag === 'b') {
        this.content = this.content.substring(0, start) + `**${selected || 'bold text'}**` + this.content.substring(end);
      } else if (tag === 'i') {
        this.content = this.content.substring(0, start) + `*${selected || 'italic text'}*` + this.content.substring(end);
      } else if (tag === 'u') {
        this.content = this.content.substring(0, start) + `_${selected || 'underlined text'}_` + this.content.substring(end);
      }
    },

    // --- Footer Actions ---
    downloadExcel() {
      if (typeof onDownloadExcel === 'function') {
        onDownloadExcel(this.content);
      } else {
        this.statusMessage = 'Excel export initiated.';
      }
    },

    downloadPdf() {
      if (typeof onDownloadPdf === 'function') {
        onDownloadPdf(this.content);
      } else {
        this.statusMessage = 'PDF export initiated.';
      }
    },

    submitEditor() {
      if (typeof onSubmit === 'function') {
        onSubmit(this.content.trim());
      }
      this.closeModal();
    }
  };
}

// Global Alpine auto-registration fallback
export const viewEditor = viewEncoding;

if (typeof document !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    if (typeof Alpine !== 'undefined') {
      Alpine.data('viewEncoding', viewEncoding);
      Alpine.data('viewEditor', viewEncoding);
    }
  });
}