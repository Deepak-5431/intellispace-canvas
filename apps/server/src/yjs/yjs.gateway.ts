import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
  }
})
export class YjsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async afterInit(server: Server) {
    try {
      const { YSocketIO } = await import('y-socket.io/dist/server');
      
      const ysocketio = new YSocketIO(server, {
      });

      ysocketio.initialize();
      
      ysocketio.on('document-loaded', (doc: any) => {
        console.log(`[Y.js] Document ${doc.name} loaded`);
      });
      
      ysocketio.on('document-update', (doc: any, update: any) => {
        console.log(`[Y.js] Document ${doc.name} updated`);
      });

      ysocketio.on('awareness-update', (update: any) => {
        console.log(`[Y.js] Awareness updated`);
      });

      console.log('✅ Y.js Socket.IO server initialized');
    } catch (error) {
      console.error(' Failed to initialize Y.js Socket.IO server:', error);
    }
  }

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }
}