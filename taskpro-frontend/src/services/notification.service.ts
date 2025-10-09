import api from './api'
import { Notification } from '../types/notification.types'
import { PaginatedResponse } from '../types/common.types'

export const notificationService = {
  async getNotifications(page = 0, size = 50): Promise<Notification[]> {
    const response = await api.get<PaginatedResponse<Notification>>(
      `/notifications?page=${page}&size=${size}`
    )
    return response.data.content
  },

  async markAsRead(notificationId: number): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all')
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<number>('/notifications/count-unread')
    return response.data
  },
}