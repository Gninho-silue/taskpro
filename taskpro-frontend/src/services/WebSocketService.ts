import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { addNotification } from '../store/slices/notificationsSlice.ts';
import { store } from '../store/store.ts';

let stompClient: Client | null = null;

export const WebSocketService = {
  connect: (userId: number) => {
    const socket = new SockJS('http://localhost:8081/api/v1/ws');
    
    stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
      
      // S'abonner aux notifications personnelles
      stompClient?.subscribe(`/queue/notifications/${userId}`, (message) => {
        const notification = JSON.parse(message.body);
        store.dispatch(addNotification(notification));
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP error', frame);
    };

    stompClient.activate();
  },

  disconnect: () => {
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
      console.log('Disconnected from WebSocket');
    }
  },

  isConnected: () => {
    return stompClient !== null && stompClient.connected;
  }
};