import { Injectable, NotFoundException } from '@nestjs/common';
import { Socket } from 'socket.io';

import Game from "./script/Game"

@Injectable()
export class GameService {


    //Todo Creer un module qui s'occupe du matchmaking et de la gestion des instances 
    //et sauvegarde des scores etc.

	//Emplacement des joueurs qui attendent une game
	//Lorsqu'une personne arrive dans la waitroom on regarde si
	//on peut lancer une game a deux, sinon il est ajouté à la wairoom
	waitRoom : Socket[] = []
	gamesRoom : Game[] = []



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

	findGame(client : Socket, data : any) : {player2 : Socket | null, instanceId : number}
	{
		console.log("trying to find a game for ", client.id)
		if (this.waitRoom.length >= 1)
		{
			//Todo create a game with two players
			//Player 1 is left bar 
			//Player 2 is right bar
			let newGame : Game = new Game(this.gamesRoom.length, client, this.waitRoom.pop(), data.canvas, data.window)
			console.log("new game id : ", newGame.instanceId)
			this.gamesRoom.push(newGame)
			newGame.startGame()
			//Return le deuxième joueur au gateway pour pouvoir le prévenir
			return ({player2 : newGame.player2Socket, instanceId : newGame.instanceId})
		}
		else
		{
			//Si moins de 2 joueurs on l'ajoute a la waitroom
			this.addPlayerToWaitRoom(client)
			return ({player2 : null, instanceId : -1})
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
}
