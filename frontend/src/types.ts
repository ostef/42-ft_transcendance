export interface IMessage
{
	senderId: number;
	date: Date;
	content: string;
}

export interface IChannel
{
	id: number;
	name: string;
}

export interface IUser
{
	id: number;
	username: string;
}
