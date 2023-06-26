import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Socket } from 'socket.io';

import Game from "./script/Game"
import { read } from 'fs';
import { gameHistoryEntity } from './entities/gameHistory.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import cluster from 'cluster';

@Injectable()
export class GameService {


    //Todo Creer un module qui s'occupe du matchmaking et de la gestion des instances 
    //et sauvegarde des scores etc.

	//Emplacement des joueurs qui attendent une game
	//Lorsqu'une personne arrive dans la waitroom on regarde si
	//on peut lancer une game a deux, sinon il est ajouté à la wairoom
	waitRoom : Socket[] = []
	gamesRoom : Game[] = []
	gamesWaitingRoom : Game[] = []
	gamesCreateRoom : Game[] = []
	gamesInvite : Game[] = []

	constructor(
		@InjectRepository (gameHistoryEntity)
        private gameRepository: Repository<gameHistoryEntity>,

		private usersService: UsersService,
	) {}

	quitWaitRoom(client : Socket)
	{
		console.log("Quitting the wait room for ", client.id)
		this.waitRoom = this.waitRoom.filter( socket => socket.id !== client.id)
	}

	quitGameWaitingRoom(socketId : string, gameIndex : number)
	{
		console.log("Quitting the gamewaiting room for " + socketId)
		this.gamesWaitingRoom = this.gamesWaitingRoom.filter(game => game.player1Socket.id !== socketId)
		this.gamesWaitingRoom = this.gamesWaitingRoom.filter(game => game.player2Socket.id !== socketId)
	}

	quitGameCreateRoom(socketId : string, gameIndex : number)
	{
		console.log("Quitting the gamecreateroom room for " + socketId)
		this.gamesCreateRoom = this.gamesCreateRoom.filter(game => game.player1Socket.id !== socketId)
		this.gamesCreateRoom = this.gamesCreateRoom.filter(game => game.player2Socket.id !== socketId)
	}

