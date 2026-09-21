export function fileUpload({ accept = 'application/pdf', maxSizeBytes = 5 * 1024 * 1024 } = {}) {
  return {
    accept,
    maxSizeBytes,
    file: null,
    error: null,

    browse() {
      this.$refs.input.click();
    },

    onChange(event) {
      this.setFile(event.target.files && event.target.files[0]);
    },

    onDrop(event) {
      this.setFile(event.dataTransfer.files && event.dataTransfer.files[0]);
    },

    setFile(file) {
      this.$refs.input.value = '';
      if (!file) {
        this.file = null;
        this.error = null;
        return;
      }
      if (this.accept && file.type !== this.accept) {
        this.file = null;
        this.error = 'Only PDF files are allowed.';
        return;
      }
      if (file.size > this.maxSizeBytes) {
        this.file = null;
        this.error = `File exceeds the ${Math.round(this.maxSizeBytes / (1024 * 1024))}MB limit.`;
        return;
      }
      this.file = file;
      this.error = null;
    },

    clear() {
      this.setFile(null);
    },
  };
}
