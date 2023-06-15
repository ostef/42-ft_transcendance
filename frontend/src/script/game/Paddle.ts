const SPEED = 0.5

type Point = {x: number; y: number}
type Segment = { A: Point; B : Point}

export default class Paddle {
	//Always use setter on ypos xpos height and width even inside class
	ypos : number = 0 // Center position of the paddle
	xpos : number // Center position of the paddle
	height : number = 0
	width : number = 0
	color : string
	canvasAbsoluteStart : number // Départ haut du canvas en fonction de la taille décidée 
	// Ce départ sert à positionner les paddle correctement dans le canvas
	mainCanvas : any
	context : CanvasRenderingContext2D | null | undefined = null
	//There is only a getter on this one, do not set it manually, it is set with the other setters 
	paddlePos : {height : number, width: number, centerPos : {x : number, y : number}, front : Segment}
	frontSegment : Segment
	player : boolean

	constructor(canvas : string, color :string, xpos : number, player : boolean, difficulty : number) {
		//True is left, False is right
		this.player = player
		this.xpos = xpos
		this.color = color
		this.ypos = 0
		this.canvasAbsoluteStart = 20 / 100
		this.mainCanvas = document.querySelector(canvas)
		this.height = this.setDifficulty(difficulty)
		this.width = 10
		this.context = this.mainCanvas.getContext("2d")
		this.frontSegment = { A : {x : 0, y : 0}, B : {x : 0, y : 0} }
		this.paddlePos = { height : this.height, width : this.width, 
			centerPos : {x : this.xpos, y : this.ypos}, front : this.frontSegment}
		this.setYpos(this.mainCanvas?.height / 2)
		if (player)
		{
			this.frontSegment = { A : { x : this.xpos + this.width / 2, y : this.ypos - this.height / 2}, 
			B : {x : this.xpos + this.width / 2, y : this.ypos + this.height / 2}}
		}
		else
		{
			this.frontSegment = { A : { x : this.xpos - this.width / 2, y : this.ypos - this.height / 2}, 
			B : {x : this.xpos - this.width / 2, y : this.ypos + this.height / 2}}
		}
		this.paddlePos = { height : this.height, width : this.width, 
			centerPos : {x : this.xpos, y : this.ypos}, front : this.frontSegment}
		this.reset()
	}

	getXpos()
	{
		return(this.xpos)
	}

	getYpos()
	{
		return(this.ypos)
	}

	getPaddlePos()
	{
		return(this.paddlePos)
	}

	getHeight()
	{
		return(this.height)
	}

	getWidth()
	{
		return(this.width)
	}

	setDifficulty(difficulty : number) : number
	{
		if (difficulty === 1)
		{
			return this.mainCanvas.height / 7
		}
		if (difficulty === 2)
		{
			return (this.mainCanvas.height / 9)
		}
		if (difficulty === 3)
		{
			return this.mainCanvas.height / 11
		}
		return 0
	}

	setXpos(value : number) : void
	{
		this.xpos = value
		this.paddlePos.centerPos.x = value
		if (this.player)
		{
			this.frontSegment.A.x = this.xpos + this.width / 2
			this.frontSegment.B.x = this.xpos + this.width / 2
			this.paddlePos.front = this.frontSegment
		}
		else
		{
			this.frontSegment.A.x = this.xpos - this.width / 2
			this.frontSegment.B.x = this.xpos - this.width / 2
			this.paddlePos.front = this.frontSegment
		}
	}

	setYpos(value : number) : void
	{
		this.ypos = value
		this.paddlePos.centerPos.y = value

		this.frontSegment.A.y = this.ypos - this.height / 2
		this.frontSegment.B.y = this.ypos + this.height / 2
		this.paddlePos.front = this.frontSegment
	}

	setHeight(value : number): void
	{
		this.height = value
		this.paddlePos.height = value

		this.frontSegment.A.y = this.ypos - this.height / 2
		this.frontSegment.B.y = this.ypos + this.height / 2
		this.paddlePos.front = this.frontSegment
	}

	setWidth(value : number)
	{
		this.width = value
		this.paddlePos.width = value
		if (this.player)
		{
			this.frontSegment.A.x = this.xpos + this.width / 2
			this.frontSegment.B.x = this.xpos + this.width / 2
			this.paddlePos.front = this.frontSegment
		}
		else
		{
			this.frontSegment.A.x = this.xpos - this.width / 2
			this.frontSegment.B.x = this.xpos - this.width / 2
			this.paddlePos.front = this.frontSegment
		}
	}

	draw(id : number)
	{
		if (this.context !== null && this.context !== undefined && this.mainCanvas)
		{
			if (id === 0)
			{
				if (this.player)
				{
					
					this.context.fillStyle = this.color
					this.context.fillRect(this.xpos - this.width / 2, this.ypos - this.height / 2, this.width, this.height)
					return
				}
				else
				{
					this.context.fillStyle = this.color
					this.context.fillRect(this.xpos - this.width / 2, this.ypos - this.height / 2, this.width, this.height)
					return
				}
			}
			if (id === 1)
			{
				if (this.ypos <= this.height / 2)
				{
					this.setYpos(this.height / 2)
				}
				if (this.ypos >= this.mainCanvas.height - this.height / 2)
				{
					this.setYpos(this.mainCanvas.height - this.height / 2)
				}
				this.context.fillStyle = this.color
				this.context.fillRect(this.xpos - this.width / 2, this.ypos - this.height / 2, this.width , this.height)
			}
		}
	}

	reset() 
	{
		if (this.mainCanvas)
			this.setYpos(this.mainCanvas?.height / 2)
	}

	updatecomputer(ballHeight : number) 
	{
		let under = false
		if (ballHeight - this.ypos <= 0)
		{
			under = true
		}
		this.setYpos(this.getYpos() + SPEED * (ballHeight - this.ypos))
		if (under)
		{
			if (ballHeight - this.ypos > 0)
				this.setYpos(ballHeight)
		}
		else
		{
			if (ballHeight - this.ypos < 0)
				this.setYpos(ballHeight)
		}
	}

	updateplayer(mouseHeight : number)
	{
		
	}
}