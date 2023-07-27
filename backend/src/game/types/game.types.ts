import { Socket } from 'socket.io';

export type FindGame = {
	player1 : Socket | null,
	instanceId : number,
	difficulty : string,
	color : string
}


export type SpectateGame = {
	gameId : number,
	user1 : string,
	user2 : string,
	difficulty : string,
	color : string
}

export type Spectator = {
	socket : Socket,
	gameId : number
}

export type waitingPlayer = {
	socket : Socket,
	userId : string
}
