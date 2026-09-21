import { orderService } from '../../services/orderService.js';
import { ApiError } from '../../services/apiClient.js';

// Same loading/error/data pattern as userList.js, backed by the orders microservice.
export function orderList() {
  return {
    orders: [],
    loading: false,
    error: null,

    async init() {
      this.loading = true;
      this.error = null;
      try {
        this.orders = await orderService.list();
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : 'Unexpected error';
      } finally {
        this.loading = false;
      }
    },
  };
}
