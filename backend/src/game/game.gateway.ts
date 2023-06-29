import { Body, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { find } from 'rxjs';
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
export class GameGateway implements OnModuleInit, OnApplicationBootstrap {
  
  sockets : string [] = []

  @WebSocketServer()
  server : Server;


  constructor(private readonly gameService: GameService) {
  }
  
  onModuleInit() {
  }
  
  onApplicationBootstrap() {
    this.server.on('connection', (socket) => {
      console.log("A socket is connecting : " + socket.id);      this.sockets.push(socket.id);
      console.log("The sockets are " + this.sockets)
      this.server.emit ("onConnection", {
        id: socket.id,
			});
      socket.on("disconnect", (reason) => {
        console.log(this.sockets)
        console.log("Disconnecting id : " + socket.id);
        this.sockets.splice(this.sockets.findIndex(id =>
          id == socket.id
        ), 1)
        console.log("The sockets are " + this.sockets)
        this.gameService.disconnectPlayer(socket.id)
      })
    })
  }

  isSocket(id : string)
  {
    for (let i = 0; i <= this.sockets.length; i++)
    {
      if (id === this.sockets[i])
      {
        return true;
      }
    }

    return false;
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
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
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
      client.emit("foundGame", "right", findResult.instanceId, findResult.difficulty, findResult.color)
      findResult.player1.emit("foundGame", "left", findResult.instanceId, findResult.difficulty, findResult.color)
    }
   }

   @SubscribeMessage('createGame')
   onCreateGame(@ConnectedSocket() client : Socket, @MessageBody() data : any)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
		let createResult = this.gameService.createGame(client, data)

   }

   @SubscribeMessage('stopWaiting')
   onQuitWaiting(@ConnectedSocket() client: Socket)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
		this.gameService.quitWaitRoom(client)
   }

   //Todo créer un dto pour le transfertd e donnée
   @SubscribeMessage('updatePaddle')
   onUpdatePaddle(@ConnectedSocket() client : Socket, @MessageBody() data : any)
   {
      if (this.isSocket(client.id) === false)
      {
        return ;
      }
	    this.gameService.updatePaddlePos(client, data.gameId, data.paddlePos)
   }

  //Todo : DTO 
   @SubscribeMessage('configurate')
   onConfig(@ConnectedSocket() client : Socket, @MessageBody() data : any)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    this.gameService.configurateGame(client, data)
   }

   @SubscribeMessage('userId')
   onUserId(@ConnectedSocket() client : Socket, @MessageBody() data : any)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    console.log("userId is : " + data.userId)
    this.gameService.addUserIdToGame(client, data.gameId, data.userId)
   }

   @SubscribeMessage('disconnectWaiting')
   onDisconnectWaiting(@ConnectedSocket() client : Socket)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    this.gameService.disconnectPlayer(client.id)
   }


   //Invite Event 

   @SubscribeMessage('startInvite')
   onStartInvite(@ConnectedSocket() client : Socket, @MessageBody() data : any)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    this.gameService.startInvite(client, data)
   }

   @SubscribeMessage('joinInvite')
   onJoinInvite(@ConnectedSocket() client : Socket, @MessageBody() data : any)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    this.gameService.joinInvite(client, data)
   }
}
