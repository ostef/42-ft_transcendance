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



	quitWaitRoom(client : Socket)
	{
		console.log("Quitting the wait room for ", client.id)
		this.waitRoom = this.waitRoom.filter( socket => socket.id !== client.id)
	}

	addPlayerToWaitRoom(client : Socket)
	{
		console.log("adding client to wait room", client.id)
		this.waitRoom.push(client)
	}

	quitGame(client : Socket, gameId : number)
	{
		//Todo fonction qui permet de stopper une game
		let game = this.gamesRoom.find( game => {
			game.instanceId === gameId
		})
	}

	createGame(client : Socket, data : any)
	{
		if (this.waitRoom.length >= 1)
		{
			let newGame : Game = new Game(this.gamesRoom.length, client, this.waitRoom.pop() , data.canvas, data.window, this)
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
			console.log("new game id : ", newGame.instanceId)
			newGame.createGame()
			newGame.isReady = false
			this.gamesCreateRoom.push(newGame)
		}
	}

	findGame(client : Socket, data : any) : {player1 : Socket | null, instanceId : number, difficulty : number}
	{
		console.log("trying to find a game for ", client.id)
		if (this.gamesWaitingRoom.length >= 1)
		{
			//Player 1 is left bar 
			//Player 2 is right bar
			let newGame = this.gamesWaitingRoom.shift()
			this.gamesRoom.push(newGame)
			newGame.player2Socket = client
			newGame.startGame()
			//Return le deuxième joueur au gateway pour pouvoir le prévenir
			return ({player1 : newGame.player1Socket, instanceId : newGame.instanceId, difficulty : newGame.difficulty})
		}
		else if (this.waitRoom.length >= 1)
		{
			//Si il y a un autre joueur en attente on créé une game par défault
			let client2 = this.waitRoom.pop()

			this.addWaitingGame(client, client2, data, true)
			console.log("Created a game with a difficulty")
			return ({player1 : null, instanceId : -2, difficulty : 0})
		}
		else
		{
			//Sinon on l'ajoute à la waitroom
			this.waitRoom.push(client)
			console.log("adding player to waitroom")
			return ({player1 : null, instanceId : -1, difficulty : 0})

		}
	}

	addWaitingGame(client : Socket, client2 : Socket, data : any, ready : boolean)
	{
		let newGame : Game = new Game(this.gamesRoom.length, client, client2 , data.canvas, data.window, this)
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

	redirectGame(currentGame : Game)
	{
		if (currentGame.isReady === false)
		{
			console.log("adding diffuclty")
			this.gamesWaitingRoom.push(currentGame)
			let index = this.gamesCreateRoom.findIndex(game => {
				game.instanceId == currentGame.instanceId
			})
			this.gamesCreateRoom.splice(index, 1)
		}
		else
		{
			this.gamesRoom.push(currentGame)
			let index = this.gamesCreateRoom.findIndex(game => {
				game.instanceId == currentGame.instanceId
			})
			this.gamesCreateRoom.splice(index, 1)
			currentGame.startGame()
			currentGame.player1Socket.emit("foundGame", "left", currentGame.instanceId, currentGame.difficulty)
			currentGame.player2Socket.emit("foundGame", "right", currentGame.instanceId, currentGame.difficulty)
			
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
		let index = this.gamesRoom.findIndex((game) => {
			game.instanceId == gameId
		})
		console.log(index)
		this.gamesRoom.splice(index, 1)
	}
}
