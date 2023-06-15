import { GameService } from "../game.service"
import Ball from "./Ball"
import Paddle from "./Paddle"
import { Socket } from 'socket.io'

export default class gameInstance {

	instanceId : number
	//Player 1 is left bar
	//Player 2 is right bar
	player1Socket : Socket
    player2Socket : Socket
    paddleLeft : Paddle
    paddleRight : Paddle
    ball : Ball
    score : {p1 : number , p2 : number} = { p1 : 0,  p2 : 0}
	timerId : ReturnType<typeof setInterval>
	//canvas dimensions given by the client
	canvas : {width : number, height : number}
	//window dimensions given by the client
	window : {width : number, height : number}
	//Information sur les dimensions du canvas par rapport à la fenetre
	canvasStart : number
	delta : number
	difficulty : number
	gameService : GameService
	isReady : boolean
	color : string
	inviteId : number


	constructor(instanceId : number, player1 : Socket, player2 : Socket, canvas : {width : number, height : number}, window : {width : number, height : number}, gameService : GameService)
	{
		this.instanceId = instanceId
		this.player1Socket = player1
		this.player2Socket = player2
		this.window = window
		this.canvas = canvas
		this.delta = 15
		this.score.p1 = 0
		this.score.p2 = 0
		this.difficulty = 1
		this.gameService = gameService
		this.isReady = false
		this.timerId
		this.color = "red"
		this.inviteId = -1
	}

	createGame()
	{
		console.log("emitting color event")
		this.player1Socket.emit("chooseColor", this.instanceId)
	}

	changeInviteId(Id : number)
	{
		console.log("Changed the invite Id to " + Id)
		this.inviteId = Id
	}

	addColor(color : string)
	{
		console.log("Added color")
		if (color == "default")
		{
			this.player1Socket.emit("chooseDifficulty", this.instanceId)
			return ;
		}
		this.color = color
		this.player1Socket.emit("chooseDifficulty", this.instanceId)

	}

	addDifficulty(data : number)
	{
		console.log("Added the difficulty")
		if (data == 0)
		{
			return ;
		}
		this.difficulty = data
	}
	
	gameLoop()
	{
		this.ball.update(this.paddleLeft.getPaddlePos(), this.paddleRight.getPaddlePos())
		if (this.isLose())
		{
			this.handleLose()
		}
		if (this.score.p1 >= 10 || this.score.p2 >= 10)
		{
			this.handleWin()
		}
		this.player1Socket.emit('ballUpdate', this.ball.getcenterpos())
		this.player1Socket.emit('ownPaddle', this.paddleLeft.getPaddlePos())
		this.player1Socket.emit('otherPaddle', this.paddleRight.getPaddlePos())
		

		this.player2Socket.emit('ballUpdate', this.ball.getcenterpos())
		this.player2Socket.emit('ownPaddle', this.paddleRight.getPaddlePos())
		this.player2Socket.emit('otherPaddle', this.paddleLeft.getPaddlePos())

	}

	isLose() 
	{
		if (this.ball.getcenterpos().x + this.ball.radius >= this.canvas.width)
			return (1)

		if (this.ball.getcenterpos().x - this.ball.radius <= 1)
			return (1)
		return (0)
	}

	handleLose() 
	{
		if (this.ball.getcenterpos().x + this.ball.radius >= this.canvas.width)
		{
			this.score.p1 += 1
			this.player2Socket.emit('score', this.score)
			this.player1Socket.emit('score', this.score)
		}
		else 
		{
			this.score.p2 += 1
			this.player1Socket.emit('score', this.score)
			this.player2Socket.emit('score', this.score)
		}
		this.ball.reset()
		this.paddleLeft.reset()
		this.paddleRight.reset()
	}

	handleWin()
	{
		if (this.score.p1 >= 10)
		{
			this.player1Socket.emit("winGame")
			this.player2Socket.emit("looseGame")
			this.stopGame()
		}
		if (this.score.p2 >= 10)
		{
			this.player2Socket.emit("winGame")
			this.player1Socket.emit("looseGame")
			this.stopGame()
		}
	}

	startGame() 
	{
		//Lancement de la partie en dehors de la loop
		this.ball = new Ball(this.canvas, 100, 100, {x: 10 , y: 10}, this.color, 10, this.delta)
		this.paddleLeft = new Paddle(this.canvas, "white", 5, true, this.difficulty)
		this.paddleRight = new Paddle(this.canvas, "white", this.canvas.width - 5, false, this.difficulty)
		this.score.p1 = 0
		this.score.p2 = 0
		console.log("starting a game with ")
		console.log(this.player1Socket.id)
		console.log(this.player2Socket.id)


		//Lancement de la loop et déplacement balles et paddle
		this.timerId = setInterval(this.gameLoop.bind(this), this.delta)


		//Fin de la partie 
	}

	updatePaddlePos(player : Socket, paddlePos : number)
	{
		if (player.id === this.player1Socket.id)
		{
			this.paddleLeft.setYpos(paddlePos)
		}
		else if (player.id === this.player2Socket.id)
		{
			this.paddleRight.setYpos(paddlePos)
		}
	}

	stopGame()
	{
		clearInterval(this.timerId)
		this.gameService.stopGame(this.instanceId)
	}

	disconnectPlayer1()
	{
		console.log("Disconnect from player 1")
		this.player2Socket.emit("otherPlayerDisconnected")
		this.stopGame()
	}

	disconnectPlayer2()
	{
		console.log("Disconnect from player 2")
		this.player1Socket.emit("otherPlayerDisconnected")
		this.stopGame()
	}
}