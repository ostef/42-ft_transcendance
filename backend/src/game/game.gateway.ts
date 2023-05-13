import { Body, OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io'

@WebSocketGateway()
export class GameGateway implements OnModuleInit {

  @WebSocketServer()
  server : Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id)
    })
  }
  
  @SubscribeMessage('msgToServer')
  handleMessage(client: any, payload: any): string {
    this.server.emit('onMessage', {
      msg : "newmessage", 
    })
    return 'Hello world!'; 
  }
}
