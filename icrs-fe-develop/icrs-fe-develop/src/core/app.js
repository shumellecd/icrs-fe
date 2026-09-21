import { authStore } from '../stores/authStore.js';
import { uiStore } from '../stores/uiStore.js';
import { counter } from '../components/counter/counter.js';
import { userList } from '../components/userList/userList.js';
import { orderList } from '../components/orderList/orderList.js';
import { githubStatus } from '../components/githubStatus/githubStatus.js';
import { navTabs } from '../components/navTabs/navTabs.js';
import { fileUpload } from '../components/fileUpload/fileUpload.js';
import { dataTable } from '../components/dataTable/dataTable.js';
import { goccCard } from '../components/goccCard/goccCard.js';
import { appHeader } from '../components/appHeader/appHeader.js';
import { openSeason } from '../components/openSeason/openSeason.js';
import { viewEncoding, viewEditor } from '../components/viewEncoding/viewEncoding.js';
import { logoutModal, logOut } from '../components/logOut/logOut.js';
import { profileSettings } from '../components/profileSettings/profileSettings.js';
import { addEditUser, addEditUserModal } from '../components/addEditUser/addEditUser.js';

// Alpine (loaded via CDN as a global) fires 'alpine:init' right before it
// scans the DOM. Register every store/component here — this is the single
// place that wires the app together, so nothing is scattered across pages.
// Every page loads this same app.js, so a component only needs to be
// registered once here to be usable from any page.
document.addEventListener('alpine:init', () => {
  Alpine.store('auth', authStore);
  Alpine.store('ui', uiStore);

  Alpine.data('counter', counter);
  Alpine.data('userList', userList);
  Alpine.data('orderList', orderList);
  Alpine.data('githubStatus', githubStatus);
  Alpine.data('navTabs', navTabs);
  Alpine.data('fileUpload', fileUpload);
  Alpine.data('dataTable', dataTable);
  Alpine.data('goccCard', goccCard);
  Alpine.data('appHeader', appHeader);
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





