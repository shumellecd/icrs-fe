import { authStore } from '../stores/authStore.js';
import { uiStore } from '../stores/uiStore.js';
import { navTabs } from '../components/navTabs/navTabs.js';
import { dataTable } from '../components/dataTable/dataTable.js';
import { modal } from '../components/modal/modal.js';
import { goccCard } from '../features/goccCard/goccCard.js';
import { openSeason } from '../features/openSeason/openSeason.js';
import { viewEncoding, viewEditor } from '../features/viewEncoding/viewEncoding.js';
import { logoutModal, logOut } from '../features/logOut/logOut.js';
import { profileSettings } from '../features/profileSettings/profileSettings.js';
import { addEditUser, addEditUserModal } from '../features/addEditUser/addEditUser.js';

// Alpine (loaded via CDN as a global) fires 'alpine:init' right before it
// scans the DOM. Register every store/component here — this is the single
// place that wires the app together, so nothing is scattered across pages.
// Every page loads this same app.js, so a component only needs to be
// registered once here to be usable from any page.
document.addEventListener('alpine:init', () => {
  Alpine.store('auth', authStore);
  Alpine.store('ui', uiStore);

  Alpine.data('navTabs', navTabs);
  Alpine.data('dataTable', dataTable);
  Alpine.data('modal', modal);
  Alpine.data('goccCard', goccCard);
  Alpine.data('openSeason', openSeason);
  Alpine.data('reopenSeasonComponent', openSeason);
  Alpine.data('viewEncoding', viewEncoding);
  Alpine.data('viewEditor', viewEditor);
  Alpine.data('logoutModal', logoutModal);
  Alpine.data('logOut', logOut);
  Alpine.data('profileSettings', profileSettings);
  Alpine.data('addEditUser', addEditUser);
  Alpine.data('addEditUserModal', addEditUserModal);
});





