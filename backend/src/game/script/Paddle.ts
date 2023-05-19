const SPEED = 0.5

type Point = {x: number; y: number}
type Segment = { A: Point; B : Point}


export default class Paddle {
	//Always use setter on ypos xpos height and width even inside class
	#ypos : number = 0 // Center position of the paddle
	#xpos : number // Center position of the paddle
	#height : number = 0
	#width : number = 0
	color : string
	canvasAbsoluteStart : number // Départ haut du canvas en fonction de la taille décidée 
	// Ce départ sert à positionner les paddle correctement dans le canvas
	mainCanvas : {width : number, height : number}
	context : CanvasRenderingContext2D | null | undefined = null
	//There is only a getter on this one, do not set it manually, it is set with the other setters 
	#paddlePos : {height : number, width: number, centerPos : {x : number, y : number}, front : Segment}
	#frontSegment : Segment
	player : boolean

	constructor(canvas : {width : number, height : number}, color : string, xpos : number, player : boolean) {
		//True is left, False is right
		this.player = player
		this.#xpos = xpos + this.#width / 2
		this.color = color
		this.#ypos = 0
		this.canvasAbsoluteStart = 20 / 100
		this.mainCanvas = canvas
		this.#height = this.mainCanvas.height / 7
		this.#width = 10
		this.#frontSegment = { A : {x : 0, y : 0}, B : {x : 0, y : 0} }
		this.#paddlePos = { height : this.#height, width : this.#width, 
			centerPos : {x : this.#xpos, y : this.#ypos}, front : this.#frontSegment}
		this.setYpos(this.mainCanvas?.height / 2)
		if (player)
		{
			this.#frontSegment = { A : { x : this.#xpos, y : this.#ypos - this.#height / 2}, 
			B : {x : this.#xpos, y : this.#ypos + this.#height / 2}}
		}
		else
		{
			this.#frontSegment = { A : { x : this.#xpos, y : this.#ypos - this.#height / 2}, 
			B : {x : this.#xpos, y : this.#ypos + this.#height / 2}}
		}
		this.#paddlePos = { height : this.#height, width : this.#width, 
			centerPos : {x : this.#xpos, y : this.#ypos}, front : this.#frontSegment}
		this.reset()
	}

	getXpos()
	{
		return(this.#xpos)
	}

	getYpos()
	{
		return(this.#ypos)
	}

	getPaddlePos()
	{
		return(this.#paddlePos)
	}

	getHeight()
	{
		return(this.#height)
	}

	getWidth()
	{
		return(this.#width)
	}

	setXpos(value : number)
	{
		this.#xpos = value
		this.#paddlePos.centerPos.x = value
		if (this.player)
		{
			this.#frontSegment = { A : { x : this.#xpos, y : this.#ypos - this.#height / 2}, 
			B : {x : this.#xpos, y : this.#ypos + this.#height / 2}}
			this.#paddlePos.front = this.#frontSegment
		}
		else
		{
			this.#frontSegment = { A : { x : this.#xpos, y : this.#ypos - this.#height / 2}, 
			B : {x : this.#xpos, y : this.#ypos + this.#height / 2}}
			this.#paddlePos.front = this.#frontSegment
		}
	}

	setYpos(value : number)
	{
		this.#ypos = value
		this.#paddlePos.centerPos.y = value
		if (this.player)
		{
			this.#frontSegment = { A : { x : this.#xpos, y : this.#ypos - this.#height / 2}, 
			B : {x : this.#xpos, y : this.#ypos + this.#height / 2}}
			this.#paddlePos.front = this.#frontSegment
		}
		else
		{
			this.#frontSegment = { A : { x : this.#xpos, y : this.#ypos - this.#height / 2}, 
			B : {x : this.#xpos, y : this.#ypos + this.#height / 2}}
			this.#paddlePos.front = this.#frontSegment
		}
	}

	setHeight(value : number)
	{
		this.#height = value
		this.#paddlePos.height = value
		if (this.player)
		{
			this.#frontSegment = { A : { x : this.#xpos, y : this.#ypos - this.#height / 2}, 
			B : {x : this.#xpos, y : this.#ypos + this.#height / 2}}
			this.#paddlePos.front = this.#frontSegment
		}
		else
		{
			this.#frontSegment = { A : { x : this.#xpos, y : this.#ypos - this.#height / 2}, 
			B : {x : this.#xpos, y : this.#ypos + this.#height / 2}}
			this.#paddlePos.front = this.#frontSegment
		}
	}

	setWidth(value : number)
	{
		this.#width = value
		this.#paddlePos.width = value
		if (this.player)
		{
			this.#frontSegment = { A : { x : this.#xpos, y : this.#ypos - this.#height / 2}, 
			B : {x : this.#xpos, y : this.#ypos + this.#height / 2}}
			this.#paddlePos.front = this.#frontSegment
		}
		else
		{
			this.#frontSegment = { A : { x : this.#xpos, y : this.#ypos - this.#height / 2}, 
			B : {x : this.#xpos, y : this.#ypos + this.#height / 2}}
			this.#paddlePos.front = this.#frontSegment
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
		if (ballHeight - this.#ypos <= 0)
		{
			under = true
		}
		this.setYpos(this.getYpos() + SPEED * (ballHeight - this.#ypos))
		if (under)
		{
			if (ballHeight - this.#ypos > 0)
				this.setYpos(ballHeight)
		}
		else
		{
			if (ballHeight - this.#ypos < 0)
				this.setYpos(ballHeight)
		}
	}

	updateplayer(mouseHeight : number)
	{
		//Todo a coder ?
	}
}