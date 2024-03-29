import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';

import Game from "./script/Game"
import { gameHistoryEntity } from './entities/gameHistory.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ConfigurateDto, GameSpectateDto, JoinInviteDto, StartInviteDto } from './dto/game.dto';
import { SpectateGame, Spectator, waitingPlayer } from './types/game.types';
import { validateColor, validateDifficulty } from './script/validators';
import { ChannelsService } from 'src/chat/channels.service';
import { UserDto } from "src/users/types";

class MatchHistoryDto
{
	id: number;
	opponent: UserDto;
	playerScore: number;
	opponentScore: number;
	winner: string;

	static fromMatchHistoryEntity (myUserId: string, game: gameHistoryEntity): MatchHistoryDto
	{
		return {
			id: game.id,
			opponent: UserDto.fromUserEntity (game.user1.id == myUserId ? game.user1 : game.user2, game.user1.id == myUserId ? game.user2 : game.user1),
			playerScore: game.user1.id == myUserId ? game.scoreP1 : game.scoreP2,
			opponentScore: game.user1.id == myUserId ? game.scoreP2 : game.scoreP1,
			winner: game.winner.id,
		};
	}
}

@Injectable()
export class GameService {


	//Waitroms for the multiple state of games that exists
	waitRoom : waitingPlayer[] = []
	gamesRoom : Game[] = []
	gamesPlayingRoom : Game[] = []
	gamesWaitingRoom : Game[] = []
	gamesCreateRoom : Game[] = []
	gamesInvite : Game[] = []
	usersInGame : string[] = []
	spectators : Spectator[] = []
	gameIds : number = 0

	constructor(
		@InjectRepository (gameHistoryEntity)
        private gameRepository: Repository<gameHistoryEntity>,

		private usersService: UsersService,

		private channelService : ChannelsService
	) {}

	//Leave Room Fonctions, called on disconnect or on leave


	quitWaitRoom(client : Socket)
	{
		//console.log("Quitting the wait room for ", client.id)
		this.waitRoom = this.waitRoom.filter( player => player.socket.id !== client.id)
	}

	quitGameWaitingRoom(socketId : string, gameIndex : number)
	{
		//console.log("Quitting the gamewaiting room for " + socketId)
		this.gamesWaitingRoom = this.gamesWaitingRoom.filter(game => game.player1Socket.id !== socketId)
		this.gamesWaitingRoom = this.gamesWaitingRoom.filter(game => game.player2Socket.id !== socketId)
	}

	quitGameCreateRoom(socketId : string, gameIndex : number)
	{
		//console.log("Quitting the gamecreateroom room for " + socketId)
		this.gamesCreateRoom = this.gamesCreateRoom.filter(game => game.player1Socket.id !== socketId)
		this.gamesCreateRoom = this.gamesCreateRoom.filter(game => game.player2Socket.id !== socketId)
	}

	quitGameInvite(socketId : string)
	{
		//console.log("Quitting the Game Invite room room for " + socketId)
		this.gamesInvite = this.gamesInvite.filter(game => {
			if (game.player1Socket)
			{
				game.player1Socket.id !== socketId
			}
		})

		this.gamesInvite = this.gamesInvite.filter(game => {
			if (game.player2Socket)
			{
				game.player2Socket.id !== socketId
			}
		})
	}

	quitInGame(userId : string)
	{
		//console.log("Quitting the IngameRoom for " + userId)
		this.usersInGame = this.usersInGame.filter(Id => userId == Id)
	}

	quitPlayingGame(gameIndex : number)
	{
		//console.log("Quitting the playing game room for game " + gameIndex)
		this.gamesPlayingRoom = this.gamesPlayingRoom.filter(game =>
			game.instanceId !== gameIndex)
		}

		quitSpectators(socketId : string)
		{
		this.spectators = this.spectators.filter(spectator =>
			spectator.socket.id !== socketId)
		}


