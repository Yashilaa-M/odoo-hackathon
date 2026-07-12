import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: true,
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly configService: ConfigService) {}

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

  afterInit(server: Server) {
    const corsOrigin = this.configService.get<string>('CORS_ORIGIN') || 'http://localhost:5173';
    server.engine.opts.cors = {
      origin: corsOrigin,
      credentials: true,
    };
  }
}
