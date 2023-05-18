const INITIAL_direction = 4
const direction_INCREASE = 0.0001

type Point = {x: number; y: number}
type Segment = { A: Point; B : Point}

export default class Ball {
	// Always use setter for xpos and ypos ! Getters are not mandatory inside class
	xpos: number
	ypos: number
	radius : number
	color: string
	direction: { x: number; y: number }
	speed : number
	mainCanvas : any
	context : any
	//No setter for centerpos, you should'nt change it manually, getter not mandatory inside class
	centerpos : Point
	nextpos : Point
	isPlaying : boolean


	constructor(maincanvas : string,  x :  number, y : number , direction : { x :  number; y : number}, color : string, radius : number) {

		this.xpos = x
		this.ypos = y
		this.direction = direction
		this.color =  color
		this.radius = radius
		this.speed = 1
		this.centerpos = { x : this.xpos, y : this.ypos }
		this.mainCanvas = document.querySelector(maincanvas)
		this.context = this.mainCanvas.getContext("2d")
		this.isPlaying = true
		this.nextpos = { x : this.centerpos.x + this.direction.x * (this.speed), 
			y : this.centerpos.y + this.direction.x * (this.speed)}

		this.reset()
	}

	getxpos() 
	{
		return (this.xpos)
	}

	getypos()
	{
		return (this.ypos)
	}

	getcenterpos()
	{
		return (this.centerpos)
	}

	setxpos(value : number)
	{
		this.xpos = value
		this.centerpos.x = value
		this.nextpos.x = this.centerpos.x + this.direction.x * (this.speed)
	}

	setypos(value : number)
	{
		this.ypos = value
		this.centerpos.y = this.ypos
		this.nextpos.y = this.centerpos.y + this.direction.y * (this.speed)
	}

	draw()
	{
		this.context.beginPath()
		this.context.arc(this.xpos, this.ypos, this.radius, 0, Math.PI * 2, false)
		this.context.strokeStyle = this.color
		this.context.stroke()
	}

	clear()
	{
		this.context.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height)
	}

	reset() {
		this.setxpos(this.mainCanvas.width / 2)
		this.setypos(this.mainCanvas.height / 2)
		this.direction = {x: 0, y: 0}
		while (Math.abs(this.direction.x) <= .2 || Math.abs(this.direction.x) >= .9) 
		{
			const heading = randomNumberBewteen(0, 2 * Math.PI)
			this.direction = {x: Math.cos(heading), y: Math.sin(heading)}
		}
		this.speed = INITIAL_direction
	}

	/*drawFront( playerseg : Segment, computseg : Segment)
	{
		this.context.beginPath()
		this.context.moveTo(playerseg.A.x, playerseg.A.y)
		this.context.lineTo(playerseg.B.x, playerseg.B.y)
		this.context.moveTo(computseg.A.x, computseg.A.y)
		this.context.lineTo(computseg.B.x, computseg.B.y)
		this.context.stroke()
	}*/

	drawLine(A : Point, B : Point)
	{
		this.context.beginPath()
		this.context.moveTo(A.x, A.y)
		this.context.lineTo(B.x, B.y)
		this.context.stroke()
	}

	update(delta : any, playerPos : any, computerPos : any) {
		this.setxpos(this.xpos + this.direction.x * this.speed)
		this.setypos(this.ypos + this.direction.y * this.speed)
		this.speed += direction_INCREASE
		
		if (this.ypos + this.radius > this.mainCanvas.height || this.ypos - this.radius < 0) {
			this.direction.y *= -1
		}
		if (this.collisionDetection(playerPos, computerPos) && this.isPlaying)
		{
			this.direction.x *= -1
		}
		this.draw()
	}

	lerp(A : number,B : number, t : number)
	{
		return (A + (B - A) * t)
	}
	
	getIntersection(A : Point, B : Point, C : Point, D : Point)
	{
		const ttop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x)
		const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y)
		
		const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y)
		
		if (bottom != 0)
		{
			const t = ttop/bottom
			const u = uTop / bottom
			if (t >= 0 && t<= 1 && u<= 1 && u >= 0)
			{		
				return ({
					x: this.lerp(A.x, B.x, t),
					y: this.lerp(A.y, B.y, t)
				})
			}
		}
		return (null)
	}

	collisionDetection(playerPos : {height : number, width: number, centerPos : {x : number, y : number}, front : Segment}, 
		computerPos : {height : number, width: number, centerPos : {x : number, y : number}, front : Segment})
	{


		//Intersection part
		//Player inter with center
		const frontPosPlayer = {
			x : this.centerpos.x - this.radius,
			y : this.centerpos.y
		}
		const frontNextPosPlayer = {
			x : this.nextpos.x - this.radius,
			y : this.nextpos.y
		}
		if (this.getIntersection(frontPosPlayer, frontNextPosPlayer, playerPos.front.A, playerPos.front.B) != null)
		{
			return (1)
		}

		const frontPosComputer = {
			x : this.centerpos.x + this.radius,
			y : this.centerpos.y
		}
		const frontNextPosComputer = {
			x : this.nextpos.x + this.radius,
			y : this.nextpos.y
		}


		//Computer front intersection
		if (this.getIntersection(frontPosComputer, frontNextPosComputer, computerPos.front.A, computerPos.front.B) != null)
		{
			return (1)
		}


		//This part is to tell that the ball is not possible to bounce anymore



		return (0)
	}
}


function randomNumberBewteen(min: number, max: number) {
	return (Math.random() * (max - min) + min)
}

