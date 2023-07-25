export type SpectateGame = {
	gameId : number,
	user1 : string,
	user2 : string,
	difficulty : string,
	color : string
}

export type Point = {x: number; y: number}
export type Segment = { A: Point; B : Point}
export type PaddlePos = {height : number, width: number, centerPos : {x : number, y : number}, front : Segment}
export type Score =  {p1 : number, p2 : number}