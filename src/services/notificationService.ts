import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { AppNotification } from '@/types/production';

export interface NotificationPage {
  data: AppNotification[];
  meta: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
    sortBy: string[][];
  };
}

export const notificationService = {
  /**
   * Fetches paginated in-app notifications for the authenticated account.
   * Maps to GET /api/notifications
   */
  async listNotifications(page = 1, limit = 20): Promise<ApiResponse<NotificationPage>> {
    return apiClient.get<NotificationPage>(`${API_ROUTES.NOTIFICATIONS.LIST}?page=${page}&limit=${limit}`);
  },

  /** One page of the notifications of the given types (all when empty), optionally only the unread ones. */
  async listByTypes(types: string[], page = 1, limit = 15, unreadOnly = false): Promise<ApiResponse<NotificationPage>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (types.length) params.set('filter.type', `$in:${types.join(',')}`);
    if (unreadOnly) params.set('filter.readAt', '$null');
    return apiClient.get<NotificationPage>(`${API_ROUTES.NOTIFICATIONS.LIST}?${params.toString()}`);
  },

  /**
   * Fetches unread notification count for the authenticated account.
   * Maps to GET /api/notifications/unread-count
   */
  async getUnreadCount(): Promise<ApiResponse<{ unread: number }>> {
    return apiClient.get<{ unread: number }>(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT);
  },

  /**
   * Marks a specific notification as read.
   * Maps to PATCH /api/notifications/:id/read
   */
  async markRead(notificationId: string): Promise<ApiResponse<unknown>> {
    return apiClient.patch(API_ROUTES.NOTIFICATIONS.READ(notificationId));
  },

  /**
   * Marks all notifications as read for the authenticated account.
   * Maps to PATCH /api/notifications/read-all
   */
  async markAllRead(): Promise<ApiResponse<{ updated: number }>> {
    return apiClient.patch<{ updated: number }>(API_ROUTES.NOTIFICATIONS.READ_ALL);
  },
};
