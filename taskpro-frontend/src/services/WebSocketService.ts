import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Notification } from '../types/notification.types';
import { toast } from 'react-hot-toast';

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  connect(userId: number, onNotificationReceived?: (notification: Notification) => void) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot connect to WebSocket');
      return;
    }

    this.client = new Client({
      // Le backend écoute sur 8081 (application-dev.yml) et le endpoint est /api/v1/ws
      webSocketFactory: () => new SockJS('http://localhost:8081/api/v1/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('WebSocket Debug:', str);
        }
      },
      reconnectDelay: this.reconnectInterval,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // S'abonner aux notifications personnelles
      this.client?.subscribe(`/queue/notifications/${userId}`, (message) => {
        try {
          const notification: Notification = JSON.parse(message.body);
          console.log('Notification received:', notification);
          
          // Afficher une toast notification
          this.showToastNotification(notification);
          
          // Callback pour mettre à jour le store
          if (onNotificationReceived) {
            onNotificationReceived(notification);
          }
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      });

      // S'abonner aux mises à jour globales (optionnel)
      this.client?.subscribe('/topic/global', (message) => {
        console.log('Global update:', message.body);
      });
    };

    this.client.onStompError = (frame) => {
      console.error('WebSocket STOMP error:', frame);
      this.isConnected = false;
    };

    this.client.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      this.isConnected = false;
      this.handleReconnect(userId, onNotificationReceived);
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.handleReconnect(userId, onNotificationReceived);
    };

    this.client.activate();
  }

  private handleReconnect(userId: number, onNotificationReceived?: (notification: Notification) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(userId, onNotificationReceived);
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      toast.error('Connexion temps réel perdue. Actualisez la page.');
    }
  }

  private showToastNotification(notification: Notification) {
    const notificationMessages: Record<string, string> = {
      TASK_ASSIGNED: '📋 Nouvelle tâche assignée',
      TASK_STATUS_CHANGED: '🔄 Statut de tâche modifié',
      TASK_COMMENTED: '💬 Nouveau commentaire',
      TASK_DUE_SOON: '⏰ Rappel de date limite',
      PROJECT_INVITATION: '📢 Invitation projet',
      TEAM_INVITATION: '👥 Invitation équipe',
      GENERAL: '🔔 Nouvelle notification',
    };

    const title = notificationMessages[notification.type] || notificationMessages.GENERAL;
    
    toast.success(
      `${title}: ${notification.message}`,
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  }

  disconnect() {
    if (this.client && this.isConnected) {
      this.client.deactivate();
      this.isConnected = false;
      console.log('WebSocket manually disconnected');
    }
  }

  sendMessage(destination: string, body: any) {
    if (this.client && this.isConnected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
