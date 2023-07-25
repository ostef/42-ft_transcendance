const INITIAL_direction = 0.0005
const direction_INCREASE = 0.000001

type Point = {x: number; y: number}
type Segment = { A: Point; B : Point}

export default class Ball {
	// Always use setter for xpos and ypos ! Getters are not mandatory inside class
	#xpos: number
	#ypos: number
	radius : number
	color: string
	direction: { x: number; y: number }
	speed : number
	context : any
	//No setter for centerpos, you should'nt change it manually, getter not mandatory inside class
	#centerpos : Point
	#nextpos : Point
	isPlaying : boolean
	delta : number


	constructor(x :  number, y : number , direction : { x :  number; y : number}, color : string, radius : number, delta : number) {

		this.#xpos = x
		this.#ypos = y
		this.direction = direction
		this.color =  color
		this.radius = radius
		this.speed = 0.0005
		this.delta = delta
		this.#centerpos = { x : this.#xpos, y : this.#ypos }
		this.isPlaying = true
		this.#nextpos = { x : this.#centerpos.x + this.direction.x * (this.speed) * this.delta, 
			y : this.#centerpos.y + this.direction.x * (this.speed) * this.delta}
		this.reset()
	}

	getxpos() 
	{
		return (this.#xpos)
	}

	getypos()
	{
		return (this.#ypos)
	}

	getcenterpos()
	{
		return (this.#centerpos)
	}

	setxpos(value : number)
	{
		this.#xpos = value
		this.#centerpos.x = value
		this.#nextpos.x = this.#centerpos.x + this.direction.x * (this.speed) * this.delta
	}

	setypos(value : number)
	{
		this.#ypos = value
		this.#centerpos.y = this.#ypos
		this.#nextpos.y = this.#centerpos.y + this.direction.y * (this.speed) * this.delta
	}

	reset() {
		this.setxpos(1 / 2)
		this.setypos(1 / 2)
		this.direction = {x: 0, y: 0}
		while (Math.abs(this.direction.x) <= .5 || Math.abs(this.direction.x) >= .9) 
		{
			const heading = randomNumberBewteen(0, 2 * Math.PI)
			this.direction = {x: Math.cos(heading), y: Math.sin(heading)}
		}
		this.speed = INITIAL_direction
	}

	update(playerPos : any, computerPos : any) {
		this.setxpos(this.#xpos + this.direction.x * this.speed * this.delta)
		this.setypos(this.#ypos + this.direction.y * this.speed * this.delta)
		this.speed += direction_INCREASE
		
		if (this.#ypos + this.radius > 1 || this.#ypos - this.radius < 0) {
			this.direction.y *= -1
		}
		let resultCollision = this.collisionDetection(playerPos, computerPos)
		if ((resultCollision.x != 0 && resultCollision.y != 0) && this.isPlaying)
		{
			if (resultCollision.x <= 1 / 2)
			{
				this.setxpos(resultCollision.x + this.radius)
				this.setypos(resultCollision.y)
				//Left paddle collision
				let ydiff = (resultCollision.y - playerPos.centerPos.y) / playerPos.height
				this.direction.y = ydiff
			}
			else
			{
				//Right Paddle collision
				this.setxpos(resultCollision.x - this.radius)
				this.setypos(resultCollision.y)
				let ydiff = (resultCollision.y - computerPos.centerPos.y) / computerPos.height
				this.direction.y = ydiff
			}
			this.direction.x *= -1
		}
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
		return ({
			x : 0,
			y : 0
		})
	}

	collisionDetection(playerPos : {height : number, width: number, centerPos : {x : number, y : number}, front : Segment}, 
		computerPos : {height : number, width: number, centerPos : {x : number, y : number}, front : Segment})
	{
		//Intersection part
		//Player inter with center
		const frontPosPlayer = {
			x : this.#centerpos.x - this.radius,
			y : this.#centerpos.y
		}
		const frontNextPosPlayer = {
			x : this.#nextpos.x - this.radius,
			y : this.#nextpos.y
		}

		let resultInter = this.getIntersection(frontPosPlayer, frontNextPosPlayer, playerPos.front.A, playerPos.front.B)
		if (resultInter.x != 0)
		{
			return (resultInter)
		}
		
		//Computer front intersection
		const frontPosComputer = {
			x : this.#centerpos.x + this.radius,
			y : this.#centerpos.y
		}
		const frontNextPosComputer = {
			x : this.#nextpos.x + this.radius,
			y : this.#nextpos.y
		}

		resultInter = this.getIntersection(frontPosComputer, frontNextPosComputer, computerPos.front.A, computerPos.front.B)
		if (resultInter.x != 0)
		{
			return (resultInter)
		}

		return ({
			x : 0,
			y : 0
		})
	}
}


function randomNumberBewteen(min: number, max: number) {
	return (Math.random() * (max - min) + min)
}

