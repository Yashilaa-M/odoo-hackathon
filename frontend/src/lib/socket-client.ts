import { io } from 'socket.io-client';

const socketUrl = (import.meta as any).env.VITE_WS_URL || 'http://localhost:3000';

export const socket = io(socketUrl, {
  autoConnect: false,
});
