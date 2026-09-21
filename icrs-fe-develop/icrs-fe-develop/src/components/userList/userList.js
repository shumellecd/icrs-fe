import { userService } from '../../services/userService.js';
import { ApiError } from '../../services/apiClient.js';

// Alpine.data component. Bind with x-data="userList" — shows the standard
// loading/error/data pattern used for any service-backed component.
export function userList() {
  return {
    users: [],
    loading: false,
    error: null,

    async init() {
      this.loading = true;
      this.error = null;
      try {
        this.users = await userService.list();
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : 'Unexpected error';
      } finally {
        this.loading = false;
      }
    },
  };
}
