const INITIAL_VELOCITY = 0.025
const VELOCITY_INCREASE = 0.00001

export default class Ball {
	
	ballElem: HTMLElement
	direction: { x: number; y: number }
	velocity: number;


	constructor(ballElem: any) {
		this.ballElem = ballElem
		this.direction = {x: 0, y: 0}
		this.velocity = INITIAL_VELOCITY
		this.reset()
	}

	get x() {
		return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x"))
	}

	set x(value) {
		this.ballElem.style.setProperty("--x", value.toString())
	}

	get y() {
		return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y"))
	}

	set y(value) {
		this.ballElem.style.setProperty("--y", value.toString())
	}

	rect() {
		return (this.ballElem.getBoundingClientRect())
	}

	reset() {
		this.x = 50
		this.y = 50
		this.direction = {x: 0, y: 0}
		while (Math.abs(this.direction.x) <= .2 || Math.abs(this.direction.x) >= .9) 
		{
			const heading = randomNumberBewteen(0, 2 * Math.PI)
			this.direction = {x: Math.cos(heading), y: Math.sin(heading)}
		}
		this.velocity = INITIAL_VELOCITY
	}

	update(delta : any, paddleRects : any) {
		this.x += this.direction.x * this.velocity * delta
		this.y += this.direction.y * this.velocity * delta
		this.velocity += VELOCITY_INCREASE * delta
		const rect = this.rect()

		if (rect.bottom >= window.innerHeight || rect.top <= 0) {
			this.direction.y *= -1
		}
		
		if (paddleRects.some((r: any) => isCollision(r, rect)))
		{
			this.direction.x *= -1
		}

	}
}


function randomNumberBewteen(min: number, max: number) {
	return (Math.random() * (max - min) + min)
}

function isCollision(rect1: { left: number; right: number; top: number; bottom: number; }, rect2: DOMRect) {
	return rect1.left <= rect2.right && rect1.right >= rect2.left 
	&& rect1.top <= rect2.bottom && rect1.bottom >= rect2.top
}

