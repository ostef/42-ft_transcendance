import { Socket } from 'socket.io';

export type FindGame = {
	player1 : Socket | null,
	instanceId : number,
	difficulty : string,
	color : string
}

