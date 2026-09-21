import { authStore } from '../../src/stores/authStore.js';

/**
 * Generates the inner HTML template for AppHeader.
 *
 * @param {Object} [options]
 * @param {string} [options.title]
 * @param {string} [options.subtitle]
 * @param {string} [options.badge]
 * @param {string} [options.logoUrl]
 * @param {boolean} [options.showActions]
 * @param {string} [options.userName]
 * @returns {string} HTML string
 */
export function getAppHeaderHTML({
  title = 'ICRS — Integrated Corporate Reporting System',
  subtitle = 'Governance Commission for GOCCs • Republic of the Philippines',
  badge = '',
  logoUrl = '../../public/GCG-Logo.png',
  showActions = true,
  userName = 'Authorized Officer',
} = {}) {
  const badgeHTML = badge
    ? `<div class="header-divider"></div><span class="header-badge">${badge}</span>`
    : '';

  const actionsHTML = showActions
    ? `
      <div class="header-actions">
        <div class="header-notification" role="button" aria-label="Notifications" title="Notifications">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </div>
        <div class="header-user">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div class="header-welcome">
          <span class="header-welcome-top">Welcome,</span>
          <span class="header-user-name">${userName}</span>
          <a href="javascript:void(0)" class="header-welcome-actions header-logout-btn">Sign Out</a>
        </div>
      </div>
    `
    : '<div class="header-actions header-actions--empty"></div>';

  return `
    <div class="header-brand">
      <img src="${logoUrl}" alt="Governance Commission for GOCCs Official Logo" class="header-logo">
      <div class="header-brand-copy">
        <div class="header-title">${title}</div>
        <div class="header-subtitle">${subtitle}</div>
      </div>
      ${badgeHTML}
    </div>
    ${actionsHTML}
  `;
}

/**
 * AppHeader Component for ICRS.
 * Automatically injects the full header DOM structure and handles auth session state.
 *
 * Usage in HTML:
 *   <header x-data="appHeader()"></header>
 *   <header x-data="appHeader({ showActions: false })"></header>
 *   <header x-data="appHeader({ badge: 'ADMIN' })"></header>
 *
 * @param {Object} [options]
 * @param {string} [options.title='ICRS — Integrated Corporate Reporting System']
 * @param {string} [options.subtitle='Governance Commission for GOCCs • Republic of the Philippines']
 * @param {string} [options.badge='']
 * @param {string} [options.logoUrl='../../public/GCG-Logo.png']
 * @param {boolean} [options.showActions=true]
 */
export function appHeader({
  title = 'ICRS — Integrated Corporate Reporting System',
  subtitle = 'Governance Commission for GOCCs • Republic of the Philippines',
  badge = '',
  logoUrl = '../../public/GCG-Logo.png',
  showActions = true,
} = {}) {
  return {
    title,
    subtitle,
    badge,
    logoUrl,
    showActions,
    hasNotifications: false,

    get user() {
      return authStore.user;
    },

    get isAuthenticated() {
      return authStore.isAuthenticated;
    },

    get userName() {
      return this.user?.name ?? this.user?.email ?? 'Authorized Officer';
    },

    init() {
      // Ensure shared-header base styling class is present on host element
      if (this.$el) {
        if (!this.$el.classList.contains('shared-header')) {
          this.$el.classList.add('shared-header');
        }

        // If the element has no inner HTML or only whitespace, automatically render template
        if (!this.$el.innerHTML.trim() || this.$el.children.length === 0) {
          this.render();
        }
      }
    },

    render() {
      if (!this.$el) return;
      this.$el.innerHTML = getAppHeaderHTML({
        title: this.title,
        subtitle: this.subtitle,
        badge: this.badge,
        logoUrl: this.logoUrl,
        showActions: this.showActions,
        userName: this.userName,
      });

      // Bind logout button click handler
      const logoutBtn = this.$el.querySelector('.header-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.logout();
        });
      }
    },

    logout() {
      authStore.logout();
      window.location.href = '../auth/index.html';
    },
  };
}

/**
 * Programmatic helper to render the AppHeader into any container element.
 *
 * @param {string|HTMLElement} target - CSS selector or DOM Element
 * @param {Object} [options]
 */
export function renderAppHeader(target, options = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return null;

  if (!el.classList.contains('shared-header')) {
    el.classList.add('shared-header');
  }

  const currentUser = authStore.user;
  const userName = currentUser?.name ?? currentUser?.email ?? 'Authorized Officer';

  el.innerHTML = getAppHeaderHTML({
    userName,
    ...options,
  });

  const logoutBtn = el.querySelector('.header-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      authStore.logout();
      window.location.href = '../auth/index.html';
    });
  }

  return el;
}