		//Getters for Game rooms
		async getPlayingGames() : Promise<GameSpectateDto>
		{
			let gamesSpectate = {} as GameSpectateDto
		gamesSpectate.games = []
		for (let gamesPlaying of this.gamesPlayingRoom)
		{
			let gameSpec = {} as SpectateGame
			gameSpec.gameId = gamesPlaying.instanceId
			gameSpec.difficulty = gamesPlaying.difficulty
			gameSpec.color = gamesPlaying.color
			let user1 = await this.usersService.findUserEntity({ id : gamesPlaying.player1DataBaseId })
			if (user1 == null)
			{
				return null
			}
			gameSpec.user1 = user1.nickname
			let user2 = await this.usersService.findUserEntity({ id : gamesPlaying.player2DataBaseId })
			if (user2 == null)
			{
				return null
			}
			gameSpec.user2 = user2.nickname
			gamesSpectate.games.push(gameSpec)
		}
		return (gamesSpectate)
	}



	//Matchmaking functions to join Queue or create game and wait for player
	addPlayerToWaitRoom(client : Socket, userId : string)
	{
		//console.log("adding client to wait room", client.id)
		this.waitRoom.push({socket :client, userId : userId })
	}

	async createGame(client : Socket, userId : string)
	{
		let userControl = await this.usersService.findUserEntity({id : userId})
		if (userControl == null)
		{
			throw new UnauthorizedException("Player not on database")
		}
		if (this.isWaitingUserId(userId) != -1 || this.isGamingUserId(userId) != -1 || this.isGameCreatingUserId(userId) != -1
			|| this.isGameWaitingUserId(userId) != -1 || this.isGameInviteUserId(userId) != -1)
		{
			client.emit("alreadyGaming")
			return
		}
		if (this.waitRoom.length >= 1)
		{
			let otherUser = this.waitRoom.pop()
			let newGame : Game = new Game(this.gameIds, client, otherUser.socket, this)
			this.incrementGameids()
			this.gamesRoom.push(newGame)
			//console.log("new game id : ", newGame.instanceId)
			newGame.createGame()
			newGame.isReady = true
			newGame.player1DataBaseId = userId
			newGame.player2DataBaseId = otherUser.userId
			this.gamesCreateRoom.push(newGame)
			return
		}
		else
		{
			//console.log("empty newgame")
			let newGame : Game = new Game(this.gameIds, client, client, this)
			this.gamesRoom.push(newGame)
			this.incrementGameids()
			//console.log("new game id : ", newGame.instanceId)
			newGame.createGame()
			newGame.isReady = false
			newGame.player1DataBaseId = userId
			this.gamesCreateRoom.push(newGame)
			this.gamesWaitingRoom.push(newGame)
		}
	}

	async findGame(client : Socket, userId : string) : Promise<{ player1: Socket | null; instanceId: number; difficulty: string; color: string; }>
	{
		let userControl = await this.usersService.findUserEntity({id : userId})
		if (userControl == null)
		{
			throw new UnauthorizedException("Player not on database")
		}
		//console.log("trying to find a game for ", client.id)
		//One game is waiting for player
		if (this.isWaitingUserId(userId) != -1 || this.isGamingUserId(userId) != -1 || this.isGameCreatingUserId(userId) != -1
			|| this.isGameWaitingUserId(userId) != -1 || this.isGameInviteUserId(userId) != -1)
		{
			client.emit("alreadyGaming")
			return ({player1 : null, instanceId : -2, difficulty : "default", color : ""})
		}
		if (this.gamesWaitingRoom.length >= 1)
		{
			let newGame = this.gamesWaitingRoom.shift()
			newGame.player2Socket = client
			newGame.player2DataBaseId = userId
			//The game has not been configurated yet so player will wait for configuration
			if (newGame.isConfig == false)
			{
				newGame.isReady = true
				return ({player1 : null, instanceId : -2, difficulty : "default", color : ""})
			}
			else
			{
				//Game is configurated so it can start right away
				newGame.startGame()
				this.addPlayingGame(newGame)
				this.addUserIdtoInGame(newGame.player1DataBaseId)
				this.addUserIdtoInGame(newGame.player2DataBaseId)
				return ({player1 : newGame.player1Socket, instanceId : newGame.instanceId, difficulty : newGame.difficulty, color : newGame.color})
			}
		}

		//Another player is waiting for a game, creates a game for both a them, player 1 will configurate it
		else if (this.waitRoom.length >= 1)
		{
			let client2 = this.waitRoom.pop()
			this.addWaitingGame(client, client2, userId, true)
			return ({player1 : null, instanceId : -2, difficulty : "default", color : ""})
		}
		else
		{
			//No other player waiting and no game waiting, join the queue
			this.addPlayerToWaitRoom(client, userId)
			return ({player1 : null, instanceId : -1, difficulty : "default", color : ""})

		}
	}

