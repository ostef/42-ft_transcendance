import { Body, OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { GameService } from './game.service';


//Todo Controler si les sockets sont ok avant de faire des actions

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

  constructor(private readonly gameService: GameService) {}

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


  //Todo Créer un dto sur la data a transférer pour le search game
  @SubscribeMessage('searchGame')
  onSearchGame(@ConnectedSocket() client: Socket, @MessageBody() data: any)
  {
	console.log("Searching for a game", client.id)
	let findResult = this.gameService.findGame(client, data)
	if (findResult.instanceId === -1)
	{
		client.emit("waitingMessage")
	}
	else if (findResult.instanceId === -2)
	{
		//do nothing for now
	}
	else
	{
		//On previent le front qu'une game est lancé
		//Et on donne la position de la paddle
		client.emit("foundGame", "right", findResult.instanceId, findResult.difficulty)
		findResult.player1.emit("foundGame", "left", findResult.instanceId, findResult.difficulty)
	}
   }

   @SubscribeMessage('createGame')
   onCreateGame(@ConnectedSocket() client : Socket, @MessageBody() data : any)
   {
		let createResult = this.gameService.createGame(client, data)

   }

   @SubscribeMessage('stopWaiting')
   onQuitWaiting(@ConnectedSocket() client: Socket)
   {
		this.gameService.quitWaitRoom(client)
   }

   //Todo créer un dto pour le transfertd e donnée
   @SubscribeMessage('updatePaddle')
   onUpdatePaddle(@ConnectedSocket() client : Socket, @MessageBody() data : any)
   {
	    this.gameService.updatePaddlePos(client, data.gameId, data.paddlePos)
   }

   @SubscribeMessage('difficultyChoice')
   onDifficulty(@ConnectedSocket() client : Socket, @MessageBody() data : any)
   {
		this.gameService.addDifficulty(client, data)
   }   

}
