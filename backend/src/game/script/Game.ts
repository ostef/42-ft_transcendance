import { GameService } from "../game.service"
import Ball from "./Ball"
import Paddle from "./Paddle"
import { Socket } from 'socket.io'

const MAX_SCORE = 10;

export default class gameInstance {

	instanceId : number
	//Player 1 is left bar
	//Player 2 is right bar
	player1Socket : Socket
	player1DataBaseId : string
    player2Socket : Socket
	player2DataBaseId : string
    paddleLeft : Paddle
    paddleRight : Paddle
    ball : Ball
    score : {p1 : number , p2 : number} = { p1 : 0,  p2 : 0}
	timerId : ReturnType<typeof setInterval>
	//Information sur les dimensions du canvas par rapport à la fenetre
	delta : number
	difficulty : string
	maxScore : number
	gameService : GameService
	isReady : boolean
	color : string
	inviteId : string
	isConfig : boolean
	isPlaying : boolean
	isWinner : number
	spectators : Socket[] = []
	inviteReady : boolean



	constructor(instanceId : number, player1 : Socket, player2 : Socket, gameService : GameService)
	{
		this.instanceId = instanceId
		this.player1Socket = player1
		this.player2Socket = player2
		this.delta = 5
		this.score.p1 = 0
		this.score.p2 = 0
		this.difficulty = "default"
		this.maxScore = MAX_SCORE
		this.gameService = gameService
		this.isReady = false
		this.timerId
		this.color = "red"
		this.inviteId = ""
		this.isConfig = false
		this.inviteReady = false
	}

	createGame()
	{
		this.player1Socket.emit("configurateGame", this.instanceId)
	}

	changeInviteId(Id : string)
	{
		this.inviteId = Id
	}

	addColor(color : string)
	{
		if (color != "default" && color != "green" && color != "red" && color != "black")
		{
			return ;
		}
		if (this.color == "default")
			return ;
		this.color = color
	}

	addDifficulty(data : string)
	{
		if (data != "default" && data != "easy" && data != "medium" && data != "hard")
		{
			return ;
		}
		this.difficulty = data
	}

	addMaxScore(data : number)
	{
		if (data <= 5 || data >= 20)
		{
			return ;
		}
		this.maxScore = data
	}

	gameLoop()
	{
		this.ball.update(this.paddleLeft.getPaddlePos(), this.paddleRight.getPaddlePos())
		if (this.isLose())
		{
			this.handleLose()
		}
		if (this.score.p1 >= MAX_SCORE  || this.score.p2 >= MAX_SCORE)
		{
			this.handleWin()
		}
		this.player1Socket.emit('ballUpdate', this.ball.getcenterpos())
		this.player1Socket.emit('ownPaddle', this.paddleLeft.getPaddlePos())
		this.player1Socket.emit('otherPaddle', this.paddleRight.getPaddlePos())


		this.player2Socket.emit('ballUpdate', this.ball.getcenterpos())
		this.player2Socket.emit('ownPaddle', this.paddleRight.getPaddlePos())
		this.player2Socket.emit('otherPaddle', this.paddleLeft.getPaddlePos())

		for (let spectator of this.spectators)
		{
			spectator.emit('ballUpdate', this.ball.getcenterpos())
			spectator.emit('ownPaddle', this.paddleRight.getPaddlePos())
			spectator.emit('otherPaddle', this.paddleLeft.getPaddlePos())
		}
	}

	isLose()
	{
		if (this.ball.getcenterpos().x + this.ball.radius >= 1)
			return (1)

		if (this.ball.getcenterpos().x - this.ball.radius <= 0)
			return (1)
		return (0)
	}

	handleLose()
	{
		if (this.ball.getcenterpos().x + this.ball.radius >= 1)
		{
			this.score.p1 += 1
			this.player2Socket.emit('score', this.score)
			this.player1Socket.emit('score', this.score)
			for (let spectator of this.spectators)
			{
				spectator.emit('score', this.score)
			}
		}
		else
		{
			this.score.p2 += 1
			this.player1Socket.emit('score', this.score)
			this.player2Socket.emit('score', this.score)
			for (let spectator of this.spectators)
			{
				spectator.emit('score', this.score)
			}
		}
		this.ball.reset()
		this.paddleLeft.reset()
		this.paddleRight.reset()
	}

	handleWin()
	{
		if (this.score.p1 >= MAX_SCORE)
		{
			this.isWinner = 1
			this.player1Socket.emit("winGame")
			this.player2Socket.emit("looseGame")
			for (let spectator of this.spectators)
			{
				spectator.emit('endOfSpectate')
			}
			this.stopGame()
		}
		if (this.score.p2 >= MAX_SCORE)
		{
			this.isWinner = 2
			this.player2Socket.emit("winGame")
			this.player1Socket.emit("looseGame")
			for (let spectator of this.spectators)
			{
				spectator.emit('endOfSpectate')
			}
			this.stopGame()
		}
	}

	startGame()
	{
		//Lancement de la partie en dehors de la loop
		this.ball = new Ball(0.5, 0.5, {x: 0.0001 , y: 0.0001}, this.color, 0.008, this.delta)
		this.paddleLeft = new Paddle("white", 0.01, true, this.difficulty)
		this.paddleRight = new Paddle("white", 1 - 0.01, false, this.difficulty)
		this.score.p1 = 0
		this.score.p2 = 0
		this.isPlaying = true


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
		if (this.player2Socket)
		{
			this.player2Socket.emit("otherPlayerDisconnectedGame")
			for (let spectator of this.spectators)
			{
				spectator.emit('endOfSpectateDisconnect')
			}
		}
		this.isWinner = 2
		this.stopGame()
	}

	disconnectPlayer2()
	{
		if (this.player1Socket)
		{
			this.player1Socket.emit("otherPlayerDisconnectedGame")
			for (let spectator of this.spectators)
			{
				spectator.emit('endOfSpectateDisconnect')
			}
		}
		this.isWinner = 1
		this.stopGame()
	}

	stopGameBeforeStart()
	{
		this.gameService.stopGameBeforeStart(this.instanceId)
	}

	disconnectPlayerBeforeStart(playerId : string)
	{
		if (this.player1Socket)
		{
			if (playerId == this.player1Socket.id)
			{
				if (this.player2Socket && this.player2Socket.id != this.player1Socket.id)
				{
					this.player2Socket.emit('OtherPlayerDisconnected')
				}
			}
		}
		if (this.player2Socket)
		{
			if (playerId == this.player2Socket.id)
			{
				if (this.player1Socket)
				{
					this.player1Socket.emit('OtherPlayerDisconnected')
				}
			}
		}
		this.stopGameBeforeStart()
	}

	disconnectSpectator(socketId : string)
	{
		this.spectators = this.spectators.filter(spectator =>
			spectator.id !== socketId)
	}

	addSpectator(client : Socket)
	{
		this.spectators.push(client)
		client.emit('score', this.score)
	}
}