	addWaitingGame(client : Socket, client2 : waitingPlayer, user1Id : string, ready : boolean)
	{
		//Creating a game with 2 players and waiting for player 1 to configurate it
		let newGame : Game = new Game(this.gameIds, client, client2.socket , this)
		this.incrementGameids()
		this.gamesRoom.push(newGame)
		newGame.player2DataBaseId = client2.userId
		newGame.player1DataBaseId = user1Id
		//console.log("new game id : ", newGame.instanceId)
		if (ready === true)
		{
			newGame.isReady = true
		}
		newGame.createGame()
		this.gamesCreateRoom.push(newGame)
	}

	addPlayingGame(game : Game)
	{
		//console.log("adding a game to the playing Game room")
		this.gamesPlayingRoom.push(game)
	}


	//Configuration functions to add difficulty, color and user infos
	configurateGame(client : Socket, data : ConfigurateDto)
	{
		let currentInstance = null
		for (let game of this.gamesCreateRoom)
		{
			if (game.instanceId == data.gameId)
			{
				currentInstance = game
				break
			}
		}
		if (currentInstance == null)
		{
			throw new NotFoundException("Game Not Found")
		}
		if (currentInstance.player1Socket.id != client.id && currentInstance.player2Socket.id != client.id)
		{
			throw new UnauthorizedException("You are not in the Game")
		}
		if (!validateDifficulty(data.difficulty))
		{
			throw new BadRequestException("Wrong difficulty format")
		}
		if (!validateColor(data.color))
		{
			throw new BadRequestException("Wrong Color format")
		}
		currentInstance.addDifficulty(data.difficulty)
		currentInstance.addColor(data.color)
		currentInstance.addMaxScore(data.score)
		currentInstance.isConfig = true
		this.redirectGame(currentInstance)
	}

	addUserIdtoInGame(userId : string)
	{
		this.usersInGame.push(userId)
	}

	addSpectatorToGame(client : Socket, gameId : number)
	{
		let index = this.gamesRoom.findIndex(game =>
			game.instanceId == gameId)
			if (index != -1)
		{
			this.gamesRoom[index].addSpectator(client)
			let newSpectate = {} as Spectator
			newSpectate.gameId = gameId
			newSpectate.socket = client
			this.spectators.push(newSpectate)
		}
		else
		{
			client.emit('gameNotFound')
		}
	}


	//Once game is configurated, launch it if 2 players are in or wait for a second one
	redirectGame(currentGame : Game)
	{
		if (currentGame.isReady === false)
		{
			let index = this.gamesCreateRoom.findIndex(game =>
				game.instanceId == currentGame.instanceId
				)
				if (index != -1)
				{
					this.gamesCreateRoom.splice(index, 1)
				}
			}
			else
			{
				let index = this.gamesCreateRoom.findIndex(game =>
					game.instanceId == currentGame.instanceId
					)
					if (index != -1)
			{
				this.gamesCreateRoom.splice(index, 1)
				currentGame.startGame()
				this.addPlayingGame(currentGame)
				this.addUserIdtoInGame(currentGame.player1DataBaseId)
				this.addUserIdtoInGame(currentGame.player2DataBaseId)
				currentGame.player1Socket.emit("foundGame", "left", currentGame.instanceId, currentGame.difficulty, currentGame.color)
				currentGame.player2Socket.emit("foundGame", "right", currentGame.instanceId, currentGame.difficulty, currentGame.color)
			}
		}
	}


