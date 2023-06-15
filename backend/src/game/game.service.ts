import { Injectable, NotFoundException } from '@nestjs/common';
import { Socket } from 'socket.io';

import Game from "./script/Game"
import { read } from 'fs';

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
		this.gamesRoom = this.gamesRoom.filter(game => game.player1Socket.id !== socketId)
		this.gamesRoom = this.gamesRoom.filter(game => game.player2Socket.id !== socketId)
	}

	quitGameCreateRoom(socketId : string, gameIndex : number)
	{
		console.log("Quitting the gamecreateroom room for " + socketId)
		this.gamesCreateRoom = this.gamesCreateRoom.filter(game => game.player1Socket.id !== socketId)
		this.gamesCreateRoom = this.gamesCreateRoom.filter(game => game.player2Socket.id !== socketId)
		this.gamesRoom = this.gamesRoom.filter(game => game.player1Socket.id !== socketId)
		this.gamesRoom = this.gamesRoom.filter(game => game.player2Socket.id !== socketId)
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
			let newGame : Game = new Game(this.gamesRoom.length, client, this.waitRoom.pop() , data.canvas, data.window, this)
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
			let newGame : Game = new Game(this.gamesRoom.length, client, client , data.canvas, data.window, this)
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
		let newGame : Game = new Game(this.gamesRoom.length, client, client2 , data.canvas, data.window, this)
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
		this.gamesRoom.splice(index, 1)
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
			console.log(index)
			console.log(this.gamesCreateRoom[index])
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
		// Todo : Enelever si il y a une game en waitGameroom
		index = this.isGameWaiting(socketId)
		if (index != -1)
		{
			this.gamesWaitingRoom[index].disconnectPlayer1()
			this.quitGameWaitingRoom(socketId, index)
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


	//Creation d'invitation 
	createInvite( data : any )
	{
		let newGame : Game = new Game(this.gamesRoom.length, null, null , null, null, this)
		this.gamesRoom.push(newGame)
		newGame.isReady = false
		newGame.changeInviteId(this.gamesInvite.length)
		this.gamesInvite.push(newGame)
		//Todo : envoyer un message a l'autre mec qui va devoir join via le chat servcie de steff
		return (newGame.inviteId)
	}

	startInvite(client : Socket, data : any)
	{
		let index = this.gamesInvite.findIndex(game => game.inviteId == data.instanceId)
		if (index != -1)
		{
			this.gamesInvite[index].player1Socket = client
			this.gamesInvite[index].canvas = data.canvas
			this.gamesInvite[index].window = data.window
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
}