	quitGameInvite(socketId : string)
	{
		console.log("Quitting the Game Invite room room for " + socketId)
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

	addPlayerToWaitRoom(client : Socket)
	{
		console.log("adding client to wait room", client.id)
		this.waitRoom.push(client)
	}

	createGame(client : Socket, data : any)
	{
		if (this.waitRoom.length >= 1)
		{
			let newGame : Game = new Game(this.gamesRoom.length, client, this.waitRoom.pop(), this)
			this.gamesRoom.push(newGame)
			console.log("new game id : ", newGame.instanceId)
			newGame.createGame()
			newGame.isReady = true
			this.gamesCreateRoom.push(newGame)
			return
		}
		else
		{
			console.log("empty newgame")
			let newGame : Game = new Game(this.gamesRoom.length, client, client, this)
			this.gamesRoom.push(newGame)
			console.log("new game id : ", newGame.instanceId)
			newGame.createGame()
			newGame.isReady = false
			this.gamesCreateRoom.push(newGame)
		}
	}

	findGame(client : Socket, data : any) : {player1 : Socket | null, instanceId : number, difficulty : number, color : string}
	{
		console.log("trying to find a game for ", client.id)
		if (this.gamesWaitingRoom.length >= 1)
		{
			//Player 1 is left bar 
			//Player 2 is right bar
			let newGame = this.gamesWaitingRoom.shift()
			newGame.player2Socket = client
			newGame.startGame()
			//Return le deuxième joueur au gateway pour pouvoir le prévenir
			return ({player1 : newGame.player1Socket, instanceId : newGame.instanceId, difficulty : newGame.difficulty, color : newGame.color})
		}
		else if (this.waitRoom.length >= 1)
		{
			//Si il y a un autre joueur en attente on créé une game par défault
			let client2 = this.waitRoom.pop()

			this.addWaitingGame(client, client2, data, true)
			console.log("Created a game with a difficulty")
			return ({player1 : null, instanceId : -2, difficulty : 0, color : ""})
		}
		else
		{
			//Sinon on l'ajoute à la waitroom
			this.waitRoom.push(client)
			console.log("adding player to waitroom")
			return ({player1 : null, instanceId : -1, difficulty : 0, color : ""})

		}
	}

	addWaitingGame(client : Socket, client2 : Socket, data : any, ready : boolean)
	{
		let newGame : Game = new Game(this.gamesRoom.length, client, client2 , this)
		this.gamesRoom.push(newGame)
		console.log("new game id : ", newGame.instanceId)
		if (ready === true)
		{
			newGame.isReady = true
		}
		newGame.createGame()
		this.gamesCreateRoom.push(newGame)
	}

	addDifficulty(client : Socket, data : any)
	{
		console.log("adding diffuclty")
		let currentInstance = null
		for (let game of this.gamesCreateRoom)
		{
			if (game.instanceId == data.gameId)
			{
				currentInstance = game
				break
			}
		}
		currentInstance.addDifficulty(data.difficulty)
		this.redirectGame(currentInstance)
		//this.gamesWaitingRoom.push(currentInstance)
	}

	addColor(client : Socket, data : any)
	{
		console.log("adding color")
		let currentInstance = null
		for (let game of this.gamesCreateRoom)
		{
			if (game.instanceId == data.gameId)
			{
				currentInstance = game
				break
			}
		}
		console.log(data.color)
		currentInstance.addColor(data.color)
		console.log(currentInstance.color)
	}

	redirectGame(currentGame : Game)
	{
		if (currentGame.isReady === false)
		{
			this.gamesWaitingRoom.push(currentGame)
			let index = this.gamesCreateRoom.findIndex(game => 
				game.instanceId == currentGame.instanceId
			)
			this.gamesCreateRoom.splice(index, 1)
		}
		else
		{
			let index = this.gamesCreateRoom.findIndex(game => 
				game.instanceId == currentGame.instanceId
			)
			this.gamesCreateRoom.splice(index, 1)
			currentGame.startGame()
			currentGame.player1Socket.emit("foundGame", "left", currentGame.instanceId, currentGame.difficulty, currentGame.color)
			currentGame.player2Socket.emit("foundGame", "right", currentGame.instanceId, currentGame.difficulty, currentGame.color)
			
		}
	}

	addUserIdToGame(client : Socket, gameId : number, userId : string)
	{
		console.log("Added userId to the game " + userId)	
		let currentInstance = null
		for (let game of this.gamesRoom)
		{
			if (game.instanceId == gameId)
			{
				currentInstance = game
				break
			}
		}
		if (currentInstance.player1Socket.id == client.id)
		{
			currentInstance.player1DataBaseId = userId
		}
		if (currentInstance.player2Socket.id == client.id)
		{
			currentInstance.player2DataBaseId = userId
		}
	}

	updatePaddlePos(client : Socket, gameId : number, paddlePos : number)
	{
		let currentInstance = null
		for (let game of this.gamesRoom)
		{
			if (game.instanceId == gameId)
			{
				currentInstance = game
				break
			}
		}
		currentInstance.updatePaddlePos(client, paddlePos)
	}

	stopGame(gameId : number)
	{
		let index = this.gamesRoom.findIndex(game => 
			game.instanceId == gameId
		)
		if (index != -1)
		{
			this.createGameHistory(this.gamesRoom[index].player1DataBaseId, 
				this.gamesRoom[index].player2DataBaseId, 
				this.gamesRoom[index].score.p1, this.gamesRoom[index].score.p2)
			this.gamesRoom.splice(index, 1)
		}
	}


	disconnectPlayer(socketId : string)
	{
		//On check si le joueur etait en game et si oui on la coupe pour deconnexion
		let index = this.isGaming(socketId)
		if (index != -1)
		{
			if (this.gamesRoom[index].player1Socket.id == socketId)
				this.gamesRoom[index].disconnectPlayer1();
			else if (this.gamesRoom[index].player2Socket.id == socketId)
			{
				this.gamesRoom[index].disconnectPlayer2();
			}
		}
		//Ensuite on check si il etait en waitroom et on l'enleve
		index = this.isWaiting(socketId)
		if (index != -1)
		{
			this.quitWaitRoom(this.waitRoom[index])
		}
		
		//On eleve les game de la create room en cas de deconnexion
		index = this.isGameCreating(socketId)
		if (index != -1)
		{
			if (this.gamesCreateRoom[index].player1Socket.id == socketId)
			{
				this.gamesCreateRoom[index].disconnectPlayer1()
			}
			else if (this.gamesCreateRoom[index].player2Socket.id == socketId)
			{
				this.gamesCreateRoom[index].disconnectPlayer2()
			}
			this.quitGameCreateRoom(socketId, index)
		}
		// On enleve les games en gamewaiting room
		index = this.isGameWaiting(socketId)
		if (index != -1)
		{
			this.gamesWaitingRoom[index].disconnectPlayer1()
			this.quitGameWaitingRoom(socketId, index)
		}

		//Todo : faire le disconect pour les invits
		index = this.isGameInvite(socketId)
		if (index != -1)
		{
			if (this.gamesInvite[index].player1Socket)
			{
				if (this.gamesInvite[index].player1Socket.id == socketId)
					this.gamesInvite[index].disconnectPlayer1()
			}
			else if (this.gamesInvite[index].player2Socket)
			{
				if (this.gamesInvite[index].player2Socket.id == socketId)
				{
					this.gamesInvite[index].disconnectPlayer2()
				}
			}
			this.quitGameInvite(socketId)
		}
	}

	isGaming(socketId : string)
	{
		let index = this.gamesRoom.findIndex(game => 
			game.player1Socket.id == socketId 
		)
		if (index == -1)
		{
			index = this.gamesRoom.findIndex(game => 
				game.player2Socket.id == socketId 
			)
		}
		return (index)
	}

	isWaiting(socketId : string)
	{
		let index =  this.waitRoom.findIndex(id => id.id == socketId)
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

	isGameWaiting(socketId : string)
	{
		let index = this.gamesWaitingRoom.findIndex(game => game.player1Socket.id == socketId)
		if (index == -1)
		{
			index  = this.gamesWaitingRoom.findIndex(game => game.player2Socket.id == socketId)
		}
		return (index)
	}

	isGameInvite(socketId : string)
	{
		let index = this.gamesInvite.findIndex(game => {
			if (game.player1Socket)
			{
				game.player1Socket.id == socketId
			}})
		if (index == -1)
		{
			index  = this.gamesInvite.findIndex(game => {
				if (game.player2Socket)
				{
					game.player2Socket.id == socketId
				}
			})
		}
		return (index)
	}


	//Creation d'invitation 
	createInvite()
	{
		let newGame : Game = new Game(this.gamesRoom.length, null, null , this)
		this.gamesRoom.push(newGame)
		newGame.isReady = false
		newGame.changeInviteId(this.gamesInvite.length)
		this.gamesInvite.push(newGame)
		//Todo mettre un timeout si le createur arrive pas sur la page, on detruit la game
		//Todo : envoyer un message a l'autre mec qui va devoir join via le chat servcie de steff
		
		return (newGame.inviteId)
	}

	startInvite(client : Socket, data : any)
	{
		let index = this.gamesInvite.findIndex(game => game.inviteId == data.instanceId)
		if (index != -1)
		{
			this.gamesInvite[index].player1Socket = client
			client.emit("waitingPlayerInvite")
		}
		else
		{
			client.emit("gameNotFound")
		}
	}

	joinInvite(client : Socket, gameId : number)
	{
		let index = this.gamesInvite.findIndex(game => game.inviteId == gameId)
		if (index != -1)
		{
			this.gamesInvite[index].player2Socket = client

			client.emit("joinedGameInvite", this.gamesInvite[index].instanceId)
			this.gamesInvite[index].isReady = true
			this.gamesCreateRoom.push(this.gamesInvite[index])
			this.gamesInvite[index].createGame()
			this.gamesInvite.splice(index, 1)
		}
		else
		{
			client.emit("gameNotFound")
		}
	}

	//Create History 

	async createGameHistory(player1Id : string, player2Id : string, scoreP1 : number, scoreP2 : number)
	{
		let gameHistory = this.gameRepository.create()
		let user1 = await this.usersService.findUserEntity({id : player1Id})
		if (user1 == null)
		{
			console.log("Can't find user1 for gameHistory")
			// throw new HttpException("can't find user", HttpStatus.BAD_REQUEST);
			return null
		}
		console.log(user1.id)
		let user2 = await this.usersService.findUserEntity({id : player2Id})
		if (user2 == null)
		{
			console.log("Can't find user2 for gameHistory")
			return null
		}
		gameHistory.user1 = user1
		gameHistory.user2 = user2
		gameHistory.scoreP1 = scoreP1
		gameHistory.scoreP2 = scoreP2
		this.gameRepository.save(gameHistory).then(() => {
			console.log("Added a game history for " + player1Id + "and " + player2Id)
		}).catch(() => {
			console.log("Failed to add the game to the history")
		})

	}
}