	//Ingame functions
	updatePaddlePos(client : Socket, gameId : number, paddlePos : number)
	{
		let currentInstance = null as Game
		for (let game of this.gamesRoom)
		{
			if (game.instanceId == gameId)
			{
				currentInstance = game
				break
			}
		}
		if (currentInstance == null)
		{
			throw new NotFoundException("Game Already Finished or Not Found")
		}
		if (currentInstance.player1Socket.id != client.id && currentInstance.player2Socket.id != client.id)
		{
			throw new UnauthorizedException("You are not in the Game")
		}
		if (paddlePos <= 0 || paddlePos >= 1)
		{
			throw new BadRequestException("Wrong paddle position")
		}
		currentInstance.updatePaddlePos(client, paddlePos)
	}



	//Leave game functions
	stopGame(gameId : number)
	{
		this.quitPlayingGame(gameId)
		let index = this.gamesRoom.findIndex(game =>
			game.instanceId == gameId
			)
			if (index != -1)
			{
				this.createGameHistory(this.gamesRoom[index].player1DataBaseId,
				this.gamesRoom[index].player2DataBaseId,
				this.gamesRoom[index].score.p1, this.gamesRoom[index].score.p2, this.gamesRoom[index].isWinner)
				this.quitInGame(this.gamesRoom[index].player1DataBaseId)
				this.quitInGame(this.gamesRoom[index].player2DataBaseId)
				for ( let spectator of this.gamesRoom[index].spectators )
				{
					this.quitSpectators(spectator.id)
				}
			this.gamesRoom.splice(index, 1)
			}
	}

	stopGameBeforeStart(gameId : number)
	{
		let index = this.gamesRoom.findIndex(game =>
			game.instanceId == gameId
			)
			if (index != -1)
		{
			this.gamesRoom.splice(index, 1)
		}
	}

	incrementGameids()
	{
		if (this.gameIds == 9007199254740991)
		{
			this.gameIds = 0
			return
		}
		this.gameIds += 1
	}


	//Global disconnect function, leave all rooms and treat the game regarding it's current state
	disconnectPlayer(socketId : string)
	{
		let index = this.isGaming(socketId)
		if (index != -1)
		{
			//Game is playing so we will choose a winner based on the disconnected player
			if (this.gamesRoom[index].isPlaying == true)
			{
				if (this.gamesRoom[index].player1Socket.id == socketId)
					this.gamesRoom[index].disconnectPlayer1()
				else if (this.gamesRoom[index].player2Socket.id == socketId)
				{
					this.gamesRoom[index].disconnectPlayer2()
				}
			}
		}

		//If player was in queue, leave it
		index = this.isWaiting(socketId)
		if (index != -1)
		{
			//console.log("Disconnecting a waiting player")
			this.quitWaitRoom(this.waitRoom[index].socket)
		}

		//If Game was being created, stops the process
		index = this.isGameCreating(socketId)
		if (index != -1)
		{
			//console.log("Disconnecting a game getting created")
			if (this.gamesCreateRoom[index].isReady == false)
			{
				this.gamesCreateRoom[index].stopGameBeforeStart()
			}
			else
			{
				this.gamesCreateRoom[index].disconnectPlayerBeforeStart(socketId)
			}
			this.quitGameCreateRoom(socketId, index)
		}

		//If Game was waiting for second player stops the process
		index = this.isGameWaiting(socketId)
		if (index != -1)
		{
			//console.log("Disconnecting a waiting game")
			this.gamesWaitingRoom[index].stopGameBeforeStart()
			this.quitGameWaitingRoom(socketId, index)
		}


		index = this.isGameInvite(socketId)
		if (index != -1)
		{
			//console.log("Disconnecting an Invite game")
			this.gamesInvite[index].disconnectPlayerBeforeStart(socketId)
			this.quitGameInvite(socketId)
		}

		index = this.isSpectating(socketId)
		if (index != -1)
		{
			let index2 = this.gamesRoom.findIndex(game =>
				game.instanceId == this.spectators[index].gameId)
			if (index != -1)
			{
				this.gamesRoom[index2].disconnectSpectator(socketId)
			}
			this.quitSpectators(socketId)
		}
		index = this.isGaming(socketId)
		if (index != -1)
		{
			this.gamesRoom[index].disconnectPlayerBeforeStart(socketId)
		}
		// console.log("The game room : " , this.gamesRoom)
		// console.log("The Game waiting room : " , this.gamesWaitingRoom)
		// console.log("The game Create room : " , this.gamesCreateRoom)
		// console.log("The playing games are : " , this.gamesPlayingRoom)
		// console.log("The playing players are : " , this.usersInGame)
		// console.log("The spectators are : " , this.spectators)
	}


