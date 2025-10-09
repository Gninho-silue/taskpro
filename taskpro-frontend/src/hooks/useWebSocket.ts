import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { webSocketService } from '../services/WebSocketService';
import { addNotification } from '../store/slices/notificationsSlice';
import { Notification } from '../types/notification.types';

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !isConnectedRef.current) {
      const handleNotification = (notification: Notification) => {
        dispatch(addNotification(notification));
      };

      webSocketService.connect(user.id, handleNotification);
      isConnectedRef.current = true;

      // Cleanup lors du démontage
      return () => {
        webSocketService.disconnect();
        isConnectedRef.current = false;
      };
    }
  }, [isAuthenticated, user, dispatch]);

  // Déconnecter si l'utilisateur se déconnecte
  useEffect(() => {
    if (!isAuthenticated && isConnectedRef.current) {
      webSocketService.disconnect();
      isConnectedRef.current = false;
    }
  }, [isAuthenticated]);

  return {
    isConnected: webSocketService.isWebSocketConnected(),
    sendMessage: webSocketService.sendMessage.bind(webSocketService),
  };
};