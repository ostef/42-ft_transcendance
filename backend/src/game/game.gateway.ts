import { Body, OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io'


@WebSocketGateway({
	namespace: "/game",
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
})
export class GameGateway implements OnModuleInit {

  @WebSocketServer()
  server : Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id)

      this.server.emit ("onConnection", {
				id: socket.id,
			});
    })
  }
  
  @SubscribeMessage('msgToServer')
  handleMessage(client: any, payload: any): string {
    this.server.emit('onMessage', {
      msg : "newmessage", 
    })
    return 'Hello world!'; 
  }

  @SubscribeMessage()

  
}