	//State information functions to identify the state of the game of the player
	isGaming(socketId : string)
	{
		let index = this.gamesRoom.findIndex(game => {
			if (game.player1Socket)
			{
				return (game.player1Socket.id == socketId)
			}
			return (false)
		}
		)
		if (index == -1)
		{
			index = this.gamesRoom.findIndex(game =>
				game.player2Socket?.id === socketId
			)
		}
		return (index)
	}

	isGamingGameId(gameId : number)
	{
		let index = this.gamesRoom.findIndex(game => {
			if (game.player1Socket)
			{
				return (game.instanceId == gameId)
			}
			return (false)
		})
		return (index)
	}

	isGamingUserId(userId : string)
	{
		let index = this.gamesRoom.findIndex(game => {
			if (game.player1DataBaseId)
			{
				return (game.player1DataBaseId === userId)
			}
			return (false)
		}
		)
		if (index == -1)
		{
			index = this.gamesRoom.findIndex(game => {
				if (game.player2DataBaseId)
					return (game.player2DataBaseId === userId)
				return (false)
			})
		}
		return (index)
	}

	isWaiting(socketId : string)
	{
		let index =  this.waitRoom.findIndex(player => player.socket.id == socketId)
		return (index)
	}

	isWaitingUserId(userId : string)
	{
		let index =  this.waitRoom.findIndex(player => player.userId == userId)
		return (index)
	}

	isGameCreating(socketId : string)
	{
		let index  = this.gamesCreateRoom.findIndex(game => game.player1Socket.id == socketId)
		if (index == -1)
		{
			index  = this.gamesCreateRoom.findIndex(game => game.player2Socket.id == socketId)
		}
		return (index)
	}

	isGameCreatingGameId(gameId : number)
	{
		let index  = this.gamesCreateRoom.findIndex(game => game.instanceId == gameId)
		return (index)
	}

	isGameCreatingUserId(userId : string)
	{
		let index  = this.gamesCreateRoom.findIndex(game => {
			if (game.player1DataBaseId)
				return (game.player1DataBaseId == userId)
			return (false)
		})
		if (index == -1)
		{
			index  = this.gamesCreateRoom.findIndex(game => {
				if (game.player2DataBaseId)
					return (game.player2DataBaseId == userId)
				return (false)
			})
		}
		return (index)
	}

	isGameWaiting(socketId : string)
	{
		let index = this.gamesWaitingRoom.findIndex(game => game.player1Socket.id == socketId)
		if (index == -1)
		{
			index  = this.gamesWaitingRoom.findIndex(game => game.player2Socket.id == socketId)
		}
		return (index)
	}

	isGameWaitingUserId(userId : string)
	{
		let index = this.gamesWaitingRoom.findIndex(game => {
			if (game.player1DataBaseId)
				return (game.player1DataBaseId == userId)
			return (false)
		})
		if (index == -1)
		{
			index  = this.gamesWaitingRoom.findIndex(game => {
				if (game.player2DataBaseId)
					return (game.player2DataBaseId == userId)
				return (false)
			})
		}
		return (index)
	}

