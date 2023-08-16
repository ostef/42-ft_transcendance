import { Body, OnApplicationBootstrap, OnModuleInit, UnauthorizedException, UseFilters, UsePipes, ValidationPipe, WsExceptionFilter } from '@nestjs/common';
import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { find } from 'rxjs';
import { Server, Socket } from 'socket.io'
import { GameService } from './game.service'
import { FindGame } from './types/game.types'
import { UpdatePaddleDto, ConfigurateDto, UserIdDtto, StartInviteDto, JoinInviteDto, SpectateDto, SearchCreateGameDto } from './dto/game.dto';
import { AuthService } from 'src/auth/auth.service';
import { WsCatchAllFilter } from './exceptions/ws-catch-all-filter'



@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
	namespace: "/game",
	cors: {
		origin: "*",
	}
})
export class GameGateway implements OnModuleInit, OnApplicationBootstrap {

  sockets : string [] = []

  @WebSocketServer()
	server : Server;


  constructor(
	private readonly gameService: GameService,
	private authService: AuthService
	) {}

  onModuleInit() {
  }

  onApplicationBootstrap() {

	this.server.use (async (socket, next) => {
		const payload = this.authService.getPayloadFromToken (socket.handshake.auth.token);
    const user = await this.authService.validateUser (payload.userId);

		if (!payload || !user)
		{
			next (new WsException ("Unauthorized"));
		}
		else
		{
		   socket.data.userId = payload.userId;
		   next ();
		}
	 });




    this.server.on('connection', (socket) => {
      //console.log("A socket is connecting : " + socket.id);
	  this.sockets.push(socket.id);
      //console.log("The sockets are " + this.sockets)
      this.server.emit ("onConnection", {
        id: socket.id,
			});
      socket.on("disconnect", (reason) => {
        //console.log(this.sockets)
        //console.log("Disconnecting id : " + socket.id);
        this.sockets.splice(this.sockets.findIndex(id =>
          id == socket.id
        ), 1)
        //console.log("The sockets are " + this.sockets)
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
  async onSearchGame(@ConnectedSocket() client: Socket, @MessageBody() data : SearchCreateGameDto)
  {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    //console.log("Searching for a game", client.id)
	try {

		let findResult = await this.gameService.findGame(client, data.userId)
		if (findResult.instanceId >= 0)
		{
		  client.emit("foundGame", "right", findResult.instanceId, findResult.difficulty, findResult.color)
		  findResult.player1.emit("foundGame", "left", findResult.instanceId, findResult.difficulty, findResult.color)
		}
	}
	catch(err)
	{
		console.log(err.message)
		throw new UnauthorizedException("Player not on database")
	}
   }

   @SubscribeMessage('createGame')
   onCreateGame(@ConnectedSocket() client : Socket, @MessageBody() data : SearchCreateGameDto)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
		try
		{

			let createResult = this.gameService.createGame(client, data.userId)
		}
		catch(err)
		{
			console.log(err.message)
		}
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
	  try {

		  this.gameService.updatePaddlePos(client, data.gameId, data.paddlePos)
	  }
	  catch(err)
	  {
		console.log(err.message);
	  }
   }




   //Configuration Events to add the difficulty, color and userInfo to the game
   @SubscribeMessage('configurate')
   onConfig(@ConnectedSocket() client : Socket, @MessageBody() data : ConfigurateDto)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    try {

      this.gameService.configurateGame(client, data)
    }
    catch(err)
    {
      console.log(err.message);
    }
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
    this.gameService.joinInvite(client, data)
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

   @SubscribeMessage('StartSpectating')
   onStartSpectating(@ConnectedSocket() client : Socket, @MessageBody() data : SpectateDto)
   {
    if (this.isSocket(client.id) === false)
    {
      return ;
    }
    this.gameService.addSpectatorToGame(client, data.gameId)
   }
}
