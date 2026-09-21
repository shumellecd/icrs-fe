/**
 * Add and Edit GOCC Card Component Library for icrs-fe.
 * Manages form state, validation, and submission for creating and editing GOCC entities.
 * Pure ES Module adhering to GCG ICRS standards.
 */

export function goccCard({
  initialData = null,
  onSubmit = null,
  onCancel = null,
} = {}) {
  return {
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    id: null,

    // Form fields
    name: '',
    code: '',
    sector: '',
    governmentAgency: '',
    status: 'Active',

    // Validation & State
    errors: {},
    isSubmitting: false,

    init() {
      if (initialData) {
        this.openEdit(initialData);
      }
    },

    // 1. Open for Adding new GOCC
    openAdd() {
      this.mode = 'add';
      this.id = null;
      this.name = '';
      this.code = '';
      this.sector = '';
      this.governmentAgency = '';
      this.status = 'Active';
      this.errors = {};
      this.isOpen = true;
    },

    // 2. Open for Editing existing GOCC
    openEdit(gocc = {}) {
      this.mode = 'edit';
      this.id = gocc?.id ?? null;
      this.name = gocc?.name ?? '';
      this.code = gocc?.code ?? '';
      this.sector = gocc?.sector ?? '';
      this.governmentAgency = gocc?.governmentAgency ?? gocc?.agency ?? '';
      this.status = gocc?.status ?? 'Active';
      this.errors = {};
      this.isOpen = true;
    },

    // 3. Close / Dismiss
    close() {
      this.isOpen = false;
      this.errors = {};
      onCancel?.();
    },

    // 4. Form Validation
    validate() {
      const errs = {};

      if (!this.name?.trim()) {
        errs.name = 'GOCC Name is required.';
      }

      if (!this.code?.trim()) {
        errs.code = 'GOCC Code / Acronym is required.';
      }

      if (!this.sector?.trim()) {
        errs.sector = 'Sector is required.';
      }

      if (!this.governmentAgency?.trim()) {
        errs.governmentAgency = 'Oversight Government Agency is required.';
      }

      this.errors = errs;
      return Object.keys(errs).length === 0;
    },

    // 5. Submit Action
    async submit() {
      if (!this.validate()) return;

      this.isSubmitting = true;
      const payload = {
        id: this.id,
        name: this.name?.trim(),
        code: this.code?.trim()?.toUpperCase(),
        sector: this.sector,
        governmentAgency: this.governmentAgency,
        status: this.status,
      };

      try {
        await onSubmit?.(payload, this.mode);
        this.isOpen = false;
      } catch (err) {
        this.errors.submit = err?.message || 'An error occurred while saving.';
      } finally {
        this.isSubmitting = false;
      }
    },
  };
}
