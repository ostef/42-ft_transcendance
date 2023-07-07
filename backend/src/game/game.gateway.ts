import { Body, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { find } from 'rxjs';
import { Server, Socket } from 'socket.io'
import { GameService } from './game.service'
import { FindGame } from './types/game.types'
import { UpdatePaddleDto, ConfigurateDto, UserIdDtto, StartInviteDto, JoinInviteDto } from './dto/game.dto';


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



  //MatchMaking Events : Used to join the waiting queue or to create a game and wait for players to join
  @SubscribeMessage('searchGame')
  onSearchGame(@ConnectedSocket() client: Socket)
  {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    console.log("Searching for a game", client.id)
    let findResult : FindGame = this.gameService.findGame(client)
    if (findResult.instanceId >= 0)
    {
      client.emit("foundGame", "right", findResult.instanceId, findResult.difficulty, findResult.color)
      findResult.player1.emit("foundGame", "left", findResult.instanceId, findResult.difficulty, findResult.color)
    }
   }

   @SubscribeMessage('createGame')
   onCreateGame(@ConnectedSocket() client : Socket)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
		let createResult = this.gameService.createGame(client)
   }



   //Events to leave game queue and player queue  
   @SubscribeMessage('stopWaiting')
   onQuitWaiting(@ConnectedSocket() client: Socket)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
		this.gameService.quitWaitRoom(client)
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
   



   //Game Events to update paddle position
   @SubscribeMessage('updatePaddle')
   onUpdatePaddle(@ConnectedSocket() client : Socket, @MessageBody() data : UpdatePaddleDto)
   {
      if (this.isSocket(client.id) === false)
      {
        return ;
      }
	    this.gameService.updatePaddlePos(client, data.gameId, data.paddlePos)
   }




   //Configuration Events to add the difficulty, color and userInfo to the game
   @SubscribeMessage('configurate')
   onConfig(@ConnectedSocket() client : Socket, @MessageBody() data : ConfigurateDto)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    this.gameService.configurateGame(client, data)
   }

   @SubscribeMessage('userId')
   onUserId(@ConnectedSocket() client : Socket, @MessageBody() data : UserIdDtto)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    console.log("userId is : " + data.userId)
    this.gameService.addUserIdToGame(client, data.gameId, data.userId)
	this.gameService.addUserIdtoInGame(data.userId)
   }



   //Invite Event to handle connection from an invite URL
   @SubscribeMessage('startInvite')
   onStartInvite(@ConnectedSocket() client : Socket, @MessageBody() data : StartInviteDto)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    this.gameService.startInvite(client, data)
   }

   @SubscribeMessage('joinInvite')
   onJoinInvite(@ConnectedSocket() client : Socket, @MessageBody() data : JoinInviteDto)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    this.gameService.joinInvite(client, data.gameId)
   }


   //Spectate Events
   @SubscribeMessage('getSpectateList')
   onSpectateList(@ConnectedSocket() client : Socket)
   {
	if (this.isSocket(client.id) === false)
    {
      return ;
    }
	client.emit('spectateList', this.gameService.getPlayingGames())
   }
}
