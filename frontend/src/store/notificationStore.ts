import { create } from 'zustand';
import type { NotificationWSDTO } from '../types';

interface NotificationStore {
  unreadCount: number;
  liveNotifications: NotificationWSDTO[];
  setUnreadCount: (count: number) => void;
  addLiveNotification: (n: NotificationWSDTO) => void;
  decrementUnread: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  liveNotifications: [],
  setUnreadCount: (count) => set({ unreadCount: count }),
  addLiveNotification: (n) =>
    set((s) => ({
      liveNotifications: [n, ...s.liveNotifications].slice(0, 20),
      unreadCount: s.unreadCount + 1,
    })),
  decrementUnread: () =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
}));
