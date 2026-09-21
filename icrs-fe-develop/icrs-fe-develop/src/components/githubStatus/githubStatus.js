import { statusService } from '../../services/statusService.js';
import { ApiError } from '../../services/apiClient.js';

// Same loading/error/data pattern as userList.js/orderList.js, but backed by
// a third-party API (via the BFF's dedicated /api/status/github route)
// instead of one of our own microservices.
export function githubStatus() {
  return {
    status: null,
    loading: false,
    error: null,

    async init() {
      this.loading = true;
      this.error = null;
      try {
        const res = await statusService.githubStatus();
        this.status = res.data;
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : 'Unexpected error';
      } finally {
        this.loading = false;
      }
    },
  };
}
