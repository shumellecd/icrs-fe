/**
 * Generic Modal/PopUp shell. Unlike the feature-specific modals in
 * src/features/ (add/edit user, GOCC, logout confirm — each with its own
 * open/close state), this one is content-agnostic: give it a unique `name`
 * and it opens/closes itself in response to a matching window event, so any
 * number of independent modals can reuse it on the same page.
 *
 * Usage:
 *   <div x-data="modal({ name: 'example' })" @keydown.escape.window="close()">
 *     <div x-show="open" x-transition.opacity class="modal-gcg-backdrop" @click="close()" style="display:none"></div>
 *     <div x-show="open" class="modal-gcg-dialog" style="display:none">
 *       <div class="modal-gcg-content" @click.outside="close()">
 *         <div class="modal-gcg-header">
 *           <h3 class="modal-gcg-title">Title</h3>
 *           <button class="modal-gcg-close" @click="close()" aria-label="Close">&times;</button>
 *         </div>
 *         <div class="modal-gcg-body">Content goes here.</div>
 *         <div class="modal-gcg-footer">
 *           <button class="btn btn-secondary" @click="close()">Cancel</button>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 *
 *   Open it from anywhere: <button @click="$dispatch('open-modal-example')">Open</button>
 *
 * @param {Object} [options]
 * @param {string} options.name - unique id; the modal listens for `open-modal-<name>`
 */
export function modal({ name } = {}) {
  if (!name) {
    console.warn('modal() requires a unique `name` so it knows which open-modal-<name> event to listen for.');
  }

  return {
    open: false,

    init() {
      if (!name) return;
      window.addEventListener(`open-modal-${name}`, () => this.openModal());
    },

    openModal() {
      this.open = true;
    },

    close() {
      this.open = false;
    },
  };
}