	isGameInvite(socketId : string)
	{
		let index = this.gamesInvite.findIndex(game => {
			if (game.player1Socket)
			{
				return (game.player1Socket.id == socketId)
			}
			return (false)
		})
		if (index == -1)
		{
			index  = this.gamesInvite.findIndex(game => {
				if (game.player2Socket)
				{
					game.player2Socket?.id == socketId
				}
			})
		}
		return (index)
	}

	isGameInviteGameId(gameId : number)
	{
		let index = this.gamesInvite.findIndex(game => {
			if (game.player1Socket)
			{
				return (game.instanceId == gameId)
			}
			return (false)
		})
		return (index)
	}

	isGameInviteUserId(userId : string)
	{
		let index = this.gamesInvite.findIndex(game => {
			if (game.player1DataBaseId)
			{
				return (game.player1DataBaseId == userId)
			}
			return (false)
		})
		if (index == -1)
		{
			index = this.gamesInvite.findIndex(game => {
				if (game.player2DataBaseId)
				{
					return (game.player2DataBaseId == userId)
				}
				return (false)
			})
		}
		return (index)
	}

	isInGame(userId : string) : number
	{
		let index = this.usersInGame.findIndex(Id => userId == Id)
		return (index)
	}

	isSpectating(socketId : string) : number
	{
		let index = this.spectators.findIndex(spectator =>
			spectator.socket.id == socketId)
		return (index)
	}



	//Invite functions to redirect players who followed and invite link
	async createInvite(userId : string)
	{
		let result : string = ""
		const date = new Date()


		let userControl = await this.usersService.findUserEntity({id : userId})
		if (userControl == null)
		{
			throw new BadRequestException("User is not on database")
		}

		if (this.isWaitingUserId(userId) != -1 || this.isGamingUserId(userId) != -1 || this.isGameCreatingUserId(userId) != -1
			|| this.isGameWaitingUserId(userId) != -1 || this.isGameInviteUserId(userId) != -1)
		{
			throw new BadRequestException("Your are already gaming on other screen")
		}
		result = result + userId + date.getTime().toString()
		result = this.channelService.hashPassword(result)

		let newGame : Game = new Game(this.gameIds, null, null , this)
		this.incrementGameids()
		this.gamesRoom.push(newGame)

		newGame.isReady = false
		newGame.changeInviteId(result)
		this.gamesInvite.push(newGame)


		let clearMethod = function (inviteId : string)
		{
			this.clearInvite(inviteId);
		}.bind(this)

		setTimeout(clearMethod, 20000, result)
		return (result)
	}

	clearInvite(inviteId : string)
	{
		//supprime l'invitation apres le timeout de 20 secondes
		let index = this.gamesInvite.findIndex(game => game.inviteId == inviteId)
		if (index != -1)
		{
			if (this.gamesInvite[index].inviteReady == false)
			{
				if (this.gamesInvite[index].player1Socket != null)
				{
					this.gamesInvite[index].player1Socket.emit("gameNotFound")
				}
				else if (this.gamesInvite[index].player2Socket != null)
				{
					this.gamesInvite[index].player2Socket.emit("gameNotFound")
				}
				if (this.isGameCreatingGameId(this.gamesInvite[index].instanceId) != -1)
				{
					this.gamesCreateRoom = this.gamesCreateRoom.filter(game => game.instanceId !== this.gamesInvite[index].instanceId)
				}
				if (this.isGamingGameId(this.gamesInvite[index].instanceId) != -1)
				{
					this.gamesRoom = this.gamesRoom.filter(game => game.instanceId !== this.gamesInvite[index].instanceId)
				}
				if (this.isGameInviteGameId(this.gamesInvite[index].instanceId) != -1)
				{
					this.gamesInvite = this.gamesInvite.filter(game => game.instanceId !== this.gamesInvite[index].instanceId)
				}
			}
		}
		else
		{
			return;
		}
	}

