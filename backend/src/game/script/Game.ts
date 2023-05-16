import Ball from "./Ball"
import Paddle from "./Paddle"
import { Socket } from 'socket.io'

export default class gameInstance {

	player1Socket : Socket
    player2Socket : Socket
    paddleLeft : Paddle
    paddleRight : Paddle
    ball : Ball
    score : {p1 : number, p2 : number}
	timerId : ReturnType<typeof setInterval>
	//canvas dimensions given by the client
	canvas : {width : number, height : number}
	//window dimensions given by the client
	window : {width : number, height : number}
	//Information sur les dimensions du canvas par rapport à la fenetre
	canvasStart : number
	delta : number


	constructor(player1 : Socket, player2 : Socket, canvas : {width : number, height : number}, window : {width : number, height : number})
	{
		this.player1Socket = player1
		this.player2Socket = player2
		this.window = window
		this.canvas = canvas
		this.delta = 16
	}
	
	gameLoop()
	{
		this.ball.update(this.delta, this.paddleLeft.getPaddlePos(), this.paddleRight.getPaddlePos())
		if (this.isLose())
		{
			this.handleLose()
		}
		
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
		}
		else 
		{
			this.score.p2 += 1
		}
		this.ball.reset()
		this.paddleLeft.reset()
		this.paddleRight.reset()
	}

	startGame() 
	{
		//Lancement de la partie en dehors de la loop
		this.ball = new Ball(this.canvas, 100, 100, {x: 10 , y: 10}, "red", 8)
		this.paddleLeft = new Paddle(this.canvas, "white", 5, true)
		this.paddleRight = new Paddle(this.canvas, "white", this.canvas.width - 5, true)
		this.score.p1 = 0
		this.score.p2 = 0



		//Lancement de la loop et déplacement balles et paddle
		this.timerId = setInterval(this.gameLoop.bind(this), this.delta)


		//Fin de la partie 
	}

}