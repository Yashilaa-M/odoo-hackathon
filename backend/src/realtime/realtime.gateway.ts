import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log(`Websocket client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Websocket client disconnected: ${client.id}`);
  }

  broadcast(event: string, payload: any) {
    if (this.server) {
      this.server.emit(event, payload);
    }
  }
}
