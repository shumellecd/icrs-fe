/**
 * Search, Filter & Sort Request Component Library for icrs-fe.
 * Manages UI search, filter, and sort state and generates backend query strings.
 * Pure ES Module adhering to GCG ICRS standards.
 */

/**
 * Builds a URL query string for backend API search, filter, and sort requests.
 *
 * @param {Object} [params]
 * @param {string} [params.search] - Search text query
 * @param {Record<string, any>} [params.filters] - Key-value filter parameters (e.g. { year: 2023, agency: 'DOF', status: 'Submitted' })
 * @param {string} [params.sortBy] - Column field name to sort by
 * @param {'asc'|'desc'} [params.sortOrder='asc'] - Sort direction
 * @returns {string} Sanitized query string (e.g. "?search=test&agency=DOF&sortBy=name&sortOrder=asc")
 */
export function buildQueryParams({
  search = '',
  filters = {},
  sortBy = '',
  sortOrder = 'asc',
} = {}) {
  const query = new URLSearchParams();

  if (search && typeof search === 'string' && search.trim()) {
    query.set('search', search.trim());
  }

  if (filters && typeof filters === 'object') {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.set(key, String(value));
      }
    });
  }

  if (sortBy) {
    query.set('sortBy', sortBy);
    query.set('sortOrder', sortOrder === 'desc' ? 'desc' : 'asc');
  }

  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Debounces a function to prevent excessive API requests while typing in search inputs.
 *
 * @param {Function} func - Callback function to debounce
 * @param {number} [waitMs=300] - Delay in milliseconds
 * @returns {(...args: any[]) => void}
 */
export function debounce(func, waitMs = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), waitMs);
  };
}

/**
 * Alpine.js Search, Filter & Sort Component.
 * Manages search input, dropdown filter selections, and table column sort toggling.
 *
 * @param {Object} [options]
 * @param {Record<string, any>} [options.filters={}] - Initial filter values
 * @param {string} [options.search=''] - Initial search text
 * @param {string} [options.sortBy=''] - Initial sort column
 * @param {'asc'|'desc'} [options.sortOrder='asc'] - Initial sort direction
 * @param {Function} [options.onChange] - Callback invoked with the updated query string whenever state changes
 */
export function dataTable({
  filters = {},
  search = '',
  sortBy = '',
  sortOrder = 'asc',
  onChange = null,
} = {}) {
  return {
    search,
    filters: { ...filters },
    sortBy,
    sortOrder,

    init() {
      this.debouncedNotify = debounce(() => {
        this.notify();
      }, 300);
    },

    // 1. Filter Methods
    setFilter(key, value) {
      this.filters[key] = value;
      this.notify();
    },

    getFilter(key, defaultValue = 'all') {
      return this.filters[key] ?? defaultValue;
    },

    resetFilters() {
      this.filters = { ...filters };
      this.search = '';
      this.notify();
    },

    // 2. Search Methods
    setSearch(val) {
      this.search = val;
      this.debouncedNotify();
    },

    clearSearch() {
      this.search = '';
      this.notify();
    },

    // 3. Table Column Sorting Methods
    toggleSort(column) {
      if (this.sortBy === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = column;
        this.sortOrder = 'asc';
      }
      this.notify();
    },

    getSortIcon(column) {
      if (this.sortBy !== column) {
        return 'bi-arrow-down-up opacity-25';
      }
      return this.sortOrder === 'asc' ? 'bi-sort-alpha-down text-primary' : 'bi-sort-alpha-up-alt text-primary';
    },

    getAriaSort(column) {
      if (this.sortBy !== column) return 'none';
      return this.sortOrder === 'asc' ? 'ascending' : 'descending';
    },

    // 4. Query Output
    getQuery() {
      return buildQueryParams({
        search: this.search,
        filters: this.filters,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
      });
    },

    notify() {
      if (typeof onChange === 'function') {
        onChange(this.getQuery());
      }
    },
  };
}