	async startInvite(client : Socket, data : StartInviteDto)
	{
		let userControl = await this.usersService.findUserEntity({id : data.userId})
		if (userControl == null)
		{
			return
		}
		let index = this.gamesInvite.findIndex(game => game.inviteId == data.gameId)
		if (index != -1)
		{
			this.gamesInvite[index].player1Socket = client
			this.gamesInvite[index].player1DataBaseId = data.userId
			client.emit("waitingPlayerInvite")
		}
		else
		{
			client.emit("gameNotFound")
		}
	}

	async joinInvite(client : Socket, data : JoinInviteDto)
	{
		let userControl = await this.usersService.findUserEntity({id : data.userId})
		if (userControl == null)
		{
			return
		}
		let index = this.gamesInvite.findIndex(game => game.inviteId == data.gameId)
		if (index != -1)
		{
			if (this.isWaitingUserId(data.userId) != -1 || this.isGamingUserId(data.userId) != -1 || this.isGameCreatingUserId(data.userId) != -1
				|| this.isGameWaitingUserId(data.userId) != -1 || this.isGameInviteUserId(data.userId) != -1)
			{
				client.emit("alreadyPlaying")
				this.gamesInvite[index].player1Socket.emit("gameNotFound")
				let index2 = this.isGamingGameId(this.gamesInvite[index].instanceId)
				if (index2 != -1)
				{
					this.gamesRoom.splice(index2, 1)
				}
				this.gamesInvite.splice(index, 1)
				return
			}
			this.gamesInvite[index].player2Socket = client
			this.gamesInvite[index].player2DataBaseId = data.userId
			client.emit("joinedGameInvite", this.gamesInvite[index].instanceId)
			this.gamesInvite[index].isReady = true
			this.gamesCreateRoom.push(this.gamesInvite[index])
			this.gamesInvite[index].createGame()
			this.gamesInvite[index].inviteReady = true
			this.gamesInvite.splice(index, 1)
		}
		else
		{
			client.emit("gameNotFound")
		}
	}

	//Game history functions to add the history to the database
	async createGameHistory(player1Id : string, player2Id : string, scoreP1 : number, scoreP2 : number, winnerId : number)
	{
		let gameHistory = this.gameRepository.create()
		let user1 = await this.usersService.findUserEntity({id : player1Id})
		if (user1 == null)
		{
			//console.log("Can't find user1 for gameHistory")
			return null
		}
		//console.log(user1.id)
		let user2 = await this.usersService.findUserEntity({id : player2Id})
		if (user2 == null)
		{
			//console.log("Can't find user2 for gameHistory")
			return null
		}
		gameHistory.user1 = user1
		gameHistory.user2 = user2
		gameHistory.scoreP1 = scoreP1
		gameHistory.scoreP2 = scoreP2
		if (winnerId == 1)
		{
			gameHistory.winner = user1
		}
		else
		{
			gameHistory.winner = user2
		}
		this.gameRepository.save(gameHistory).then(() => {
			//console.log("Added a game history for " + player1Id + "and " + player2Id)
		}).catch(() => {
			//console.log("Failed to add the game to the history")
		})


	}

	async getMatchHistory(playerId : string): Promise<any[]>
	{
		const matchHistory = await this.gameRepository.find ({
			where: [
				{ user1: { id: playerId } },
				{ user2: { id: playerId } }
			],
			relations: {
				user1: {
					friends: true,
					blockedUsers: true,
				},
				user2: {
					friends: true,
					blockedUsers: true,
				},
				winner: true,
			},
			order: {
				id: "DESC"
			}
		});

		const result = [] as MatchHistoryDto[];
		for (const hist of matchHistory)
			result.push (MatchHistoryDto.fromMatchHistoryEntity (playerId, hist));

		return result;
	}

	getUsersInGame() : string[]
	{
		return (this.usersInGame)
	}
}
